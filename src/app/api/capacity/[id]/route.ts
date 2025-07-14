import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { fetchMetabase, fetchWikidata, sanitizeCapacityName } from '@/lib/utils/capacitiesUtils';

// Hard-coded fallback names for known capacity IDs
const CAPACITY_NAMES = {
  '69': 'Strategic Thinking',
  '71': 'Team Leadership',
  '97': 'Project Management',
  '10': 'Organizational Skills',
  '36': 'Communication',
  '50': 'Learning',
  '56': 'Community Building',
  '65': 'Social Skills',
  '74': 'Strategic Planning',
  '106': 'Technology',
};

export interface Capacity {
  id: string;
}

export interface Users {
  wanted: Capacity[];
}

export interface CapacityById {
  code: string;
  wd_code: string;
  users: Users[];
  name: string;
  description?: string;
  icon?: string;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`⏳ API: Processing request for capacity ID: ${params.id}`);
    const id = params.id;
    const language = req.nextUrl.searchParams.get('language') || 'en';

    const codeList = await axios.get(`${process.env.BASE_URL}/list/skills/`);

    // If the ID doesn't exist in the code list, return a generic capacity instead of an error
    if (!codeList.data.hasOwnProperty(id)) {
      return NextResponse.json({
        code: id,
        wd_code: null,
        users: [],
        name: `Capacity ${id}`,
        description: '',
      });
    }

    const userList = await axios.get(`${process.env.BASE_URL}/users_by_skill/${id}/`);

    const capacityCodes = {
      code: id,
      wd_code: codeList.data[id],
      users: userList.data,
    };

    try {
      // fetch details using fetchMetabase first
      const metabaseResults = await fetchMetabase([capacityCodes], language);

      if (metabaseResults.length > 0 && metabaseResults[0].name) {
        // use Metabase data
        const name = sanitizeCapacityName(metabaseResults[0].name, id);

        return NextResponse.json({
          ...capacityCodes,
          name,
          description: metabaseResults[0].description || '',
          item: metabaseResults[0].item,
        });
      }

      // fallback for Wikidata
      const wikidataResults = await fetchWikidata([capacityCodes], language);
      if (wikidataResults.length > 0 && wikidataResults[0].name) {
        const name = sanitizeCapacityName(wikidataResults[0].name, id);

        return NextResponse.json({
          ...capacityCodes,
          name,
          description: wikidataResults[0].description || '',
        });
      }
    } catch (error) {
      console.error(`❌ API: Error fetching metadata for capacity ${id}:`, error);
      // Continue to fallback
    }

    // If we got here, use the hard-coded name if we have it
    if (CAPACITY_NAMES[id]) {
      return NextResponse.json({
        ...capacityCodes,
        name: CAPACITY_NAMES[id],
        description: '',
      });
    }

    // If no result is found from any source, use a generic name
    return NextResponse.json({
      ...capacityCodes,
      name: `Capacity ${id}`,
      description: '',
    });
  } catch (error) {
    console.error(`❌ API: Error processing capacity ${params.id}:`, error);

    // Try one last time with hardcoded name
    if (CAPACITY_NAMES[params.id]) {
      return NextResponse.json({
        code: params.id,
        name: CAPACITY_NAMES[params.id],
        description: '',
        wd_code: null,
        users: [],
      });
    }

    // Return a generic response with a 200 status to avoid breaking the UI
    return NextResponse.json({
      code: params.id,
      name: `Capacity ${params.id}`,
      description: '',
      wd_code: null,
      users: [],
      error: 'Failed to fetch data',
    });
  }
}

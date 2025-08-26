import { fetchCapacitiesWithFallback, fetchWikidata } from '@/lib/utils/capacitiesUtils';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export interface CapacityById {
  code: string;
  wd_code: string;
  users: any[];
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
      // Use the new fallback strategy
      const metabaseResults = await fetchCapacitiesWithFallback([capacityCodes], language);

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
    const hardcodedNames: Record<string, string> = {
      '10': 'Organizational Skills',
      '36': 'Communication',
      '50': 'Learning',
      '56': 'Community Building',
      '65': 'Social Skills',
      '74': 'Strategic Planning',
      '106': 'Technology',
    };

    const hardcodedName = hardcodedNames[id];
    if (hardcodedName) {
      return NextResponse.json({
        ...capacityCodes,
        name: hardcodedName,
        description: '',
      });
    }

    // Final fallback
    return NextResponse.json({
      ...capacityCodes,
      name: `Capacity ${id}`,
      description: '',
    });
  } catch (error) {
    console.error(`❌ API: Error processing capacity ${params.id}:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to sanitize capacity names
function sanitizeCapacityName(name: string | undefined, code: string | number): string {
  if (!name || name.trim() === '') {
    return `Capacity ${code}`;
  }

  // Check if the name looks like a QID (common format with Q followed by numbers)
  if (name.startsWith('Q') && /^Q\d+$/.test(name)) {
    return `Capacity ${code}`;
  }

  return name;
}

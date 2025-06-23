import { getCapacityColor } from '@/lib/utils/capacitiesUtils';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { fetchMetabase, fetchWikidata } from '@/lib/utils/capacitiesUtils';

export async function GET(req: NextRequest) {
  try {
    const language = req.nextUrl.searchParams.get('language') || 'en';

    // Check if BASE_URL is defined
    if (!process.env.BASE_URL) {
      console.error('BASE_URL is not defined in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: BASE_URL is not defined' },
        { status: 500 }
      );
    }

    // Get all skills
    const codesResponse = await axios.get(`${process.env.BASE_URL}/list/skills/`).catch(error => {
      console.error('Error fetching skills list:', error.message);
      throw new Error(`Failed to fetch skills list: ${error.message}`);
    });

    // Get all skills by type to identify root items
    const skillsByTypeResponse = await axios
      .get(`${process.env.BASE_URL}/skills_by_type/0/`)
      .catch(error => {
        console.error('Error fetching skills by type:', error.message);
        throw new Error(`Failed to fetch skills by type: ${error.message}`);
      });

    // Root items are those in skills_by_type/0/
    const rootSkillIds = Array.isArray(skillsByTypeResponse.data)
      ? skillsByTypeResponse.data
      : Object.keys(skillsByTypeResponse.data).map(Number);

    // Filter codes to only include root items
    const codes = Object.entries(codesResponse.data)
      .filter(([key]) => rootSkillIds.includes(Number(key)))
      .map(([key, value]) => ({
        code: Number(key),
        wd_code: value,
      }));

    // Fetch from Metabase first
    const metabaseResults = await fetchMetabase(codes, language);

    // Use Wikidata as fallback
    const wikidataResults = await fetchWikidata(codes, language);

    // Combine results, prioritizing Metabase over Wikidata
    const codesWithNames = codes.map(obj1 => {
      // Find matching data from Metabase
      const metabaseMatch = metabaseResults.find(mb => mb.wd_code === obj1.wd_code);

      // Use Wikidata as fallback
      const wikidataMatch = wikidataResults.find(wd => wd.wd_code === obj1.wd_code);

      return {
        ...obj1,
        name: metabaseMatch?.name || wikidataMatch?.name || obj1.wd_code,
        description: metabaseMatch?.description || wikidataMatch?.description || '',
        color: getCapacityColor(obj1.code.toString()),
      };
    });

    return NextResponse.json(codesWithNames);
  } catch (error) {
    console.error('Error details:', error);

    // Provide a more specific error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    const errorStack = error instanceof Error ? error.stack : 'No stack trace available';

    console.error('Error message:', errorMessage);
    console.error('Error stack:', errorStack);

    return NextResponse.json(
      {
        error: 'Failed to fetch capacity data.',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

import { fetchCapacitiesWithFallback, fetchWikidata } from '@/lib/utils/capacitiesUtils';
import { Capacity } from '@/types/capacity';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

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
        wd_code: value as string,
      }));

    // Use the new fallback strategy
    const metabaseResults = await fetchCapacitiesWithFallback(codes, language);

    // Use Wikidata as fallback if Metabase didn't provide enough data
    let wikidataResults: Capacity[] = [];
    if (metabaseResults.length < codes.length * 0.5) {
      // Less than 50% success
      console.log('📚 Metabase insuficiente, usando Wikidata como fallback');
      wikidataResults = await fetchWikidata(codes, language);
    }

    // Combine results, prioritizing Metabase over Wikidata
    const codesWithNames = codes.map(codeItem => {
      const metabaseMatch = metabaseResults.find(item => item?.wd_code === codeItem.wd_code);
      const wikidataMatch = wikidataResults.find(item => item?.wd_code === codeItem.wd_code);

      return {
        code: codeItem.code,
        wd_code: codeItem.wd_code,
        name: metabaseMatch?.name || wikidataMatch?.name || codeItem.wd_code,
        description: metabaseMatch?.description || wikidataMatch?.description || '',
      };
    });

    return NextResponse.json(codesWithNames);
  } catch (error) {
    console.error('Error in capacity API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

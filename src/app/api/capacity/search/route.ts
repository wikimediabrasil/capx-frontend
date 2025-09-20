import { fetchCapacitiesWithFallback, fetchWikidata } from '@/lib/utils/capacitiesUtils';
import { Capacity } from '@/types/capacity';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchQuery = req.nextUrl.searchParams.get('q');
    const language = req.nextUrl.searchParams.get('language') || 'en';

    // fetch all capacities
    const codesResponse = await axios.get(`${process.env.BASE_URL}/list/skills/`);

    const codes = Object.entries(codesResponse.data).map(([key, value]) => ({
      code: Number(key),
      wd_code: value as string,
    }));

    // Use the new fallback strategy
    const metabaseResults = await fetchCapacitiesWithFallback(codes, language);

    // Use Wikidata as fallback if Metabase didn't provide enough data
    let wikidataResults: Capacity[] = [];
    if (metabaseResults.length < codes.length * 0.5) {
      // Less than 50% success
      wikidataResults = await fetchWikidata(codes, language);
    }

    // Combine results, prioritizing Metabase over Wikidata
    const combinedResults = codes.map(codeItem => {
      const metabaseMatch = metabaseResults.find(item => item.wd_code === codeItem.wd_code);
      const wikidataMatch = wikidataResults.find(item => item.wd_code === codeItem.wd_code);

      return {
        ...codeItem,
        name: metabaseMatch?.name || wikidataMatch?.name || codeItem.wd_code,
        description: metabaseMatch?.description || wikidataMatch?.description || '',
      };
    });

    // filter by search term
    const organizedData = combinedResults.filter(item =>
      item.name.toLowerCase().includes(searchQuery?.toLowerCase() || '')
    );

    // fetch detailed information for each found capacity
    const detailedResults = await Promise.all(
      organizedData.map(async item => {
        try {
          const detailedResponse = await axios.get(
            `${process.env.BASE_URL}/users_by_skill/${item.code}/`
          );

          return {
            ...item,
            users: detailedResponse.data,
          };
        } catch (error) {
          console.error(`Error fetching detailed info for capacity ${item.code}:`, error);
          return {
            ...item,
            users: [],
          };
        }
      })
    );

    return NextResponse.json(detailedResults);
  } catch (error) {
    console.error('Error in capacity search API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

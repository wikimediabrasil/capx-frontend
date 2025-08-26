import { fetchCapacitiesWithFallback, fetchWikidata } from '@/lib/utils/capacitiesUtils';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const language = req.nextUrl.searchParams.get('language') || 'en';

    const response = await axios.get(`${process.env.BASE_URL}/skills_by_type/${id}/`);

    if (!response.data) {
      return NextResponse.json({ error: 'No data received from backend' }, { status: 500 });
    }

    // ensure that we are dealing with an object
    const skillsData = response.data;

    // ensure that we are dealing with an object
    if (Array.isArray(skillsData)) {
      // convert array to empty object
      return NextResponse.json({});
    }

    // ensure that we are dealing with an object
    if (typeof skillsData !== 'object' || skillsData === null) {
      return NextResponse.json({});
    }

    // fetch the wikidata codes for each skill
    const skillsList = await axios.get(`${process.env.BASE_URL}/list/skills/`);

    // preparing the data for search in Metabase and Wikidata
    const codes = Object.entries(skillsData).map(([key, value]) => ({
      code: key,
      name: value,
      wd_code: skillsList.data[key],
    }));

    // if we don't have codes, return empty object
    if (codes.length === 0) {
      return NextResponse.json({});
    }

    // Use the new fallback strategy
    const metabaseResults = await fetchCapacitiesWithFallback(codes, language);

    // Use Wikidata as fallback if Metabase didn't provide enough data
    let wikidataResults = [];
    if (metabaseResults.length < codes.length * 0.5) { // Less than 50% success
      console.log('📚 Metabase insuficiente, usando Wikidata como fallback');
      wikidataResults = await fetchWikidata(codes, language);
    }

    // try to get names from Metabase first
    let capacityNames = {};

    try {
      // filter only items with valid wd_code
      const validCodes = codes.filter(code => code.wd_code);

      if (validCodes.length > 0) {
        // Combine results, prioritizing Metabase over Wikidata
        const combinedResults = [...metabaseResults, ...wikidataResults];

        // Create a map of wd_code to name
        combinedResults.forEach(result => {
          if (result.wd_code && result.name) {
            capacityNames[result.wd_code] = result.name;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching from Metabase/Wikidata:', error);
      // Continue with fallback
    }

    // Create the final response
    const finalResponse = {};
    codes.forEach(code => {
      if (code.wd_code && capacityNames[code.wd_code]) {
        finalResponse[code.code] = capacityNames[code.wd_code];
      } else {
        // Use the original name if no translation found
        finalResponse[code.code] = code.name;
      }
    });

    return NextResponse.json(finalResponse);
  } catch (error) {
    console.error('Error in capacity type API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

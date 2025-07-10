import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { fetchMetabase, fetchWikidata } from "@/lib/utils/capacitiesUtils";

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const language = req.nextUrl.searchParams.get("language") || "en";

    const response = await axios.get(
      `${process.env.BASE_URL}/skills_by_type/${id}/`
    );

    if (!response.data) {
      return NextResponse.json(
        { error: "No data received from backend" },
        { status: 500 }
      );
    }

    // ensure that we are dealing with an object
    const skillsData = response.data;

    // ensure that we are dealing with an object
    if (Array.isArray(skillsData)) {
      // convert array to empty object
      return NextResponse.json({});
    }

    // ensure that we are dealing with an object
    if (typeof skillsData !== "object" || skillsData === null) {
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

    // try to get names from Metabase first
    let capacityNames = {};

    try {
      // filter only items with valid wd_code
      const validCodes = codes.filter((code) => code.wd_code);

      if (validCodes.length > 0) {
        // Fetch from Metabase first as the primary source
        const metabaseResults = await fetchMetabase(validCodes, language);

        // Use Wikidata as fallback
        const wikidataResults = await fetchWikidata(validCodes, language);

        // Process all codes, prioritizing Metabase data with fallback to Wikidata
        codes.forEach((code) => {
          const metabaseMatch = metabaseResults.find(
            (item) => item.wd_code === code.wd_code
          );
          const wikidataMatch = wikidataResults.find(
            (item) => item.wd_code === code.wd_code
          );

          capacityNames[code.code] =
            metabaseMatch?.name || wikidataMatch?.name || code.name;
        });
      }
    } catch (error) {
      console.error("Error fetching names from Metabase/Wikidata:", error);

      // in case of error, use the original names
      codes.forEach((code) => {
        capacityNames[code.code] = code.name;
      });
    }

    // if we don't have any name, use the original names
    if (Object.keys(capacityNames).length === 0) {
      return NextResponse.json(skillsData);
    }

    return NextResponse.json(capacityNames);
  } catch (error) {
    console.error("API error in type/[id]:", error);

    if (axios.isAxiosError(error)) {
      console.error("API error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
    }

    return NextResponse.json(
      {
        error: "Failed to fetch capacity data",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

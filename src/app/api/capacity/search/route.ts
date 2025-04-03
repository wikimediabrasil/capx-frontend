import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { fetchMetabase, fetchWikidata } from "@/lib/utils/capacitiesUtils";

export async function GET(req: NextRequest) {
  try {
    const searchQuery = req.nextUrl.searchParams.get("q");
    const language = req.nextUrl.searchParams.get("language") || "en";
    const authHeader = req.headers.get("authorization");

    // fetch all capacities
    const codesResponse = await axios.get(
      `${process.env.BASE_URL}/list/skills/`,
      {
        headers: { Authorization: authHeader },
      }
    );

    const codes = Object.entries(codesResponse.data).map(([key, value]) => ({
      code: Number(key),
      wd_code: value,
    }));

    // use fetchMetabase first to get names
    const metabaseResults = await fetchMetabase(codes, language);

    // use fetchWikidata as fallback
    const wikidataResults = await fetchWikidata(codes, language);

    // combine results, prioritizing metabase
    const combinedResults = codes.map((codeItem) => {
      const metabaseMatch = metabaseResults.find(
        (item) => item.wd_code === codeItem.wd_code
      );
      const wikidataMatch = wikidataResults.find(
        (item) => item.wd_code === codeItem.wd_code
      );

      return {
        ...codeItem,
        name: metabaseMatch?.name || wikidataMatch?.name || codeItem.wd_code,
      };
    });

    // filter by search term
    const organizedData = combinedResults.filter((item) =>
      item.name.toLowerCase().includes(searchQuery?.toLowerCase() || "")
    );

    // fetch detailed information for each found capacity
    const searchResults = await Promise.all(
      organizedData.map(async (item) => {
        // fetch details of the capacity, including skill_type
        try {
          const detailsResponse = await axios.get(
            `${process.env.BASE_URL}/skill/${item.code}/`,
            {
              headers: { Authorization: authHeader },
            }
          );

          return {
            ...item,
            skill_type: detailsResponse.data.skill_type || [],
          };
        } catch (error) {
          console.error(
            `Failed to fetch details for skill ${item.code}:`,
            error
          );
          return null;
        }
      })
    );

    // filter out null results
    const filteredResults = searchResults.filter(Boolean);

    return NextResponse.json(filteredResults);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Failed to search capacities" },
      { status: 500 }
    );
  }
}

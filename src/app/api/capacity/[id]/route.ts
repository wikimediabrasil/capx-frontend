import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { fetchMetabase, fetchWikidata } from "@/lib/utils/capacitiesUtils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const language = req.nextUrl.searchParams.get("language") || "en";

    const codeList = await axios.get(`${process.env.BASE_URL}/list/skills/`);

    if (!codeList.data.hasOwnProperty(id)) {
      return NextResponse.json(
        { error: "No wikidata item for this capacity id." },
        { status: 500 }
      );
    }

    const userList = await axios.get(
      `${process.env.BASE_URL}/users_by_skill/${id}/`
    );

    const capacityCodes = {
      code: id,
      wd_code: codeList.data[id],
      users: userList.data,
    };

    // fetch details using fetchMetabase first
    const metabaseResults = await fetchMetabase([capacityCodes], language);
    let capacityData = {};

    if (metabaseResults.length > 0 && metabaseResults[0].name) {
      // use Metabase data
      capacityData = {
        name: metabaseResults[0].name,
        description: metabaseResults[0].description || "",
      };
    } else {
      // fallback for Wikidata
      const wikidataResults = await fetchWikidata([capacityCodes], language);

      if (wikidataResults.length > 0) {
        capacityData = {
          name: wikidataResults[0].name,
          description: wikidataResults[0].description || "",
        };
      } else {
        // if no result is found
        capacityData = {
          name: capacityCodes.wd_code,
          description: "",
        };
      }
    }

    return NextResponse.json({ ...capacityCodes, ...capacityData });
  } catch (error) {
    console.error("Error fetching capacity details:", error);
    return NextResponse.json(
      { error: "Failed to fetch data.", details: error.message },
      { status: 500 }
    );
  }
}

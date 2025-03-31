import { getCapacityColor } from "@/lib/utils/capacitiesUtils";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { fetchMetabase, fetchWikidata } from "@/lib/utils/capacitiesUtils";

export async function GET(req: NextRequest) {
  try {
    const language = req.nextUrl.searchParams.get("language");
    const authHeader = req.headers.get("authorization");

    // Get all skills
    const codesResponse = await axios.get(
      `${process.env.BASE_URL}/list/skills/`,
      {
        headers: { Authorization: authHeader },
      }
    );

    // Get all skills by type to identify root items
    const skillsByTypeResponse = await axios.get(
      `${process.env.BASE_URL}/skills_by_type/0/`,
      { headers: { Authorization: authHeader } }
    );

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
    const metabaseResponse = await fetchMetabase(codes, language ?? "en");
    const wikidataResponse = await fetchWikidata(codes, language ?? "en");

    const codesWithNames = codes.map((obj1) => {
      const metabaseMatch = metabaseResponse.find(
        (mb) => mb.wd_code === obj1.wd_code
      );
      const wikidataMatch = wikidataResponse.find(
        (wd) => wd.wd_code === obj1.wd_code
      );
      return {
        ...obj1,
        name: metabaseMatch?.name || wikidataMatch?.name || obj1.wd_code,
        description:
          metabaseMatch?.description || wikidataMatch?.description || "",
        color: getCapacityColor(obj1.code.toString()),
      };
    });
    return NextResponse.json(codesWithNames);
  } catch (error) {
    console.error("Error details:", error);
    return NextResponse.json(
      { error: "Failed to fetch data.", details: error.message },
      { status: 500 }
    );
  }
}

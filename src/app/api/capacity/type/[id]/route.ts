import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { fetchWikidata, fetchMetabase } from "@/lib/utils/capacitiesUtils";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const language = req.nextUrl.searchParams.get("language");
    const authHeader = req.headers.get("authorization");

    const skillsByType = await axios.get(
      `${process.env.BASE_URL}/skills_by_type/${params.id}/`,
      { headers: { Authorization: authHeader } }
    );

    const skillIds = Array.isArray(skillsByType.data)
      ? skillsByType.data
      : Object.keys(skillsByType.data).map(Number);

    if (!skillIds.length) {
      return NextResponse.json({});
    }

    const codesResponse = await axios.get(
      `${process.env.BASE_URL}/list/skills/`,
      { headers: { Authorization: authHeader } }
    );

    const relevantCodes = Object.entries(codesResponse.data)
      .filter(([key]) => skillIds.includes(Number(key)))
      .reduce((acc, [key, value]) => {
        acc[key] = value as string;
        return acc;
      }, {} as Record<string, string>);

    if (Object.keys(relevantCodes).length === 0) {
      return NextResponse.json({});
    }

    const metabaseResponse = await fetchMetabase(
      relevantCodes,
      language ?? "en"
    );

    const wikidataResponse = await fetchWikidata(
      relevantCodes,
      language ?? "en"
    );

    const nameMap =
      metabaseResponse ||
      wikidataResponse.reduce((acc, item) => {
        const wd_code = item.item.value.split("/").slice(-1)[0];
        acc[wd_code] = item.itemLabel.value;
        return acc;
      }, {} as Record<string, string>);

    const result = Object.entries(relevantCodes).reduce(
      (acc, [code, wd_code]) => {
        acc[code] = nameMap[wd_code] || wd_code;
        return acc;
      },
      {} as Record<string, string>
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in capacity type route:", error);
    return NextResponse.json(
      { error: "Failed to fetch capacity data", details: error.message },
      { status: 500 }
    );
  }
}

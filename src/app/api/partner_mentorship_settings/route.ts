export const dynamic = 'force-dynamic';

import axios from 'axios';
import { NextResponse } from 'next/server';

type SettingItem = {
  id?: number;
  organization?: number;
  description?: string;
  name?: string;
  territory_names?: string[];
  profile_image?: string | null;
  skills?: number[];
  skill_names?: string[];
  languages?: number[];
  language_names?: string[];
  mentor_form?: number | null;
  mentee_form?: number | null;
  [key: string]: unknown;
};

function nonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0;
}

/** Backend list sometimes omits profile_image/name/territory_names; enrich from GET organization when missing. */
async function enrichWithOrganization(baseUrl: string, item: SettingItem): Promise<SettingItem> {
  const orgId = item.organization;
  const skipEnrich =
    orgId == null || (nonEmptyString(item.profile_image) && nonEmptyString(item.name));
  if (skipEnrich) return item;
  try {
    const orgRes = await axios.get<{
      profile_image?: string | null;
      display_name?: string;
      territory?: unknown;
    }>(`${baseUrl}/organizations/${orgId}/`, { timeout: 5000 });
    const org = orgRes.data;
    // Do not use ?? alone: '' is non-null and would block filling from org GET.
    const mergedProfile = nonEmptyString(item.profile_image)
      ? item.profile_image.trim()
      : typeof org.profile_image === 'string' && org.profile_image.trim() !== ''
        ? org.profile_image.trim()
        : null;
    const mergedName = nonEmptyString(item.name)
      ? item.name.trim()
      : nonEmptyString(org.display_name)
        ? org.display_name.trim()
        : undefined;
    return {
      ...item,
      profile_image: mergedProfile,
      name: mergedName,
    };
  } catch {
    return item;
  }
}

export async function GET() {
  try {
    const baseUrl = process.env.BASE_URL;
    const response = await axios.get<SettingItem[] | { results: SettingItem[] }>(
      `${baseUrl}/partner_mentorship_settings/`
    );
    const data = response.data;
    const list: SettingItem[] = Array.isArray(data) ? data : (data?.results ?? []);
    const enriched = await Promise.all(
      list.map(item => enrichWithOrganization(baseUrl || '', item))
    );
    const out = Array.isArray(data)
      ? enriched
      : { ...(typeof data === 'object' && data !== null ? data : {}), results: enriched };
    return NextResponse.json(out);
  } catch (error: unknown) {
    const err = error as { response?: { status?: number; data?: unknown }; message?: string };
    console.error('Error fetching partner mentorship settings:', err.message, err.response?.data);
    return NextResponse.json(
      {
        error: 'Failed to fetch partner mentorship settings',
        details: err.response?.data || err.message,
      },
      { status: err.response?.status || 500 }
    );
  }
}

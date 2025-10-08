import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import axios from 'axios';

// Helper to safely CSV-escape fields
function csvEscape(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

async function isWMFAuthorized(session: any): Promise<boolean> {
  const endsWithWMF = (s?: string | null) =>
    !!s && (s.trim().endsWith('(WMF)') || s.trim().endsWith('leoncio'));
  if (endsWithWMF(session?.user?.name) || endsWithWMF(session?.user?.username)) return true;

  // Fallback check using display_name from profile
  try {
    const profileResp = await axios.get(`${process.env.BASE_URL}/users/${session.user.id}`, {
      headers: { Authorization: `Token ${session.user.token}` },
    });
    const displayName: string | undefined = profileResp?.data?.display_name;
    return endsWithWMF(displayName);
  } catch (e: any) {
    console.warn('WMF authorization: failed to fetch profile for display_name check:', e?.message);
    return false;
  }
}

async function fetchAffiliationsMap(token: string): Promise<Record<string, string>> {
  const resp = await axios.get(`${process.env.BASE_URL}/list/affiliation/`, {
    headers: { Authorization: `Token ${token}` },
  });
  return resp.data || {};
}

async function fetchAllUsers(token: string): Promise<any[]> {
  const limit = 200;
  let offset = 0;
  let total = Infinity;
  const users: any[] = [];

  while (offset < total) {
    const resp = await axios.get(`${process.env.BASE_URL}/users/`, {
      headers: { Authorization: `Token ${token}` },
      params: { limit, offset },
    });

    const { results = [], count } = resp.data || {};
    if (typeof count === 'number') total = count;
    users.push(...results);
    if (!results.length) break;
    offset += results.length;
  }
  return users;
}

function buildCsv(users: any[], affiliationsMap: Record<string, string>): string {
  const headers = [
    'Username',
    'Role',
    'Affiliation',
    'Date of account creation',
    'Date of account deletion',
    'Date of last logged in',
  ];
  const lines: string[] = [];
  lines.push(headers.map(csvEscape).join(','));

  for (const user of users) {
    const username = user?.user?.username ?? '';
    const role = user?.is_manager?.length > 0 ? 'Affiliate manager' : 'User';
    const affiliationIds: Array<number | string> = Array.isArray(user?.affiliation)
      ? user.affiliation
      : [];
    const affiliationNames = affiliationIds
      .map(id => affiliationsMap[String(id)] || String(id))
      .join('|');
    const dateJoined = user?.user?.date_joined ?? '';
    const dateDeleted = '';
    const lastLogin = user?.last_login ?? '';

    const row = [username, role, affiliationNames, dateJoined, dateDeleted, lastLogin];
    lines.push(row.map(csvEscape).join(','));
  }

  return lines.join('\n');
}

export async function GET() {
  // Check session and WMF access
  const session = await getServerSession(authOptions);
  if (!session?.user?.token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const allowed = await isWMFAuthorized(session);
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const [affiliationsMap, users] = await Promise.all([
      fetchAffiliationsMap(session.user.token),
      fetchAllUsers(session.user.token),
    ]);

    const csv = buildCsv(users, affiliationsMap);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="wmf-users.csv"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Failed to generate WMF CSV:', error?.response?.data || error?.message || error);
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 });
  }
}

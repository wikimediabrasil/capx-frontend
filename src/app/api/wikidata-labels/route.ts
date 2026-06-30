export const dynamic = 'force-dynamic';

import { WIKIMEDIA_USER_AGENT } from '@/constants/wikimedia';
import { NextRequest, NextResponse } from 'next/server';

const isInvalidCapacityLabel = (name: string | undefined): boolean => {
  if (!name?.trim()) return true;
  const n = name.trim();
  return n.startsWith('http') || n.includes('entity/') || /^Q\d+$/i.test(n);
};

type WikidataLabelMap = Record<string, { value?: string }>;
type EntityData = { labels?: WikidataLabelMap; descriptions?: WikidataLabelMap };

const pickLabelFromEntity = (
  entityLabels: WikidataLabelMap | undefined,
  languageCandidates: string[]
): string | undefined => {
  if (!entityLabels) return undefined;

  const langs = [...languageCandidates, 'en', 'pt-br', 'pt'];
  const seen = new Set<string>();
  for (const lang of langs) {
    if (!lang || seen.has(lang)) continue;
    seen.add(lang);
    const candidate = entityLabels[lang]?.value;
    if (candidate && !isInvalidCapacityLabel(candidate)) {
      return candidate;
    }
  }

  for (const labelData of Object.values(entityLabels)) {
    if (labelData?.value && !isInvalidCapacityLabel(labelData.value)) {
      return labelData.value;
    }
  }

  return undefined;
};

const pickDescriptionFromEntity = (
  entityDescriptions: WikidataLabelMap | undefined,
  languageCandidates: string[]
): string => {
  if (!entityDescriptions) return '';

  const langs = [...languageCandidates, 'en', 'pt-br', 'pt'];
  const seen = new Set<string>();
  for (const lang of langs) {
    if (!lang || seen.has(lang)) continue;
    seen.add(lang);
    if (entityDescriptions[lang]?.value) {
      return entityDescriptions[lang].value!;
    }
  }

  return '';
};

const fetchEntityViaEntityData = async (
  wd_code: string
): Promise<{ labels?: WikidataLabelMap; descriptions?: WikidataLabelMap } | null> => {
  const response = await fetch(
    `https://www.wikidata.org/wiki/Special:EntityData/${encodeURIComponent(wd_code)}.json`,
    {
      headers: { 'User-Agent': WIKIMEDIA_USER_AGENT },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const entity =
    data?.entities?.[wd_code] ??
    data?.entities?.[wd_code.toUpperCase()] ??
    Object.values(data?.entities ?? {}).find(
      (e: { id?: string }) => e?.id?.toUpperCase() === wd_code.toUpperCase()
    );

  if (!entity || (entity as { missing?: string }).missing !== undefined) {
    return null;
  }

  return entity as { labels?: WikidataLabelMap; descriptions?: WikidataLabelMap };
};

// Resolve a single id to its label/description, falling back to EntityData when needed
const resolveLabelForId = async (
  wd_code: string,
  entities: Record<string, EntityData>,
  languageCandidates: string[]
): Promise<{ wd_code: string; name: string; description: string } | null> => {
  let entity: EntityData | undefined =
    entities[wd_code] ??
    entities[wd_code.toUpperCase()] ??
    (Object.entries(entities).find(([k]) => k.toUpperCase() === wd_code.toUpperCase())?.[1] as
      | EntityData
      | undefined);

  if (!entity || (entity as { missing?: string }).missing !== undefined) {
    entity = (await fetchEntityViaEntityData(wd_code)) ?? undefined;
  }

  let name = pickLabelFromEntity(entity?.labels, languageCandidates);

  if (!name) {
    const entityData = await fetchEntityViaEntityData(wd_code);
    if (entityData) {
      entity = entityData;
      name = pickLabelFromEntity(entityData.labels, languageCandidates);
    }
  }

  if (!name) return null;

  return {
    wd_code,
    name,
    description: pickDescriptionFromEntity(entity?.descriptions, languageCandidates),
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');
    const languagesParam = searchParams.get('languages') || 'en';

    if (!idsParam) {
      return NextResponse.json({ error: 'ids parameter is required' }, { status: 400 });
    }

    const ids = idsParam
      .split(',')
      .map(id => id.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ labels: [] });
    }

    if (ids.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 ids per request' }, { status: 400 });
    }

    const languageCandidates = languagesParam.split('|').filter(Boolean);
    const entities: Record<string, EntityData> = {};

    // Batch request via wbgetentities
    const wbResponse = await fetch(
      `https://www.wikidata.org/w/api.php?${new URLSearchParams({
        action: 'wbgetentities',
        ids: ids.join('|'),
        props: 'labels|descriptions',
        languages: [...new Set([...languageCandidates, 'en'])].join('|'),
        languagefallback: '1',
        format: 'json',
      })}`,
      {
        headers: { 'User-Agent': WIKIMEDIA_USER_AGENT },
        cache: 'no-store',
      }
    );

    if (wbResponse.ok) {
      const data = await wbResponse.json();
      if (!data.error) {
        Object.assign(entities, data.entities ?? {});
      }
    }

    const labels: Array<{ wd_code: string; name: string; description: string }> = [];

    for (const wd_code of ids) {
      const label = await resolveLabelForId(wd_code, entities, languageCandidates);
      if (label) labels.push(label);
    }

    return NextResponse.json({ labels });
  } catch (error) {
    console.error('Error in wikidata-labels API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

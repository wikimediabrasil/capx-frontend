import fs from 'fs';
import path from 'path';

async function main() {
  // Use import dinâmico para ES Modules
  const capacitiesJson = (await import('./capacities_flat.json', { assert: { type: 'json' } }))
    .default;
  const descriptionsJson = (
    await import('./capacities_descriptions.json', { assert: { type: 'json' } })
  ).default;

  // Função para montar a hierarquia
  function buildHierarchy(flatMap: Record<string, any>, descriptions: Record<string, string>) {
    const all: Record<number, any> = {};
    Object.values(flatMap).forEach((cap: any) => {
      all[cap.code] = {
        ...cap,
        description: descriptions[cap.code] || cap.description || '',
        children: [],
      };
    });
    const roots: any[] = [];
    Object.values(all).forEach((cap: any) => {
      if (cap.parentCapacity && all[cap.parentCapacity.code]) {
        all[cap.parentCapacity.code].children.push(cap);
      } else {
        roots.push(cap);
      }
    });
    return roots;
  }

  const flatMap = Object.fromEntries(capacitiesJson.json);
  const descriptions = descriptionsJson;
  const hierarchy = buildHierarchy(flatMap, descriptions);

  const output = `import { Capacity } from "@/types/capacity";\n\nexport const STATIC_CAPACITIES: Capacity[] = ${JSON.stringify(hierarchy, null, 2)};\n`;

  fs.writeFileSync(path.join(__dirname, 'staticCapacities.ts'), output);
  console.log('Arquivo staticCapacities.ts gerado com sucesso!');
}

main();

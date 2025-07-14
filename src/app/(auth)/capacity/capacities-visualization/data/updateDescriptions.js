const fs = require('fs');
const path = require('path');

// Ler o arquivo de descrições
const descriptionsPath = path.join(__dirname, 'capacities_descriptions.json');
const descriptions = JSON.parse(fs.readFileSync(descriptionsPath, 'utf8'));

// Ler o arquivo staticCapacities.ts
const staticCapacitiesPath = path.join(__dirname, 'staticCapacities.ts');
let staticCapacitiesContent = fs.readFileSync(staticCapacitiesPath, 'utf8');

// Extrair o array de capacidades do arquivo TypeScript
const capacitiesMatch = staticCapacitiesContent.match(/export const staticCapacities: Capacity\[\] = (\[[\s\S]*\]);/);
if (!capacitiesMatch) {
  console.error('Não foi possível encontrar o array staticCapacities no arquivo');
  process.exit(1);
}

// Converter a string do array para objeto JavaScript
const capacitiesString = capacitiesMatch[1];
let capacities;
try {
  capacities = eval('(' + capacitiesString + ')');
} catch (error) {
  console.error('Erro ao fazer parse do array de capacidades:', error);
  process.exit(1);
}

// Função recursiva para atualizar descrições
function updateDescriptions(capacity) {
  if (descriptions[capacity.id]) {
    capacity.description = descriptions[capacity.id];
  }
  if (capacity.children && capacity.children.length > 0) {
    capacity.children.forEach(child => updateDescriptions(child));
  }
}
capacities.forEach(capacity => updateDescriptions(capacity));

// Converter de volta para string formatada
const updatedCapacitiesString = JSON.stringify(capacities, null, 2);

// Substituir no arquivo original
const updatedContent = staticCapacitiesContent.replace(
  /export const staticCapacities: Capacity\[\] = (\[[\s\S]*\]);/,
  `export const staticCapacities: Capacity[] = ${updatedCapacitiesString};`
);

// Escrever o arquivo atualizado
fs.writeFileSync(staticCapacitiesPath, updatedContent, 'utf8');

console.log('Descrições atualizadas com sucesso!'); 
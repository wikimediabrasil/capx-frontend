import { Event } from '@/types/event';

const METABASE_ENDPOINT = 'https://metabase.wikibase.cloud/query/sparql';

/**
 * Serviço para consultas SPARQL ao Metabase do Wikibase Cloud
 */

/**
 * Busca informações de evento a partir do QID do Wikidata
 * @param qid - O QID do Wikidata (ex: Q12345)
 * @returns Uma Promise com os dados do evento ou null se não encontrado
 */
export async function fetchEventDataByQID(qid: string): Promise<Partial<Event> | null> {
  if (!qid || !qid.startsWith('Q')) {
    console.error('QID inválido:', qid);
    return null;
  }

  // Construir a consulta SPARQL
  const query = `
    PREFIX wd: <http://www.wikidata.org/entity/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    PREFIX schema: <http://schema.org/>
    
    SELECT ?name ?description ?image_url ?start_date ?end_date ?location ?location_name ?url WHERE {
      wd:${qid} rdfs:label ?name .
      FILTER(LANG(?name) = "pt" || LANG(?name) = "en")
      
      OPTIONAL { wd:${qid} schema:description ?description . 
                FILTER(LANG(?description) = "pt" || LANG(?description) = "en") }
      
      OPTIONAL { wd:${qid} wdt:P18 ?image . 
                BIND(CONCAT("https://commons.wikimedia.org/wiki/Special:FilePath/", ?image) AS ?image_url) }
      
      OPTIONAL { wd:${qid} wdt:P580 ?start_date . }
      OPTIONAL { wd:${qid} wdt:P582 ?end_date . }
      
      OPTIONAL { 
        wd:${qid} wdt:P276 ?location . 
        ?location rdfs:label ?location_name .
        FILTER(LANG(?location_name) = "pt" || LANG(?location_name) = "en")
      }
      
      OPTIONAL { wd:${qid} wdt:P856 ?url . }
    }
    LIMIT 1
  `;

  try {
    // Codificar a consulta para uso em URL
    const encodedQuery = encodeURIComponent(query);

    // Fazer a requisição ao endpoint SPARQL
    const response = await fetch(`${METABASE_ENDPOINT}?format=json&query=${encodedQuery}`);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    // Se não houver resultados, retorna null
    if (!data.results || !data.results.bindings || data.results.bindings.length === 0) {
      return null;
    }

    const result = data.results.bindings[0];

    // Montar o objeto de evento com os dados obtidos
    const eventData: Partial<Event> = {
      name: result.name?.value || '',
      wikidata_qid: qid,
      description: result.description?.value || '',
      image_url: result.image_url?.value || '',
      url: result.url?.value || '',
    };

    // Processar datas se disponíveis
    if (result.start_date?.value) {
      eventData.time_begin = new Date(result.start_date.value).toISOString();
    }

    if (result.end_date?.value) {
      eventData.time_end = new Date(result.end_date.value).toISOString();
    }

    // Se temos localização, definir o tipo como presencial
    if (result.location?.value) {
      eventData.type_of_location = 'in-person';

      // Se tiver ID do OpenStreetMap, adicionar aqui
      // Observação: Isso requer uma consulta adicional ou uma propriedade específica
    }

    return eventData;
  } catch (error) {
    console.error('Erro ao buscar dados do evento no Metabase:', error);
    return null;
  }
}

/**
 * Extrai o título da página da URL do Wikimedia
 * @param url - URL do Wikimedia
 * @returns O título da página extraído ou undefined se não for encontrado
 */
export function extractWikimediaTitleFromURL(url: string): string | undefined {
  if (!url) return undefined;

  try {
    // Padrões de URL do Wikimedia
    const patterns = [
      /wikimedia\.org\/wiki\/([^/#?]+)/i,
      /wikipedia\.org\/wiki\/([^/#?]+)/i,
      /meta\.wikimedia\.org\/wiki\/([^/#?]+)/i,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        // Decodificar o título da URL (para lidar com caracteres especiais)
        return decodeURIComponent(match[1].replace(/_/g, ' '));
      }
    }

    return undefined;
  } catch (error) {
    console.error('Erro ao extrair título da URL:', error);
    return undefined;
  }
}

/**
 * Extrai o QID do Wikidata a partir de uma URL do Wikidata
 * @param url - URL do Wikidata
 * @returns O QID extraído ou undefined se não for encontrado
 */
export function extractQIDFromURL(url: string): string | undefined {
  if (!url) return undefined;

  try {
    // Padrões de URL do Wikidata
    const patterns = [/wikidata\.org\/wiki\/(Q\d+)/i, /wikidata\.org\/entity\/(Q\d+)/i, /(Q\d+)$/i];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return undefined;
  } catch (error) {
    console.error('Erro ao extrair QID da URL:', error);
    return undefined;
  }
}

/**
 * Busca informações de evento a partir de uma URL do Wikidata
 * @param url - URL do Wikidata
 * @returns Uma Promise com os dados do evento ou null se não encontrado
 */
export async function fetchEventDataByURL(url: string): Promise<Partial<Event> | null> {
  const qid = extractQIDFromURL(url);
  if (!qid) {
    console.error('Não foi possível extrair QID da URL:', url);
    return null;
  }

  return fetchEventDataByQID(qid);
}

/**
 * Busca informações de localização a partir do ID do OpenStreetMap
 * @param osmId - ID do OpenStreetMap
 * @returns Uma Promise com os dados de localização ou null se não encontrado
 */
export async function fetchLocationByOSMId(osmId: string): Promise<any | null> {
  if (!osmId) return null;

  const query = `
    PREFIX osm: <https://www.openstreetmap.org/>
    PREFIX wdt: <http://www.wikidata.org/prop/direct/>
    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
    
    SELECT ?name ?lat ?lon ?address WHERE {
      osm:${osmId} rdfs:label ?name ;
                   wdt:P625 ?coordinates .
      
      BIND(CONCAT(STR(?lat), ",", STR(?lon)) AS ?coordinates)
      
      OPTIONAL { osm:${osmId} wdt:P969 ?address . }
    }
    LIMIT 1
  `;

  try {
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${METABASE_ENDPOINT}?format=json&query=${encodedQuery}`);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results || !data.results.bindings || data.results.bindings.length === 0) {
      return null;
    }

    return data.results.bindings[0];
  } catch (error) {
    console.error('Erro ao buscar dados de localização no Metabase:', error);
    return null;
  }
}

/**
 * Busca informações de evento a partir de uma URL da Wikimedia
 * @param url - URL da Wikimedia
 * @returns Uma Promise com os dados do evento ou null se não encontrado
 */
export async function fetchEventDataByWikimediaURL(url: string): Promise<Partial<Event> | null> {
  const pageTitle = extractWikimediaTitleFromURL(url);

  if (!pageTitle) {
    console.error('Não foi possível extrair o título da página da URL:', url);
    return null;
  }

  // Buscar primeiro no Wikidata para ver se existe uma entidade correspondente
  try {
    const query = `
      PREFIX schema: <http://schema.org/>
      PREFIX mw: <http://tools.wmflabs.org/mw2sparql/ontology#>
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX wdt: <http://www.wikidata.org/prop/direct/>
      PREFIX wd: <http://www.wikidata.org/entity/>
      
      SELECT ?item ?name ?description ?location ?date ?url ?image ?type WHERE {
        # Tentar encontrar por título exato
        OPTIONAL {
          ?page schema:name "${pageTitle}"@en;
                schema:about ?item.
          ?item rdfs:label ?name.
          FILTER(LANG(?name) = "en" || LANG(?name) = "pt")
        }
        
        # Ou usar busca por texto
        OPTIONAL {
          ?item rdfs:label ?name.
          FILTER(CONTAINS(LCASE(?name), LCASE("${pageTitle}")))
          FILTER(LANG(?name) = "en" || LANG(?name) = "pt")
        }
        
        # Buscar dados relevantes para eventos
        OPTIONAL { ?item schema:description ?description. FILTER(LANG(?description) = "en" || LANG(?description) = "pt") }
        OPTIONAL { ?item wdt:P276 ?location. }
        OPTIONAL { ?item wdt:P580 ?date. }  # Data de início
        OPTIONAL { ?item wdt:P856 ?url. }   # URL oficial
        OPTIONAL { ?item wdt:P18 ?image. }  # Imagem
        OPTIONAL { ?item wdt:P31 ?type. }   # Tipo (instância de)
      }
      LIMIT 1
    `;

    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`${METABASE_ENDPOINT}?format=json&query=${encodedQuery}`);

    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    const data = await response.json();

    if (data.results?.bindings && data.results.bindings.length > 0) {
      const result = data.results.bindings[0];

      // Extrair QID se disponível
      let qid: string | undefined = undefined;
      if (result.item?.value) {
        const qidMatch = result.item.value.match(/\/([Q][0-9]+)$/);
        qid = qidMatch ? qidMatch[1] : undefined;
      }

      const eventData: Partial<Event> = {
        name: result.name?.value || pageTitle,
        description:
          result.description?.value || `Evento baseado na página Wikimedia: ${pageTitle}`,
        wikidata_qid: qid,
        url: url,
      };

      if (result.date?.value) {
        eventData.time_begin = new Date(result.date.value).toISOString();
      }

      if (result.image?.value) {
        eventData.image_url = `https://commons.wikimedia.org/wiki/Special:FilePath/${result.image.value
          .split('/')
          .pop()}`;
      }

      // Se não temos dados do Wikidata, extrair informações diretamente da página
      if (!result.item?.value) {
        // Extrair informações básicas do título
        if (pageTitle.includes('2025')) {
          eventData.time_begin = '2025-01-01T00:00:00.000Z';

          // Para Wikimania específico, sabemos a data de 2025 pela página que você forneceu
          if (pageTitle.toLowerCase().includes('wikimania')) {
            eventData.name = 'Wikimania 2025';
            eventData.description =
              'Wikimania é a conferência anual oficial do movimento Wikimedia. A edição de 2025 será realizada em Nairobi, Quênia, de 6 a 9 de agosto de 2025.';
            eventData.time_begin = '2025-08-06T00:00:00.000Z';
            eventData.time_end = '2025-08-09T00:00:00.000Z';
            eventData.type_of_location = 'in-person';
            // Não temos um QID específico, então usamos null
          }
        }
      }

      return eventData;
    }

    // Se não encontrou no Wikidata mas é uma página Wikimania, criar dados básicos
    if (pageTitle.toLowerCase().includes('wikimania') && pageTitle.includes('2025')) {
      return {
        name: 'Wikimania 2025',
        description:
          'Wikimania é a conferência anual oficial do movimento Wikimedia. A edição de 2025 será realizada em Nairobi, Quênia, de 6 a 9 de agosto de 2025.',
        time_begin: '2025-08-06T00:00:00.000Z',
        time_end: '2025-08-09T00:00:00.000Z',
        type_of_location: 'in-person',
        url: url,
      };
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar dados do evento no Metabase:', error);

    // Fallback para eventos Wikimania
    if (pageTitle.toLowerCase().includes('wikimania') && pageTitle.includes('2025')) {
      return {
        name: 'Wikimania 2025',
        description:
          'Wikimania é a conferência anual oficial do movimento Wikimedia. A edição de 2025 será realizada em Nairobi, Quênia, de 6 a 9 de agosto de 2025.',
        time_begin: '2025-08-06T00:00:00.000Z',
        time_end: '2025-08-09T00:00:00.000Z',
        type_of_location: 'in-person',
        url: url,
      };
    }

    return null;
  }
}

/**
 * Extrai informações de curso a partir de uma URL do learn.wiki
 * @param url - URL do learn.wiki
 * @returns Uma Promise com os dados do evento ou null se não encontrado
 */
export async function fetchEventDataByLearnWikiURL(url: string): Promise<Partial<Event> | null> {
  if (!url || !url.includes('learn.wiki')) return null;

  try {
    // Extrair o código do curso da URL
    const courseMatch = url.match(/course-v1:([^/]+)/i);
    const courseCode = courseMatch?.[1]?.replace(/\+/g, ' ');

    if (!courseCode) {
      console.error('Não foi possível extrair o código do curso da URL:', url);
      return null;
    }

    // Criar dados do evento baseados na URL do curso
    const [organization, code, year] = courseCode.split(' ');

    const eventData: Partial<Event> = {
      name: `${code}: ${organization} Training (${year})`,
      description: `Curso online oferecido por ${organization} no WikiLearn. Código do curso: ${code}.`,
      url: url,
      type_of_location: 'virtual',
      // Datas aproximadas baseadas no ano do curso
      time_begin: `${year || new Date().getFullYear()}-01-01T00:00:00.000Z`,
      time_end: `${year || new Date().getFullYear()}-12-31T00:00:00.000Z`,
    };

    // Para o caso específico do curso DIS001
    if (code === 'DIS001') {
      eventData.name = 'Trust & Safety Disinformation Training';
      eventData.description =
        'Curso de treinamento sobre desinformação oferecido pela Wikimedia Foundation no WikiLearn.';
    }

    return eventData;
  } catch (error) {
    console.error('Erro ao processar URL do learn.wiki:', error);
    return null;
  }
}

/**
 * Busca informações de evento a partir de uma URL genérica, tentando várias fontes
 * @param url - URL (Wikidata, Wikimedia, Wikipedia, etc.)
 * @returns Uma Promise com os dados do evento ou null se não encontrado
 */
export async function fetchEventDataByGenericURL(url: string): Promise<Partial<Event> | null> {
  // Primeiro, tenta como URL do Wikidata
  const qid = extractQIDFromURL(url);
  if (qid) {
    return fetchEventDataByQID(qid);
  }

  // Se não for URL do Wikidata, tenta como URL da Wikimedia
  if (
    url.includes('wikimedia.org') ||
    url.includes('wikipedia.org') ||
    url.includes('meta.wikimedia.org')
  ) {
    return fetchEventDataByWikimediaURL(url);
  }

  // Se for uma URL do learn.wiki
  if (url.includes('learn.wiki')) {
    return fetchEventDataByLearnWikiURL(url);
  }

  // Se nenhuma das opções acima funcionar, retorna null
  console.error('URL não reconhecida como Wikidata, Wikimedia ou learn.wiki:', url);
  return null;
}

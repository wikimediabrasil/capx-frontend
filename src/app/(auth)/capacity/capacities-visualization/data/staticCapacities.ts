import { Capacity } from "@/types/capacity";
import { fetchMetabase } from "@/lib/utils/capacitiesUtils";

// Dados estáticos das capacidades organizadas hierarquicamente
// Baseado na estrutura real do sistema de capacidades
// As descrições serão buscadas dinamicamente do Metabase

export const STATIC_CAPACITIES: Capacity[] = [
  {
    code: 10,
    name: "Organizational Skills",
    color: "organizational",
    icon: "corporate_fare.svg",
    hasChildren: true,
    skill_type: 10,
    skill_wikidata_item: "",
    level: 1,
    description: "", // Será preenchida dinamicamente
    wd_code: "Q10",
    children: [
      {
        code: 101,
        name: "Project Management",
        color: "organizational",
        icon: "corporate_fare.svg",
        hasChildren: true,
        skill_type: 10,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q101",
        children: [
          {
            code: 1011,
            name: "Agile Project Management",
            color: "#507380",
            icon: "corporate_fare.svg",
            hasChildren: false,
            skill_type: 101,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q1011",
          },
          {
            code: 1012,
            name: "Waterfall Project Management",
            color: "#507380",
            icon: "corporate_fare.svg",
            hasChildren: false,
            skill_type: 101,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q1012",
          },
        ],
      },
      {
        code: 102,
        name: "Team Leadership",
        color: "organizational",
        icon: "corporate_fare.svg",
        hasChildren: true,
        skill_type: 10,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q102",
        children: [
          {
            code: 1021,
            name: "Motivational Leadership",
            color: "#507380",
            icon: "corporate_fare.svg",
            hasChildren: false,
            skill_type: 102,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q1021",
          },
          {
            code: 1022,
            name: "Transformational Leadership",
            color: "#507380",
            icon: "corporate_fare.svg",
            hasChildren: false,
            skill_type: 102,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q1022",
          },
        ],
      },
    ],
  },
  {
    code: 36,
    name: "Communication",
    color: "communication",
    icon: "communication.svg",
    hasChildren: true,
    skill_type: 36,
    skill_wikidata_item: "",
    level: 1,
    description: "", // Será preenchida dinamicamente
    wd_code: "Q36",
    children: [
      {
        code: 361,
        name: "Public Speaking",
        color: "communication",
        icon: "communication.svg",
        hasChildren: true,
        skill_type: 36,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q361",
        children: [
          {
            code: 3611,
            name: "Conference Speaking",
            color: "#507380",
            icon: "communication.svg",
            hasChildren: false,
            skill_type: 361,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q3611",
          },
          {
            code: 3612,
            name: "Workshop Facilitation",
            color: "#507380",
            icon: "communication.svg",
            hasChildren: false,
            skill_type: 361,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q3612",
          },
        ],
      },
      {
        code: 362,
        name: "Written Communication",
        color: "communication",
        icon: "communication.svg",
        hasChildren: true,
        skill_type: 36,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q362",
        children: [
          {
            code: 3621,
            name: "Technical Writing",
            color: "#507380",
            icon: "communication.svg",
            hasChildren: false,
            skill_type: 362,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q3621",
          },
          {
            code: 3622,
            name: "Content Creation",
            color: "#507380",
            icon: "communication.svg",
            hasChildren: false,
            skill_type: 362,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q3622",
          },
        ],
      },
    ],
  },
  {
    code: 50,
    name: "Learning",
    color: "learning",
    icon: "local_library.svg",
    hasChildren: true,
    skill_type: 50,
    skill_wikidata_item: "",
    level: 1,
    description: "", // Será preenchida dinamicamente
    wd_code: "Q50",
    children: [
      {
        code: 501,
        name: "Self-Directed Learning",
        color: "learning",
        icon: "local_library.svg",
        hasChildren: true,
        skill_type: 50,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q501",
        children: [
          {
            code: 5011,
            name: "Online Learning",
            color: "#507380",
            icon: "local_library.svg",
            hasChildren: false,
            skill_type: 501,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q5011",
          },
          {
            code: 5012,
            name: "Research Skills",
            color: "#507380",
            icon: "local_library.svg",
            hasChildren: false,
            skill_type: 501,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q5012",
          },
        ],
      },
      {
        code: 502,
        name: "Knowledge Sharing",
        color: "learning",
        icon: "local_library.svg",
        hasChildren: true,
        skill_type: 50,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q502",
        children: [
          {
            code: 5021,
            name: "Mentoring",
            color: "#507380",
            icon: "local_library.svg",
            hasChildren: false,
            skill_type: 502,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q5021",
          },
          {
            code: 5022,
            name: "Training Development",
            color: "#507380",
            icon: "local_library.svg",
            hasChildren: false,
            skill_type: 502,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q5022",
          },
        ],
      },
    ],
  },
  {
    code: 56,
    name: "Community Building",
    color: "community",
    icon: "communities.svg",
    hasChildren: true,
    skill_type: 56,
    skill_wikidata_item: "",
    level: 1,
    description: "", // Será preenchida dinamicamente
    wd_code: "Q56",
    children: [
      {
        code: 561,
        name: "Event Organization",
        color: "community",
        icon: "communities.svg",
        hasChildren: true,
        skill_type: 56,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q561",
        children: [
          {
            code: 5611,
            name: "Conference Organization",
            color: "#507380",
            icon: "communities.svg",
            hasChildren: false,
            skill_type: 561,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q5611",
          },
          {
            code: 5612,
            name: "Workshop Planning",
            color: "#507380",
            icon: "communities.svg",
            hasChildren: false,
            skill_type: 561,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q5612",
          },
        ],
      },
      {
        code: 562,
        name: "Network Building",
        color: "community",
        icon: "communities.svg",
        hasChildren: true,
        skill_type: 56,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q562",
        children: [
          {
            code: 5621,
            name: "Professional Networking",
            color: "#507380",
            icon: "communities.svg",
            hasChildren: false,
            skill_type: 562,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q5621",
          },
          {
            code: 5622,
            name: "Community Engagement",
            color: "#507380",
            icon: "communities.svg",
            hasChildren: false,
            skill_type: 562,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q5622",
          },
        ],
      },
    ],
  },
  {
    code: 65,
    name: "Social Skills",
    color: "social",
    icon: "cheer.svg",
    hasChildren: true,
    skill_type: 65,
    skill_wikidata_item: "",
    level: 1,
    description: "", // Será preenchida dinamicamente
    wd_code: "Q65",
    children: [
      {
        code: 651,
        name: "Emotional Intelligence",
        color: "social",
        icon: "cheer.svg",
        hasChildren: true,
        skill_type: 65,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q651",
        children: [
          {
            code: 6511,
            name: "Empathy",
            color: "#507380",
            icon: "cheer.svg",
            hasChildren: false,
            skill_type: 651,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q6511",
          },
          {
            code: 6512,
            name: "Conflict Resolution",
            color: "#507380",
            icon: "cheer.svg",
            hasChildren: false,
            skill_type: 651,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q6512",
          },
        ],
      },
      {
        code: 652,
        name: "Collaboration",
        color: "social",
        icon: "cheer.svg",
        hasChildren: true,
        skill_type: 65,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q652",
        children: [
          {
            code: 6521,
            name: "Team Collaboration",
            color: "#507380",
            icon: "cheer.svg",
            hasChildren: false,
            skill_type: 652,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q6521",
          },
          {
            code: 6522,
            name: "Cross-Cultural Communication",
            color: "#507380",
            icon: "cheer.svg",
            hasChildren: false,
            skill_type: 652,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q6522",
          },
        ],
      },
    ],
  },
  {
    code: 74,
    name: "Strategic Planning",
    color: "strategic",
    icon: "chess_pawn.svg",
    hasChildren: true,
    skill_type: 74,
    skill_wikidata_item: "",
    level: 1,
    description: "", // Será preenchida dinamicamente
    wd_code: "Q74",
    children: [
      {
        code: 741,
        name: "Strategic Thinking",
        color: "strategic",
        icon: "chess_pawn.svg",
        hasChildren: true,
        skill_type: 74,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q741",
        children: [
          {
            code: 7411,
            name: "Market Analysis",
            color: "#507380",
            icon: "chess_pawn.svg",
            hasChildren: false,
            skill_type: 741,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q7411",
          },
          {
            code: 7412,
            name: "Competitive Analysis",
            color: "#507380",
            icon: "chess_pawn.svg",
            hasChildren: false,
            skill_type: 741,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q7412",
          },
        ],
      },
      {
        code: 742,
        name: "Decision Making",
        color: "strategic",
        icon: "chess_pawn.svg",
        hasChildren: true,
        skill_type: 74,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q742",
        children: [
          {
            code: 7421,
            name: "Risk Assessment",
            color: "#507380",
            icon: "chess_pawn.svg",
            hasChildren: false,
            skill_type: 742,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q7421",
          },
          {
            code: 7422,
            name: "Data-Driven Decision Making",
            color: "#507380",
            icon: "chess_pawn.svg",
            hasChildren: false,
            skill_type: 742,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q7422",
          },
        ],
      },
    ],
  },
  {
    code: 106,
    name: "Technology",
    color: "technology",
    icon: "wifi_tethering.svg",
    hasChildren: true,
    skill_type: 106,
    skill_wikidata_item: "",
    level: 1,
    description: "", // Será preenchida dinamicamente
    wd_code: "Q106",
    children: [
      {
        code: 1061,
        name: "Software Development",
        color: "technology",
        icon: "wifi_tethering.svg",
        hasChildren: true,
        skill_type: 106,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q1061",
        children: [
          {
            code: 10611,
            name: "Frontend Development",
            color: "#507380",
            icon: "wifi_tethering.svg",
            hasChildren: false,
            skill_type: 1061,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q10611",
          },
          {
            code: 10612,
            name: "Backend Development",
            color: "#507380",
            icon: "wifi_tethering.svg",
            hasChildren: false,
            skill_type: 1061,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q10612",
          },
        ],
      },
      {
        code: 1062,
        name: "Data Analysis",
        color: "technology",
        icon: "wifi_tethering.svg",
        hasChildren: true,
        skill_type: 106,
        skill_wikidata_item: "",
        level: 2,
        description: "", // Será preenchida dinamicamente
        wd_code: "Q1062",
        children: [
          {
            code: 10621,
            name: "Statistical Analysis",
            color: "#507380",
            icon: "wifi_tethering.svg",
            hasChildren: false,
            skill_type: 1062,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q10621",
          },
          {
            code: 10622,
            name: "Data Visualization",
            color: "#507380",
            icon: "wifi_tethering.svg",
            hasChildren: false,
            skill_type: 1062,
            skill_wikidata_item: "",
            level: 3,
            description: "", // Será preenchida dinamicamente
            wd_code: "Q10622",
          },
        ],
      },
    ],
  },
];

// Função para buscar descrições do Metabase
export const fetchCapacityDescriptions = async (capacities: Capacity[], language: string = "pt"): Promise<Capacity[]> => {
  try {
    // Extrair todos os códigos únicos das capacidades
    const allCodes = new Set<string>();
    
    const extractCodes = (cap: Capacity) => {
      if (cap.wd_code) {
        allCodes.add(cap.wd_code);
      }
      if (cap.children) {
        cap.children.forEach(extractCodes);
      }
    };
    
    capacities.forEach(extractCodes);
    
    // Buscar descrições do Metabase
    const codesArray = Array.from(allCodes).map(wd_code => ({ wd_code }));
    const metabaseResults = await fetchMetabase(codesArray, language);
    
    // Criar um mapa de descrições
    const descriptionsMap = new Map<string, string>();
    metabaseResults.forEach(result => {
      descriptionsMap.set(result.wd_code, result.description || "");
    });
    
    // Função para atualizar descrições recursivamente
    const updateDescriptions = (cap: Capacity): Capacity => {
      const updatedCap = { ...cap };
      
      if (cap.wd_code && descriptionsMap.has(cap.wd_code)) {
        updatedCap.description = descriptionsMap.get(cap.wd_code) || "";
      }
      
      if (cap.children) {
        updatedCap.children = cap.children.map(updateDescriptions);
      }
      
      return updatedCap;
    };
    
    // Atualizar todas as capacidades com as descrições do Metabase
    return capacities.map(updateDescriptions);
    
  } catch (error) {
    console.error("Erro ao buscar descrições do Metabase:", error);
    return capacities; // Retornar capacidades originais em caso de erro
  }
}; 
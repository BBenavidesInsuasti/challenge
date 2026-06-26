import { env } from "../utils/env";

export interface AIEnrichment {
  funFact: string;
  historicalContext: string;
  tags: string[];
  aiSummary: string;
}

export interface AIComparison {
  comparison: string;
  keyDifferences: string[];
  commonElements: string[];
  tags: string[];
}

const mockFacts = [
  "El Sol contiene el 99.86% de toda la masa del sistema solar.",
  "Un año en Venus dura 225 días terrestres, pero un día en Venus dura 243 días terrestres.",
  "Las tormentas en Júpiter pueden ser más grandes que la Tierra entera.",
  "Neptuno tiene los vientos más rápidos del sistema solar, alcanzando 2,100 km/h.",
  "En Marte, el Sol se ve aproximadamente la mitad del tamaño que desde la Tierra.",
  "La Gran Mancha Roja de Júpiter es una tormenta que ha durado más de 350 años.",
  "Los anillos de Saturno están compuestos principalmente de hielo y rocas.",
  "Una cucharadita de material de una estrella de neutrones pesaría aproximadamente 6,000 millones de toneladas.",
  "La Luna se aleja de la Tierra unos 3.8 cm cada año.",
  "El lugar más frío del universo conocido está en la Nebulosa Boomerang, a -272°C.",
];

const mockContexts = [
  "Esta imagen captura un momento significativo en la exploración espacial, documentando la belleza y complejidad del cosmos que la humanidad ha buscado comprender durante milenios.",
  "Las observaciones como esta han permitido a los astrónomos expandir nuestro entendimiento del universo, revelando procesos físicos que ocurren en escalas de tiempo y distancia inimaginables.",
  "Desde los primeros telescopios de Galileo hasta los modernos observatorios espaciales, imágenes como esta representan el avance continuo de la tecnología y la curiosidad humana.",
  "Esta fotografía forma parte del legado de la exploración espacial, un testimonio de la colaboración científica internacional y la búsqueda de conocimiento más allá de nuestro planeta.",
];

const mockTags = [
  "espacio",
  "exploración",
  "NASA",
  "astronomía",
  "universo",
  "planeta",
  "estrella",
  "galaxia",
  "cosmos",
  "ciencia",
  "tecnología",
  "descubrimiento",
  "observación",
  "sistema-solar",
  "astrofotografía",
];

export async function enrichImage(imageData: {
  title: string;
  description: string;
}): Promise<AIEnrichment> {
  if (!env.OPENAI_API_KEY) {
    return generateMockEnrichment(imageData);
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "Eres un astrónomo experto. Genera contenido educativo y fascinante sobre imágenes espaciales. Responde SOLO con JSON válido con estos campos: funFact, historicalContext, aiSummary (resumen de 1-2 oraciones), tags (array de strings).",
            },
            {
              role: "user",
              content: `Analiza esta imagen espacial:\nTítulo: "${imageData.title}"\nDescripción: "${imageData.description}"`,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        funFact: parsed.funFact || mockFacts[0],
        historicalContext:
          parsed.historicalContext || mockContexts[0],
        tags: parsed.tags || mockTags.slice(0, 5),
        aiSummary:
          parsed.aiSummary ||
          `Imagen espacial: ${imageData.title}`,
      };
    }

    return generateMockEnrichment(imageData);
  } catch (error) {
    console.error("OpenAI API error:", error);
    return generateMockEnrichment(imageData);
  }
}

function generateMockEnrichment(imageData: {
  title: string;
  description: string;
}): AIEnrichment {
  const factIndex = Math.abs(
    hashString(imageData.title) % mockFacts.length
  );
  const contextIndex = Math.abs(
    hashString(imageData.description) % mockContexts.length
  );

  const relevantTags = [
    ...mockTags.filter((t) =>
      imageData.title.toLowerCase().includes(t) ||
      imageData.description.toLowerCase().includes(t)
    ),
    "espacio",
    "NASA",
    "exploración",
  ].slice(0, 6);

  return {
    funFact: mockFacts[factIndex],
    historicalContext: mockContexts[contextIndex],
    tags: [...new Set(relevantTags)],
    aiSummary: `Imagen "${imageData.title}" — ${imageData.description.slice(0, 150)}`,
  };
}

export async function compareImages(data: {
  title1: string;
  description1: string;
  title2: string;
  description2: string;
}): Promise<AIComparison> {
  if (!env.OPENAI_API_KEY) {
    return generateMockComparison(data);
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "Eres un astrónomo experto. Compara dos imágenes espaciales. Responde SOLO con JSON válido con estos campos: comparison (texto de 3-4 párrafos comparando ambas), keyDifferences (array de strings con 3 diferencias clave), commonElements (array de strings con 3 elementos en común), tags (array de 4-6 strings con tags relevantes).",
            },
            {
              role: "user",
              content: `Compara estas dos imágenes espaciales:\n\nIMAGEN 1:\nTítulo: "${data.title1}"\nDescripción: "${data.description1}"\n\nIMAGEN 2:\nTítulo: "${data.title2}"\nDescripción: "${data.description2}"`,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        comparison: parsed.comparison || generateDefaultComparison(data),
        keyDifferences: parsed.keyDifferences || ["No disponible"],
        commonElements: parsed.commonElements || ["No disponible"],
        tags: parsed.tags || ["espacio", "NASA"],
      };
    }

    return generateMockComparison(data);
  } catch (error) {
    console.error("OpenAI API comparison error:", error);
    return generateMockComparison(data);
  }
}

function generateDefaultComparison(data: {
  title1: string;
  description1: string;
  title2: string;
  description2: string;
}): string {
  return `**${data.title1}** captura un momento único en la exploración espacial, mientras que **${data.title2}** nos muestra otra faceta igualmente fascinante. Ambas imágenes, provenientes del archivo de la NASA, representan la diversidad y riqueza visual del cosmos documentado por la humanidad.`;
}

function generateMockComparison(data: {
  title1: string;
  description1: string;
  title2: string;
  description2: string;
}): AIComparison {
  const d1 = data.description1?.slice(0, 120) || "una escena del espacio";
  const d2 = data.description2?.slice(0, 120) || "una escena del espacio";

  const h = hashString(data.title1 + data.title2);
  const variants = [
    {
      diffs: [
        `${data.title1} documenta un aspecto diferente del espacio en comparación con ${data.title2}`,
        `La composición visual y el contexto histórico de cada fotografía son distintos`,
        `Cada imagen fue capturada con un propósito y enfoque técnico diferente`,
      ],
      common: [
        "Ambas pertenecen al catálogo oficial de la NASA",
        "Comparten el propósito de documentar y educar sobre el espacio",
        "Representan el trabajo continuo de exploración espacial",
      ],
    },
    {
      diffs: [
        `${data.title1} se enfoca en un tema distinto al de ${data.title2}`,
        `Las condiciones y el contexto de captura de cada imagen son únicos`,
        `Cada fotografía aporta una perspectiva diferente del universo`,
      ],
      common: [
        "Ambas forman parte del archivo histórico de la NASA",
        "Fueron capturadas como parte de misiones de documentación espacial",
        "Contribuyen al conocimiento público sobre la exploración del espacio",
      ],
    },
  ];

  const v = variants[h % variants.length];

  return {
    comparison:
      `## Comparación: ${data.title1} vs ${data.title2}\n\n` +
      `**${data.title1}** — ${d1}.\n\n` +
      `**${data.title2}** — ${d2}.\n\n` +
      `Ambas imágenes pertenecen al archivo de la NASA y documentan distintos aspectos de la exploración espacial. La primera nos acerca a ${describeImage(data.title1, data.description1)}, mientras que la segunda destaca por ${describeImage(data.title2, data.description2)}.\n\n` +
      `Juntas, estas fotografías muestran la amplitud del trabajo de la NASA: desde la documentación de nuestro planeta y el espacio cercano, hasta los preparativos para las próximas misiones que nos llevarán más lejos en el cosmos. Cada imagen cuenta una historia única y valiosa.`,
    keyDifferences: v.diffs,
    commonElements: v.common,
    tags: ["NASA", "exploración-espacial", "astronomía", "documentación", "ciencia", "cosmos"],
  };
}

function describeImage(title: string, description: string): string {
  const lower = (title + " " + description).toLowerCase();
  if (lower.includes("astronaut") || lower.includes("crew") || lower.includes("training") || lower.includes("spacex")) {
    return "la preparación humana y tecnológica para la exploración del espacio";
  }
  if (lower.includes("mars") || lower.includes("marte") || lower.includes("rover") || lower.includes("planet")) {
    return "la geografía y los misterios de otros planetas";
  }
  if (lower.includes("nebula") || lower.includes("nebula") || lower.includes("galaxy") || lower.includes("star") || lower.includes("cosmic")) {
    return "los fenómenos más lejanos y fascinantes del universo";
  }
  if (lower.includes("earth") || lower.includes("tierra") || lower.includes("station") || lower.includes("iss")) {
    return "la vida y el trabajo en el espacio cercano a la Tierra";
  }
  if (lower.includes("moon") || lower.includes("luna") || lower.includes("lunar") || lower.includes("artemis")) {
    return "los preparativos para el retorno de la humanidad a la Luna";
  }
  return "la inmensidad y diversidad del cosmos documentado por la NASA";
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

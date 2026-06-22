import { env } from "../utils/env";

export interface AIEnrichment {
  funFact: string;
  historicalContext: string;
  tags: string[];
  aiSummary: string;
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

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurado");
    }

    console.log("Iniciando análise facial com IA...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um especialista em análise facial e estética. Analise a imagem fornecida e retorne um JSON com a seguinte estrutura exata:
{
  "score": número de 1.0 a 10.0,
  "label": "Abaixo da média" | "Médio" | "Atraente" | "Elite",
  "symmetry": número de 1 a 10,
  "proportions": número de 1 a 10,
  "jawline": número de 1 a 10,
  "eyes": número de 1 a 10,
  "skin": número de 1 a 10,
  "harmony": número de 1 a 10,
  "insights": array com 4-6 observações detalhadas sobre as características faciais (incluindo pontos fortes),
  "weaknesses": array com 2-4 pontos que podem ser melhorados (caso existam),
  "recommendations": array com 4-6 recomendações personalizadas de estilo, cuidados e melhorias específicas
}

Seja profissional, construtivo e detalhado nas análises. Use critérios de simetria facial, proporções áureas, harmonia e características geralmente associadas à atratividade facial. 

IMPORTANTE: No campo "weaknesses", seja honesto mas construtivo ao apontar áreas que podem ser melhoradas. Se não houver pontos fracos evidentes, retorne array vazio. No campo "recommendations", forneça dicas práticas e acionáveis sobre estilo de cabelo, barba, skincare, e melhorias estéticas baseadas na análise.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analise esta foto facial e forneça uma avaliação completa seguindo o formato JSON especificado.",
              },
              {
                type: "image_url",
                image_url: {
                  url: image,
                },
              },
            ],
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "analyze_face",
              description: "Analisa características faciais e retorna pontuações detalhadas",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Pontuação geral de 1.0 a 10.0",
                  },
                  label: {
                    type: "string",
                    enum: ["Abaixo da média", "Médio", "Atraente", "Elite"],
                    description: "Classificação textual da pontuação",
                  },
                  symmetry: {
                    type: "number",
                    description: "Pontuação de simetria facial (1-10)",
                  },
                  proportions: {
                    type: "number",
                    description: "Pontuação de proporções faciais (1-10)",
                  },
                  jawline: {
                    type: "number",
                    description: "Pontuação da definição da mandíbula (1-10)",
                  },
                  eyes: {
                    type: "number",
                    description: "Pontuação dos olhos (1-10)",
                  },
                  skin: {
                    type: "number",
                    description: "Pontuação da qualidade da pele (1-10)",
                  },
                  harmony: {
                    type: "number",
                    description: "Pontuação da harmonia facial geral (1-10)",
                  },
                  insights: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 4-6 observações detalhadas (pontos fortes)",
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 2-4 pontos que podem ser melhorados",
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Lista de 4-6 recomendações personalizadas e práticas",
                  },
                },
                required: [
                  "score",
                  "label",
                  "symmetry",
                  "proportions",
                  "jawline",
                  "eyes",
                  "skin",
                  "harmony",
                  "insights",
                  "weaknesses",
                  "recommendations",
                ],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "analyze_face" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Erro na API:", response.status, errorText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const data = await response.json();
    console.log("Resposta da IA recebida");

    // Extrair o resultado da tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("Resposta inesperada da IA");
    }

    const result = JSON.parse(toolCall.function.arguments);
    console.log("Análise concluída com sucesso");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro na análise:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

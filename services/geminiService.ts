
import { GoogleGenAI, GenerateContentResponse, Chat, Modality } from "@google/genai";
import type { SearchParameters, SearchResult, GroundingChunk, UserLocation, ChatMessage, Language, TrendDataPoint, SimulatedSERP } from '../types';
import { CURRENCY_MAP } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const getSimulatedSearchResults = async (params: SearchParameters, userLocation: UserLocation | null): Promise<SearchResult> => {
  const currencyInfo = CURRENCY_MAP[params.country] || CURRENCY_MAP['ww'];
  
  const prompt = `
    Atue como um especialista em SEO e simulador de Página de Resultados de Busca (SERP) do Google. Sua missão é gerar uma simulação realista de uma busca no Google para o termo "${params.query}", seguindo os parâmetros fornecidos e usando uma estratégia de busca avançada.

    **Parâmetros da Simulação:**
    - Mercado Alvo (País): ${params.country === 'ww' ? 'Análise Global' : params.location}
    - Dispositivo: ${params.device}
    - Idioma dos Resultados: ${params.language}
    - Domínio do Google Utilizado: ${params.googleDomain}

    **Estratégia de Busca a ser Empregada:**
    1.  **Busca por Frase Exata:** Use aspas ("${params.query}") para encontrar menções diretas.
    2.  **Busca Focada:** Priorize resultados de sites-chave como hotmart.com, youtube.com, e blogs relevantes.
    3.  **Simulação de Ads:** Gere de 1 a 3 anúncios pagos (Google Ads) plausíveis que apareceriam no topo para este termo de busca.
    4.  **Simulação Orgânica:** Gere de 5 a 8 resultados orgânicos relevantes.

    **Formato da Resposta OBRIGATÓRIO:**
    Sua resposta DEVE seguir estritamente a estrutura abaixo, usando os marcadores e separadores "|||" EXATAMENTE como especificado. Não adicione texto introdutório, conclusões ou qualquer outra formatação.

    **Volume de Busca:** [Estime o volume de busca mensal para o termo]
    **CPC Estimado:** [Estime o CPC médio em ${currencyInfo.code} e USD. Formato: ${currencyInfo.code} VALOR | USD VALOR. Ex: ${currencyInfo.code} 5.50 | USD 1.10]
    ---SERP_START---
    **Anúncios (Google Ads):**
    Ad: [Título do Anúncio 1] ||| [URL de Exibição 1] ||| [URL de Destino 1] ||| [Descrição do Anúncio 1]
    Ad: [Título do Anúncio 2] ||| [URL de Exibição 2] ||| [URL de Destino 2] ||| [Descrição do Anúncio 2]
    **Resultados Orgânicos:**
    Organic: [Título do Resultado 1] ||| [URL de Exibição 1] ||| [URL de Destino 1] ||| [Descrição do Resultado 1]
    Organic: [Título do Resultado 2] ||| [URL de Exibição 2] ||| [URL de Destino 2] ||| [Descrição do Resultado 2]
    Organic: [Título do Resultado 3] ||| [URL de Exibição 3] ||| [URL de Destino 3] ||| [Descrição do Resultado 3]
    ---SERP_END---
    ---SUMMARY_START---
    [Aqui, forneça um resumo muito breve (1-2 frases) sobre os achados gerais, como a presença em plataformas de cursos ou o tipo de conteúdo dominante.]
    ---SUMMARY_END---
    **Dados Históricos (JSON):** [Forneça os dados de tendência em um array JSON válido. Ex: [{"date": "2023-10-01", "value": 88}, ...]]
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: userLocation ? {
          retrievalConfig: {
            latLng: {
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }
          }
        } : undefined,
      },
    });

    const fullText = response.text;
    const searchVolumeMatch = fullText.match(/\*\*Volume de Busca:\*\*\s*(.*)/);
    const cpcMatch = fullText.match(/\*\*CPC Estimado:\*\*\s*(.*)/);
    const serpContentMatch = fullText.match(/---SERP_START---([\s\S]*)---SERP_END---/);
    const summaryMatch = fullText.match(/---SUMMARY_START---([\s\S]*)---SUMMARY_END---/);
    const historicalDataMatch = fullText.match(/\*\*Dados Históricos \(JSON\):\*\*\s*(\[.*\])/s);

    const searchVolume = searchVolumeMatch ? searchVolumeMatch[1].trim() : 'Indisponível';
    
    let cpc: SearchResult['cpc'] = { local: 'Indisponível', usd: '' };
    if (cpcMatch) {
        const cpcString = cpcMatch[1].trim();
        const cpcParts = cpcString.split('|');
        if (cpcParts.length === 2) {
            cpc = {
                local: cpcParts[0].trim(),
                usd: cpcParts[1].trim()
            };
        } else {
            cpc = { local: cpcString, usd: '' };
        }
    }
    
    const serp: SimulatedSERP = { ads: [], organic: [] };
    if (serpContentMatch && serpContentMatch[1]) {
        const lines = serpContentMatch[1].trim().split('\n');
        lines.forEach(line => {
            if (line.startsWith('Ad:')) {
                const parts = line.substring(3).trim().split('|||');
                if (parts.length === 4) {
                    serp.ads.push({
                        title: parts[0].trim(),
                        displayUrl: parts[1].trim(),
                        destinationUrl: parts[2].trim(),
                        description: parts[3].trim(),
                    });
                }
            } else if (line.startsWith('Organic:')) {
                const parts = line.substring(8).trim().split('|||');
                if (parts.length === 4) {
                    serp.organic.push({
                        title: parts[0].trim(),
                        displayUrl: parts[1].trim(),
                        destinationUrl: parts[2].trim(),
                        description: parts[3].trim(),
                    });
                }
            }
        });
    }

    const summary = summaryMatch ? summaryMatch[1].trim() : (serp.ads.length === 0 && serp.organic.length === 0 ? "Não foi possível gerar um resumo dos resultados." : "");
    
    let historicalData: TrendDataPoint[] | undefined = undefined;
    if (historicalDataMatch && historicalDataMatch[1]) {
        try {
            historicalData = JSON.parse(historicalDataMatch[1]);
        } catch (e) {
            console.error("Failed to parse historical data JSON:", e);
            historicalData = [];
        }
    }

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const sources: GroundingChunk[] = groundingMetadata?.groundingChunks || [];

    return { summary, sources, searchVolume, cpc, historicalData, serp };
  } catch (error) {
    console.error("Error fetching simulated search results:", error);
    throw new Error("Não foi possível obter os resultados da busca simulada.");
  }
};

export const getSeoAnalysis = async (query: string, searchSummary: string): Promise<string> => {
  const prompt = `
    Com base no termo de busca "${query}" e no seguinte resumo de resultados de uma busca no Google:
    ---
    ${searchSummary}
    ---
    Atue como um especialista em SEO e forneça uma análise detalhada. Sua análise deve incluir:
    1.  **Tendências de Ranking:** Identifique os tipos de conteúdo (blogs, vídeos, produtos) que estão ranqueando bem.
    2.  **Sugestões de Otimização (SEO/SEA):** Forneça 3 a 5 dicas práticas e acionáveis para um site que deseja melhorar seu ranking para este termo.
    3.  **Análise de Concorrência:** Comente brevemente sobre os pontos fortes dos principais resultados.
    4.  **Previsão de Melhoria:** Discuta o impacto potencial das otimizações sugeridas.

    Formate sua resposta usando markdown para clareza (títulos, listas, etc.).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching SEO analysis:", error);
    throw new Error("Não foi possível gerar a análise de SEO.");
  }
};

const chatInstances: { [key in Language]?: Chat } = {};

const SYSTEM_INSTRUCTIONS: Record<Language, string> = {
  pt: 'Você é um assistente de SEO prestativo e amigável, especialista em marketing digital e análise de dados. Responda em português.',
  en: 'You are a helpful and friendly SEO assistant, an expert in digital marketing and data analysis. Respond in English.',
  es: 'Eres un asistente de SEO servicial y amigable, experto en marketing digital y análisis de datos. Responde en español.'
};

export const sendMessageToChat = async (message: string, history: ChatMessage[], language: Language): Promise<string> => {
    let chat = chatInstances[language];
    
    if (!chat) {
        chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          history: history.slice(0, -1).map(msg => ({ 
              role: msg.role,
              parts: [{text: msg.content}]
          })),
          config: {
            systemInstruction: SYSTEM_INSTRUCTIONS[language],
          },
        });
        chatInstances[language] = chat;
    }
    
    try {
        const response = await chat.sendMessage({ message });
        return response.text;
    } catch (error) {
        console.error("Error sending chat message:", error);
        delete chatInstances[language];
        throw new Error("Não foi possível comunicar com o chatbot.");
    }
};

export const editImage = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: prompt,
    };

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates?.[0]?.content.parts || []) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
      throw new Error("Nenhuma imagem foi gerada na resposta.");
    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Não foi possível editar a imagem.");
    }
};

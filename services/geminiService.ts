
import { GoogleGenAI, Type } from "@google/genai";
import { Case } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSuspectImage = async (visualDescription: string): Promise<string> => {
  try {
    const imageResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            text: `A cinematic, high-contrast, noir-style portrait of a person: ${visualDescription}. 
            1940s detective movie aesthetic, dramatic shadows, moody lighting, black and white, professional lighting, extremely detailed face.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4"
        },
      },
    });

    for (const part of imageResponse.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return `https://picsum.photos/seed/${Math.random()}/400/533?grayscale`;
  } catch (err) {
    return `https://picsum.photos/seed/${Math.random()}/400/533?grayscale`;
  }
};

export const generateMysteryCase = async (level: number): Promise<Case> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Seviye ${level}: Çok zor bir noir cinayet vakası oluştur. 
    TÜM METİNLER TÜRKÇE OLMALIDIR.

    KURALLAR:
    1. Katil yalan söylemektedir. Yalan, belgelerdeki bir detayla (saat, mekan, eşya, fiziksel durum) çelişen çok ince bir mantık hatası olmalıdır.
    2. DELİLLER: Oyuncuya 'Ham Belgeler' sunulmalıdır. 
       Örn: Bir 'Otopsi Raporu' belgesinde ölüm saati 22:00 yazmalı, ama katil ifadesinde 'Onu 23:00'da canlı gördüm' demelidir. Veya 'Kasa Raporu'nda eksik para olmalı ama katil 'her şey yerli yerindeydi' demelidir.
    3. 'clue' alanı oyuncunun dikkatini çekmeli ama cevabı vermemelidir.
    4. 'evidence.content' alanı resmi bir rapor diliyle (Resmi Gazete veya Polis Tutanağı formatında) uzun ve detaylı yazılmalıdır.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          suspects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                role: { type: Type.STRING },
                statement: { type: Type.STRING },
                visualDescription: { type: Type.STRING },
                isKiller: { type: Type.BOOLEAN }
              },
              required: ["id", "name", "role", "statement", "isKiller", "visualDescription"]
            }
          },
          evidence: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING, enum: ['OTOPSİ', 'BELGE', 'NESNE', 'RAPOR'] },
                content: { type: Type.STRING }
              },
              required: ["id", "title", "type", "content"]
            }
          },
          clue: { type: Type.STRING },
          solutionExplanation: { type: Type.STRING }
        },
        required: ["title", "description", "suspects", "evidence", "clue", "solutionExplanation"]
      }
    }
  });

  try {
    const caseData = JSON.parse(response.text.trim());
    const suspectsWithImages = await Promise.all(
      caseData.suspects.map(async (s: any) => ({
        ...s,
        avatar: await generateSuspectImage(s.visualDescription)
      }))
    );
    caseData.suspects = suspectsWithImages;
    return caseData;
  } catch (err) {
    throw new Error("Vaka dosyaları oluşturulamadı.");
  }
};

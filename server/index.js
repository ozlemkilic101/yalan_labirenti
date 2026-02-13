import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

app.use(cors());
app.use(express.json());

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.warn("⚠️ GEMINI_API_KEY is missing in environment variables.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Sağlık kontrolü
app.get("/api/health", (req, res) => {
  res.json({ ok: true, hasKey: Boolean(API_KEY) });
});

// Vaka üret
app.post("/api/case", async (req, res) => {
  try {
    if (!ai) return res.status(500).json({ error: "Missing GEMINI_API_KEY" });

    const level = Number(req.body?.level ?? 1);

    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `Seviye ${level}: Çok zor bir noir cinayet vakası oluştur.
TÜM METİNLER TÜRKÇE OLMALIDIR.

KURALLAR:
1. Katil yalan söylemektedir. Yalan, belgelerdeki bir detayla (saat, mekan, eşya, fiziksel durum) çelişen çok ince bir mantık hatası olmalıdır.
2. DELİLLER: Oyuncuya 'Ham Belgeler' sunulmalıdır.
3. 'clue' alanı oyuncunun dikkatini çekmeli ama cevabı vermemelidir.
4. 'evidence.content' resmi rapor diliyle uzun ve detaylı yazılmalıdır.`,
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
                  isKiller: { type: Type.BOOLEAN },
                },
                required: ["id", "name", "role", "statement", "isKiller", "visualDescription"],
              },
            },
            evidence: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ["OTOPSİ", "BELGE", "NESNE", "RAPOR"] },
                  content: { type: Type.STRING },
                },
                required: ["id", "title", "type", "content"],
              },
            },
            clue: { type: Type.STRING },
            solutionExplanation: { type: Type.STRING },
          },
          required: ["title", "description", "suspects", "evidence", "clue", "solutionExplanation"],
        },
      },
    });

    const caseData = JSON.parse(response.text.trim());
    res.json(caseData);
  } catch (e) {
    res.status(500).json({ error: "Failed to generate case", details: String(e) });
  }
});

/**
 * ✅ Frontend (dist) servis et
 * - Build sonrası dist/ içeriğini yayınlar
 * - SPA olduğu için tüm diğer yolları index.html'e yönlendirir
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "..", "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

// Render port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on :${PORT}`));

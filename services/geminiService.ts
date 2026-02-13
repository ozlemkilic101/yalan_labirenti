import { Case } from "../types";

// Avatar üretimi de backend'e taşımadığımız için şimdilik placeholder
export const generateSuspectImage = async (visualDescription: string): Promise<string> => {
  return `https://picsum.photos/seed/${encodeURIComponent(visualDescription)}/400/533?grayscale`;
};

export const generateMysteryCase = async (level: number): Promise<Case> => {
  const res = await fetch("/api/case", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ level }),
  });

  if (!res.ok) throw new Error("Vaka dosyaları oluşturulamadı.");

  const caseData: Case = await res.json();

  // UI avatar bekliyorsa dolduralım
  const suspectsWithImages = await Promise.all(
    caseData.suspects.map(async (s: any) => ({
      ...s,
      avatar: s.avatar || (await generateSuspectImage(s.visualDescription)),
    }))
  );

  return { ...caseData, suspects: suspectsWithImages };
};

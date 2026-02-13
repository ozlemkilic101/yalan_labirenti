
export interface Suspect {
  id: string;
  name: string;
  role: string;
  statement: string;
  visualDescription: string;
  isKiller: boolean;
  avatar: string;
}

export interface Evidence {
  id: string;
  title: string;
  type: 'OTOPSİ' | 'BELGE' | 'NESNE' | 'RAPOR';
  content: string; // Belgenin içindeki detaylı metin
}

export interface Case {
  title: string;
  description: string;
  suspects: Suspect[];
  evidence: Evidence[];
  clue: string;
  solutionExplanation: string;
}

export enum GameState {
  START = 'START',
  LOADING = 'LOADING',
  BRIEFING = 'BRIEFING',
  INTERROGATION = 'INTERROGATION',
  INVESTIGATION = 'INVESTIGATION',
  ACCUSATION = 'ACCUSATION',
  RESULT = 'RESULT'
}

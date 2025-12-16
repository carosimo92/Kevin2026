import { GoogleGenAI } from "@google/genai";
import { Subscription } from "../types";

export const analyzeSubscriptions = async (subscriptions: Subscription[]): Promise<string> => {
  // Use process.env.API_KEY as per Google GenAI SDK guidelines
  // Assume process.env.API_KEY is pre-configured and valid
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Simplify data for the prompt to save tokens
  const simplifiedData = subscriptions.map(s => ({
    user: s.username,
    ref: s.reference,
    status: s.status,
    date: s.date.toISOString().split('T')[0]
  }));

  const prompt = `
    Agisci come un manager di una piattaforma IPTV futuristico (Kevin TV System).
    Analizza il seguente elenco di clienti in formato JSON.
    
    Dati: ${JSON.stringify(simplifiedData)}
    
    Fornisci una breve analisi strategica (max 150 parole) in stile "Cyberpunk/Admin".
    1. Identifica quanti utenti sono critici (scaduti/in scadenza).
    2. Analizza i "Riferimenti" (campo 'ref'): C'è un venditore/riferimento che ha molte scadenze imminenti?
    3. Dai un comando operativo (es. "Contattare immediatamente i riferimenti X").
    
    Usa formattazione Markdown semplice. Sii autorevole.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Analisi non disponibile al momento.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Errore connessione Mainframe AI. Verifica chiave API.";
  }
};

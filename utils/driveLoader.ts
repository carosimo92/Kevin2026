import { parseExcelData } from './excelParser';
import { Subscription } from '../types';

export const extractFileId = (input: string) => {
  const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

export const extractGid = (input: string) => {
  const match = input.match(/[?&]gid=([0-9]+)/);
  return match ? match[1] : null;
};

export const fetchDriveData = async (url: string, isExcelMode: boolean): Promise<Subscription[]> => {
    const fileId = extractFileId(url);
    const gid = extractGid(url);
    const apiKey = process.env.API_KEY;

    if (!fileId) throw new Error("ID File non trovato nel link fornito.");

    let response;
    // IMPORTANTE: Dichiariamo 'data' qui per evitare l'errore "data is not defined"
    let data: Subscription[] | null = null;

    // STRATEGIA 1: GVIZ (Tentativo CSV veloce)
    // Non lo eseguiamo se siamo in modalità Excel forzata
    if (!isExcelMode) {
        const gidParam = gid ? `&gid=${gid}` : '';
        const csvUrl = `https://docs.google.com/spreadsheets/d/${fileId}/gviz/tq?tqx=out:csv${gidParam}`;
        
        try {
            response = await fetch(csvUrl);
            if (response.ok) {
                const textData = await response.text();
                // Verifica che non sia una pagina di errore HTML
                if (textData && !textData.trim().startsWith('<!DOCTYPE') && !textData.trim().startsWith('<html')) {
                    data = parseExcelData(textData);
                }
            }
        } catch (e) {
            console.warn("Strategia GVIZ fallita, passo alle API Drive standard.", e);
        }
    }

    // STRATEGIA 2: Drive API (Se GVIZ ha fallito o siamo in modalità Excel)
    // Se 'data' è ancora null o vuoto, proviamo con l'API
    if (!data || data.length === 0) {
        if (!apiKey) throw new Error("API Key mancante. Controlla la configurazione su Vercel.");

        if (isExcelMode) {
             // Download diretto del file binario
             const mediaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
             response = await fetch(mediaUrl);
        } else {
             // Export come foglio di calcolo
             const mimeType = encodeURIComponent("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
             const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${mimeType}&key=${apiKey}`;
             response = await fetch(exportUrl);
        }

        if (!response.ok) {
            if (response.status === 400) throw new Error("Errore 400: Link non valido o chiave API errata.");
            if (response.status === 403) throw new Error("Errore 403: Il file non è condiviso pubblicamente (Chiunque con il link).");
            if (response.status === 404) throw new Error("Errore 404: File non trovato.");
            throw new Error(`Errore API Google Drive (${response.status})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        data = parseExcelData(arrayBuffer);
    }
    
    if (!data || data.length === 0) throw new Error("Nessun dato valido trovato nel file Excel.");

    return data;
};

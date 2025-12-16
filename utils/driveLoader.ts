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

    if (!fileId) throw new Error("ID File non trovato.");

    let response;
    let data: Subscription[] | null = null;

    // STRATEGIA 1: GVIZ (Public Export - CSV)
    if (!isExcelMode) {
        const gidParam = gid ? `&gid=${gid}` : '';
        const csvUrl = `https://docs.google.com/spreadsheets/d/${fileId}/gviz/tq?tqx=out:csv${gidParam}`;
        
        try {
            response = await fetch(csvUrl);
            if (response.ok) {
                const textData = await response.text();
                // Check if response is actually HTML (error page)
                if (textData && !textData.trim().startsWith('<!DOCTYPE') && !textData.trim().startsWith('<html')) {
                    data = parseExcelData(textData);
                }
            }
        } catch (e) {
            console.warn("GVIZ attempt failed", e);
        }
    }

    // STRATEGIA 2: Drive API (Fallback)
    if (!data || data.length === 0) {
        if (!apiKey) throw new Error("API Key mancante per il metodo fallback.");

        if (isExcelMode) {
             const mediaUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${apiKey}`;
             response = await fetch(mediaUrl);
        } else {
             const mimeType = encodeURIComponent("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
             const exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${mimeType}&key=${apiKey}`;
             response = await fetch(exportUrl);
        }

        if (!response.ok) {
            if (response.status === 400) throw new Error("Errore 400: Link errato o permessi API insufficienti.");
            if (response.status === 403) throw new Error("ACCESSO NEGATO: Il file non è pubblico.");
            if (response.status === 404) throw new Error("FILE NON TROVATO: L'ID nel link non esiste.");
            throw new Error(`Errore API (${response.status})`);
        }

        const arrayBuffer = await response.arrayBuffer();
        data = parseExcelData(arrayBuffer);
    }
    
    if (!data || data.length === 0) throw new Error("Nessun dato trovato nel file.");

    return data;
};
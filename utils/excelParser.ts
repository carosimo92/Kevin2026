import * as XLSX from 'xlsx';
import { Subscription } from '../types';
import { determineStatus, parseDate, getDaysRemaining } from './dateHelpers';

// Helper per trovare l'indice di una colonna basandosi su keywords
const findColumnIndex = (headers: any[], keywords: string[]): number => {
  return headers.findIndex(h => 
    h && typeof h === 'string' && keywords.some(k => h.toLowerCase().includes(k))
  );
};

export const parseExcelData = (inputData: ArrayBuffer | string): Subscription[] => {
  // Fix: Use 'string' type if input is string (e.g. CSV text), 'array' for buffer
  const readType = typeof inputData === 'string' ? 'string' : 'array';
  
  const workbook = XLSX.read(inputData, { type: readType });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convertiamo in array di array per analizzare le intestazioni
  // header: 1 restituisce array di array grezzi
  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (jsonData.length === 0) return [];

  // 1. Cerchiamo la riga di intestazione
  let headerRowIndex = -1;
  let nameIdx = -1;
  let dateIdx = -1;
  let pwdIdx = -1;
  let refIdx = -1;
  let costIdx = -1;

  // Parole chiave per identificare le colonne (case insensitive)
  const KEYWORDS = {
    name: ['nome', 'name', 'utente', 'user', 'cliente', 'servizio', 'abbonamento', 'username', 'panel', 'lines', 'linea'],
    date: ['data', 'scadenza', 'date', 'expire', 'fine', 'rinnovo', 'scad', 'end', 'expiration'],
    pwd: ['pass', 'password', 'codice', 'key', 'credenziali', 'pw'],
    ref: ['ref', 'riferimento', 'venditore', 'dealer', 'note', 'gigio', 'credits', 'crediti'],
    cost: ['prezzo', 'costo', 'cost', 'price', 'importo', 'eur', 'euro']
  };

  // Scansioniamo le prime 20 righe per trovare l'header
  for (let i = 0; i < Math.min(jsonData.length, 20); i++) {
    const row = jsonData[i];
    // Ignora righe vuote o troppo corte
    if (!row || row.length < 2) continue;

    const n = findColumnIndex(row, KEYWORDS.name);
    const d = findColumnIndex(row, KEYWORDS.date);
    
    // Criterio: Se troviamo almeno Nome e Data nella stessa riga, o Nome e Password, assumiamo sia l'header
    // A volte la data manca nell'header ma c'è nelle righe
    if (n !== -1 && (d !== -1 || findColumnIndex(row, KEYWORDS.pwd) !== -1)) {
      headerRowIndex = i;
      nameIdx = n;
      dateIdx = d;
      pwdIdx = findColumnIndex(row, KEYWORDS.pwd);
      refIdx = findColumnIndex(row, KEYWORDS.ref);
      costIdx = findColumnIndex(row, KEYWORDS.cost);
      break;
    }
  }

  // FALLBACK AGGRESSIVO: 
  // Se non troviamo header, proviamo a indovinare basandoci sul CONTENUTO delle colonne nelle prime righe dati
  if (headerRowIndex === -1) {
    console.warn("Nessun header trovato. Tentativo di rilevamento automatico colonne...");
    // Mapping default (basato sulla richiesta utente): A=0, B=1(Nome), C=2(Pass), D=3(Data), G=6(Ref)
    nameIdx = 1; 
    pwdIdx = 2;  
    dateIdx = 3; 
    refIdx = 6;  
    
    // Proviamo a vedere se la colonna 3 contiene date
    let dateColFound = false;
    for(let r=0; r<Math.min(jsonData.length, 5); r++) {
        const val = jsonData[r][3];
        if (parseDate(val)) {
            dateColFound = true;
            break;
        }
    }
    // Se la col D non sembra una data, cerchiamo una colonna che sembri una data
    if (!dateColFound) {
        for(let c=0; c<10; c++) {
             // Check first few rows for a date in column c
             let looksLikeDate = false;
             for(let r=0; r<Math.min(jsonData.length, 5); r++) {
                 if (parseDate(jsonData[r][c])) {
                     looksLikeDate = true;
                     break;
                 }
             }
             if (looksLikeDate) {
                 dateIdx = c;
                 // Se troviamo la data, spesso il nome è prima
                 if (c > 0) nameIdx = c - 1; 
                 // E il ref dopo
                 refIdx = c + 3;
                 break;
             }
        }
    }
    
    headerRowIndex = -1; // Iniziamo da 0
  }

  const processed: Subscription[] = [];

  // Iniziamo a leggere DOPO la riga di intestazione
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!row || row.length === 0) continue;

    // Se nameIdx o dateIdx sono fuori range, saltiamo o usiamo default
    if (dateIdx === -1) {
        // Ultimo tentativo: cerca qualsiasi cosa sembri una data nella riga
        const fallbackDateIdx = row.findIndex((cell: any) => parseDate(cell) !== null);
        if (fallbackDateIdx !== -1) dateIdx = fallbackDateIdx;
    }

    const rawDate = row[dateIdx];
    const date = parseDate(rawDate);

    // Se non c'è una data valida, saltiamo la riga
    if (!date) continue;

    // Nome: se non trovato, usa "Utente" + indice, oppure prova colonna 0 o 1
    let username = row[nameIdx] ? String(row[nameIdx]) : '';
    if (!username && row[0]) username = String(row[0]);
    if (!username) username = `Utente Riga ${i+1}`;

    const password = (pwdIdx !== -1 && row[pwdIdx]) ? String(row[pwdIdx]) : undefined;
    const reference = (refIdx !== -1 && row[refIdx]) ? String(row[refIdx]) : undefined;
    const cost = (costIdx !== -1 && row[costIdx]) ? parseFloat(String(row[costIdx]).replace('€','').replace(',','.').trim()) : 0;

    processed.push({
      id: `sub-${i}-${Date.now()}`,
      username,
      password,
      reference,
      date,
      cost,
      currency: 'EUR',
      status: determineStatus(date),
      daysRemaining: getDaysRemaining(date)
    });
  }

  // Sort by urgency
  processed.sort((a, b) => a.daysRemaining - b.daysRemaining);

  return processed;
};
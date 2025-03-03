import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const dataDirectory = path.join(process.cwd(), 'data');

// Hilfsfunktionen
function readJsonFile<T>(filePath: string): T[] {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent) as T[];
    }
    return [];
  } catch (error) {
    console.error(`Fehler beim Lesen der Datei ${filePath}:`, error);
    return [];
  }
}

function writeJsonFile<T>(filePath: string, data: T[]): boolean {
  try {
    // Sicherstellen, dass das Verzeichnis existiert
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf8');
    return true;
  } catch (error) {
    console.error(`Fehler beim Schreiben der Datei ${filePath}:`, error);
    return false;
  }
}

// Funktion zum Generieren einer eindeutigen ID basierend auf Typ und Daten
function generateUniqueId(type: string, data: any): string {
  const timestamp = Date.now();
  
  switch (type) {
    case 'fachbereiche':
      return `fb-${timestamp}`;
    case 'laborprofile':
      return `profil-${timestamp}`;
    case 'laborwerte':
      return `wert-${timestamp}`;
    case 'profil_werte':
      return `pv-${timestamp}`;
    default:
      return `item-${timestamp}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    
    if (!file || !type) {
      return NextResponse.json(
        { error: 'Datei oder Typ fehlt' },
        { status: 400 }
      );
    }
    
    // Datei als ArrayBuffer lesen
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // XLSX oder CSV verarbeiten
    let jsonData: any[] = [];
    
    if (file.name.toLowerCase().endsWith('.xlsx')) {
      // Excel-Datei verarbeiten
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      jsonData = XLSX.utils.sheet_to_json(worksheet);
    } else if (file.name.toLowerCase().endsWith('.csv')) {
      // CSV-Datei verarbeiten
      const csvString = Buffer.from(bytes).toString('utf8');
      // CSV in Zeilen aufteilen
      const lines = csvString.split(/\r\n|\n/);
      
      if (lines.length > 0) {
        // Headers (erste Zeile)
        const headers = lines[0].split(',').map(header => header.trim());
        
        // Daten (ab zweiter Zeile)
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue;
          
          const values = lines[i].split(',').map(val => val.trim());
          const entry: any = {};
          
          headers.forEach((header, index) => {
            if (index < values.length) {
              entry[header] = values[index];
            }
          });
          
          jsonData.push(entry);
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Nicht unterstütztes Dateiformat. Bitte XLSX oder CSV verwenden.' },
        { status: 400 }
      );
    }
    
    // Dateipfad basierend auf Typ
    let filePath;
    switch (type) {
      case 'fachbereiche':
        filePath = path.join(dataDirectory, 'fachbereiche.json');
        break;
      case 'laborprofile':
        filePath = path.join(dataDirectory, 'laborprofile.json');
        break;
      case 'laborwerte':
        filePath = path.join(dataDirectory, 'laborwerte.json');
        break;
      case 'profil_werte':
        filePath = path.join(dataDirectory, 'profil_werte.json');
        break;
      default:
        return NextResponse.json(
          { error: 'Ungültiger Typ' },
          { status: 400 }
        );
    }
    
    // Vorhandene Daten laden
    const existingData = readJsonFile<any>(filePath);
    
    // IDs generieren, wenn nicht vorhanden
    const processedData = jsonData.map(item => {
      if (!item.id) {
        return {
          ...item,
          id: generateUniqueId(type, item)
        };
      }
      return item;
    });
    
    // Numerische Werte umwandeln (für laborwerte.verguetung)
    if (type === 'laborwerte') {
      processedData.forEach(item => {
        if (item.verguetung) {
          // Stellen Sie sicher, dass verguetung numerisch ist
          item.verguetung = parseFloat(item.verguetung);
        }
      });
    }
    
    // Daten hinzufügen
    const newData = [...existingData, ...processedData];
    
    // Sicherstellen, dass das Datenverzeichnis existiert
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory, { recursive: true });
    }
    
    // Daten in JSON-Datei schreiben
    const success = writeJsonFile(filePath, newData);
    
    if (success) {
      return NextResponse.json({
        message: 'Import erfolgreich',
        count: processedData.length
      });
    } else {
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Daten' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Import-Fehler:', error);
    return NextResponse.json(
      { error: 'Fehler beim Importieren der Daten: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

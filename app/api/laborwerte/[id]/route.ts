import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Laborwert } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
const laborwertePath = path.join(dataDirectory, 'laborwerte.json');

// Hilfsfunktion zum Lesen der JSON-Dateien
function readJsonFile<T>(filePath: string): T[] {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    console.error(`Fehler beim Lesen der Datei ${filePath}:`, error);
    return [];
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const laborwerte = readJsonFile<Laborwert>(laborwertePath);
  
  // Suche nach übereinstimmender ID - mit Protokollierung für Debugging
  console.log(`Suche nach Laborwert mit ID: ${id}`);
  console.log(`Verfügbare IDs: ${laborwerte.map(w => w.id).join(', ')}`);
  
  const wert = laborwerte.find(w => w.id === id);
  
  // Fallback: Wenn keine ID-Übereinstimmung gefunden wurde, nach Namen suchen
  // (Nützlich für importierte Daten, bei denen die ID-Konvention fehlen könnte)
  if (!wert) {
    console.log(`Keine direkte ID-Übereinstimmung gefunden. Suche nach Namen...`);
    // Versuche den Wert anhand des Namens zu finden
    const nameFromId = decodeURIComponent(id);
    const wertByName = laborwerte.find(w => w.name === nameFromId);
    
    if (wertByName) {
      console.log(`Wert gefunden über Namen: ${nameFromId}`);
      return NextResponse.json(wertByName);
    }
    
    return NextResponse.json(
      { error: 'Laborwert nicht gefunden' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(wert);
}

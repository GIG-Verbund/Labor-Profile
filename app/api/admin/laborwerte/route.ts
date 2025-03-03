import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Laborwert } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
const laborwertePath = path.join(dataDirectory, 'laborwerte.json');

// Hilfsfunktionen
function readJsonFile<T>(filePath: string): T[] {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    console.error(`Fehler beim Lesen der Datei ${filePath}:`, error);
    return [];
  }
}

function writeJsonFile<T>(filePath: string, data: T[]): boolean {
  try {
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf8');
    return true;
  } catch (error) {
    console.error(`Fehler beim Schreiben der Datei ${filePath}:`, error);
    return false;
  }
}

// Alle Laborwerte abrufen
export async function GET() {
  const laborwerte = readJsonFile<Laborwert>(laborwertePath);
  return NextResponse.json(laborwerte);
}

// Neuen Laborwert erstellen
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }
    
    const laborwerte = readJsonFile<Laborwert>(laborwertePath);
    
    // Neue ID generieren
    const newId = `wert-${Date.now()}`;
    const newWert: Laborwert = { 
      id: newId,
      name: data.name,
      ebm_ziffer: data.ebm_ziffer || null,
      verguetung: data.verguetung ? parseFloat(data.verguetung) : null,
      referenzbereich: data.referenzbereich || null,
      erklaerung: data.erklaerung || null,
      gruende_erhoehte_werte: data.gruende_erhoehte_werte || null,
      behandlung_erhoehte_werte: data.behandlung_erhoehte_werte || null,
      gruende_niedrige_werte: data.gruende_niedrige_werte || null,
      behandlung_niedrige_werte: data.behandlung_niedrige_werte || null
    };
    
    laborwerte.push(newWert);
    
    const success = writeJsonFile(laborwertePath, laborwerte);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Laborwerts' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newWert, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen des Laborwerts:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

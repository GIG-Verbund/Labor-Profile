import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Laborwert } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
const laborwertePath = path.join(dataDirectory, 'laborwerte.json');
const profilWertePath = path.join(dataDirectory, 'profil_werte.json');

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

// Einzelnen Laborwert abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const laborwerte = readJsonFile<Laborwert>(laborwertePath);
  const wert = laborwerte.find(w => w.id === id);
  
  if (!wert) {
    return NextResponse.json(
      { error: 'Laborwert nicht gefunden' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(wert);
}

// Laborwert aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // Validierung
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name ist erforderlich' },
        { status: 400 }
      );
    }
    
    const laborwerte = readJsonFile<Laborwert>(laborwertePath);
    const index = laborwerte.findIndex(w => w.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Laborwert nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Aktualisierte Daten
    const updatedWert: Laborwert = {
      ...laborwerte[index],
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
    
    laborwerte[index] = updatedWert;
    
    const success = writeJsonFile(laborwertePath, laborwerte);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Laborwerts' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedWert);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Laborwerts:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// Laborwert löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Laborwerte laden
    const laborwerte = readJsonFile<Laborwert>(laborwertePath);
    const filteredWerte = laborwerte.filter(w => w.id !== id);
    
    if (filteredWerte.length === laborwerte.length) {
      return NextResponse.json(
        { error: 'Laborwert nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Laborwert aus JSON-Datei entfernen
    const success = writeJsonFile(laborwertePath, filteredWerte);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Laborwerts' },
        { status: 500 }
      );
    }
    
    // Zugehörige Verknüpfungen löschen
    const profilWerte = readJsonFile<any>(profilWertePath);
    const filteredProfilWerte = profilWerte.filter(pw => pw.wert_id !== id);
    writeJsonFile(profilWertePath, filteredProfilWerte);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen des Laborwerts:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

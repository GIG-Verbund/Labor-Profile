import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ProfilWert } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
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

// Einzelne Profil-Wert-Zuordnung abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const profilWerte = readJsonFile<ProfilWert>(profilWertePath);
  const profilWert = profilWerte.find(pw => pw.id === id);
  
  if (!profilWert) {
    return NextResponse.json(
      { error: 'Zuordnung nicht gefunden' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(profilWert);
}

// Profil-Wert-Zuordnung aktualisieren (z.B. Reihenfolge ändern)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    const profilWerte = readJsonFile<ProfilWert>(profilWertePath);
    const index = profilWerte.findIndex(pw => pw.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Zuordnung nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Aktualisierte Daten
    const updatedProfilWert: ProfilWert = {
      ...profilWerte[index],
      reihenfolge: data.reihenfolge !== undefined ? data.reihenfolge : profilWerte[index].reihenfolge
    };
    
    profilWerte[index] = updatedProfilWert;
    
    const success = writeJsonFile(profilWertePath, profilWerte);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Zuordnung' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedProfilWert);
  } catch (error) {
    console.error('Fehler beim Aktualisieren der Zuordnung:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// Profil-Wert-Zuordnung löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const profilWerte = readJsonFile<ProfilWert>(profilWertePath);
    const filteredProfilWerte = profilWerte.filter(pw => pw.id !== id);
    
    if (filteredProfilWerte.length === profilWerte.length) {
      return NextResponse.json(
        { error: 'Zuordnung nicht gefunden' },
        { status: 404 }
      );
    }
    
    const success = writeJsonFile(profilWertePath, filteredProfilWerte);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Löschen der Zuordnung' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen der Zuordnung:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

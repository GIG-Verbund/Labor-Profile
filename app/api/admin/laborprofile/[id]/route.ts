import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Laborprofil } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
const laborprofilePath = path.join(dataDirectory, 'laborprofile.json');
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

// Einzelnes Laborprofil abrufen
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const laborprofile = readJsonFile<Laborprofil>(laborprofilePath);
  const profil = laborprofile.find(p => p.id === id);
  
  if (!profil) {
    return NextResponse.json(
      { error: 'Laborprofil nicht gefunden' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(profil);
}

// Laborprofil aktualisieren
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const data = await request.json();
    
    // Validierung
    if (!data.name || !data.fachbereich_id) {
      return NextResponse.json(
        { error: 'Name und Fachbereich sind erforderlich' },
        { status: 400 }
      );
    }
    
    const laborprofile = readJsonFile<Laborprofil>(laborprofilePath);
    const index = laborprofile.findIndex(p => p.id === id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Laborprofil nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Aktualisierte Daten
    const updatedProfil: Laborprofil = {
      ...laborprofile[index],
      name: data.name,
      fachbereich_id: data.fachbereich_id,
      beschreibung: data.beschreibung || null
    };
    
    laborprofile[index] = updatedProfil;
    
    const success = writeJsonFile(laborprofilePath, laborprofile);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Laborprofils' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedProfil);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Laborprofils:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

// Laborprofil löschen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Laborprofile laden
    const laborprofile = readJsonFile<Laborprofil>(laborprofilePath);
    const filteredProfile = laborprofile.filter(p => p.id !== id);
    
    if (filteredProfile.length === laborprofile.length) {
      return NextResponse.json(
        { error: 'Laborprofil nicht gefunden' },
        { status: 404 }
      );
    }
    
    // Laborprofil aus JSON-Datei entfernen
    const success = writeJsonFile(laborprofilePath, filteredProfile);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Löschen des Laborprofils' },
        { status: 500 }
      );
    }
    
    // Zugehörige Verknüpfungen löschen
    const profilWerte = readJsonFile<any>(profilWertePath);
    const filteredProfilWerte = profilWerte.filter(pw => pw.profil_id !== id);
    writeJsonFile(profilWertePath, filteredProfilWerte);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Fehler beim Löschen des Laborprofils:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

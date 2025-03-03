import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Laborprofil } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
const laborprofilePath = path.join(dataDirectory, 'laborprofile.json');

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

// Alle Laborprofile abrufen
export async function GET() {
  const laborprofile = readJsonFile<Laborprofil>(laborprofilePath);
  return NextResponse.json(laborprofile);
}

// Neues Laborprofil erstellen
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung
    if (!data.name || !data.fachbereich_id) {
      return NextResponse.json(
        { error: 'Name und Fachbereich sind erforderlich' },
        { status: 400 }
      );
    }
    
    const laborprofile = readJsonFile<Laborprofil>(laborprofilePath);
    
    // Neue ID generieren
    const newId = `profil-${Date.now()}`;
    const newProfil: Laborprofil = { 
      id: newId,
      name: data.name,
      fachbereich_id: data.fachbereich_id,
      beschreibung: data.beschreibung || null
    };
    
    laborprofile.push(newProfil);
    
    const success = writeJsonFile(laborprofilePath, laborprofile);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern des Laborprofils' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newProfil, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen des Laborprofils:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

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

// Alle Profil-Wert-Zuordnungen abrufen
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const profilId = searchParams.get('profil_id');
  
  const profilWerte = readJsonFile<ProfilWert>(profilWertePath);
  
  if (profilId) {
    const filteredWerte = profilWerte.filter(pw => pw.profil_id === profilId);
    return NextResponse.json(filteredWerte);
  }
  
  return NextResponse.json(profilWerte);
}

// Neue Profil-Wert-Zuordnung erstellen
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validierung
    if (!data.profil_id || !data.wert_id) {
      return NextResponse.json(
        { error: 'Profil-ID und Wert-ID sind erforderlich' },
        { status: 400 }
      );
    }
    
    const profilWerte = readJsonFile<ProfilWert>(profilWertePath);
    
    // Prüfen, ob die Zuordnung bereits existiert
    const existingLink = profilWerte.find(
      pw => pw.profil_id === data.profil_id && pw.wert_id === data.wert_id
    );
    
    if (existingLink) {
      return NextResponse.json(
        { error: 'Diese Zuordnung existiert bereits' },
        { status: 400 }
      );
    }
    
    // Neue ID generieren
    const newId = `pv-${Date.now()}`;
    
    // Reihenfolge bestimmen (am Ende anfügen)
    const existingProfilWerte = profilWerte.filter(pw => pw.profil_id === data.profil_id);
    const reihenfolge = existingProfilWerte.length > 0 
      ? Math.max(...existingProfilWerte.map(pw => pw.reihenfolge || 0)) + 1 
      : 1;
    
    const newProfilWert: ProfilWert = { 
      id: newId,
      profil_id: data.profil_id,
      wert_id: data.wert_id,
      reihenfolge: reihenfolge
    };
    
    profilWerte.push(newProfilWert);
    
    const success = writeJsonFile(profilWertePath, profilWerte);
    if (!success) {
      return NextResponse.json(
        { error: 'Fehler beim Speichern der Zuordnung' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newProfilWert, { status: 201 });
  } catch (error) {
    console.error('Fehler beim Erstellen der Zuordnung:', error);
    return NextResponse.json(
      { error: 'Interner Serverfehler' },
      { status: 500 }
    );
  }
}

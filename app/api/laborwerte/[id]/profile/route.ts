import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Laborwert, Laborprofil, ProfilWert, Fachbereich } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
const laborwertePath = path.join(dataDirectory, 'laborwerte.json');
const laborprofilePath = path.join(dataDirectory, 'laborprofile.json');
const profilWertePath = path.join(dataDirectory, 'profil_werte.json');
const fachbereichePath = path.join(dataDirectory, 'fachbereiche.json');

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
  
  try {
    // Alle benötigten Daten laden
    const laborwerte = readJsonFile<Laborwert>(laborwertePath);
    const laborprofile = readJsonFile<Laborprofil>(laborprofilePath);
    const profilWerte = readJsonFile<ProfilWert>(profilWertePath);
    const fachbereiche = readJsonFile<Fachbereich>(fachbereichePath);
    
    // Laborwert finden
    const laborwert = laborwerte.find(w => w.id === id);
    
    // Wenn keine exakte ID-Übereinstimmung gefunden wurde, nach Namen suchen
    let wertId = id;
    if (!laborwert) {
      const nameFromId = decodeURIComponent(id);
      const wertByName = laborwerte.find(w => w.name === nameFromId);
      if (wertByName) {
        wertId = wertByName.id;
      } else {
        // Wert nicht gefunden
        return NextResponse.json([]);
      }
    }
    
    // Profil-IDs finden, die diesen Laborwert enthalten
    const profilIds = profilWerte
      .filter(pw => pw.wert_id === wertId)
      .map(pw => pw.profil_id);
    
    // Laborprofile mit diesen IDs finden
    const profileMitWert = laborprofile.filter(profil => 
      profilIds.includes(profil.id)
    );
    
    // Fachbereichsnamen hinzufügen
    const profileMitFachbereich = profileMitWert.map(profil => {
      const fachbereich = fachbereiche.find(fb => fb.id === profil.fachbereich_id);
      return {
        ...profil,
        fachbereich_name: fachbereich ? fachbereich.name : 'Unbekannt'
      };
    });
    
    return NextResponse.json(profileMitFachbereich);
  } catch (error) {
    console.error('Fehler beim Laden der Profile:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Profile' },
      { status: 500 }
    );
  }
}

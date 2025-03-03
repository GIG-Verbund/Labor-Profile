import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ProfilWert, Laborwert } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
const profilWertePath = path.join(dataDirectory, 'profil_werte.json');
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
  try {
    const profilId = params.id;
    console.log(`Suche Laborwerte für Profil mit ID: ${profilId}`);
    
    // Profil-Wert-Zuordnungen laden
    const profilWerte = readJsonFile<ProfilWert>(profilWertePath);
    
    // Profil-Wert-Zuordnungen für dieses Profil filtern
    const profilZuordnungen = profilWerte.filter(pw => pw.profil_id === profilId);
    console.log(`Gefundene Zuordnungen: ${profilZuordnungen.length}`);
    
    if (profilZuordnungen.length === 0) {
      return NextResponse.json([]);
    }
    
    // Alle Laborwerte laden
    const laborwerte = readJsonFile<Laborwert>(laborwertePath);
    
    // Laborwerte für diese Zuordnungen sammeln
    const profilLaborwerte = profilZuordnungen.map(zuordnung => {
      const wert = laborwerte.find(w => w.id === zuordnung.wert_id);
      
      if (!wert) {
        console.log(`Laborwert mit ID ${zuordnung.wert_id} nicht gefunden`);
        return null;
      }
      
      // Reihenfolge hinzufügen
      return {
        ...wert,
        reihenfolge: zuordnung.reihenfolge
      };
    }).filter(wert => wert !== null);
    
    // Nach Reihenfolge sortieren
    profilLaborwerte.sort((a, b) => {
      if (a && b) {
        return (a.reihenfolge || 0) - (b.reihenfolge || 0);
      }
      return 0;
    });
    
    console.log(`Fertige Laborwerte für Profil: ${profilLaborwerte.length}`);
    return NextResponse.json(profilLaborwerte);
  } catch (error) {
    console.error('Fehler beim Laden der Laborwerte:', error);
    return NextResponse.json(
      { error: 'Fehler beim Laden der Laborwerte' },
      { status: 500 }
    );
  }
}

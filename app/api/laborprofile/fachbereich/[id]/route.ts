import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Laborprofil } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
const laborprofilePath = path.join(dataDirectory, 'laborprofile.json');

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
  const fachbereichId = params.id;
  const laborprofile = readJsonFile<Laborprofil>(laborprofilePath);
  const filteredProfile = laborprofile.filter(profil => profil.fachbereich_id === fachbereichId);
  
  return NextResponse.json(filteredProfile);
}

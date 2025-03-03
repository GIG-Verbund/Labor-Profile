import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Fachbereich } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
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

export async function GET() {
  const fachbereiche = readJsonFile<Fachbereich>(fachbereichePath);
  return NextResponse.json(fachbereiche);
}

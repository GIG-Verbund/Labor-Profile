import { NextResponse } from 'next/server';
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

export async function GET() {
  const laborprofile = readJsonFile<Laborprofil>(laborprofilePath);
  return NextResponse.json(laborprofile);
}

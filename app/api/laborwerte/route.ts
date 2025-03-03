import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Laborwert } from '@/lib/types';

const dataDirectory = path.join(process.cwd(), 'data');
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get('search');
  
  const laborwerte = readJsonFile<Laborwert>(laborwertePath);
  
  if (search) {
    const searchLower = search.toLowerCase();
    const filteredWerte = laborwerte.filter(wert => 
      wert.name.toLowerCase().includes(searchLower)
    );
    return NextResponse.json(filteredWerte);
  }
  
  return NextResponse.json(laborwerte);
}

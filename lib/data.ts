import fs from 'fs';
import path from 'path';

// Typdefinitionen für unsere Datenstruktur
export type Fachbereich = {
  id: string;
  name: string;
  beschreibung: string | null;
};

export type Laborprofil = {
  id: string;
  name: string;
  fachbereich_id: string;
  beschreibung: string | null;
};

export type Laborwert = {
  id: string;
  name: string;
  ebm_ziffer: string | null;
  verguetung: number | null;
  referenzbereich: string | null;
  erklaerung: string | null;
  gruende_erhoehte_werte: string | null;
  behandlung_erhoehte_werte: string | null;
  gruende_niedrige_werte: string | null;
  behandlung_niedrige_werte: string | null;
};

export type ProfilWert = {
  id: string;
  profil_id: string;
  wert_id: string;
  reihenfolge: number | null;
};

// Pfade zu den Datendateien
const dataDirectory = path.join(process.cwd(), 'data');
const fachbereichePath = path.join(dataDirectory, 'fachbereiche.json');
const laborprofilePath = path.join(dataDirectory, 'laborprofile.json');
const laborwertePath = path.join(dataDirectory, 'laborwerte.json');
const profilWertePath = path.join(dataDirectory, 'profil_werte.json');

// Hilfsfunktion zum Lesen der JSON-Dateien
export function readJsonFile<T>(filePath: string): T[] {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as T[];
  } catch (error) {
    console.error(`Fehler beim Lesen der Datei ${filePath}:`, error);
    return [];
  }
}

// Hilfsfunktion zum Schreiben der JSON-Dateien
export function writeJsonFile<T>(filePath: string, data: T[]): boolean {
  try {
    // Sicherstellen, dass das Verzeichnis existiert
    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    fs.writeFileSync(filePath, jsonString, 'utf8');
    return true;
  } catch (error) {
    console.error(`Fehler beim Schreiben der Datei ${filePath}:`, error);
    return false;
  }
}

// Fachbereich Funktionen
export function getAllFachbereiche(): Fachbereich[] {
  return readJsonFile<Fachbereich>(fachbereichePath);
}

export function getFachbereichById(id: string): Fachbereich | null {
  const fachbereiche = getAllFachbereiche();
  return fachbereiche.find(fb => fb.id === id) || null;
}

export function createFachbereich(data: Omit<Fachbereich, 'id'>): Fachbereich {
  const fachbereiche = getAllFachbereiche();
  const newId = `fb-${Date.now()}`;
  const newFachbereich: Fachbereich = { ...data, id: newId };
  
  fachbereiche.push(newFachbereich);
  writeJsonFile(fachbereichePath, fachbereiche);
  
  return newFachbereich;
}

export function updateFachbereich(id: string, data: Partial<Omit<Fachbereich, 'id'>>): Fachbereich | null {
  const fachbereiche = getAllFachbereiche();
  const index = fachbereiche.findIndex(fb => fb.id === id);
  
  if (index === -1) return null;
  
  fachbereiche[index] = { ...fachbereiche[index], ...data };
  writeJsonFile(fachbereichePath, fachbereiche);
  
  return fachbereiche[index];
}

export function deleteFachbereich(id: string): boolean {
  const fachbereiche = getAllFachbereiche();
  const filteredFachbereiche = fachbereiche.filter(fb => fb.id !== id);
  
  if (filteredFachbereiche.length === fachbereiche.length) return false;
  
  writeJsonFile(fachbereichePath, filteredFachbereiche);
  return true;
}

// Laborprofil Funktionen
export function getAllLaborprofile(): Laborprofil[] {
  return readJsonFile<Laborprofil>(laborprofilePath);
}

export function getLaborprofilById(id: string): Laborprofil | null {
  const profile = getAllLaborprofile();
  return profile.find(p => p.id === id) || null;
}

export function getLaborprofileByFachbereich(fachbereichId: string): Laborprofil[] {
  const profile = getAllLaborprofile();
  return profile.filter(p => p.fachbereich_id === fachbereichId);
}

export function createLaborprofil(data: Omit<Laborprofil, 'id'>): Laborprofil {
  const profile = getAllLaborprofile();
  const newId = `profil-${Date.now()}`;
  const newProfil: Laborprofil = { ...data, id: newId };
  
  profile.push(newProfil);
  writeJsonFile(laborprofilePath, profile);
  
  return newProfil;
}

export function updateLaborprofil(id: string, data: Partial<Omit<Laborprofil, 'id'>>): Laborprofil | null {
  const profile = getAllLaborprofile();
  const index = profile.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  profile[index] = { ...profile[index], ...data };
  writeJsonFile(laborprofilePath, profile);
  
  return profile[index];
}

export function deleteLaborprofil(id: string): boolean {
  const profile = getAllLaborprofile();
  const filteredProfile = profile.filter(p => p.id !== id);
  
  if (filteredProfile.length === profile.length) return false;
  
  writeJsonFile(laborprofilePath, filteredProfile);
  
  // Auch zugehörige Verknüpfungen löschen
  const profilWerte = getAllProfilWerte();
  const filteredProfilWerte = profilWerte.filter(pw => pw.profil_id !== id);
  writeJsonFile(profilWertePath, filteredProfilWerte);
  
  return true;
}

// Laborwert Funktionen
export function getAllLaborwerte(): Laborwert[] {
  return readJsonFile<Laborwert>(laborwertePath);
}

export function getLaborwertById(id: string): Laborwert | null {
  const werte = getAllLaborwerte();
  return werte.find(w => w.id === id) || null;
}

export function searchLaborwerte(searchTerm: string): Laborwert[] {
  const werte = getAllLaborwerte();
  return werte.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

export function createLaborwert(data: Omit<Laborwert, 'id'>): Laborwert {
  const werte = getAllLaborwerte();
  const newId = `wert-${Date.now()}`;
  const newWert: Laborwert = { ...data, id: newId };
  
  werte.push(newWert);
  writeJsonFile(laborwertePath, werte);
  
  return newWert;
}

export function updateLaborwert(id: string, data: Partial<Omit<Laborwert, 'id'>>): Laborwert | null {
  const werte = getAllLaborwerte();
  const index = werte.findIndex(w => w.id === id);
  
  if (index === -1) return null;
  
  werte[index] = { ...werte[index], ...data };
  writeJsonFile(laborwertePath, werte);
  
  return werte[index];
}

export function deleteLaborwert(id: string): boolean {
  const werte = getAllLaborwerte();
  const filteredWerte = werte.filter(w => w.id !== id);
  
  if (filteredWerte.length === werte.length) return false;
  
  writeJsonFile(laborwertePath, filteredWerte);
  
  // Auch zugehörige Verknüpfungen löschen
  const profilWerte = getAllProfilWerte();
  const filteredProfilWerte = profilWerte.filter(pw => pw.wert_id !== id);
  writeJsonFile(profilWertePath, filteredProfilWerte);
  
  return true;
}

// ProfilWert Funktionen
export function getAllProfilWerte(): ProfilWert[] {
  return readJsonFile<ProfilWert>(profilWertePath);
}

export function getProfilWerteByProfil(profilId: string): ProfilWert[] {
  const profilWerte = getAllProfilWerte();
  return profilWerte.filter(pw => pw.profil_id === profilId);
}

export function getLaborwerteForProfil(profilId: string): Laborwert[] {
  const profilWerte = getProfilWerteByProfil(profilId);
  const laborwerte = getAllLaborwerte();
  
  // Alle Wert-IDs für das Profil finden
  const wertIds = profilWerte.map(pw => pw.wert_id);
  
  // Laborwerte mit diesen IDs zurückgeben
  return laborwerte.filter(w => wertIds.includes(w.id));
}

export function getProfileForLaborwert(wertId: string): Laborprofil[] {
  const profilWerte = getAllProfilWerte();
  const profile = getAllLaborprofile();
  
  // Alle Profil-IDs für den Wert finden
  const profilIds = profilWerte
    .filter(pw => pw.wert_id === wertId)
    .map(pw => pw.profil_id);
  
  // Profile mit diesen IDs zurückgeben
  return profile.filter(p => profilIds.includes(p.id));
}

export function addWertToProfil(profilId: string, wertId: string, reihenfolge?: number): ProfilWert | null {
  const profil = getLaborprofilById(profilId);
  const wert = getLaborwertById(wertId);
  
  if (!profil || !wert) return null;
  
  const profilWerte = getAllProfilWerte();
  
  // Prüfen, ob die Verknüpfung bereits existiert
  const existingLink = profilWerte.find(
    pw => pw.profil_id === profilId && pw.wert_id === wertId
  );
  
  if (existingLink) return existingLink;
  
  // Neue Verknüpfung erstellen
  const newReihenfolge = reihenfolge ?? profilWerte.filter(pw => pw.profil_id === profilId).length + 1;
  const newId = `pv-${Date.now()}`;
  const newProfilWert: ProfilWert = {
    id: newId,
    profil_id: profilId,
    wert_id: wertId,
    reihenfolge: newReihenfolge
  };
  
  profilWerte.push(newProfilWert);
  writeJsonFile(profilWertePath, profilWerte);
  
  return newProfilWert;
}

export function removeWertFromProfil(profilId: string, wertId: string): boolean {
  const profilWerte = getAllProfilWerte();
  const filteredProfilWerte = profilWerte.filter(
    pw => !(pw.profil_id === profilId && pw.wert_id === wertId)
  );
  
  if (filteredProfilWerte.length === profilWerte.length) return false;
  
  writeJsonFile(profilWertePath, filteredProfilWerte);
  return true;
}

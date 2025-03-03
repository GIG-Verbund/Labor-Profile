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

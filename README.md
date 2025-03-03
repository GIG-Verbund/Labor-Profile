# GIG-Verbund Laborprofil App

Eine Web-Anwendung für den GIG-Verbund, die Ärzten ermöglicht, Laborprofile und Laborwerte in verschiedenen medizinischen Fachbereichen nachzuschlagen.

## Funktionen

- Anzeige von Laborprofilen nach Fachbereichen
- Detaillierte Informationen zu einzelnen Laborwerten
- Suche nach Laborwerten
- Admin-Bereich für die Verwaltung der Daten
- Import/Export von Daten aus Excel

## Struktur

Die Anwendung verwendet folgende Technologien:

- Next.js (React-basiertes Framework)
- TypeScript
- Tailwind CSS
- JSON-Dateien als Datenbank

## Erste Schritte

### Voraussetzungen

- Node.js (>= 14.x)
- npm oder yarn

### Installation

1. Klonen Sie das Repository:
   ```bash
   git clone [repository-url]
   cd gig-labor-app
   ```

2. Installieren Sie die Abhängigkeiten:
   ```bash
   npm install
   # oder
   yarn install
   ```

3. Starten Sie den Entwicklungsserver:
   ```bash
   npm run dev
   # oder
   yarn dev
   ```

4. Öffnen Sie [http://localhost:3000](http://localhost:3000) in Ihrem Browser.

## Datenstruktur

Die Anwendung verwendet JSON-Dateien im `/data`-Verzeichnis:

- `fachbereiche.json` - Medizinische Fachbereiche
- `laborprofile.json` - Laborprofile
- `laborwerte.json` - Einzelne Laborwerte mit Details
- `profil_werte.json` - Verknüpfungen zwischen Profilen und Werten

## Administration

Der Admin-Bereich ist über `/admin` erreichbar. Das Standard-Passwort ist `admin123`.

## Daten importieren

Sie können Daten aus Excel über den Admin-Bereich importieren. Die Excel-Dateien sollten folgende Spalten enthalten:

### Für Fachbereiche:
- id
- name
- beschreibung

### Für Laborprofile:
- id
- name
- fachbereich_id
- beschreibung

### Für Laborwerte:
- id
- name
- ebm_ziffer
- verguetung
- referenzbereich
- erklaerung
- gruende_erhoehte_werte
- behandlung_erhoehte_werte
- gruende_niedrige_werte
- behandlung_niedrige_werte

### Für Profil-Wert-Zuordnungen:
- id
- profil_id
- wert_id
- reihenfolge

## Build für Produktion

Um die Anwendung für die Produktion zu bauen:

```bash
npm run build
# oder
yarn build
```

Danach kann sie mit `npm start` oder `yarn start` gestartet werden.

## Lizenz

Dieses Projekt ist urheberrechtlich geschützt und für den internen Gebrauch im GIG-Verbund bestimmt.

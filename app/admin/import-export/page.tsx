'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Fachbereich, Laborprofil, Laborwert, ProfilWert } from '@/lib/types';

export default function ImportExportPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [importType, setImportType] = useState<'fachbereiche' | 'laborprofile' | 'laborwerte' | 'profil_werte'>('laborwerte');
  const [exportData, setExportData] = useState<any[]>([]);
  const [exportReady, setExportReady] = useState(false);

  // Authentifizierung
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Falsches Passwort');
    }
  };

  // Excel-Import-Funktion
  const handleImport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const fileInput = formData.get('file') as File;
    
    if (!fileInput || fileInput.size === 0) {
      setError('Bitte wählen Sie eine Datei aus');
      return;
    }
    
    // Dateiendung prüfen
    const fileName = fileInput.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.csv')) {
      setError('Bitte wählen Sie eine Excel- oder CSV-Datei aus');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Datei an API-Endpunkt senden
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Import');
      }
      
      const result = await response.json();
      setSuccess(`Import erfolgreich! ${result.count} Einträge wurden importiert.`);
    } catch (error: any) {
      console.error('Fehler beim Import:', error);
      setError(error.message || 'Fehler beim Import');
    } finally {
      setLoading(false);
    }
  };

  // Daten für Export laden
  const loadExportData = async () => {
    setLoading(true);
    setError('');
    setExportReady(false);
    
    try {
      let url;
      
      switch (importType) {
        case 'fachbereiche':
          url = '/api/fachbereiche';
          break;
        case 'laborprofile':
          url = '/api/admin/laborprofile';
          break;
        case 'laborwerte':
          url = '/api/admin/laborwerte';
          break;
        case 'profil_werte':
          url = '/api/admin/profil-werte';
          break;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Fehler beim Laden der Daten');
      }
      
      const data = await response.json();
      setExportData(data);
      setExportReady(true);
    } catch (error: any) {
      console.error('Fehler beim Laden der Exportdaten:', error);
      setError(error.message || 'Fehler beim Laden der Exportdaten');
    } finally {
      setLoading(false);
    }
  };

  // CSV-Export-Funktion
  const exportToCSV = () => {
    if (exportData.length === 0) {
      setError('Keine Daten zum Exportieren vorhanden');
      return;
    }
    
    // CSV-Header ermitteln
    const headers = Object.keys(exportData[0]).filter(key => key !== 'id');
    
    // CSV-Zeilen erstellen
    const csvRows = [
      headers.join(','), // Header-Zeile
      ...exportData.map(item => {
        return headers.map(header => {
          const value = item[header];
          // Werte mit Kommas in Anführungszeichen setzen
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"`
            : value === null 
              ? '' 
              : value;
        }).join(',');
      })
    ];
    
    // CSV-String erstellen
    const csvString = csvRows.join('\n');
    
    // Download-Link erstellen
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${importType}_export.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel-Template für Import generieren
  const generateTemplate = () => {
    let headers: string[] = [];
    
    switch (importType) {
      case 'fachbereiche':
        headers = ['name', 'beschreibung'];
        break;
      case 'laborprofile':
        headers = ['name', 'fachbereich_id', 'beschreibung'];
        break;
      case 'laborwerte':
        headers = [
          'name', 
          'ebm_ziffer', 
          'verguetung', 
          'referenzbereich', 
          'erklaerung', 
          'gruende_erhoehte_werte', 
          'behandlung_erhoehte_werte', 
          'gruende_niedrige_werte', 
          'behandlung_niedrige_werte'
        ];
        break;
      case 'profil_werte':
        headers = ['profil_id', 'wert_id', 'reihenfolge'];
        break;
    }
    
    // CSV-String erstellen
    const csvString = headers.join(',') + '\n';
    
    // Download-Link erstellen
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${importType}_template.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/admin" className="text-blue-500 hover:underline">
            &larr; Zurück zum Admin-Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">Import / Export</h1>
        
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Anmeldung erforderlich</h2>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Passwort
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}
            
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Anmelden
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/admin" className="text-blue-500 hover:underline">
          &larr; Zurück zum Admin-Dashboard
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Import / Export</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {loading && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-700 rounded-md">
          Bitte warten...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Import-Bereich */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Daten importieren</h2>
          
          <form onSubmit={handleImport}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Datentyp
              </label>
              <select
                name="type"
                value={importType}
                onChange={(e) => setImportType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              >
                <option value="fachbereiche">Fachbereiche</option>
                <option value="laborprofile">Laborprofile</option>
                <option value="laborwerte">Laborwerte</option>
                <option value="profil_werte">Profil-Wert-Zuordnungen</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Excel- oder CSV-Datei
              </label>
              <input
                type="file"
                name="file"
                accept=".xlsx,.csv"
                className="w-full px-3 py-2 border rounded-md"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Unterstützte Formate: .xlsx, .csv
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                disabled={loading}
              >
                Importieren
              </button>
              
              <button
                type="button"
                onClick={generateTemplate}
                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
                disabled={loading}
              >
                Template herunterladen
              </button>
            </div>
          </form>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-lg mb-2">Hinweise zum Import</h3>
            <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
              <li>Die erste Zeile der Datei muss die Spaltenüberschriften enthalten.</li>
              <li>Die Daten müssen den Spaltenüberschriften entsprechen.</li>
              <li>Laden Sie ein Template herunter, um das korrekte Format zu sehen.</li>
              <li><strong>Fachbereiche</strong>: Benötigt "name", optional "beschreibung".</li>
              <li><strong>Laborprofile</strong>: Benötigt "name" und "fachbereich_id", optional "beschreibung".</li>
              <li><strong>Laborwerte</strong>: Benötigt "name", alle anderen Felder sind optional.</li>
              <li><strong>Profil-Wert-Zuordnungen</strong>: Benötigt "profil_id" und "wert_id", optional "reihenfolge".</li>
            </ul>
          </div>
        </div>

        {/* Export-Bereich */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Daten exportieren</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Datentyp
            </label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={loading}
            >
              <option value="fachbereiche">Fachbereiche</option>
              <option value="laborprofile">Laborprofile</option>
              <option value="laborwerte">Laborwerte</option>
              <option value="profil_werte">Profil-Wert-Zuordnungen</option>
            </select>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={loadExportData}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 disabled:bg-green-300"
              disabled={loading}
            >
              Daten laden
            </button>
            
            <button
              onClick={exportToCSV}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading || !exportReady}
            >
              Als CSV exportieren
            </button>
          </div>
          
          {exportReady && (
            <div className="mt-4">
              <p className="text-sm text-green-600">
                {exportData.length} Einträge zum Export bereit.
              </p>
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h3 className="font-medium text-lg mb-2">Hinweise zum Export</h3>
            <ol className="list-decimal pl-5 text-sm text-gray-700 space-y-1">
              <li>Klicken Sie auf "Daten laden", um die aktuellen Daten abzurufen.</li>
              <li>Wählen Sie das Format aus und klicken Sie auf "Exportieren".</li>
              <li>Die exportierte Datei kann bearbeitet und später wieder importiert werden.</li>
              <li>Sie können exportierte Daten als Backup verwenden oder für den Import in andere Systeme nutzen.</li>
            </ol>
          </div>
        </div>
      </div>
      
      {/* Zusätzliche Hinweise */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">Wichtige Hinweise für Massen-Import</h2>
        
        <div className="space-y-4">
          <p className="text-yellow-700">
            Um eine große Anzahl von Laborwerten zu importieren, empfehlen wir folgende Vorgehensweise:
          </p>
          
          <ol className="list-decimal pl-5 text-yellow-700 space-y-2">
            <li>
              <strong>Vorbereitung</strong>: Laden Sie zunächst das Laborwerte-Template herunter und füllen Sie es mit Ihren Daten.
            </li>
            <li>
              <strong>Formatierung</strong>: Stellen Sie sicher, dass alle erforderlichen Spalten korrekt ausgefüllt sind. Die Spalte "name" ist Pflicht.
            </li>
            <li>
              <strong>Batch-Import</strong>: Bei sehr großen Datenmengen empfiehlt es sich, die Datei in kleinere Teile aufzuteilen und diese nacheinander zu importieren.
            </li>
            <li>
              <strong>Verknüpfungen</strong>: Um Laborwerte mit Profilen zu verknüpfen, müssen Sie die ID des Profils und des Laborwerts in der Profil-Wert-Datei angeben.
            </li>
          </ol>
          
          <p className="text-yellow-700">
            Für einen erfolgreichen Massenimport ist die Reihenfolge wichtig:
          </p>
          
          <ol className="list-decimal pl-5 text-yellow-700">
            <li>Zuerst Fachbereiche importieren</li>
            <li>Dann Laborprofile (mit Fachbereichs-IDs)</li>
            <li>Dann Laborwerte</li>
            <li>Zuletzt Profil-Wert-Zuordnungen (mit Profil- und Wert-IDs)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

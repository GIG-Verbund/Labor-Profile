'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Laborprofil, Laborwert, ProfilWert, Fachbereich } from '@/lib/types';

type ProfilWertWithDetails = ProfilWert & {
  wert_name: string;
};

export default function ProfilWerteAdmin() {
  const [fachbereiche, setFachbereiche] = useState<Fachbereich[]>([]);
  const [profile, setProfile] = useState<Laborprofil[]>([]);
  const [laborwerte, setLaborwerte] = useState<Laborwert[]>([]);
  const [profilWerte, setProfilWerte] = useState<ProfilWertWithDetails[]>([]);
  const [selectedFachbereichId, setSelectedFachbereichId] = useState<string>('');
  const [selectedProfilId, setSelectedProfilId] = useState<string>('');
  const [selectedWertId, setSelectedWertId] = useState<string>('');
  const [filteredProfile, setFilteredProfile] = useState<Laborprofil[]>([]);
  const [filteredWerte, setFilteredWerte] = useState<Laborwert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Authentifizierung
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
      loadInitialData();
    } else {
      setError('Falsches Passwort');
    }
  };

  // Initiale Daten laden
  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Fachbereiche laden
      const fachbereicheResponse = await fetch('/api/fachbereiche');
      if (!fachbereicheResponse.ok) throw new Error('Fehler beim Laden der Fachbereiche');
      const fachbereicheData = await fachbereicheResponse.json();
      setFachbereiche(fachbereicheData);
      
      // Profile laden
      const profileResponse = await fetch('/api/admin/laborprofile');
      if (!profileResponse.ok) throw new Error('Fehler beim Laden der Profile');
      const profileData = await profileResponse.json();
      setProfile(profileData);
      
      // Laborwerte laden
      const laborwerteResponse = await fetch('/api/admin/laborwerte');
      if (!laborwerteResponse.ok) throw new Error('Fehler beim Laden der Laborwerte');
      const laborwerteData = await laborwerteResponse.json();
      setLaborwerte(laborwerteData);
      
      // Ersten Fachbereich auswählen, falls vorhanden
      if (fachbereicheData.length > 0) {
        setSelectedFachbereichId(fachbereicheData[0].id);
        
        // Profile für den ersten Fachbereich filtern
        const filteredProfiles = profileData.filter(
          (profil: Laborprofil) => profil.fachbereich_id === fachbereicheData[0].id
        );
        setFilteredProfile(filteredProfiles);
        
        // Erstes Profil auswählen, falls vorhanden
        if (filteredProfiles.length > 0) {
          setSelectedProfilId(filteredProfiles[0].id);
          loadProfilWerte(filteredProfiles[0].id);
        }
      }
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Profil-Wert-Zuordnungen für ein bestimmtes Profil laden
  const loadProfilWerte = async (profilId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/profil-werte?profil_id=${profilId}`);
      if (!response.ok) throw new Error('Fehler beim Laden der Zuordnungen');
      
      const data = await response.json();
      
      // Laborwert-Namen zu den Zuordnungen hinzufügen
      const detailedProfilWerte = data.map((pw: ProfilWert) => {
        const wert = laborwerte.find(w => w.id === pw.wert_id);
        return {
          ...pw,
          wert_name: wert ? wert.name : 'Unbekannt'
        };
      });
      
      // Nach Reihenfolge sortieren
      detailedProfilWerte.sort((a: ProfilWertWithDetails, b: ProfilWertWithDetails) => {
        return (a.reihenfolge || 0) - (b.reihenfolge || 0);
      });
      
      setProfilWerte(detailedProfilWerte);
      
      // Bereits zugeordnete Werte aus der Liste verfügbarer Werte ausfiltern
      const zugeordneteWertIds = data.map((pw: ProfilWert) => pw.wert_id);
      const verfuegbareWerte = laborwerte.filter(wert => !zugeordneteWertIds.includes(wert.id));
      setFilteredWerte(verfuegbareWerte);
      
      // Ersten verfügbaren Wert auswählen, falls vorhanden
      if (verfuegbareWerte.length > 0) {
        setSelectedWertId(verfuegbareWerte[0].id);
      } else {
        setSelectedWertId('');
      }
    } catch (error) {
      console.error('Fehler beim Laden der Zuordnungen:', error);
      setError('Fehler beim Laden der Zuordnungen');
    } finally {
      setLoading(false);
    }
  };

  // Bei Änderung des Fachbereichs
  useEffect(() => {
    if (selectedFachbereichId && profile.length > 0) {
      // Profile für den ausgewählten Fachbereich filtern
      const filtered = profile.filter(
        profil => profil.fachbereich_id === selectedFachbereichId
      );
      setFilteredProfile(filtered);
      
      // Erstes Profil auswählen, falls vorhanden
      if (filtered.length > 0) {
        setSelectedProfilId(filtered[0].id);
        loadProfilWerte(filtered[0].id);
      } else {
        setSelectedProfilId('');
        setProfilWerte([]);
        setFilteredWerte(laborwerte);
      }
    }
  }, [selectedFachbereichId, profile, laborwerte]);

  // Bei Änderung des Profils
  useEffect(() => {
    if (selectedProfilId) {
      loadProfilWerte(selectedProfilId);
    }
  }, [selectedProfilId]);

  // Suche nach Laborwerten
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Bereits zugeordnete Werte aus der Liste verfügbarer Werte ausfiltern
      const zugeordneteWertIds = profilWerte.map(pw => pw.wert_id);
      const verfuegbareWerte = laborwerte.filter(wert => !zugeordneteWertIds.includes(wert.id));
      setFilteredWerte(verfuegbareWerte);
    } else {
      // Nach Laborwerten suchen, die den Suchbegriff enthalten und noch nicht zugeordnet sind
      const zugeordneteWertIds = profilWerte.map(pw => pw.wert_id);
      const searchResults = laborwerte.filter(
        wert => 
          !zugeordneteWertIds.includes(wert.id) && 
          wert.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredWerte(searchResults);
    }
  }, [searchTerm, laborwerte, profilWerte]);

  // Laborwert zum Profil hinzufügen
  const addWertToProfil = async () => {
    if (!selectedProfilId || !selectedWertId) {
      setError('Bitte Profil und Laborwert auswählen');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch('/api/admin/profil-werte', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          profil_id: selectedProfilId,
          wert_id: selectedWertId
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Hinzufügen des Laborwerts');
      }
      
      setSuccess('Laborwert erfolgreich zum Profil hinzugefügt');
      
      // Zuordnungen neu laden
      loadProfilWerte(selectedProfilId);
    } catch (error: any) {
      console.error('Fehler beim Hinzufügen des Laborwerts:', error);
      setError(error.message || 'Fehler beim Hinzufügen des Laborwerts');
    } finally {
      setLoading(false);
    }
  };

  // Laborwert aus Profil entfernen
  const removeWertFromProfil = async (zuordnungId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Laborwert aus dem Profil entfernen möchten?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await fetch(`/api/admin/profil-werte/${zuordnungId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Fehler beim Entfernen des Laborwerts');
      }
      
      setSuccess('Laborwert erfolgreich aus dem Profil entfernt');
      
      // Zuordnungen neu laden
      loadProfilWerte(selectedProfilId);
    } catch (error: any) {
      console.error('Fehler beim Entfernen des Laborwerts:', error);
      setError(error.message || 'Fehler beim Entfernen des Laborwerts');
    } finally {
      setLoading(false);
    }
  };

  // Reihenfolge ändern
  const changeOrder = async (zuordnungId: string, direction: 'up' | 'down') => {
    // Aktuelle Zuordnung finden
    const currentIndex = profilWerte.findIndex(pw => pw.id === zuordnungId);
    if (currentIndex === -1) return;
    
    // Nachbarzuordnung finden
    const neighborIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (neighborIndex < 0 || neighborIndex >= profilWerte.length) return;
    
    // Reihenfolgen tauschen
    const currentOrder = profilWerte[currentIndex].reihenfolge || 0;
    const neighborOrder = profilWerte[neighborIndex].reihenfolge || 0;
    
    try {
      setLoading(true);
      
      // Erste Zuordnung aktualisieren
      const response1 = await fetch(`/api/admin/profil-werte/${zuordnungId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reihenfolge: neighborOrder })
      });
      
      if (!response1.ok) {
        throw new Error('Fehler beim Aktualisieren der Reihenfolge');
      }
      
      // Zweite Zuordnung aktualisieren
      const response2 = await fetch(`/api/admin/profil-werte/${profilWerte[neighborIndex].id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reihenfolge: currentOrder })
      });
      
      if (!response2.ok) {
        throw new Error('Fehler beim Aktualisieren der Reihenfolge');
      }
      
      // Zuordnungen neu laden
      loadProfilWerte(selectedProfilId);
    } catch (error) {
      console.error('Fehler beim Ändern der Reihenfolge:', error);
      setError('Fehler beim Ändern der Reihenfolge');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/admin" className="text-blue-500 hover:underline">
            &larr; Zurück zum Admin-Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">Laborwerte zu Profilen zuordnen</h1>
        
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

      <h1 className="text-3xl font-bold mb-6">Laborwerte zu Profilen zuordnen</h1>

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
        {/* Profil-Auswahl */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Profil auswählen</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fachbereich
            </label>
            <select
              value={selectedFachbereichId}
              onChange={(e) => setSelectedFachbereichId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={loading || fachbereiche.length === 0}
            >
              {fachbereiche.length === 0 ? (
                <option value="">Keine Fachbereiche verfügbar</option>
              ) : (
                fachbereiche.map(fachbereich => (
                  <option key={fachbereich.id} value={fachbereich.id}>
                    {fachbereich.name}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Laborprofil
            </label>
            <select
              value={selectedProfilId}
              onChange={(e) => setSelectedProfilId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              disabled={loading || filteredProfile.length === 0}
            >
              {filteredProfile.length === 0 ? (
                <option value="">Keine Profile für diesen Fachbereich</option>
              ) : (
                filteredProfile.map(profil => (
                  <option key={profil.id} value={profil.id}>
                    {profil.name}
                  </option>
                ))
              )}
            </select>
          </div>
          
          {/* Bereits zugeordnete Laborwerte */}
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Zugeordnete Laborwerte</h3>
            
            {profilWerte.length === 0 ? (
              <p className="text-gray-500">Keine Laborwerte zugeordnet</p>
            ) : (
              <ul className="border rounded-md divide-y">
                {profilWerte.map((profilWert, index) => (
                  <li key={profilWert.id} className="p-3 flex items-center justify-between">
                    <span>{profilWert.wert_name}</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => changeOrder(profilWert.id, 'up')}
                        className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                        disabled={loading || index === 0}
                        title="Nach oben verschieben"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => changeOrder(profilWert.id, 'down')}
                        className="text-blue-500 hover:text-blue-700 disabled:text-gray-400"
                        disabled={loading || index === profilWerte.length - 1}
                        title="Nach unten verschieben"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => removeWertFromProfil(profilWert.id)}
                        className="text-red-500 hover:text-red-700 disabled:text-gray-400"
                        disabled={loading}
                        title="Entfernen"
                      >
                        ×
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Laborwert-Auswahl */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Laborwert hinzufügen</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Suche nach Laborwerten
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Laborwert suchen..."
              className="w-full px-3 py-2 border rounded-md"
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Verfügbare Laborwerte
            </label>
            <select
              value={selectedWertId}
              onChange={(e) => setSelectedWertId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              size={10}
              disabled={loading || filteredWerte.length === 0}
            >
              {filteredWerte.length === 0 ? (
                <option value="">Keine verfügbaren Laborwerte</option>
              ) : (
                filteredWerte.map(wert => (
                  <option key={wert.id} value={wert.id}>
                    {wert.name}
                  </option>
                ))
              )}
            </select>
          </div>
          
          <button
            onClick={addWertToProfil}
            className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-blue-300 w-full"
            disabled={loading || !selectedProfilId || !selectedWertId || filteredWerte.length === 0}
          >
            Laborwert zum Profil hinzufügen
          </button>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Tipp: Wenn ein Laborwert nicht in der Liste erscheint, wurde er entweder bereits zugeordnet oder muss erst <Link href="/admin/laborwerte" className="text-blue-500 hover:underline">erstellt werden</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Laborprofil, Fachbereich } from '@/lib/types';

export default function LaborprofileAdmin() {
  const [laborprofile, setLaborprofile] = useState<Laborprofil[]>([]);
  const [fachbereiche, setFachbereiche] = useState<Fachbereich[]>([]);
  const [selectedProfil, setSelectedProfil] = useState<Laborprofil | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    fachbereich_id: '',
    beschreibung: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Authentifizierung
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
      loadData();
    } else {
      setError('Falsches Passwort');
    }
  };

  // Daten laden
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Laborprofile laden
      const profileResponse = await fetch('/api/admin/laborprofile');
      if (!profileResponse.ok) throw new Error('Fehler beim Laden der Profile');
      const profileData = await profileResponse.json();
      setLaborprofile(profileData);
      
      // Fachbereiche laden
      const fachbereicheResponse = await fetch('/api/fachbereiche');
      if (!fachbereicheResponse.ok) throw new Error('Fehler beim Laden der Fachbereiche');
      const fachbereicheData = await fachbereicheResponse.json();
      setFachbereiche(fachbereicheData);
    } catch (error) {
      console.error('Fehler beim Laden der Daten:', error);
      setError('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  // Formular zurücksetzen
  const resetForm = () => {
    setFormData({
      name: '',
      fachbereich_id: fachbereiche.length > 0 ? fachbereiche[0].id : '',
      beschreibung: ''
    });
    setSelectedProfil(null);
    setIsEditing(false);
  };

  // Profil zur Bearbeitung auswählen
  const selectProfilForEdit = (profil: Laborprofil) => {
    setSelectedProfil(profil);
    setFormData({
      name: profil.name,
      fachbereich_id: profil.fachbereich_id,
      beschreibung: profil.beschreibung || ''
    });
    setIsEditing(true);
  };

  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Daten vorbereiten
      const profilData = {
        name: formData.name,
        fachbereich_id: formData.fachbereich_id,
        beschreibung: formData.beschreibung || null
      };
      
      if (isEditing && selectedProfil) {
        // Bestehendes Profil aktualisieren
        const response = await fetch(`/api/admin/laborprofile/${selectedProfil.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profilData)
        });
        
        if (response.ok) {
          const updatedProfil = await response.json();
          
          // Lokale Daten aktualisieren
          setLaborprofile(prevProfile => 
            prevProfile.map(profil => 
              profil.id === selectedProfil.id ? updatedProfil : profil
            )
          );
          
          resetForm();
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Fehler beim Aktualisieren');
        }
      } else {
        // Neues Profil erstellen
        const response = await fetch('/api/admin/laborprofile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profilData)
        });
        
        if (response.ok) {
          const newProfil = await response.json();
          setLaborprofile(prev => [...prev, newProfil]);
          resetForm();
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Fehler beim Erstellen');
        }
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  // Profil löschen
  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Laborprofil löschen möchten?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/admin/laborprofile/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setLaborprofile(prev => prev.filter(profil => profil.id !== id));
        if (selectedProfil?.id === id) {
          resetForm();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Fehler beim Löschen');
      }
    } catch (error) {
      console.error('Fehler beim Löschen:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  // Änderungen im Formular
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Wenn Fachbereiche geladen wurden und das Formular leer ist, ersten Fachbereich als Standard setzen
  useEffect(() => {
    if (fachbereiche.length > 0 && !formData.fachbereich_id && !isEditing) {
      setFormData(prev => ({ ...prev, fachbereich_id: fachbereiche[0].id }));
    }
  }, [fachbereiche, formData.fachbereich_id, isEditing]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/admin" className="text-blue-500 hover:underline">
            &larr; Zurück zum Admin-Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">Laborprofile verwalten</h1>
        
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

      <h1 className="text-3xl font-bold mb-6">Laborprofile verwalten</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profil-Liste */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Alle Laborprofile</h2>
            
            <button 
              onClick={resetForm}
              className="mb-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              disabled={loading || fachbereiche.length === 0}
            >
              + Neues Profil anlegen
            </button>
            
            {loading && <p className="text-center text-gray-500 my-2">Wird geladen...</p>}
            
            {fachbereiche.length === 0 && !loading && (
              <p className="text-yellow-600 text-sm mb-4">
                Hinweis: Bitte erstellen Sie zuerst Fachbereiche.
              </p>
            )}
            
            <div className="max-h-96 overflow-y-auto border rounded">
              <ul className="divide-y">
                {laborprofile.map(profil => {
                  const fachbereich = fachbereiche.find(fb => fb.id === profil.fachbereich_id);
                  return (
                    <li key={profil.id} className="p-3 hover:bg-gray-50">
                      <div className="flex justify-between items-center">
                        <button 
                          onClick={() => selectProfilForEdit(profil)}
                          className="text-left flex-grow font-medium text-blue-600 hover:underline"
                          disabled={loading}
                        >
                          {profil.name}
                        </button>
                        <button 
                          onClick={() => handleDelete(profil.id)}
                          className="text-red-500 hover:text-red-700"
                          disabled={loading}
                        >
                          Löschen
                        </button>
                      </div>
                      {fachbereich && (
                        <p className="text-sm text-gray-500">
                          Fachbereich: {fachbereich.name}
                        </p>
                      )}
                    </li>
                  );
                })}
                
                {laborprofile.length === 0 && !loading && (
                  <li className="p-3 text-gray-500 text-center">
                    Keine Laborprofile vorhanden
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Bearbeitungsformular */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Laborprofil bearbeiten' : 'Neues Laborprofil anlegen'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fachbereich
                  </label>
                  <select
                    name="fachbereich_id"
                    value={formData.fachbereich_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    required
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
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Beschreibung
                </label>
                <textarea
                  name="beschreibung"
                  value={formData.beschreibung}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={loading}
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={loading || fachbereiche.length === 0}
                >
                  {loading ? 'Wird gespeichert...' : (isEditing ? 'Aktualisieren' : 'Speichern')}
                </button>
                
                <button
                  type="button"
                  onClick={resetForm}
                  className="border border-gray-300 bg-white text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 disabled:bg-gray-100"
                  disabled={loading}
                >
                  Abbrechen
                </button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                Nächste Schritte:
              </p>
              <ul className="list-disc pl-5 text-sm text-gray-500">
                <li className="mb-1">Nach dem Erstellen eines Profils können Sie <Link href="/admin/profil-werte" className="text-blue-500 hover:underline">Laborwerte zuordnen</Link>.</li>
                <li>Oder erstellen Sie zuerst <Link href="/admin/laborwerte" className="text-blue-500 hover:underline">neue Laborwerte</Link>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

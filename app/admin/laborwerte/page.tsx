'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Laborwert } from '@/lib/types';

export default function LaborwerteAdmin() {
  const [laborwerte, setLaborwerte] = useState<Laborwert[]>([]);
  const [selectedWert, setSelectedWert] = useState<Laborwert | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ebm_ziffer: '',
    verguetung: '',
    referenzbereich: '',
    erklaerung: '',
    gruende_erhoehte_werte: '',
    behandlung_erhoehte_werte: '',
    gruende_niedrige_werte: '',
    behandlung_niedrige_werte: ''
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
      const response = await fetch('/api/admin/laborwerte');
      if (!response.ok) throw new Error('Fehler beim Laden der Daten');
      
      const data = await response.json();
      setLaborwerte(data);
    } catch (error) {
      console.error('Fehler beim Laden der Laborwerte:', error);
    } finally {
      setLoading(false);
    }
  };

  // Formular zurücksetzen
  const resetForm = () => {
    setFormData({
      name: '',
      ebm_ziffer: '',
      verguetung: '',
      referenzbereich: '',
      erklaerung: '',
      gruende_erhoehte_werte: '',
      behandlung_erhoehte_werte: '',
      gruende_niedrige_werte: '',
      behandlung_niedrige_werte: ''
    });
    setSelectedWert(null);
    setIsEditing(false);
  };

  // Wert zur Bearbeitung auswählen
  const selectWertForEdit = (wert: Laborwert) => {
    setSelectedWert(wert);
    setFormData({
      name: wert.name,
      ebm_ziffer: wert.ebm_ziffer || '',
      verguetung: wert.verguetung?.toString() || '',
      referenzbereich: wert.referenzbereich || '',
      erklaerung: wert.erklaerung || '',
      gruende_erhoehte_werte: wert.gruende_erhoehte_werte || '',
      behandlung_erhoehte_werte: wert.behandlung_erhoehte_werte || '',
      gruende_niedrige_werte: wert.gruende_niedrige_werte || '',
      behandlung_niedrige_werte: wert.behandlung_niedrige_werte || ''
    });
    setIsEditing(true);
  };

  // Formular absenden
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Daten vorbereiten
      const laborwertData = {
        name: formData.name,
        ebm_ziffer: formData.ebm_ziffer || null,
        verguetung: formData.verguetung ? parseFloat(formData.verguetung) : null,
        referenzbereich: formData.referenzbereich || null,
        erklaerung: formData.erklaerung || null,
        gruende_erhoehte_werte: formData.gruende_erhoehte_werte || null,
        behandlung_erhoehte_werte: formData.behandlung_erhoehte_werte || null,
        gruende_niedrige_werte: formData.gruende_niedrige_werte || null,
        behandlung_niedrige_werte: formData.behandlung_niedrige_werte || null
      };
      
      if (isEditing && selectedWert) {
        // Bestehenden Wert aktualisieren
        const response = await fetch(`/api/admin/laborwerte/${selectedWert.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(laborwertData)
        });
        
        if (response.ok) {
          const updatedWert = await response.json();
          
          // Lokale Daten aktualisieren
          setLaborwerte(prevWerte => 
            prevWerte.map(wert => 
              wert.id === selectedWert.id ? updatedWert : wert
            )
          );
          
          resetForm();
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Fehler beim Aktualisieren');
        }
      } else {
        // Neuen Wert erstellen
        const response = await fetch('/api/admin/laborwerte', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(laborwertData)
        });
        
        if (response.ok) {
          const newWert = await response.json();
          setLaborwerte(prev => [...prev, newWert]);
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

  // Wert löschen
  const handleDelete = async (id: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Laborwert löschen möchten?')) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`/api/admin/laborwerte/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setLaborwerte(prev => prev.filter(wert => wert.id !== id));
        if (selectedWert?.id === id) {
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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/admin" className="text-blue-500 hover:underline">
            &larr; Zurück zum Admin-Dashboard
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">Laborwerte verwalten</h1>
        
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

      <h1 className="text-3xl font-bold mb-6">Laborwerte verwalten</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Wert-Liste */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Alle Laborwerte</h2>
            
            <button 
              onClick={resetForm}
              className="mb-4 w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
              disabled={loading}
            >
              + Neuen Wert anlegen
            </button>
            
            {loading && <p className="text-center text-gray-500 my-2">Wird geladen...</p>}
            
            <div className="max-h-96 overflow-y-auto border rounded">
              <ul className="divide-y">
                {laborwerte.map(wert => (
                  <li key={wert.id} className="p-3 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <button 
                        onClick={() => selectWertForEdit(wert)}
                        className="text-left flex-grow font-medium text-blue-600 hover:underline"
                        disabled={loading}
                      >
                        {wert.name}
                      </button>
                      <button 
                        onClick={() => handleDelete(wert.id)}
                        className="text-red-500 hover:text-red-700"
                        disabled={loading}
                      >
                        Löschen
                      </button>
                    </div>
                    {wert.ebm_ziffer && (
                      <p className="text-sm text-gray-500">
                        EBM: {wert.ebm_ziffer}
                      </p>
                    )}
                  </li>
                ))}
                
                {laborwerte.length === 0 && !loading && (
                  <li className="p-3 text-gray-500 text-center">
                    Keine Laborwerte vorhanden
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
              {isEditing ? 'Laborwert bearbeiten' : 'Neuen Laborwert anlegen'}
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
                    EBM-Ziffer
                  </label>
                  <input
                    type="text"
                    name="ebm_ziffer"
                    value={formData.ebm_ziffer}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vergütung (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    name="verguetung"
                    value={formData.verguetung}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referenzbereich
                  </label>
                  <input
                    type="text"
                    name="referenzbereich"
                    value={formData.referenzbereich}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Erklärung
                </label>
                <textarea
                  name="erklaerung"
                  value={formData.erklaerung}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md"
                  disabled={loading}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gründe für erhöhte Werte
                  </label>
                  <textarea
                    name="gruende_erhoehte_werte"
                    value={formData.gruende_erhoehte_werte}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Behandlung bei erhöhten Werten
                  </label>
                  <textarea
                    name="behandlung_erhoehte_werte"
                    value={formData.behandlung_erhoehte_werte}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gründe für niedrige Werte
                  </label>
                  <textarea
                    name="gruende_niedrige_werte"
                    value={formData.gruende_niedrige_werte}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Behandlung bei niedrigen Werten
                  </label>
                  <textarea
                    name="behandlung_niedrige_werte"
                    value={formData.behandlung_niedrige_werte}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border rounded-md"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 px-6 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                  disabled={loading}
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
          </div>
        </div>
      </div>
    </div>
  );
}

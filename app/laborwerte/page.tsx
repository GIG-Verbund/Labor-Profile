'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Laborwert } from '@/lib/types';

export default function LaborwertSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [laborwerte, setLaborwerte] = useState<Laborwert[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    
    if (searchTerm.trim()) {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/laborwerte?search=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Fehler bei der Suche');
        
        const data = await response.json();
        setLaborwerte(data);
        setSearched(true);
      } catch (error) {
        console.error('Suchfehler:', error);
      } finally {
        setLoading(false);
      }
    }
  }

  // Hilfsfunktion: Generiert einen Link basierend auf ID oder Name
  // Für importierte Daten verwenden wir den Namen, wenn die ID kein Standardformat hat
  const getWertLink = (wert: Laborwert) => {
    // Überprüfen, ob die ID das erwartete Format hat (wert-XXX)
    if (wert.id && wert.id.startsWith('wert-')) {
      return `/laborwerte/${wert.id}`;
    }
    // Ansonsten den Namen als Fallback verwenden
    return `/laborwerte/${encodeURIComponent(wert.name)}`;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Zurück zur Startseite
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Laborwertsuche</h1>

      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Laborwert suchen..."
            className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Suche...' : 'Suchen'}
          </button>
        </form>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Suche läuft...</p>
      ) : (
        <>
          {searched && (
            <>
              <h2 className="text-xl font-semibold mb-4">
                {laborwerte.length === 0
                  ? 'Keine Laborwerte gefunden'
                  : `${laborwerte.length} Laborwerte gefunden`}
              </h2>

              {laborwerte.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-3 px-4 text-left border">Name</th>
                        <th className="py-3 px-4 text-left border">EBM-Ziffer</th>
                        <th className="py-3 px-4 text-left border">Vergütung</th>
                        <th className="py-3 px-4 text-left border">Referenzbereich</th>
                        <th className="py-3 px-4 text-left border">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {laborwerte.map((wert) => (
                        <tr key={wert.id || wert.name} className="hover:bg-gray-50">
                          <td className="py-3 px-4 border">{wert.name}</td>
                          <td className="py-3 px-4 border">{wert.ebm_ziffer || '-'}</td>
                          <td className="py-3 px-4 border">
                            {wert.verguetung 
                              ? `${wert.verguetung.toFixed(2)} €` 
                              : '-'}
                          </td>
                          <td className="py-3 px-4 border">{wert.referenzbereich || '-'}</td>
                          <td className="py-3 px-4 border">
                            <Link 
                              href={getWertLink(wert)}
                              className="text-blue-500 hover:underline"
                            >
                              Details ansehen
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
          
          {!searched && (
            <div className="text-center text-gray-600">
              <p>Geben Sie den Namen eines Laborwerts ein, um die Suche zu starten.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

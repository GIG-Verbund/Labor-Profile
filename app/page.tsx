'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Fachbereich } from '@/lib/types';

export default function Home() {
  const [fachbereiche, setFachbereiche] = useState<Fachbereich[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Daten vom API-Endpunkt abrufen
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/fachbereiche');
        if (!response.ok) throw new Error('Fehler beim Laden der Daten');
        
        const data = await response.json();
        setFachbereiche(data);
      } catch (error) {
        console.error('Fehler beim Laden der Fachbereiche:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">
        GIG-Verbund Laborprofil App
      </h1>
      
      {loading ? (
        <div className="flex justify-center">
          <p className="text-gray-500">Lade Fachbereiche...</p>
        </div>
      ) : (
        <>
          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Fachbereiche</h2>
            
            {fachbereiche.length === 0 ? (
              <p className="text-gray-500">Keine Fachbereiche gefunden.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fachbereiche.map((bereich) => (
                  <Link
                    href={`/fachbereiche/${bereich.id}`}
                    key={bereich.id}
                    className="block"
                  >
                    <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h3 className="text-xl font-medium mb-2">{bereich.name}</h3>
                      {bereich.beschreibung && (
                        <p className="text-gray-600 text-sm">
                          {bereich.beschreibung}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">
              Laborwert finden
            </h2>
            <div className="max-w-xl mx-auto">
              <Link
                href="/laborwerte"
                className="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                Zur Laborwertsuche
              </Link>
            </div>
          </section>

          <div className="text-center mt-12">
            <Link
              href="/admin"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Administrationsbereich
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

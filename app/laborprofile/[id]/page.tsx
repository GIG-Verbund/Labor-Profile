'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Laborprofil, Laborwert, Fachbereich } from '@/lib/types';

// Erweiterte Laborwert-Daten mit Reihenfolge
type ProfilLaborwert = Laborwert & {
  reihenfolge: number | null;
};

export default function LaborprofilDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [profil, setProfil] = useState<Laborprofil | null>(null);
  const [fachbereich, setFachbereich] = useState<Fachbereich | null>(null);
  const [laborwerte, setLaborwerte] = useState<ProfilLaborwert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Daten vom API-Endpunkt abrufen
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Laborprofil laden
        const profilResponse = await fetch(`/api/laborprofile/${id}`);
        if (!profilResponse.ok) {
          if (profilResponse.status === 404) {
            setError('Laborprofil nicht gefunden');
          } else {
            setError('Fehler beim Laden der Daten');
          }
          return;
        }
        
        const profilData = await profilResponse.json();
        setProfil(profilData);
        
        // Fachbereich laden
        const fachbereichResponse = await fetch(`/api/fachbereiche/${profilData.fachbereich_id}`);
        if (!fachbereichResponse.ok) {
          setError('Fehler beim Laden des Fachbereichs');
          return;
        }
        
        const fachbereichData = await fachbereichResponse.json();
        setFachbereich(fachbereichData);
        
        // Laborwerte des Profils laden
        console.log('Lade Laborwerte für Profil:', id);
        const werteResponse = await fetch(`/api/profil-werte/profil/${id}`);
        if (!werteResponse.ok) {
          console.error('Fehler beim Laden der Laborwerte:', await werteResponse.text());
          setError('Fehler beim Laden der Laborwerte');
          return;
        }
        
        const werteData = await werteResponse.json();
        console.log('Geladene Laborwerte:', werteData);
        setLaborwerte(werteData);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError('Ein unerwarteter Fehler ist aufgetreten');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-gray-500">Lade Daten...</p>
      </div>
    );
  }

  if (error || !profil || !fachbereich) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">{error || 'Laborprofil nicht gefunden'}</p>
        <div className="text-center mt-4">
          <Link href="/" className="text-blue-500 hover:underline">
            Zurück zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link 
          href={`/fachbereiche/${fachbereich.id}`} 
          className="text-blue-500 hover:underline"
        >
          &larr; Zurück zu {fachbereich.name}
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{profil.name}</h1>
      <p className="text-gray-600 mb-2">Fachbereich: {fachbereich.name}</p>
      
      {profil.beschreibung && (
        <p className="text-gray-600 mb-8">{profil.beschreibung}</p>
      )}

      <h2 className="text-2xl font-semibold mb-4">Enthaltene Laborwerte</h2>
      
      {laborwerte.length === 0 ? (
        <p className="text-gray-500">Keine Laborwerte für dieses Profil gefunden.</p>
      ) : (
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
                <tr key={wert.id} className="hover:bg-gray-50">
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
                      href={`/laborwerte/${wert.id}`}
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
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Laborwert, Laborprofil } from '@/lib/types';

type ProfilWithFachbereich = Laborprofil & {
  fachbereich_name: string;
};

export default function LaborwertDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [laborwert, setLaborwert] = useState<Laborwert | null>(null);
  const [profile, setProfile] = useState<ProfilWithFachbereich[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Daten vom API-Endpunkt abrufen
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Laborwert laden
        const laborwertResponse = await fetch(`/api/laborwerte/${id}`);
        if (!laborwertResponse.ok) {
          if (laborwertResponse.status === 404) {
            console.error(`Laborwert nicht gefunden: ID=${id}`);
            setError('Laborwert nicht gefunden');
          } else {
            setError('Fehler beim Laden der Daten');
          }
          return;
        }
        
        const laborwertData: Laborwert = await laborwertResponse.json();
        console.log("Laborwert geladen:", laborwertData);
        setLaborwert(laborwertData);
        
        // An dieser Stelle müssten wir auch die zugehörigen Profile laden
        // Dies würde normalerweise über einen API-Endpunkt geschehen
        
        try {
          // Profile laden
          const profileResponse = await fetch(`/api/laborwerte/${laborwertData.id}/profile`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setProfile(profileData);
          }
        } catch (profileError) {
          console.log("Konnte keine Profile laden:", profileError);
          // Wir setzen keinen Fehler, da die Hauptdaten bereits geladen wurden
          setProfile([]);
        }
        
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

  if (error || !laborwert) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">{error || 'Laborwert nicht gefunden'}</p>
        <div className="text-center mt-4">
          <Link href="/laborwerte" className="text-blue-500 hover:underline">
            Zurück zur Suche
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/laborwerte" className="text-blue-500 hover:underline">
          &larr; Zurück zur Laborwertsuche
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">{laborwert.name}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Grundinformationen</h2>
          
          <div className="space-y-3">
            <div>
              <p className="text-gray-600 text-sm">EBM-Ziffer</p>
              <p className="font-medium">{laborwert.ebm_ziffer || 'Nicht angegeben'}</p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Vergütung</p>
              <p className="font-medium">
                {laborwert.verguetung 
                  ? `${laborwert.verguetung.toFixed(2)} €` 
                  : 'Nicht angegeben'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-600 text-sm">Referenzbereich</p>
              <p className="font-medium">{laborwert.referenzbereich || 'Nicht angegeben'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Beschreibung</h2>
          <p>{laborwert.erklaerung || 'Keine Beschreibung verfügbar.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-red-600">Erhöhte Werte</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Mögliche Gründe</h3>
              <p>{laborwert.gruende_erhoehte_werte || 'Keine Information verfügbar.'}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Behandlungsmöglichkeiten</h3>
              <p>{laborwert.behandlung_erhoehte_werte || 'Keine Information verfügbar.'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Niedrige Werte</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Mögliche Gründe</h3>
              <p>{laborwert.gruende_niedrige_werte || 'Keine Information verfügbar.'}</p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Behandlungsmöglichkeiten</h3>
              <p>{laborwert.behandlung_niedrige_werte || 'Keine Information verfügbar.'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Enthalten in folgenden Profilen</h2>
        
        {profile.length === 0 ? (
          <p className="text-gray-500">Dieser Laborwert ist keinem Profil zugeordnet.</p>
        ) : (
          <ul className="space-y-2">
            {profile.map((profil) => (
              <li key={profil.id}>
                <Link 
                  href={`/laborprofile/${profil.id}`}
                  className="text-blue-500 hover:underline"
                >
                  {profil.name}
                </Link>
                <span className="text-gray-500 ml-2">
                  (Fachbereich: {profil.fachbereich_name})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

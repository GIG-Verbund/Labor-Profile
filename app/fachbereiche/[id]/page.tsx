'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Fachbereich, Laborprofil } from '@/lib/types';

export default function FachbereichDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [fachbereich, setFachbereich] = useState<Fachbereich | null>(null);
  const [profile, setProfile] = useState<Laborprofil[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Daten vom API-Endpunkt abrufen
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fachbereich laden
        const fachbereichResponse = await fetch(`/api/fachbereiche/${id}`);
        if (!fachbereichResponse.ok) {
          if (fachbereichResponse.status === 404) {
            setError('Fachbereich nicht gefunden');
          } else {
            setError('Fehler beim Laden der Daten');
          }
          return;
        }
        
        const fachbereichData = await fachbereichResponse.json();
        setFachbereich(fachbereichData);
        
        // Profile des Fachbereichs laden
        const profileResponse = await fetch(`/api/laborprofile/fachbereich/${id}`);
        if (!profileResponse.ok) {
          setError('Fehler beim Laden der Profile');
          return;
        }
        
        const profileData = await profileResponse.json();
        setProfile(profileData);
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

  if (error || !fachbereich) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-center text-red-500">{error || 'Fachbereich nicht gefunden'}</p>
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
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Zurück zur Startseite
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-2">{fachbereich.name}</h1>
      
      {fachbereich.beschreibung && (
        <p className="text-gray-600 mb-8">{fachbereich.beschreibung}</p>
      )}

      <h2 className="text-2xl font-semibold mb-4">Laborprofile</h2>
      
      {profile.length === 0 ? (
        <p className="text-gray-500">Keine Laborprofile für diesen Fachbereich gefunden.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.map((profil) => (
            <Link
              href={`/laborprofile/${profil.id}`}
              key={profil.id}
              className="block"
            >
              <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-xl font-medium mb-2">{profil.name}</h3>
                {profil.beschreibung && (
                  <p className="text-gray-600 text-sm">{profil.beschreibung}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

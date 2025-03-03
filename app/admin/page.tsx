'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Einfache Passwortauthentifizierung
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hier würde normalerweise eine sichere Authentifizierung stattfinden
    // Dies ist nur eine einfache Demo-Implementation
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Falsches Passwort');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-4">
          <Link href="/" className="text-blue-500 hover:underline">
            &larr; Zurück zur Startseite
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-center">Administrationsbereich</h1>
        
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
        <Link href="/" className="text-blue-500 hover:underline">
          &larr; Zurück zur Startseite
        </Link>
      </div>

      <h1 className="text-3xl font-bold mb-6">Administrationsbereich</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Fachbereiche</h2>
          <p className="text-gray-600 mb-4">
            Fachbereiche hinzufügen, bearbeiten oder löschen.
          </p>
          <Link
            href="/admin/fachbereiche"
            className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Verwalten
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Laborprofile</h2>
          <p className="text-gray-600 mb-4">
            Laborprofile erstellen und bearbeiten
          </p>
          <Link
            href="/admin/laborprofile"
            className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Verwalten
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Laborwerte</h2>
          <p className="text-gray-600 mb-4">
            Laborwerte hinzufügen, bearbeiten oder löschen.
          </p>
          <Link
            href="/admin/laborwerte"
            className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Verwalten
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Laborwerte zuordnen</h2>
          <p className="text-gray-600 mb-4">
            Laborwerte zu Profilen zuordnen und die Reihenfolge anpassen.
          </p>
          <Link
            href="/admin/profil-werte"
            className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Verwalten
          </Link>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Import / Export</h2>
          <p className="text-gray-600 mb-4">
            Daten aus Excel importieren oder als CSV exportieren.
          </p>
          <Link
            href="/admin/import-export"
            className="block w-full text-center bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            Öffnen
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Abmelden
        </button>
      </div>
    </div>
  );
}

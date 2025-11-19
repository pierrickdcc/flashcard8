import React from 'react';
import { Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle'; // Je prévois d'ajouter le ThemeToggle ici

const AppHeader = () => {
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between bg-body/80 backdrop-blur-lg border-b border-border"
      style={{
        padding: '1.5rem 2.5rem',
      }}
    >
      {/* Barre de recherche */}
      <div className="relative w-full max-w-md">
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
          size={20}
        />
        <input
          type="text"
          placeholder="Rechercher..."
          className="w-full bg-card border border-border rounded-2xl py-2.5 pl-12 pr-4 text-main text-sm focus:border-primary transition-colors"
        />
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <div
          className="w-10 h-10 rounded-full bg-primary-gradient grid place-items-center font-bold cursor-pointer"
        >
          JD
        </div>
      </div>
    </header>
  );
};

export default AppHeader;

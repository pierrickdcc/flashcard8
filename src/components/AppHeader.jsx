import React from 'react';
import { Search } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';

const AppHeader = ({ onProfileClick }) => {
  const { session } = useAuth();
  const userInitials = session?.user?.email
    ? session.user.email.substring(0, 2).toUpperCase()
    : 'JD';

  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-between bg-[rgba(14,17,22,0.85)] backdrop-blur-xl border-b border-[var(--border)]"
      style={{
        padding: '1.5rem 2.5rem',
      }}
    >
      {/* Barre de recherche (Intégration de GlobalSearch ou style statique mappé) */}
      <div className="relative w-[450px] hidden md:block">
         {/* Je suppose que GlobalSearch est le composant fonctionnel.
             Si on veut le style exact de la maquette, on peut styliser GlobalSearch.
             Pour l'instant, j'utilise la structure HTML/CSS de la maquette adaptée en JSX. */}
         <div className="relative w-full">
            <Search className="absolute left-[1.2rem] top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
            <input
              type="text"
              className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] py-[0.8rem] pl-[3rem] pr-[1rem] text-[var(--text-main)] text-[0.95rem] focus:border-[var(--primary)] transition-colors"
              placeholder="Rechercher..."
            />
         </div>
      </div>

      {/* Mobile Title (Visible only on small screens if needed, otherwise empty) */}
      <div className="md:hidden font-bold text-xl flex items-center gap-2">
        <span>Flash</span>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={onProfileClick}
          className="w-[42px] h-[42px] rounded-full bg-[var(--primary-gradient)] grid place-items-center font-bold cursor-pointer select-none"
        >
          {userInitials}
        </motion.div>
      </div>
    </header>
  );
};

import { motion } from 'framer-motion';
export default AppHeader;

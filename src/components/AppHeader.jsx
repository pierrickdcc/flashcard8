import React from 'react';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../context/AuthContext';
import GlobalSearch from './GlobalSearch';

const AppHeader = ({ onProfileClick }) => {
  const { session } = useAuth();
  const userInitials = session?.user?.email
    ? session.user.email.substring(0, 2).toUpperCase()
    : 'JD';

  return (
    <header className="top-bar">
      {/* Barre de recherche (Desktop) */}
      <div className="hidden md:block">
         <GlobalSearch />
      </div>

      {/* Titre Mobile (si nécessaire) */}
      <div className="md:hidden font-bold text-xl flex items-center gap-2 text-[var(--text-main)]">
        <span>Flash</span>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center gap-4 ml-auto md:ml-0">
        <ThemeToggle />
        <motion.div
          whileTap={{ scale: 0.95 }}
          onClick={onProfileClick}
          className="user-profile text-white select-none"
        >
          {userInitials}
        </motion.div>
      </div>
    </header>
  );
};

export default AppHeader;

import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { LayoutGrid, Layers, BookOpen, User, Plus } from 'lucide-react';

const MobileNav = ({ onFabClick, onProfileClick }) => {
  const navItems = [
    { to: '/', label: 'Accueil', icon: LayoutGrid },
    { to: '/flashcards', label: 'Cartes', icon: Layers },
    { to: '/courses', label: 'Cours', icon: BookOpen },
  ];

  return (
    <>
      {/* Barre de navigation inférieure */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-[var(--nav-height)] bg-[rgba(14,17,22,0.95)] backdrop-blur-xl border-t border-[var(--border)] z-50 grid grid-cols-4"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors no-underline
              ${isActive ? 'text-[var(--primary)]' : 'text-[var(--text-muted)]'}`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}

        <button
          onClick={onProfileClick}
          className="flex flex-col items-center justify-center gap-1 text-[0.7rem] font-medium transition-colors text-[var(--text-muted)]"
        >
           <User size={22} />
           <span>Profil</span>
        </button>
      </nav>

      {/* Bouton d'action flottant (FAB) */}
      {/* Mobile: Above nav bar */}
      <div className="md:hidden fixed z-[60]" style={{bottom: 'calc(var(--nav-height) + 16px)', right: '16px'}}>
        <motion.button
          onClick={onFabClick}
          className="w-14 h-14 rounded-full bg-[var(--primary-gradient)] text-white grid place-items-center shadow-lg shadow-blue-500/40 cursor-pointer border-none"
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
        >
          <Plus size={28} />
        </motion.button>
      </div>

      {/* Desktop: Fixed Bottom Right Corner */}
      <div className="hidden md:block fixed z-[60] bottom-8 right-8">
        <motion.button
          onClick={onFabClick}
          className="w-14 h-14 rounded-full bg-[var(--primary-gradient)] text-white grid place-items-center shadow-xl shadow-blue-500/30 cursor-pointer border-none hover:scale-110 transition-transform"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Ajouter du contenu"
        >
          <Plus size={28} />
        </motion.button>
      </div>
    </>
  );
};

export default MobileNav;

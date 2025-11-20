import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, LayoutGrid, Layers, BookOpen, StickyNote, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { to: '/', label: 'Tableau de bord', icon: LayoutGrid },
    { to: '/flashcards', label: 'Flashcards', icon: Layers },
    { to: '/courses', label: 'Cours', icon: BookOpen },
    { to: '/memos', label: 'Mémos', icon: StickyNote },
    { to: '/stats', label: 'Statistiques', icon: BarChart2 },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className="hidden md:flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border)] shrink-0 z-20 relative"
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-[var(--bg-card)] border border-[var(--border)] rounded-full flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--primary)] hover:border-[var(--primary)] transition-colors z-30 cursor-pointer shadow-sm"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="p-6 flex flex-col h-full">
        <NavLink to="/" className={`flex items-center gap-3 text-2xl font-extrabold mb-10 text-[var(--text-main)] no-underline ${isCollapsed ? 'justify-center' : ''}`}>
          <Zap className="text-[var(--primary)] shrink-0" fill="rgba(59, 130, 246, 0.2)" size={28} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="whitespace-nowrap overflow-hidden"
              >
                Flash
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        <nav className="flex flex-col gap-2 flex-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={label}
              to={to}
              title={isCollapsed ? label : ''}
              className={({ isActive }) =>
                `flex items-center p-3 rounded-xl font-medium transition-all duration-200 text-[var(--text-muted)] no-underline hover:bg-white/5 hover:text-[var(--text-main)]
                ${isActive ? 'bg-[rgba(59,130,246,0.15)] text-[var(--primary)]' : ''}
                ${isCollapsed ? 'justify-center' : 'gap-4 hover:translate-x-1'}`
              }
            >
              <Icon size={22} className="shrink-0" />
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Footer / User Info could go here */}
      </div>
    </motion.aside>
  );
};

export default Sidebar;

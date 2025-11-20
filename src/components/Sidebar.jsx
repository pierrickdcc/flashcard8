import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, LayoutGrid, Layers, BookOpen, StickyNote, BarChart2, ChevronLeft, ChevronRight, Cloud, CloudOff, RefreshCw, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const { isOnline, isSyncing, lastSync } = useDataSync();

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', newState);
  };

  const navItems = [
    { to: '/', label: 'Tableau de bord', icon: LayoutGrid },
    { to: '/flashcards', label: 'Flashcards', icon: Layers },
    { to: '/courses', label: 'Cours', icon: BookOpen },
    { to: '/memos', label: 'Mémos', icon: StickyNote },
    { to: '/stats', label: 'Statistiques', icon: BarChart2 },
  ];

  const getTimeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'À l\'instant';
    if (diff < 3600) return `${Math.floor(diff / 60)} min`;
    return `${Math.floor(diff / 3600)} h`;
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? '80px' : '260px' }}
      className="hidden md:flex flex-col bg-[var(--bg-sidebar)] border-r border-[var(--border)] shrink-0 z-20 relative h-full transition-all duration-300 shadow-2xl"
    >
      {/* Logo Area */}
      <div className="h-[var(--nav-height)] flex items-center px-6">
        <NavLink to="/" className={`flex items-center gap-3 text-[var(--text-main)] no-underline group ${isCollapsed ? 'justify-center w-full' : ''}`}>
          <div className="w-10 h-10 rounded-xl bg-[var(--primary-gradient)] flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <Zap className="text-white" size={20} fill="currentColor" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="font-bold text-xl tracking-tight whitespace-nowrap bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent"
              >
                Flash
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2 p-4 mt-4 overflow-y-auto overflow-x-hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            title={isCollapsed ? label : ''}
            className={({ isActive }) =>
              `flex items-center h-12 rounded-xl transition-all duration-200 no-underline relative group
              ${isActive
                ? 'text-white shadow-lg shadow-indigo-500/20'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-card)]'}
              ${isCollapsed ? 'justify-center px-0' : 'px-4 gap-3'}`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-[var(--primary-gradient)] rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon size={22} className="shrink-0 z-10 relative" />
                {!isCollapsed && (
                  <span className="whitespace-nowrap overflow-hidden text-sm font-medium z-10 relative">
                    {label}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* VS Code Style Footer: Sync Status & Collapse */}
      <div className="mt-auto border-t border-[var(--border)] bg-[var(--bg-sidebar)]">
        {/* Sync Status Bar */}
        <div className={`flex items-center h-10 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'} text-xs text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-main)] transition-colors cursor-default`}>
           <div className="flex items-center gap-2">
              {isSyncing ? (
                 <RefreshCw size={14} className="animate-spin text-[var(--primary)]" />
               ) : isOnline ? (
                 <Wifi size={14} className="text-emerald-400" />
               ) : (
                 <CloudOff size={14} className="text-red-400" />
               )}

               {!isCollapsed && (
                 <span>
                    {isSyncing ? 'Sync...' : (isOnline ? 'En ligne' : 'Hors ligne')}
                 </span>
               )}
           </div>

           {!isCollapsed && !isSyncing && isOnline && lastSync && (
               <span className="opacity-50 text-[10px]">{getTimeAgo(lastSync)}</span>
           )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center h-10 border-t border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-white transition-colors"
          title={isCollapsed ? "Déplier" : "Replier"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;

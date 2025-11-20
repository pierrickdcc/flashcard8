import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, LayoutGrid, Layers, BookOpen, StickyNote, BarChart2 } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { to: '/', label: 'Tableau de bord', icon: LayoutGrid },
    { to: '/flashcards', label: 'Flashcards', icon: Layers },
    { to: '/courses', label: 'Cours', icon: BookOpen },
    { to: '/memos', label: 'Mémos', icon: StickyNote },
    { to: '/stats', label: 'Statistiques', icon: BarChart2 },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[var(--sidebar-width)] bg-[var(--bg-sidebar)] border-r border-[var(--border)] p-8 shrink-0 z-20">
      <NavLink to="/" className="flex items-center gap-3 text-2xl font-extrabold mb-12 text-[var(--text-main)] no-underline">
        <Zap className="text-[var(--primary)]" fill="rgba(59, 130, 246, 0.2)" />
        <span>Flash</span>
      </NavLink>
      <nav className="flex flex-col gap-2 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-4 p-4 rounded-xl font-medium transition-all duration-200 text-[var(--text-muted)] no-underline hover:bg-white/5 hover:text-[var(--text-main)] hover:translate-x-1
              ${isActive ? 'bg-[rgba(59,130,246,0.15)] text-[var(--primary)]' : ''}`
            }
          >
            <Icon size={22} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

import React, { Fragment } from 'react';
import { Search, Plus, LogOut, Settings, Database, User, Command } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import { useUIState } from '../context/UIStateContext';
import ThemeToggle from './ThemeToggle';
import styles from './Header.module.css';

const AppHeader = ({ onProfileClick }) => {
  const { searchTerm, debouncedSetSearchTerm, setShowAddCardModal } = useUIState();
  const { session } = useAuth();

  const userInitials = session?.user?.email
    ? session.user.email.substring(0, 2).toUpperCase()
    : '??';

  return (
    <header className="h-[var(--nav-height)] bg-[var(--bg-body)]/80 backdrop-blur-xl border-b border-[var(--border)] sticky top-0 z-30 px-6 flex items-center justify-between transition-colors duration-300">

      {/* Mobile Title */}
      <div className="md:hidden font-extrabold text-xl flex items-center gap-2">
         <span className="bg-[var(--primary-gradient)] bg-clip-text text-transparent">Flash</span>
      </div>

      {/* Search Bar - Better Integrated */}
      <div className="hidden md:flex flex-1 max-w-lg relative group mr-auto">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" />
        <input
          type="text"
          placeholder="Rechercher (Flashcards, Cours, Mémos)..."
          className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl py-2 pl-10 pr-12 text-sm text-[var(--text-main)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all shadow-sm placeholder:text-[var(--text-muted)]/70"
          defaultValue={searchTerm}
          onChange={(e) => debouncedSetSearchTerm(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
           <span className="text-[10px] font-medium text-[var(--text-muted)] border border-[var(--border)] rounded px-1.5 py-0.5 bg-[var(--bg-body)]">⌘ K</span>
        </div>
      </div>

      {/* Actions Area */}
      <div className="flex items-center gap-3 md:gap-5">
        <ThemeToggle />

        <div className="h-6 w-[1px] bg-[var(--border)] hidden md:block"></div>

        <button
          className="hidden md:flex items-center gap-2 bg-[var(--primary-gradient)] hover:brightness-110 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:scale-95"
          onClick={() => setShowAddCardModal(true)}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Créer</span>
        </button>

        {/* Dropdown Profil - Clean & Standard */}
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="flex items-center gap-2 focus:outline-none group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] cursor-pointer shadow-md transition-transform group-hover:scale-105 ring-offset-2 ring-offset-[var(--bg-body)] group-focus:ring-2 ring-[var(--primary)]">
              <div className="w-full h-full rounded-full bg-[var(--bg-card)] flex items-center justify-center">
                <span className="font-bold text-xs text-white">{userInitials}</span>
              </div>
            </div>
          </Menu.Button>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right divide-y divide-[var(--border)] rounded-xl bg-[var(--bg-card)] shadow-2xl ring-1 ring-black/50 focus:outline-none border border-[var(--border)] z-50 overflow-hidden backdrop-blur-xl">
              <div className="px-4 py-3 bg-[var(--bg-sidebar)]/50">
                <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold tracking-wider">Connecté en tant que</p>
                <p className="text-sm font-medium text-[var(--text-main)] truncate mt-0.5">{session?.user?.email}</p>
              </div>

              <div className="p-1.5">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onProfileClick}
                      className={`${
                        active ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--text-main)]'
                      } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                    >
                      <User className="mr-3 h-4 w-4 opacity-70" />
                      Mon Profil
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onProfileClick}
                      className={`${
                        active ? 'bg-[var(--primary)]/10 text-[var(--primary)]' : 'text-[var(--text-main)]'
                      } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                    >
                      <Database className="mr-3 h-4 w-4 opacity-70" />
                      Données & Export
                    </button>
                  )}
                </Menu.Item>
              </div>

              <div className="p-1.5 border-t border-[var(--border)]">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={onProfileClick}
                      className={`${
                        active ? 'bg-red-500/10 text-red-500' : 'text-red-500'
                      } group flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors`}
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Se déconnecter
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};

export default AppHeader;

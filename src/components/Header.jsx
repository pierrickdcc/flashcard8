import React from 'react';
import { useUIState } from '../context/UIStateContext';
import { Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import ProfileMenu from './ProfileSideMenu'; // Correction définitive
import styles from './Header.module.css';

const Header = () => {
  const {
    setShowAddCardModal,
    searchTerm,
    debouncedSetSearchTerm,
  } = useUIState();

  const navigate = useNavigate();

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>

        {/* Logo */}
        <a href="/" className={styles.logo} onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <span className={styles.logoText}>Flash</span>
        </a>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <Search size={18} className={styles.searchIcon}/>
          <input
            type="text"
            placeholder="Rechercher... (Ctrl+K)"
            className={styles.searchInput}
            defaultValue={searchTerm}
            onChange={(e) => debouncedSetSearchTerm(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className={styles.headerActions}>
          <ThemeToggle />

          <button
            className="btn btn-primary"
            onClick={() => setShowAddCardModal(true)}
          >
            <Plus size={18} />
            <span>Nouveau</span>
          </button>

          <ProfileMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import CardGrid from './CardGrid';
import CardTable from './CardTable';
import Pagination from './Pagination';
import { LayoutGrid, List, Brain, Search, Filter, Layers } from 'lucide-react';

const CARDS_PER_PAGE = 12;

const FlashcardsPage = () => {
  const { cards, subjects = [], updateCard, deleteCard, getCardsToReview } = useDataSync();
  const { viewMode, setViewMode, setShowReviewSetupModal } = useUIState();

  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingCard, setEditingCard] = useState(null);
  const [dueCardsCount, setDueCardsCount] = useState(0);

  useEffect(() => {
    const fetchDueCards = async () => {
      const dueCards = await getCardsToReview([selectedSubject]);
      setDueCardsCount(dueCards.length);
    };
    fetchDueCards();
  }, [cards, selectedSubject, getCardsToReview]);

  const filteredCards = useMemo(() => {
    if (!cards) return [];

    let cardsToFilter = cards;

    if (selectedSubject !== 'all') {
      cardsToFilter = cardsToFilter.filter(card => card.subject_id === selectedSubject);
    }

    if (searchQuery.trim() !== '') {
        const lowercasedQuery = searchQuery.toLowerCase();
        cardsToFilter = cardsToFilter.filter(card =>
            (card.question && card.question.toLowerCase().includes(lowercasedQuery)) ||
            (card.answer && card.answer.toLowerCase().includes(lowercasedQuery))
        );
    }

    return cardsToFilter;
  }, [cards, selectedSubject, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, searchQuery]);

  const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);
  const paginatedCards = filteredCards.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE
  );

  const handleUpdateCard = async (cardId, updatedData) => {
    await updateCard(cardId, updatedData);
    setEditingCard(null);
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

   return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="p-8 max-w-[1800px] mx-auto w-full flex flex-col gap-8 dashboard-layout" // Added dashboard-layout for consistent padding
    >
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-main)] flex items-center gap-3 tracking-tight">
            <div className="p-2 bg-[rgba(99,102,241,0.1)] rounded-xl border border-[rgba(99,102,241,0.2)]">
                <Layers className="text-[var(--primary)]" size={32} />
            </div>
            Flashcards
          </h1>
          <p className="text-[var(--text-muted)] mt-2 text-lg">
              Explorez votre base de connaissances et maîtrisez vos sujets.
          </p>
        </div>

        {dueCardsCount > 0 && (
           <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(99, 102, 241, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReviewSetupModal(true)}
            className="btn-review" // Use new shared class
          >
            <Brain size={24} />
            <span>Réviser {dueCardsCount} cartes</span>
          </motion.button>
        )}
      </header>

      {/* Controls Bar - Glassmorphism */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col lg:flex-row gap-4 items-center justify-between">

         {/* Search */}
         <div className="relative flex-1 w-full max-w-lg">
           <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
           <input
            type="text"
            placeholder="Rechercher une notion..."
            className="glass-input w-full rounded-xl py-3 pl-12 pr-4 text-[var(--text-main)]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">

          {/* Filter */}
          <div className="glass-input flex items-center gap-3 rounded-xl px-4 py-3 min-w-[220px]">
            <Filter size={18} className="text-[var(--text-muted)]" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent border-none text-sm text-[var(--text-main)] focus:ring-0 cursor-pointer w-full outline-none"
              style={{ backgroundImage: 'none' }} // Remove default arrow if needed, or keep for clarity
            >
              <option value="all" className="bg-[var(--bg-card)]">Toutes les matières</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-[var(--bg-card)]">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-10 w-[1px] bg-[rgba(255,255,255,0.1)] hidden lg:block"></div>

          {/* View Toggle */}
          <div className="flex bg-[rgba(0,0,0,0.2)] rounded-xl p-1 border border-[rgba(255,255,255,0.05)]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-3 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              title="Vue Grille"
            >
              <LayoutGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-3 rounded-lg transition-all ${viewMode === 'table' ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-md' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
               title="Vue Liste"
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {viewMode === 'grid' ? (
          <CardGrid
            filteredCards={paginatedCards}
            setEditingCard={() => alert('Passez en vue liste pour modifier.')}
            deleteCardWithSync={deleteCard}
            subjects={subjects}
          />
        ) : (
          <CardTable
            filteredCards={paginatedCards}
            editingCard={editingCard}
            setEditingCard={setEditingCard}
            updateCardWithSync={handleUpdateCard}
            deleteCardWithSync={deleteCard}
            subjects={subjects}
          />
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </motion.div>
  );
};

export default FlashcardsPage;

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
      className="p-8 max-w-[1600px] mx-auto w-full flex flex-col gap-8"
    >
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-main)] flex items-center gap-3">
            <Layers className="text-[var(--color-flashcards)]" size={32} />
            Flashcards
          </h1>
          <p className="text-[var(--text-muted)] mt-1">Gérez votre base de connaissances et révisez vos acquis.</p>
        </div>

        {dueCardsCount > 0 && (
           <motion.button
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowReviewSetupModal(true)}
            className="flex items-center gap-3 px-6 py-3 bg-[var(--primary-gradient)] rounded-xl text-white font-bold shadow-lg shadow-blue-500/25"
          >
            <Brain size={20} />
            <span>Réviser {dueCardsCount} cartes</span>
          </motion.button>
        )}
      </header>

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border)] shadow-sm">
         <div className="relative flex-1 w-full max-w-md">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
           <input
            type="text"
            placeholder="Rechercher une carte..."
            className="w-full bg-[var(--bg-body)] border border-[var(--border)] rounded-xl py-2.5 pl-10 pr-4 text-[var(--text-main)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <div className="flex items-center gap-2 bg-[var(--bg-body)] border border-[var(--border)] rounded-xl px-3 py-2">
            <Filter size={16} className="text-[var(--text-muted)]" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="bg-transparent border-none text-sm text-[var(--text-main)] focus:ring-0 cursor-pointer min-w-[150px]"
            >
              <option value="all">Toutes les matières</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="h-8 w-[1px] bg-[var(--border)] mx-1 hidden lg:block"></div>

          <div className="flex bg-[var(--bg-body)] border border-[var(--border)] rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
              title="Vue Grille"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-[var(--bg-card)] text-[var(--primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
               title="Vue Liste"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

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

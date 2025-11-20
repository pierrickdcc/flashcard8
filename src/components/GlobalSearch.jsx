import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, StickyNote, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalSearch = () => {
    const { cards, courses, memos } = useDataSync();
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef(null);

    const searchResults = useMemo(() => {
        if (query.trim().length < 2) return null;

        const lowercasedQuery = query.toLowerCase();

        const foundCards = cards
            .filter(card =>
                card.question?.toLowerCase().includes(lowercasedQuery) ||
                card.answer?.toLowerCase().includes(lowercasedQuery)
            )
            .slice(0, 5);

        const foundCourses = courses
            .filter(course =>
                course.title?.toLowerCase().includes(lowercasedQuery) ||
                course.content?.toLowerCase().includes(lowercasedQuery)
            )
            .slice(0, 5);

        const foundMemos = memos
            .filter(memo => memo.content?.toLowerCase().includes(lowercasedQuery))
            .slice(0, 5);

        if (foundCards.length === 0 && foundCourses.length === 0 && foundMemos.length === 0) {
            return null;
        }

        return { cards: foundCards, courses: foundCourses, memos: foundMemos };
    }, [query, cards, courses, memos]);

    const handleResultClick = (path) => {
        navigate(path);
        setQuery('');
        setIsFocused(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={searchRef} className="search-container">
             <Search className="absolute left-[1.2rem] top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" size={20} />
             <input
                type="text"
                placeholder="Recherche globale..."
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
            />

            <AnimatePresence>
            {isFocused && searchResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[14px] shadow-xl z-50 overflow-hidden max-h-[400px] overflow-y-auto"
                >
                    {searchResults.courses.length > 0 && (
                        <div className="p-2">
                            <h3 className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                                <FileText size={12} /> Cours
                            </h3>
                            {searchResults.courses.map(course => (
                                <div key={course.id} className="px-3 py-2 hover:bg-[var(--primary)] hover:bg-opacity-10 hover:text-[var(--primary)] rounded-lg cursor-pointer transition-colors text-sm truncate" onClick={() => handleResultClick(`/courses/${course.id}`)}>
                                    {course.title}
                                </div>
                            ))}
                        </div>
                    )}
                    {searchResults.cards.length > 0 && (
                        <div className="p-2 border-t border-[var(--border)]">
                             <h3 className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                                <Layers size={12} /> Flashcards
                             </h3>
                            {searchResults.cards.map(card => (
                                <div key={card.id} className="px-3 py-2 hover:bg-[var(--primary)] hover:bg-opacity-10 hover:text-[var(--primary)] rounded-lg cursor-pointer transition-colors text-sm truncate" onClick={() => handleResultClick('/flashcards')}>
                                    {card.question}
                                </div>
                            ))}
                        </div>
                    )}
                    {searchResults.memos.length > 0 && (
                        <div className="p-2 border-t border-[var(--border)]">
                            <h3 className="px-3 py-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-2">
                                <StickyNote size={12} /> Mémos
                            </h3>
                            {searchResults.memos.map(memo => (
                                <div key={memo.id} className="px-3 py-2 hover:bg-[var(--primary)] hover:bg-opacity-10 hover:text-[var(--primary)] rounded-lg cursor-pointer transition-colors text-sm truncate" onClick={() => handleResultClick('/memos')}>
                                    {memo.content.substring(0, 50)}...
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
};

export default GlobalSearch;

import React, { useMemo, useEffect, useState } from 'react';
import { Edit, Trash2, Inbox, Clock, Zap, RefreshCw } from 'lucide-react';
import EmptyState from './EmptyState';
import FlipCard from './FlipCard';
import { useAuth } from '../context/AuthContext';
import { db } from '../db';

const CardGrid = ({ filteredCards, setEditingCard, deleteCardWithSync, subjects }) => {
  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
  const { session } = useAuth();
  const [progressMap, setProgressMap] = useState(new Map());

  useEffect(() => {
    const fetchProgress = async () => {
      if (!session?.user?.id) return;
      const allProgress = await db.user_card_progress.where('userId').equals(session.user.id).toArray();
      const map = new Map(allProgress.map(p => [p.cardId, p]));
      setProgressMap(map);
    };
    fetchProgress();
  }, [session, filteredCards]);

  if (!filteredCards || filteredCards.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucune flashcard trouvée"
        message="Commencez par ajouter une nouvelle carte ou ajustez vos filtres."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredCards.map((card) => {
        const progress = progressMap.get(card.id);
        const nextReviewDate = progress?.dueDate ? new Date(progress.dueDate) : null;
        const easeFactor = progress?.easeFactor || 2.5;
        const subjectName = subjectMap.get(card.subject_id) || 'N/A';

        // --- FRONT FACE CONTENT ---
        const FrontContent = (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-lg relative overflow-hidden group hover:border-[var(--primary)] transition-colors">

            {/* Decorative Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--primary)] opacity-5 blur-[50px] rounded-full pointer-events-none group-hover:opacity-10 transition-opacity" />

            <div className="flex justify-between items-start z-10">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[rgba(99,102,241,0.1)] text-[var(--primary)] border border-[rgba(99,102,241,0.2)]">
                {subjectName}
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center text-center my-4 z-10">
              <h3 className="text-xl font-bold text-[var(--text-main)] line-clamp-4">
                {card.question}
              </h3>
            </div>

            <div className="flex justify-center z-10 opacity-50 text-xs text-[var(--text-muted)] flex items-center gap-1">
               <RefreshCw size={12} />
               <span>Cliquer pour retourner</span>
            </div>
          </div>
        );

        // --- BACK FACE CONTENT ---
        const BackContent = (
          <div className="w-full h-full p-6 flex flex-col justify-between bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-2xl shadow-xl relative overflow-hidden">

            {/* Back Glow */}
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[var(--color-review)] opacity-5 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex-1 flex items-center justify-center text-center my-4 z-10 overflow-y-auto custom-scrollbar">
              <p className="text-base text-[var(--text-muted)] whitespace-pre-wrap leading-relaxed">
                {card.answer}
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between z-10">
               <div className="flex gap-3">
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]" title="Prochaine révision">
                    <Clock size={12} />
                    <span>{nextReviewDate ? nextReviewDate.toLocaleDateString('fr-FR') : 'Jamais'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--text-muted)]" title="Facilité">
                    <Zap size={12} className="text-yellow-500" />
                    <span>{Math.round(easeFactor * 100)}%</span>
                  </div>
               </div>

               <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteCardWithSync(card.id); }}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
            </div>
          </div>
        );

        return (
          <FlipCard
            key={card.id}
            className="h-[320px] w-full cursor-pointer" // Define Fixed Height
            frontContent={FrontContent}
            backContent={BackContent}
          />
        );
      })}
    </div>
  );
};

export default CardGrid;

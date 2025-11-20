import React, { useMemo, useEffect, useState } from 'react';
import { Edit, Trash2, Check, X, Inbox, ArrowDown, ArrowUp, Clock, Zap } from 'lucide-react';
import EmptyState from './EmptyState';
import { useAuth } from '../context/AuthContext';
import { db } from '../db';
import { motion } from 'framer-motion';

const CardTable = ({
  filteredCards,
  editingCard,
  setEditingCard,
  updateCardWithSync,
  deleteCardWithSync,
  subjects
}) => {
  const subjectMap = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
  const { session } = useAuth();
  const [progressMap, setProgressMap] = useState(new Map());
  const [sortConfig, setSortConfig] = useState(null);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!session?.user?.id) return;
      const allProgress = await db.user_card_progress.where('userId').equals(session.user.id).toArray();
      const map = new Map(allProgress.map(p => [p.cardId, p]));
      setProgressMap(map);
    };
    fetchProgress();
  }, [session, filteredCards]);

  const sortedCards = useMemo(() => {
    if (!sortConfig) return filteredCards;

    let sortableItems = [...filteredCards];
    sortableItems.sort((a, b) => {
        const getSortValue = (item, key) => {
          if (key === 'subject') return subjectMap.get(item.subject_id) || '';
          if (key === 'nextReview') {
            const progress = progressMap.get(item.id);
            return progress?.dueDate ? new Date(progress.dueDate) : new Date(0);
          }
          if (key === 'easeFactor') {
            const progress = progressMap.get(item.id);
            return progress?.easeFactor || 2.5;
          }
          return item[key] || '';
        };

        const aValue = getSortValue(a, sortConfig.key);
        const bValue = getSortValue(b, sortConfig.key);

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    return sortableItems;
  }, [filteredCards, sortConfig, subjectMap, progressMap]);

  const requestSort = (key) => {
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      setSortConfig({ key, direction: 'descending' });
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      setSortConfig(null);
    } else {
      setSortConfig({ key, direction: 'ascending' });
    }
  };

  const getSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUp size={14} className="text-[var(--primary)]" /> : <ArrowDown size={14} className="text-[var(--primary)]" />;
  };

  if (filteredCards.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Aucune carte à afficher"
        message="Ajoutez de nouvelles cartes ou modifiez vos filtres de recherche."
      />
    );
  }

  const renderHeader = (label, key) => (
    <th onClick={() => requestSort(key)} className="cursor-pointer hover:text-[var(--primary)] transition-colors select-none">
      <div className="flex items-center gap-2">
        {label}
        {getSortIcon(key)}
      </div>
    </th>
  );

  return (
    <div className="w-full overflow-x-auto pb-4">
      <table className="modern-table">
        <thead className="modern-header">
          <tr>
            {renderHeader('Question', 'question')}
            {renderHeader('Réponse', 'answer')}
            {renderHeader('Matière', 'subject')}
            {renderHeader('Prochaine', 'nextReview')}
            {renderHeader('Facilité', 'easeFactor')}
            <th className="text-right pr-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedCards.map((card, index) => {
            const progress = progressMap.get(card.id);
            const nextReviewDate = progress?.dueDate ? new Date(progress.dueDate) : null;
            const easeFactor = progress?.easeFactor || 2.5;
            const isEditing = editingCard?.id === card.id;

            return (
              <motion.tr
                key={card.id}
                className="modern-row group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Question */}
                <td className="modern-cell font-medium text-[var(--text-main)]">
                  {isEditing ? (
                    <input
                      value={editingCard.question}
                      onChange={(e) => setEditingCard({ ...editingCard, question: e.target.value })}
                      className="glass-input w-full rounded px-2 py-1"
                      autoFocus
                    />
                  ) : (
                    <div className="line-clamp-1 max-w-[200px] xl:max-w-[300px]" title={card.question}>
                        {card.question}
                    </div>
                  )}
                </td>

                {/* Answer */}
                <td className="modern-cell text-[var(--text-muted)]">
                  {isEditing ? (
                    <input
                      value={editingCard.answer}
                      onChange={(e) => setEditingCard({ ...editingCard, answer: e.target.value })}
                      className="glass-input w-full rounded px-2 py-1"
                    />
                  ) : (
                    <div className="line-clamp-1 max-w-[200px] xl:max-w-[300px]" title={card.answer}>
                        {card.answer}
                    </div>
                  )}
                </td>

                {/* Subject */}
                <td className="modern-cell">
                  {isEditing ? (
                    <select
                      value={editingCard.subject_id}
                      onChange={(e) => setEditingCard({ ...editingCard, subject_id: e.target.value })}
                      className="glass-input rounded px-2 py-1 w-full"
                    >
                      {(subjects || []).map(s => (
                        <option key={s.id} value={s.id} className="bg-[var(--bg-card)]">{s.name}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[var(--text-muted)]">
                      {subjectMap.get(card.subject_id) || 'N/A'}
                    </span>
                  )}
                </td>

                {/* Next Review */}
                <td className="modern-cell">
                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                     <Clock size={14} className="opacity-50" />
                     {nextReviewDate
                        ? new Date(nextReviewDate).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                  </div>
                </td>

                {/* Ease Factor */}
                <td className="modern-cell">
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${Math.min((easeFactor / 3) * 100, 100)}%` }}
                            />
                        </div>
                        <span className="text-xs text-[var(--text-muted)]">{Math.round(easeFactor * 100)}%</span>
                    </div>
                </td>

                {/* Actions */}
                <td className="modern-cell">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <>
                        <button onClick={() => updateCardWithSync(card.id, editingCard)} className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingCard(null)} className="p-1.5 rounded-lg bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 transition-colors">
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => setEditingCard(card)} className="p-1.5 rounded-lg hover:bg-[var(--primary)]/10 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => deleteCardWithSync(card.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--text-muted)] hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default CardTable;

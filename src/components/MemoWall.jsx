// src/components/MemoWall.jsx
import React, { useMemo, useState } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { Pin, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './MemoWall.module.css';

const MemoCard = ({ memo, onClick, onDelete, isPinned }) => {
  const [showActions, setShowActions] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`${styles.memoCard} memo-${memo.color}`}
    >
      {isPinned && <div className={styles.pinIcon}><Pin size={16} /></div>}

      <div className={styles.memoContent}>
        <p>{memo.content}</p>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className={styles.actions}
          >
            <button onClick={(e) => { e.stopPropagation(); onClick(); }} className={styles.actionButton}>
              <Edit3 size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer ce mémo ?')) onDelete(memo.id); }} className={`${styles.actionButton} ${styles.deleteButton}`}>
              <Trash2 size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const MemoWall = ({ onMemoSelect }) => {
  const { memos, deleteMemoWithSync } = useDataSync();

  const { pinnedMemos, unpinnedMemos } = useMemo(() => {
    if (!memos || memos.length === 0) return { pinnedMemos: [], unpinnedMemos: [] };
    const pinnedMemos = memos.filter(m => m.isPinned).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    const unpinnedMemos = memos.filter(m => !m.isPinned).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return { pinnedMemos, unpinnedMemos };
  }, [memos]);

  return (
    <div>
      {pinnedMemos.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <Pin size={18} className={styles.sectionIcon} />
            <h2>Épinglés ({pinnedMemos.length})</h2>
          </div>
          <div className={`${styles.memoWall} ${styles.pinnedWall}`}>
            <AnimatePresence>
              {pinnedMemos.map((memo) => <MemoCard key={memo.id} memo={memo} onClick={() => onMemoSelect(memo)} onDelete={deleteMemoWithSync} isPinned />)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {unpinnedMemos.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionHeader}>Tous les mémos ({unpinnedMemos.length})</h2>
          <div className={styles.memoWall}>
            <AnimatePresence>
              {unpinnedMemos.map((memo) => <MemoCard key={memo.id} memo={memo} onClick={() => onMemoSelect(memo)} onDelete={deleteMemoWithSync} isPinned={false} />)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {memos.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon"><Pin size={32} /></div>
          <h3>Aucun mémo</h3>
          <p>Créez votre premier mémo en cliquant sur le bouton +</p>
        </div>
      )}
    </div>
  );
};

export default MemoWall;

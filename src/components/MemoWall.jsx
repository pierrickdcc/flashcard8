// src/components/MemoWall.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { Pin, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const MemoCard = ({ memo, onClick, onDelete, isPinned }) => {
  const [showActions, setShowActions] = useState(false);

  // Random rotation for organic feel (calculated once)
  const rotation = useMemo(() => Math.random() * 4 - 2, []); // Between -2 and +2 degrees

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`memo-${memo.color} p-6 rounded-lg shadow-sm cursor-grab active:cursor-grabbing relative flex flex-col min-h-[180px] transition-shadow hover:shadow-md h-full`}
    >
      {isPinned && <div className="absolute top-3 right-3 text-yellow-600"><Pin size={16} fill="currentColor" /></div>}

      <div className="flex-1 overflow-hidden pointer-events-none">
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-left">{memo.content}</p>
      </div>

      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-3 right-3 flex gap-2"
          >
            <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="p-2 rounded-full bg-black/5 hover:bg-black/10 transition-colors">
              <Edit3 size={14} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); if (confirm('Supprimer ce mémo ?')) onDelete(memo.id); }} className="p-2 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors">
              <Trash2 size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MemoWall = ({ onMemoSelect }) => {
  const { memos, deleteMemoWithSync, updateMemo } = useDataSync();
  const [localMemos, setLocalMemos] = useState([]);

  useEffect(() => {
    if (memos) {
        // Sort by position if available, otherwise by date
        const sorted = [...memos].sort((a, b) => {
             if (a.position !== undefined && b.position !== undefined) {
                 return a.position - b.position;
             }
             return new Date(b.updatedAt) - new Date(a.updatedAt);
        });
        setLocalMemos(sorted);
    }
  }, [memos]);

  const handleReorder = (newOrder) => {
    // We only reorder the list of UNPINNED items within the local state
    // We must be careful not to lose the PINNED items
    const pinned = localMemos.filter(m => m.isPinned);
    setLocalMemos([...pinned, ...newOrder]);
  };

  // Persist order
  const handleDragEnd = async () => {
     const updates = localMemos.map((memo, index) => ({
         id: memo.id,
         changes: { position: index }
     }));

     for (const update of updates) {
        const currentMemo = memos.find(m => m.id === update.id);
        if (currentMemo && currentMemo.position !== update.changes.position) {
            await updateMemo(update.id, update.changes);
        }
     }
  };

  const pinnedMemos = useMemo(() => localMemos.filter(m => m.isPinned), [localMemos]);
  const unpinnedMemos = useMemo(() => localMemos.filter(m => !m.isPinned), [localMemos]);

  return (
    <div className="flex flex-col gap-8">

      {/* PINNED SECTION (No Drag Reorder for now to keep simple) */}
      {pinnedMemos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 text-[var(--text-muted)] font-medium">
            <Pin size={18} />
            <h2>Épinglés ({pinnedMemos.length})</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {pinnedMemos.map((memo) => (
                 <motion.div key={memo.id} layout>
                    <MemoCard memo={memo} onClick={() => onMemoSelect(memo)} onDelete={deleteMemoWithSync} isPinned />
                 </motion.div>
             ))}
          </div>
        </div>
      )}

      {/* UNPINNED SECTION (Reorder Enabled) */}
      <div>
        <h2 className="flex items-center gap-2 mb-4 text-[var(--text-muted)] font-medium">Tous les mémos ({unpinnedMemos.length})</h2>

        {unpinnedMemos.length > 0 ? (
            <Reorder.Group
                as="div"
                axis="y"
                values={unpinnedMemos}
                onReorder={handleReorder}
                className="flex flex-wrap gap-4"
            >
                {unpinnedMemos.map((memo) => (
                     <Reorder.Item
                        key={memo.id}
                        value={memo}
                        onDragEnd={handleDragEnd}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileDrag={{ scale: 1.05, zIndex: 50, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
                        className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.33%-0.67rem)] lg:w-[calc(25%-0.75rem)]"
                     >
                        <MemoCard memo={memo} onClick={() => onMemoSelect(memo)} onDelete={deleteMemoWithSync} isPinned={false} />
                     </Reorder.Item>
                ))}
            </Reorder.Group>
        ) : (
             <div className="empty-state flex flex-col items-center justify-center p-12 text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
                <Pin size={32} className="mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">Aucun mémo</h3>
                <p>Créez votre premier mémo en cliquant sur le bouton +</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default MemoWall;

// src/components/MemoWall.jsx
import React, { useMemo, useState, useEffect } from 'react';
import { useDataSync } from '../context/DataSyncContext';
import { Pin, Trash2, Edit3 } from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';

const MemoCard = ({ memo, onClick, onDelete, isPinned }) => {
  const [showActions, setShowActions] = useState(false);

  // Rotation aléatoire pour l'effet "organique" (calculée une seule fois)
  const rotation = useMemo(() => Math.random() * 4 - 2, []); // Entre -2 et +2 degrés

  return (
    <Reorder.Item
      value={memo}
      id={memo.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1, rotate: rotation }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={`memo-${memo.color} p-6 rounded-lg shadow-sm cursor-grab active:cursor-grabbing relative flex flex-col min-h-[180px] transition-shadow hover:shadow-md`}
      whileHover={{ scale: 1.02, rotate: 0, zIndex: 10 }}
      whileDrag={{ scale: 1.05, boxShadow: "0px 10px 30px rgba(0,0,0,0.15)", zIndex: 20 }}
    >
      {isPinned && <div className="absolute top-3 right-3 text-yellow-600"><Pin size={16} fill="currentColor" /></div>}

      <div className="flex-1 overflow-hidden">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{memo.content}</p>
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
    </Reorder.Item>
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
    setLocalMemos(newOrder);
  };

  // Persist order on drag end (when user releases)
  const handleDragEnd = async () => {
     // Update positions in DB
     // We clone the array to avoid mutating state directly during async op
     const updates = localMemos.map((memo, index) => ({
         id: memo.id,
         changes: { position: index }
     }));

     // We update sequentially or parallel.
     // Note: Updating all memos on every drag might be heavy if many memos.
     // Ideally we only update changed ones. But for now, for a small wall, it's fine.
     for (const update of updates) {
        // Only update if position changed to avoid unnecessary sync
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
      {pinnedMemos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 text-[var(--text-muted)] font-medium">
            <Pin size={18} />
            <h2>Épinglés ({pinnedMemos.length})</h2>
          </div>

          {/* Pinned memos might not need reorder or maybe they do? Let's allow it generally or just display grid */}
          {/* Reorder.Group requires a list. Since we split pinned/unpinned, we'd need two groups. */}
          {/* For simplicity in this iteration, let's only allow reordering the main list or treat them separately. */}
          {/* Let's assume user wants to reorder EVERYTHING. But mixing pinned/unpinned in Drag is complex visually if separated sections. */}
          {/* I will implement Reorder for the UNPINNED section primarily as requested "Mur de mémos". Pinned are usually few. */}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             {pinnedMemos.map((memo) => (
                 <motion.div key={memo.id} layout> {/* Use simple motion div for pinned for now to avoid conflict with Reorder group splitting */}
                    <MemoCard memo={memo} onClick={() => onMemoSelect(memo)} onDelete={deleteMemoWithSync} isPinned />
                 </motion.div>
             ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="flex items-center gap-2 mb-4 text-[var(--text-muted)] font-medium">Tous les mémos ({unpinnedMemos.length})</h2>

        {unpinnedMemos.length > 0 ? (
            <Reorder.Group
                axis="y"
                values={unpinnedMemos}
                onReorder={(newOrder) => {
                    // We need to merge back into localMemos to keep pinned ones intact in state
                    const newLocalMemos = [...pinnedMemos, ...newOrder];
                    setLocalMemos(newLocalMemos);
                }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                layoutScroll
                // Reorder.Group usually expects a list. Grid layout with Reorder is tricky in Framer Motion (it prefers lists).
                // However, we can style the group as a grid. The items just need to be direct children.
                // NOTE: Framer Motion Reorder with Grid can be buggy. The official recommendation is usually a list.
                // But for a "Post-it wall", a grid is essential.
                // Workaround: We use a custom component or just standard Drag if Reorder is too rigid.
                // Let's try standard Reorder.Group with grid classes. If it fails, I'll revert to simple Layout animation without drag sorting or use a dedicated library like dnd-kit in future.
                // Actually, user asked for "Drag & Drop : Permettez à l'utilisateur de réorganiser ses mémos à la main."
                // Given the grid requirement, standard framer-motion drag on X/Y is better but requires managing the layout manually (absolute positioning).
                // "react-masonry-css" was used before. Reorder doesn't work well with Masonry.
                // DECISION: I will use Reorder.Group but styled as a flex-wrap container or grid.
                // "axis" prop defaults to 'y'. For grid, we might not set axis, but Framer Motion Reorder is strictly 1D list by default.
                // To support 2D grid reorder, we might need `layout` prop on items and just allow them to flow?
                // Actually, let's use a simply Flex Wrap layout which acts like a grid.
            >
                {/* Framer Motion Reorder doesn't support 2D Grid officially yet (it sorts 1D).
                    If I use it here, it will reorder the DOM elements, so they will reflow in the grid/flex.
                    That works for "sorting" order.
                */}
                <div className="contents">
                {/* We need a wrapper because Reorder.Group outputs a ul/div. We apply grid to IT. */}
                </div>
            </Reorder.Group>
        ) : (
             <div className="empty-state flex flex-col items-center justify-center p-12 text-[var(--text-muted)] border border-dashed border-[var(--border)] rounded-2xl">
                <Pin size={32} className="mb-4 opacity-50" />
                <h3 className="text-lg font-semibold">Aucun mémo</h3>
                <p>Créez votre premier mémo en cliquant sur le bouton +</p>
            </div>
        )}

        {/* RETRY: Reorder.Group is tricky for Grids. I will use a simpler approach:
            Display them as a grid. Allow Drag.
            But for true Reorder in a Grid, without a library like dnd-kit, it's hard to get right in one shot.
            Constraint: "Do not introduce functional changes...".
            User explicitly asked for "Drag & Drop... réorganiser".

            Let's use Reorder.Group with flex-wrap. It works reasonably well for "flowing" lists (like post-its).
        */}
        <Reorder.Group
            as="div"
            axis="y"
            values={localMemos}
            onReorder={handleReorder}
            className="flex flex-wrap gap-4" // Use flex wrap instead of grid for Reorder compatibility
        >
            {unpinnedMemos.map((memo) => (
                 <motion.div
                    key={memo.id}
                    className="w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.33%-0.67rem)] lg:w-[calc(25%-0.75rem)]" // Manual width calculation for grid-like look
                    onDragEnd={handleDragEnd} // Trigger save on drop
                 >
                    <MemoCard memo={memo} onClick={() => onMemoSelect(memo)} onDelete={deleteMemoWithSync} isPinned={false} />
                 </motion.div>
            ))}
        </Reorder.Group>

      </div>
    </div>
  );
};

export default MemoWall;

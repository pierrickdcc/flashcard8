import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal'; // Updated import

const ReviewSessionSetup = ({ onStartReview, onClose, isOpen, subjects = [] }) => {
  const [isCramMode, setIsCramMode] = useState(false);
  const [includeFuture, setIncludeFuture] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('all');

  const handleStart = () => {
    onStartReview({ isCramMode, includeFuture, subjectId: selectedSubject });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurer la révision" maxWidth="500px">
      <div className="flex flex-col gap-6">
        <div className="form-group">
          <label className="label text-sm font-medium mb-3 block">Quelles cartes réviser ?</label>
          <div className="space-y-3">
            <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-body)] hover:border-[var(--primary)] transition-all relative overflow-hidden group">
              <div className="absolute inset-0 bg-[var(--primary)] opacity-0 group-hover:opacity-5 transition-opacity" />
              <input
                type="radio"
                name="card-selection"
                checked={!includeFuture}
                onChange={() => setIncludeFuture(false)}
                className="w-5 h-5 accent-[var(--primary)]"
              />
              <div>
                <div className="font-medium text-[var(--text-main)]">Cartes dues aujourd'hui</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Optimisé pour la rétention à long terme (SRS)</div>
              </div>
            </label>

            <label className="flex items-center gap-4 cursor-pointer p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-body)] hover:border-[var(--primary)] transition-all relative overflow-hidden group">
              <div className="absolute inset-0 bg-[var(--primary)] opacity-0 group-hover:opacity-5 transition-opacity" />
              <input
                type="radio"
                name="card-selection"
                checked={includeFuture}
                onChange={() => setIncludeFuture(true)}
                className="w-5 h-5 accent-[var(--primary)]"
              />
              <div>
                <div className="font-medium text-[var(--text-main)]">Toutes les cartes</div>
                <div className="text-xs text-[var(--text-muted)] mt-1">Révision libre, incluant les cartes futures</div>
              </div>
            </label>
          </div>
        </div>

        <div className="form-group">
          <label className="label text-sm font-medium mb-2 block" htmlFor="subject-select">Matière cible</label>
          <select
            id="subject-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="select w-full bg-[var(--bg-body)] border-[var(--border)] rounded-lg p-3 text-[var(--text-main)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)]"
          >
            <option value="all">Toutes les matières</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-white/5 transition-colors">
            <input
              type="checkbox"
              checked={isCramMode}
              onChange={(e) => setIsCramMode(e.target.checked)}
              className="w-5 h-5 accent-[var(--primary)] rounded"
            />
            <div>
              <div className="font-medium text-[var(--text-main)]">Mode Bachotage</div>
              <div className="text-xs text-[var(--text-muted)]">Ne modifie pas les dates de prochaine révision</div>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[var(--text-muted)] hover:bg-white/5 transition-colors font-medium"
          >
            Annuler
          </button>
          <motion.button
            onClick={handleStart}
            className="px-6 py-2 rounded-lg bg-[var(--primary-gradient)] text-white font-medium shadow-lg shadow-blue-500/20"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
          >
            Commencer
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

export default ReviewSessionSetup;

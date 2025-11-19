// src/components/ReviewMode.jsx
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { X, RotateCcw, CheckCircle, Home, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TextFit from '@ataverascrespo/react18-ts-textfit';
import styles from './ReviewMode.module.css';

const ReviewMode = () => {
  const { reviewCard, subjects } = useDataSync();
  const { setReviewMode, reviewCards } = useUIState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  // ... (LOGIQUE DE DONNÉES INTACTE) ...

  const handleCardClick = () => { if (!isFlipped) setIsFlipped(true); };

  const isFinished = currentIndex >= reviewCards.length;

  if (isFinished) {
    return (
      <div className={styles.reviewFinishedContainer}>
        {/* ... (JSX de l'écran de fin) ... */}
      </div>
    );
  }

  // ... (Logique de chargement) ...

  const progressPercentage = ((currentIndex + 1) / reviewCards.length) * 100;

  return (
    <div className={styles.reviewModeContainer}>
      <header className={styles.reviewHeader}>
        <Link to="/" className="logo"><BookOpen /><span className="logo-text">Flashcards Pro</span></Link>
        <div className={styles.progressContainer}>
          <div className="progress-bar"><motion.div className="progress-bar-inner" animate={{ width: `${progressPercentage}%` }} /></div>
          <p className={styles.progressText}>Carte {currentIndex + 1} sur {reviewCards.length}</p>
        </div>
        <div className="header-actions">
          {/* ... (Boutons d'action) ... */}
        </div>
      </header>

      <main className={styles.reviewMain} onClick={handleCardClick}>
        <div className={styles.cardScene}>
          <motion.div className={styles.cardFlipper} animate={{ rotateY: isFlipped ? 180 : 0 }}>
            <div className={`${styles.cardFace} ${styles.cardFaceFront}`}>
              <span className={styles.cardSubjectTag}>{subjectMap.get(currentCard.subject_id) || 'Sujet'}</span>
              <div className={styles.cardContentWrapper}>
                <TextFit mode="multi" className={styles.cardContentText}>{currentCard.question}</TextFit>
                {currentCard.question_image && <img src={currentCard.question_image} alt="Question" className={styles.cardImage}/>}
              </div>
              <div className="h-6"></div>
            </div>
            <div className={`${styles.cardFace} ${styles.cardFaceBack}`}>
              {/* ... (Contenu du dos de la carte) ... */}
            </div>
          </motion.div>
        </div>
      </main>

      <footer className={styles.reviewFooter}>
        {/* ... (Logique du footer) ... */}
      </footer>
    </div>
  );
};

export default ReviewMode;

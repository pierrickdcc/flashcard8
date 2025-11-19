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
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // 1. Création du subjectMap pour récupérer les noms des matières
  const subjectMap = useMemo(() => {
    return new Map((subjects || []).map(s => [s.id, s.name]));
  }, [subjects]);

  // 2. Récupération de la carte courante
  const currentCard = reviewCards[currentIndex];

  // Gestion de la fin de la session
  const isFinished = !currentCard || currentIndex >= reviewCards.length;

  const handleCardClick = () => {
    if (!isFlipped && !isFinished) {
      setIsFlipped(true);
    }
  };

  const handleRating = async (rating) => {
    if (!currentCard) return;

    // Sauvegarder le résultat via le contexte (SM-2 algorithm)
    await reviewCard(currentCard.id, rating);

    // Passer à la carte suivante
    setIsFlipped(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleQuit = () => {
    setReviewMode(false);
    navigate('/');
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Affichage de l'écran de fin
  if (isFinished) {
    return (
      <div className={styles.reviewFinishedContainer}>
        <div className="text-center max-w-md p-8">
          <div className="flex justify-center mb-6">
            <CheckCircle size={80} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-heading-color mb-4">Session terminée !</h2>
          <p className="text-text-muted mb-8">
            Vous avez révisé {reviewCards.length} carte{reviewCards.length > 1 ? 's' : ''}.
            Continuez comme ça pour maintenir vos connaissances !
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleQuit} className="btn btn-secondary">
              <Home size={18} />
              Accueil
            </button>
            <button onClick={handleRestart} className="btn btn-primary">
              <RotateCcw size={18} />
              Recommencer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = ((currentIndex) / reviewCards.length) * 100;

  return (
    <div className={styles.reviewModeContainer}>
      <header className={styles.reviewHeader}>
        <Link to="/" className="logo" onClick={handleQuit}>
          <BookOpen className="text-primary" />
          <span className="logo-text">Flashcards Pro</span>
        </Link>

        <div className={styles.progressContainer}>
          <div className="w-full bg-border h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary-gradient"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className={styles.progressText}>Carte {currentIndex + 1} sur {reviewCards.length}</p>
        </div>

        <div className="header-actions flex gap-2">
          <button onClick={handleRestart} className="icon-btn" title="Recommencer la session">
            <RotateCcw size={20} />
          </button>
          <button onClick={handleQuit} className="icon-btn" title="Quitter">
            <X size={24} />
          </button>
        </div>
      </header>

      <main className={styles.reviewMain} onClick={handleCardClick}>
        <div className={styles.cardScene}>
          <motion.div
            className={styles.cardFlipper}
            initial={false}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
          >
            {/* FACE AVANT (QUESTION) */}
            <div className={`${styles.cardFace} ${styles.cardFaceFront}`}>
              <span className={styles.cardSubjectTag}>
                {subjectMap.get(currentCard.subject_id) || 'Matière inconnue'}
              </span>

              <div className={styles.cardContentWrapper} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', alignItems: 'center' }}>
                <TextFit mode="multi" max={40} className={styles.cardContentText} style={{ width: '100%', textAlign: 'center', color: 'var(--text-heading-color)', fontWeight: 600 }}>
                  {currentCard.question}
                </TextFit>
                {currentCard.question_image && (
                  <img
                    src={currentCard.question_image}
                    alt="Question"
                    className={styles.cardImage}
                    style={{ marginTop: '1rem', maxHeight: '200px', objectFit: 'contain' }}
                  />
                )}
              </div>

              <div className="text-sm text-muted mt-4">Cliquez pour retourner</div>
            </div>

            {/* FACE ARRIÈRE (RÉPONSE) */}
            <div className={`${styles.cardFace} ${styles.cardFaceBack}`}>
              <span className={styles.cardSubjectTag}>
                {subjectMap.get(currentCard.subject_id) || 'Matière inconnue'}
              </span>

              <div className={styles.cardContentWrapper} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%', alignItems: 'center' }}>
                <TextFit mode="multi" max={30} className={styles.cardContentText} style={{ width: '100%', textAlign: 'center', color: 'var(--text-heading-color)' }}>
                  {currentCard.answer}
                </TextFit>
                {currentCard.answer_image && (
                  <img
                    src={currentCard.answer_image}
                    alt="Réponse"
                    className={styles.cardImage}
                    style={{ marginTop: '1rem', maxHeight: '200px', objectFit: 'contain' }}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className={styles.reviewFooter} style={{ padding: '2rem', background: 'var(--background-body)' }}>
        {!isFlipped ? (
          <div className="flex justify-center w-full">
            <button
              onClick={() => setIsFlipped(true)}
              className="btn btn-primary px-8 py-3 text-lg shadow-lg"
            >
              Retourner la carte
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:flex justify-center gap-3 w-full max-w-4xl mx-auto">
            <button onClick={() => handleRating(1)} className="btn bg-red-500 hover:bg-red-600 text-white flex-1 py-3 transition-transform hover:scale-105">
              À revoir
              <div className="text-xs opacity-75 font-normal">1 min</div>
            </button>
            <button onClick={() => handleRating(2)} className="btn bg-orange-500 hover:bg-orange-600 text-white flex-1 py-3 transition-transform hover:scale-105">
              Difficile
              <div className="text-xs opacity-75 font-normal">10 min</div>
            </button>
            <button onClick={() => handleRating(3)} className="btn bg-yellow-500 hover:bg-yellow-600 text-white flex-1 py-3 transition-transform hover:scale-105">
              Moyen
              <div className="text-xs opacity-75 font-normal">1 jour</div>
            </button>
            <button onClick={() => handleRating(4)} className="btn bg-blue-500 hover:bg-blue-600 text-white flex-1 py-3 transition-transform hover:scale-105">
              Facile
              <div className="text-xs opacity-75 font-normal">3 jours</div>
            </button>
            <button onClick={() => handleRating(5)} className="btn bg-green-500 hover:bg-green-600 text-white flex-1 py-3 transition-transform hover:scale-105 col-span-2 md:col-span-1">
              Très facile
              <div className="text-xs opacity-75 font-normal">7 jours</div>
            </button>
          </div>
        )}
      </footer>
    </div>
  );
};

export default ReviewMode;

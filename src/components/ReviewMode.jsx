import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { X, RotateCcw, CheckCircle, Home, BookOpen } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TextFit from '@ataverascrespo/react18-ts-textfit';
import styles from './ReviewMode.module.css';

// --- Composant Card3D (Physique Spring & Tilt) ---
const Card3D = ({ children, onSwipe, isFlipped, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]); // Fade out on swipe

  return (
    <motion.div
      style={{ x, y, rotateX, rotateY, z: 100, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7} // Plus élastique pour le "spring"
      onDragEnd={(event, info) => {
        const threshold = 100;
        if (info.offset.x > threshold) {
          onSwipe('right'); // Très Facile
        } else if (info.offset.x < -threshold) {
          onSwipe('left'); // À revoir
        } else if (info.offset.y < -threshold) {
          onSwipe('up'); // Facile / Moyen
        } else if (info.offset.y > threshold) {
          onSwipe('down'); // Difficile
        }
      }}
      whileHover={{ scale: 1.02, cursor: "grab" }}
      whileTap={{ scale: 0.95, cursor: "grabbing" }}
      className="perspective-1000 w-full max-w-2xl aspect-[4/3] mx-auto relative"
    >
        {children}
    </motion.div>
  );
};

const ReviewMode = () => {
  const { reviewCard, subjects } = useDataSync();
  const { setReviewMode, reviewCards } = useUIState();
  const navigate = useNavigate();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);

  const subjectMap = useMemo(() => {
    return new Map((subjects || []).map(s => [s.id, s.name]));
  }, [subjects]);

  const currentCard = reviewCards[currentIndex];
  const isFinished = !currentCard || currentIndex >= reviewCards.length;

  useEffect(() => {
    if (isFinished) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [isFinished]);

  const handleCardClick = () => {
    if (!isFlipped && !isFinished) {
      setIsFlipped(true);
    }
  };

  const handleRating = async (rating) => {
    if (!currentCard) return;
    await reviewCard(currentCard.id, rating);
    setIsFlipped(false);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipe = (direction) => {
    setSwipeDirection(direction);
    // Wait for animation to potentially finish or just trigger rating
    // Mapping directions to ratings
    // Left: À revoir (1)
    // Down: Difficile (2)
    // Up: Facile (4) (Merging Easy/Medium as per user request "Haut Facile/Moyen")
    // Right: Très Facile (5)

    // Note: In strict SM-2, 3 is Pass/Good. 4 is Easy.

    setTimeout(() => {
        switch (direction) {
            case 'left': handleRating(1); break;
            case 'down': handleRating(2); break;
            case 'up': handleRating(4); break;
            case 'right': handleRating(5); break;
            default: break;
        }
        setSwipeDirection(null);
    }, 200); // Small delay for visual feedback if needed
  };

  const handleQuit = () => {
    setReviewMode(false);
    navigate('/');
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  if (isFinished) {
    return (
      <div className={styles.reviewFinishedContainer}>
        <div className="text-center max-w-md p-8">
          <div className="flex justify-center mb-6">
            <CheckCircle size={80} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-[var(--text-main)] mb-4">Session terminée !</h2>
          <p className="text-[var(--text-muted)] mb-8">
            Vous avez révisé {reviewCards.length} carte{reviewCards.length > 1 ? 's' : ''}.
            Continuez comme ça pour maintenir vos connaissances !
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={handleQuit} className="btn bg-[var(--bg-card)] border border-[var(--border)] hover:bg-white/5 text-[var(--text-main)] px-6 py-2 rounded-lg flex items-center gap-2">
              <Home size={18} />
              Accueil
            </button>
            <button onClick={handleRestart} className="btn bg-[var(--primary)] hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center gap-2">
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
    <div className={`${styles.reviewModeContainer} bg-[var(--bg-body)]`}>
      <header className={`${styles.reviewHeader} flex justify-between items-center p-4`}>
        <Link to="/" className="flex items-center gap-2 text-[var(--text-main)] no-underline font-bold text-xl" onClick={handleQuit}>
          <BookOpen className="text-[var(--primary)]" />
          <span>Flash</span>
        </Link>

        <div className={`${styles.progressContainer} flex-1 mx-8 flex flex-col items-center`}>
          <div className="w-full max-w-md bg-[var(--border)] h-2 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[var(--primary-gradient)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">Carte {currentIndex + 1} sur {reviewCards.length}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={handleRestart} className="p-2 rounded-full hover:bg-white/10 text-[var(--text-main)]" title="Recommencer">
            <RotateCcw size={20} />
          </button>
          <button onClick={handleQuit} className="p-2 rounded-full hover:bg-white/10 text-[var(--text-main)]" title="Quitter">
            <X size={24} />
          </button>
        </div>
      </header>

      <main className={`${styles.reviewMain} flex-1 flex items-center justify-center p-4 overflow-hidden`}>
        <AnimatePresence mode="wait">
        {!isFinished && (
            <Card3D
                key={currentCard.id}
                onSwipe={handleSwipe}
                isFlipped={isFlipped}
                onClick={handleCardClick}
            >
             <motion.div
                className={styles.cardFlipper}
                onClick={handleCardClick}
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
              >
                {/* FACE AVANT (QUESTION) */}
                <div className={`${styles.cardFace} ${styles.cardFaceFront} bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] p-8 shadow-2xl flex flex-col items-center justify-between`}
                     style={{backfaceVisibility: 'hidden', position: 'absolute', width:'100%', height:'100%'}}>
                  <span className="px-3 py-1 rounded-full bg-[var(--border)] text-xs font-medium text-[var(--text-muted)]">
                    {subjectMap.get(currentCard.subject_id) || 'Matière inconnue'}
                  </span>

                  <div className="flex-1 flex flex-col justify-center w-full items-center my-4">
                    <TextFit mode="multi" max={40} className="w-full text-center font-semibold text-[var(--text-main)] text-xl md:text-2xl">
                      {currentCard.question}
                    </TextFit>
                    {currentCard.question_image && (
                      <img
                        src={currentCard.question_image}
                        alt="Question"
                        className="mt-4 rounded-lg max-h-[200px] object-contain border border-[var(--border)]"
                      />
                    )}
                  </div>

                  <div className="text-sm text-[var(--text-muted)]">Cliquez pour retourner</div>
                </div>

                {/* FACE ARRIÈRE (RÉPONSE) */}
                <div className={`${styles.cardFace} ${styles.cardFaceBack} bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] p-8 shadow-2xl flex flex-col items-center justify-between`}
                     style={{backfaceVisibility: 'hidden', position: 'absolute', width:'100%', height:'100%', transform: 'rotateY(180deg)'}}>
                  <span className="px-3 py-1 rounded-full bg-[var(--border)] text-xs font-medium text-[var(--text-muted)]">
                    {subjectMap.get(currentCard.subject_id) || 'Matière inconnue'}
                  </span>

                  <div className="flex-1 flex flex-col justify-center w-full items-center my-4">
                    <TextFit mode="multi" max={30} className="w-full text-center text-[var(--text-main)] text-lg md:text-xl">
                      {currentCard.answer}
                    </TextFit>
                    {currentCard.answer_image && (
                      <img
                        src={currentCard.answer_image}
                        alt="Réponse"
                        className="mt-4 rounded-lg max-h-[200px] object-contain border border-[var(--border)]"
                      />
                    )}
                  </div>
                   <div className="text-sm text-[var(--text-muted)] opacity-0">Spacer</div>
                </div>
              </motion.div>
            </Card3D>
        )}
        </AnimatePresence>
      </main>

      <footer className="p-8 pb-12 md:pb-8">
        {!isFlipped ? (
          <div className="flex justify-center w-full">
            <button
              onClick={() => setIsFlipped(true)}
              className="bg-[var(--primary-gradient)] text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-lg hover:translate-y-[-2px] transition-transform"
            >
              Retourner la carte
            </button>
          </div>
        ) : (
            <div className="flex flex-col gap-4 max-w-4xl mx-auto">
                 {/* Indicateurs Swipe Mobile (Visible uniquement si nécessaire, ici on garde les boutons Desktop/Mobile) */}
                 <div className="md:hidden text-center text-xs text-[var(--text-muted)] mb-2">
                    Swipe: ← À revoir | ↑ Facile | ↓ Difficile | → Très Facile
                 </div>

                <div className="grid grid-cols-2 md:flex justify-center gap-3 w-full">
                    <motion.button whileTap={{scale:0.95}} onClick={() => handleRating(1)} className="btn bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white flex-1 py-4 rounded-xl transition-colors flex flex-col items-center justify-center">
                    <span className="font-bold">À revoir</span>
                    <span className="text-xs opacity-75">1 min</span>
                    </motion.button>

                    <motion.button whileTap={{scale:0.95}} onClick={() => handleRating(2)} className="btn bg-orange-500/10 border border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-white flex-1 py-4 rounded-xl transition-colors flex flex-col items-center justify-center">
                    <span className="font-bold">Difficile</span>
                    <span className="text-xs opacity-75">10 min</span>
                    </motion.button>

                    <motion.button whileTap={{scale:0.95}} onClick={() => handleRating(3)} className="btn bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 hover:bg-yellow-500 hover:text-white flex-1 py-4 rounded-xl transition-colors flex flex-col items-center justify-center">
                    <span className="font-bold">Moyen</span>
                    <span className="text-xs opacity-75">1 jour</span>
                    </motion.button>

                    <motion.button whileTap={{scale:0.95}} onClick={() => handleRating(4)} className="btn bg-blue-500/10 border border-blue-500/50 text-blue-500 hover:bg-blue-500 hover:text-white flex-1 py-4 rounded-xl transition-colors flex flex-col items-center justify-center">
                    <span className="font-bold">Facile</span>
                    <span className="text-xs opacity-75">3 jours</span>
                    </motion.button>

                    <motion.button whileTap={{scale:0.95}} onClick={() => handleRating(5)} className="btn bg-green-500/10 border border-green-500/50 text-green-500 hover:bg-green-500 hover:text-white flex-1 py-4 rounded-xl transition-colors flex flex-col items-center justify-center col-span-2 md:col-span-1">
                    <span className="font-bold">Très facile</span>
                    <span className="text-xs opacity-75">7 jours</span>
                    </motion.button>
                </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default ReviewMode;

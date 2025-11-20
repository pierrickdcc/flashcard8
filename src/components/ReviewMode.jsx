import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion, useMotionValue, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { useDataSync } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { X, RotateCcw, CheckCircle, Home, BookOpen, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import TextFit from '@ataverascrespo/react18-ts-textfit';
import styles from './ReviewMode.module.css';

// --- Modernized Swipeable Card (Glassmorphism + Physics) ---
const SwipeableCard = ({ children, onSwipe, isFlipped, onClick }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(0, { stiffness: 300, damping: 30 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 30 });

  // Reduced tilt intensity
  const rotateX = useTransform([y, mouseY], (latest) => {
      const dragY = latest[0];
      const hoverY = latest[1];
      return (dragY / -20) + (hoverY / -50); // Subtle tilt
  });

  const rotateY = useTransform([x, mouseX], (latest) => {
      const dragX = latest[0];
      const hoverX = latest[1];
      return (dragX / 20) + (hoverX / 50);
  });

  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

  const handleMouseMove = (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
      mouseX.set(0);
      mouseY.set(0);
  };

  return (
    <motion.div
      style={{ x, y, rotateX, rotateY, z: 100, opacity }}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={(event, info) => {
        const threshold = 100;
        if (info.offset.x > threshold) onSwipe('right');
        else if (info.offset.x < -threshold) onSwipe('left');
        else if (info.offset.y < -threshold) onSwipe('up');
        else if (info.offset.y > threshold) onSwipe('down');
      }}
      whileHover={{ scale: 1.02, cursor: "grab" }}
      whileTap={{ scale: 0.98, cursor: "grabbing" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
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
      const timeout = setTimeout(() => {
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#6366F1', '#A855F7', '#D946EF', '#EC4899']
          });
      }, 300);
      return () => clearTimeout(timeout);
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
    setTimeout(() => {
        switch (direction) {
            case 'left': handleRating(1); break;
            case 'down': handleRating(2); break;
            case 'up': handleRating(4); break;
            case 'right': handleRating(5); break;
            default: break;
        }
        setSwipeDirection(null);
    }, 200);
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
      <div className="flex items-center justify-center h-full w-full bg-[var(--bg-body)] absolute inset-0 z-50">
        <div className="glass-panel p-12 rounded-3xl text-center max-w-lg mx-4 flex flex-col items-center">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-[var(--primary-gradient)] flex items-center justify-center shadow-lg shadow-indigo-500/50">
                <CheckCircle size={48} className="text-white" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-[var(--text-main)] mb-4 tracking-tight">Session terminée !</h2>
          <p className="text-[var(--text-muted)] mb-10 text-lg leading-relaxed">
            Vous avez brillamment révisé <strong className="text-[var(--primary)]">{reviewCards.length} cartes</strong>.
            <br/>Votre cerveau vous remercie.
          </p>
          <div className="flex gap-4 justify-center w-full">
            <button onClick={handleQuit} className="glass-button flex-1 px-6 py-4 rounded-xl flex items-center justify-center gap-2 text-[var(--text-main)] font-medium hover:bg-white/10">
              <Home size={20} />
              Accueil
            </button>
            <button onClick={handleRestart} className="flex-1 px-6 py-4 rounded-xl flex items-center justify-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium shadow-lg shadow-indigo-500/30 transition-all">
              <RotateCcw size={20} />
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
      {/* Header Modernized */}
      <header className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-6">
        <button onClick={handleQuit} className="glass-button p-3 rounded-full text-[var(--text-muted)] hover:text-white">
            <X size={24} />
        </button>

        <div className="flex-1 max-w-md mx-4">
            <div className="flex justify-between text-xs font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wider">
                <span>Progression</span>
                <span>{currentIndex + 1} / {reviewCards.length}</span>
            </div>
            <div className="w-full h-1.5 bg-[rgba(255,255,255,0.1)] rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-[var(--primary-gradient)] shadow-[0_0_10px_var(--primary)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>

        <button onClick={handleRestart} className="glass-button p-3 rounded-full text-[var(--text-muted)] hover:text-white">
             <RotateCcw size={20} />
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 relative w-full h-full">
        <AnimatePresence mode="wait">
        {!isFinished && (
            <SwipeableCard
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
                <div className="absolute w-full h-full backface-hidden bg-[var(--bg-card)] border border-[var(--border)] rounded-[32px] p-8 md:p-12 shadow-2xl flex flex-col items-center justify-between overflow-hidden">
                  {/* Decorative Background Elements */}
                  <div className="absolute top-0 left-0 w-full h-2 bg-[var(--primary-gradient)]" />
                  <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[var(--primary)] opacity-[0.05] blur-[80px] rounded-full pointer-events-none" />

                  <span className="px-4 py-1.5 rounded-full bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.2)] text-xs font-bold text-[var(--primary)] tracking-wide uppercase z-10">
                    {subjectMap.get(currentCard.subject_id) || 'Matière inconnue'}
                  </span>

                  <div className="flex-1 flex flex-col justify-center w-full items-center my-4 z-10">
                    <TextFit mode="multi" max={48} className="w-full text-center font-bold text-[var(--text-main)] leading-tight">
                      {currentCard.question}
                    </TextFit>
                    {currentCard.question_image && (
                      <img
                        src={currentCard.question_image}
                        alt="Question"
                        className="mt-6 rounded-2xl max-h-[240px] object-contain border border-[var(--border)] shadow-lg"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] opacity-60 z-10">
                      <RefreshCw size={14} />
                      <span>Cliquer pour retourner</span>
                  </div>
                </div>

                {/* FACE ARRIÈRE (RÉPONSE) */}
                <div className="absolute w-full h-full backface-hidden bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-[32px] p-8 md:p-12 shadow-2xl flex flex-col items-center justify-between overflow-hidden"
                     style={{ transform: 'rotateY(180deg)' }}>

                   <div className="absolute -top-20 -left-20 w-64 h-64 bg-[var(--color-review)] opacity-[0.05] blur-[80px] rounded-full pointer-events-none" />

                  <span className="px-4 py-1.5 rounded-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-xs font-bold text-[var(--text-muted)] tracking-wide uppercase z-10">
                    Réponse
                  </span>

                  <div className="flex-1 flex flex-col justify-center w-full items-center my-4 z-10 w-full">
                    <TextFit mode="multi" max={32} className="w-full text-center text-[var(--text-main)] font-medium leading-relaxed">
                      {currentCard.answer}
                    </TextFit>
                    {currentCard.answer_image && (
                      <img
                        src={currentCard.answer_image}
                        alt="Réponse"
                        className="mt-6 rounded-2xl max-h-[240px] object-contain border border-[var(--border)] shadow-lg"
                      />
                    )}
                  </div>
                   <div className="h-6"></div> {/* Spacer */}
                </div>
              </motion.div>
            </SwipeableCard>
        )}
        </AnimatePresence>
      </main>

      {/* Footer Controls */}
      <footer className="p-8 pb-12 md:pb-8 absolute bottom-0 left-0 right-0 z-40">
        {!isFlipped ? (
          <div className="flex justify-center w-full">
            <button
              onClick={() => setIsFlipped(true)}
              className="glass-button bg-[rgba(255,255,255,0.08)] backdrop-blur-md border border-[rgba(255,255,255,0.1)] text-white px-10 py-4 rounded-2xl text-lg font-semibold shadow-xl hover:bg-[rgba(255,255,255,0.15)] hover:scale-105 transition-all"
            >
              Voir la réponse
            </button>
          </div>
        ) : (
            <div className="flex flex-col gap-4 max-w-5xl mx-auto w-full">
                 <div className="md:hidden text-center text-[10px] text-[var(--text-muted)] mb-2 opacity-50 uppercase tracking-widest">
                    Swipe pour noter
                 </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full">
                    <motion.button whileTap={{scale:0.95}} onClick={() => handleRating(1)} className="glass-button bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white h-24 rounded-2xl flex flex-col items-center justify-center transition-all">
                        <span className="text-lg font-bold">À revoir</span>
                        <span className="text-xs opacity-60 mt-1">1 min</span>
                    </motion.button>

                    <motion.button whileTap={{scale:0.95}} onClick={() => handleRating(2)} className="glass-button bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500 hover:text-white h-24 rounded-2xl flex flex-col items-center justify-center transition-all">
                        <span className="text-lg font-bold">Difficile</span>
                        <span className="text-xs opacity-60 mt-1">10 min</span>
                    </motion.button>

                    <motion.button whileTap={{scale:0.95}} onClick={() => handleRating(3)} className="glass-button bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500 hover:text-white h-24 rounded-2xl flex flex-col items-center justify-center transition-all">
                        <span className="text-lg font-bold">Moyen</span>
                        <span className="text-xs opacity-60 mt-1">1 jour</span>
                    </motion.button>

                    <motion.button whileTap={{scale:0.95}} onClick={() => handleRating(4)} className="glass-button bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white h-24 rounded-2xl flex flex-col items-center justify-center transition-all">
                        <span className="text-lg font-bold">Facile</span>
                        <span className="text-xs opacity-60 mt-1">3 jours</span>
                    </motion.button>

                    <motion.button whileTap={{scale:0.95}} onClick={() => handleRating(5)} className="glass-button bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500 hover:text-white h-24 rounded-2xl flex flex-col items-center justify-center transition-all col-span-2 md:col-span-1">
                        <span className="text-lg font-bold">Très facile</span>
                        <span className="text-xs opacity-60 mt-1">7 jours</span>
                    </motion.button>
                </div>
          </div>
        )}
      </footer>
    </div>
  );
};

export default ReviewMode;

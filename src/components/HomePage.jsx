import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataSync as useData } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Layers, Library, CalendarCheck, PlayCircle, PlusSquare, FolderPlus } from 'lucide-react';
import CardFanLoader from './CardFanLoader';

// Composant DonutChart
const DonutChart = ({ data }) => {
    const COLORS = ['#F59E0B', '#10B981', '#3B82F6']; // Nouvelles, En cours, Acquises
    const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

    if (total === 0) {
         return (
            <div style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="w-[140px] h-[140px] rounded-full border-4 border-[var(--border)] flex items-center justify-center opacity-20"></div>
            </div>
         )
    }

    const v1 = data[0]?.value || 0; // Nouvelles
    const v2 = data[1]?.value || 0; // En cours

    return (
        <div style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
                className="donut relative shadow-2xl shadow-black/20"
                style={{
                    width: 140, height: 140, borderRadius: '50%',
                    background: `conic-gradient(
                        ${COLORS[0]} 0% ${v1}%,
                        ${COLORS[1]} ${v1}% ${v1 + v2}%,
                        ${COLORS[2]} ${v1 + v2}% 100%
                    )`,
                    display: 'grid', placeItems: 'center'
                }}
            >
                <div className="donut-hole absolute bg-[var(--bg-card)] rounded-full" style={{ width: 90, height: 90 }}></div>
            </div>
        </div>
    );
};


const HomePage = ({ isConfigured }) => {
  const { cards = [], memos = [], subjects = [], getCardsToReview } = useData();
  const { session } = useAuth();
  const { setShowAddContentModal, setMemoToEdit, setShowMemoModal, setShowReviewSetupModal, setShowAddSubjectModal } = useUIState();
  const [dueCardsCount, setDueCardsCount] = useState(0);
  const [userCardProgress, setUserCardProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (!session?.user?.id) return;
      try {
        const { db } = await import('../db');
        const [progress, dueCards] = await Promise.all([
          db.user_card_progress.where('userId').equals(session.user.id).toArray(),
          getCardsToReview(['all'], { includeFuture: false })
        ]);
        setUserCardProgress(progress);
        setDueCardsCount(dueCards.length);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [session, cards, getCardsToReview]);

  const { totalCards, totalSubjects, forecast, pinnedMemos, cardStatusData } = useMemo(() => {
    if (!cards || !memos || !userCardProgress) return { totalCards: 0, totalSubjects: 0, forecast: [], pinnedMemos: [], cardStatusData: [] };

    const progressMap = new Map(userCardProgress.map(p => [p.cardId, p]));

    const forecastData = Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      let count = 0;
      for (const card of cards) {
          const progress = progressMap.get(card.id);
          if (progress?.dueDate) {
              const reviewDate = new Date(progress.dueDate);
              reviewDate.setHours(0, 0, 0, 0);
              if (reviewDate.getTime() === date.getTime()) {
                  count++;
              }
          }
      }
      return { day: dayName, cartes: count };
    });

    const statusCounts = { 'Nouvelles': 0, 'En cours': 0, 'Acquises': 0 };
    cards.forEach(card => {
        const progress = progressMap.get(card.id);
        const status = progress?.status || 'new';
        if (status === 'new') statusCounts['Nouvelles']++;
        else if (status === 'learning' || status === 'relearning') statusCounts['En cours']++;
        else if (status === 'review') statusCounts['Acquises']++;
    });

    const total = cards.length || 1;
    const cardStatusData = [
        { name: 'Nouvelles', value: (statusCounts['Nouvelles'] / total) * 100 },
        { name: 'En cours', value: (statusCounts['En cours'] / total) * 100 },
        { name: 'Acquises', value: (statusCounts['Acquises'] / total) * 100 },
    ];

    const pinned = memos.filter(memo => memo.isPinned).slice(0, 3);

    return { totalCards: cards.length, totalSubjects: subjects?.length || 0, forecast: forecastData, pinnedMemos: pinned, cardStatusData };
  }, [cards, memos, subjects, userCardProgress]);

  const handleMemoClick = (memo) => { setMemoToEdit(memo); setShowMemoModal(true); };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><CardFanLoader /></div>;
  }

  // ==========================================================================
  // LAYOUT GLOBAL OPTIMISÉ (NON-SCROLLABLE DESKTOP)
  // Utilise les classes .dashboard-layout et .content-grid de NewStyles.css
  // ==========================================================================
  const pageVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4 }}
      className="dashboard-layout"
    >
      {/* 1. Bannière de statistiques (Fixed Height on Desktop) */}
      <div className="stats-banner">
        <div className="stat-item">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-[var(--color-flashcards)]">
             <Layers size="24" />
          </div>
          <div>
            <span className="text-[2rem] font-black block leading-none mb-1 text-[var(--text-main)]">{totalCards}</span>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Flashcards</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-[var(--color-subjects)]">
             <Library size="24" />
          </div>
          <div>
            <span className="text-[2rem] font-black block leading-none mb-1 text-[var(--text-main)]">{totalSubjects}</span>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Matières</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/10 flex items-center justify-center text-[var(--color-review)]">
             <CalendarCheck size="24" />
          </div>
          <div>
            <span className="text-[2rem] font-black block leading-none mb-1 text-[var(--text-main)]">{dueCardsCount}</span>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">À réviser</span>
          </div>
        </div>
      </div>

      {/* 2. Grille de contenu (Scrollable internally on Desktop if needed) */}
      <div className="content-grid">
        {/* Colonne Gauche (Principale) */}
        <div className="flex flex-col gap-6">
            {/* Hero Card */}
            <div className="hero-card relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                <h2 className="text-[1.7rem] font-extrabold mb-2 text-[var(--text-main)] relative z-10">Prêt à apprendre ?</h2>
                <p className="text-[var(--text-muted)] mb-8 text-lg relative z-10 max-w-md">Lancez votre session quotidienne pour maintenir votre série et ancrer vos connaissances.</p>

                <motion.button
                    onClick={() => setShowReviewSetupModal(true)}
                    className="btn-review relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-300"
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <PlayCircle size={22} fill="currentColor" className="text-white/90" />
                        Démarrer la session ({dueCardsCount})
                    </span>
                </motion.button>
            </div>

            {/* Chart Card */}
            <div className="glass-card rounded-[var(--radius)] p-6 flex flex-col flex-1 min-h-[250px]">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-[var(--text-main)] flex items-center gap-2">
                        <BarChart size={18} className="text-[var(--primary)]" />
                        Prévisions (7j)
                    </h3>
                </div>
                <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecast} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip
                        contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                        cursor={{fill: 'rgba(255, 255, 255, 0.03)'}}
                        />
                        <Bar dataKey="cartes" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} barSize={40} />
                        <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="var(--primary)" stopOpacity={1}/>
                                <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6}/>
                            </linearGradient>
                        </defs>
                    </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Colonne Droite (Secondaire) */}
        <div className="flex flex-col gap-6">
             {/* Quick Actions */}
            <div className="quick-actions-grid">
                <motion.button
                onClick={() => setShowAddContentModal(true)}
                className="action-card group"
                whileTap={{ scale: 0.98 }}
                >
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                        <PlusSquare size={24} />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-bold text-[var(--text-main)]">Nouvelle Carte</span>
                        <span className="text-[10px] text-[var(--text-muted)]">Ajouter du contenu</span>
                    </div>
                </motion.button>

                <motion.button
                onClick={() => setShowAddSubjectModal(true)}
                className="action-card group"
                whileTap={{ scale: 0.98 }}
                >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                        <FolderPlus size={24} />
                    </div>
                    <div className="flex flex-col items-start">
                        <span className="font-bold text-[var(--text-main)]">Nouvelle Matière</span>
                        <span className="text-[10px] text-[var(--text-muted)]">Organiser les cours</span>
                    </div>
                </motion.button>
            </div>

            {/* Donut Stats */}
            <div className="glass-card rounded-[var(--radius)] p-6 flex flex-col items-center justify-center flex-1">
                <h3 className="font-bold text-[var(--text-main)] mb-4 w-full text-left text-sm uppercase tracking-wide text-[var(--text-muted)]">Progression Globale</h3>
                <DonutChart data={cardStatusData} />
                <div className="w-full grid grid-cols-3 gap-2 mt-6 text-xs">
                    <div className="text-center">
                        <span className="block font-bold text-[1.2em] text-[#F59E0B]">{Math.round(cardStatusData[0].value)}%</span>
                        <span className="text-[var(--text-muted)]">New</span>
                    </div>
                    <div className="text-center border-l border-[var(--border)] border-r">
                        <span className="block font-bold text-[1.2em] text-[#10B981]">{Math.round(cardStatusData[1].value)}%</span>
                        <span className="text-[var(--text-muted)]">Learn</span>
                    </div>
                    <div className="text-center">
                        <span className="block font-bold text-[1.2em] text-[#3B82F6]">{Math.round(cardStatusData[2].value)}%</span>
                        <span className="text-[var(--text-muted)]">Done</span>
                    </div>
                </div>
            </div>
        </div>

        {/* Mémos (Full Width at bottom if present) */}
        {pinnedMemos.length > 0 && (
            <div className="col-span-1 lg:col-span-2 glass-card rounded-[var(--radius)] p-6">
                <h3 className="font-bold mb-4 text-[var(--text-main)] flex items-center gap-2">
                    <StickyNote size={18} className="text-[var(--primary)]" />
                    Mémos Épinglés
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pinnedMemos.map(memo => (
                        <motion.div
                          key={memo.id}
                          onClick={() => handleMemoClick(memo)}
                          className={`memo p-4 rounded-xl text-sm cursor-pointer leading-relaxed shadow-sm hover:shadow-md transition-all border border-white/10 relative overflow-hidden ${'memo-' + (memo.color || 'yellow')}`}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: memo.content }} className="line-clamp-3 pointer-events-none relative z-10" />
                        </motion.div>
                    ))}
                </div>
            </div>
        )}
      </div>

    </motion.div>
  );
};
import { BarChart as ReBarChart } from 'recharts'; // Just to ensure imports are correct if I missed something
export default HomePage;

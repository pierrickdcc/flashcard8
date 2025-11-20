import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataSync as useData } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Layers, Library, CalendarCheck, PlayCircle, PlusSquare, FolderPlus, Zap } from 'lucide-react';
import CardFanLoader from './CardFanLoader';

// Ce composant pourrait être déplacé dans son propre fichier si réutilisé
const DonutChart = ({ data }) => {
    const COLORS = ['#F59E0B', '#10B981', '#3B82F6']; // Nouvelles, En cours, Acquises
    // Clean data: if value is 0, it might mess up the gradient if all are 0.
    const total = data.reduce((acc, curr) => acc + (curr.value || 0), 0);

    // If no data, render empty gray circle
    if (total === 0) {
         return (
            <div style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="w-[140px] h-[140px] rounded-full border-4 border-[var(--border)] flex items-center justify-center"></div>
            </div>
         )
    }

    const v1 = data[0]?.value || 0; // Nouvelles
    const v2 = data[1]?.value || 0; // En cours

    return (
        <div style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
                className="donut"
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
                <div className="donut-hole" style={{ width: 90, height: 90, background: 'var(--bg-card)', borderRadius: '50%' }}></div>
            </div>
        </div>
    );
};


const HomePage = ({ isConfigured }) => {
  // ==========================================================================
  // LOGIQUE DE DONNÉES (PRÉSERVÉE)
  // ==========================================================================
  const { cards = [], memos = [], subjects = [], getCardsToReview } = useData();
  const { session } = useAuth();
  const { setShowAddContentModal, setMemoToEdit, setShowMemoModal, setShowReviewSetupModal, setShowAddSubjectModal } = useUIState();
  const navigate = useNavigate();
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
  // NOUVEAU JSX (STYLE MAQUETTE)
  // ==========================================================================
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="dashboard-layout p-4 md:p-10 flex flex-col gap-6 md:gap-10 pb-[120px] md:pb-10" // Padding bottom for mobile nav
    >
      {/* 1. Bannière de statistiques */}
      <div className="stats-banner grid grid-cols-1 md:grid-cols-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-[20px] md:rounded-[100px] p-0 md:py-6 md:px-0 items-stretch md:items-center">
        <div className="stat-item flex items-center justify-start md:justify-center gap-6 p-5 md:p-0 md:border-r md:border-[var(--border)] border-b md:border-b-0 border-[var(--border)]">
          <div className="flex items-center justify-center"><Layers size="28" style={{ color: 'var(--color-flashcards)' }} /></div>
          <div>
            <span className="text-[2.2rem] font-extrabold block leading-none mb-1 text-[var(--text-main)]">{totalCards}</span>
            <span className="text-[0.9rem] font-medium text-[var(--text-muted)]">Flashcards</span>
          </div>
        </div>
        <div className="stat-item flex items-center justify-start md:justify-center gap-6 p-5 md:p-0 md:border-r md:border-[var(--border)] border-b md:border-b-0 border-[var(--border)]">
          <div className="flex items-center justify-center"><Library size="28" style={{ color: 'var(--color-subjects)' }} /></div>
          <div>
            <span className="text-[2.2rem] font-extrabold block leading-none mb-1 text-[var(--text-main)]">{totalSubjects}</span>
            <span className="text-[0.9rem] font-medium text-[var(--text-muted)]">Matières</span>
          </div>
        </div>
        <div className="stat-item flex items-center justify-start md:justify-center gap-6 p-5 md:p-0">
          <div className="flex items-center justify-center"><CalendarCheck size="28" style={{ color: 'var(--color-review)' }} /></div>
          <div>
            <span className="text-[2.2rem] font-extrabold block leading-none mb-1 text-[var(--text-main)]">{dueCardsCount}</span>
            <span className="text-[0.9rem] font-medium text-[var(--text-muted)]">À réviser</span>
          </div>
        </div>
      </div>

      {/* 2. Section Actions */}
      <div className="actions-section grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="hero-card lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] p-8 flex flex-col justify-center items-start min-h-[200px]"
             style={{background: 'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.15), transparent 60%), var(--bg-card)'}}>
          <h2 className="text-[1.8rem] font-bold mb-2 text-[var(--text-main)]">Prêt à apprendre ?</h2>
          <p className="text-[var(--text-muted)] mb-8 text-[1.1rem]">Lancez votre session quotidienne pour maintenir votre série.</p>
          <motion.button
            onClick={() => setShowReviewSetupModal(true)}
            className="btn-review flex items-center gap-3 bg-[var(--primary-gradient)] text-white font-semibold py-4 px-12 rounded-[14px] shadow-lg transition-transform text-[1.1rem]"
            whileHover={{ translateY: -2 }}
            whileTap={{ scale: 0.95 }}
            style={{boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'}}
          >
            <PlayCircle size={22} />
            Démarrer ({dueCardsCount})
          </motion.button>
        </div>

        <div className="quick-actions-grid grid grid-cols-2 md:grid-cols-2 gap-4 overflow-x-auto pb-2 md:pb-0">
            <motion.button
              onClick={() => setShowAddContentModal(true)}
              className="action-card flex flex-col items-center justify-center gap-3 bg-[rgba(255,255,255,0.03)] border border-[var(--border)] rounded-[16px] p-6 cursor-pointer transition-all min-w-[140px]"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'var(--primary)', translateY: -2 }}
              whileTap={{ scale: 0.95 }}
            >
                <PlusSquare size={24} className="text-[var(--primary)]" />
                <span className="font-semibold text-center text-[var(--text-main)]">Carte</span>
            </motion.button>
            <motion.button
              onClick={() => setShowAddSubjectModal(true)}
              className="action-card flex flex-col items-center justify-center gap-3 bg-[rgba(255,255,255,0.03)] border border-[var(--border)] rounded-[16px] p-6 cursor-pointer transition-all min-w-[140px]"
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'var(--primary)', translateY: -2 }}
              whileTap={{ scale: 0.95 }}
            >
                <FolderPlus size={24} style={{color: 'var(--color-subjects)'}} />
                <span className="font-semibold text-center text-[var(--text-main)]">Matière</span>
            </motion.button>
        </div>
      </div>

      {/* 3. Section Données */}
      <div className="data-section grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="card lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] p-6 flex flex-col">
          <h3 className="font-semibold mb-6 text-[1.1rem] text-[var(--text-main)]">Prévisions (7j)</h3>
          <div style={{width: '100%', height: 200}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={forecast} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)' }}
                  cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}
                />
                <Bar dataKey="cartes" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={30} activeBar={{fill: '#60A5FA'}} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] p-6 flex flex-col">
          <h3 className="font-semibold mb-4 text-[1.1rem] text-[var(--text-main)]">Répartition</h3>
          <DonutChart data={cardStatusData} />
           <div style={{display:'flex', justifyContent:'space-between', marginTop:'1.5rem', fontSize:'0.8rem'}}>
              <span className="flex items-center gap-1 text-[var(--text-muted)]"><span className="text-[#F59E0B] text-lg">●</span> Nouvelles</span>
              <span className="flex items-center gap-1 text-[var(--text-muted)]"><span className="text-[#10B981] text-lg">●</span> En cours</span>
              <span className="flex items-center gap-1 text-[var(--text-muted)]"><span className="text-[#3B82F6] text-lg">●</span> Acquises</span>
           </div>
        </div>

        {pinnedMemos.length > 0 && (
            <div className="card lg:col-span-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-[16px] p-6 flex flex-col">
                <h3 className="font-semibold mb-4 text-[1.1rem] text-[var(--text-main)]">Mémos Épinglés</h3>
                <div className="memo-list grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pinnedMemos.map(memo => (
                        <motion.div
                          key={memo.id}
                          onClick={() => handleMemoClick(memo)}
                          className={`memo p-4 rounded-[10px] text-sm cursor-pointer leading-relaxed shadow-sm ${'memo-' + (memo.color || 'yellow')}`}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                            <div dangerouslySetInnerHTML={{ __html: memo.content }} className="line-clamp-3 pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        )}
      </div>

    </motion.div>
  );
};

export default HomePage;

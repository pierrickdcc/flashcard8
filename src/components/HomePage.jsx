import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataSync as useData } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Layers, Library, CalendarCheck, PlayCircle, PlusSquare, FolderPlus, Zap } from 'lucide-react';
import CardFanLoader from './CardFanLoader'; // Importer le nouveau loader

// Ce composant pourrait être déplacé dans son propre fichier si réutilisé
const DonutChart = ({ data }) => {
    const COLORS = ['#F59E0B', '#10B981', '#3B82F6']; // Nouvelles, En cours, Acquises
    return (
        <div style={{ width: '100%', height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div
                className="donut"
                style={{
                    width: 140, height: 140, borderRadius: '50%',
                    background: `conic-gradient(
                        ${COLORS[0]} 0% ${data[0]?.value || 0}%,
                        ${COLORS[1]} ${data[0]?.value || 0}% ${ (data[0]?.value || 0) + (data[1]?.value || 0)}%,
                        ${COLORS[2]} ${ (data[0]?.value || 0) + (data[1]?.value || 0)}% 100%
                    )`,
                    display: 'grid', placeItems: 'center'
                }}
            >
                <div className="donut-hole" style={{ width: 90, height: 90, background: 'var(--bg-card)', borderRadius: '50%' }}></div>
            </div>
        </div>
    );
};


const HomePage = () => {
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
        else if (status === 'learning') statusCounts['En cours']++;
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
    return <CardFanLoader />;
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
      className="dashboard-layout p-4 md:p-10 flex flex-col gap-6 md:gap-10"
    >
      {/* 1. Bannière de statistiques */}
      <div className="stats-banner grid grid-cols-1 md:grid-cols-3 bg-card border border-border rounded-2xl md:rounded-full p-4 md:py-6 md:px-0">
        <div className="stat-item flex items-center justify-center gap-6 p-4 md:p-0 md:border-r md:border-border">
          <Layers size="28" style={{ color: 'var(--color-flashcards)' }} />
          <div>
            <span className="text-3xl font-bold block">{totalCards}</span>
            <span className="text-sm text-muted">Flashcards</span>
          </div>
        </div>
        <div className="stat-item flex items-center justify-center gap-6 p-4 md:p-0 md:border-r md:border-border">
          <Library size="28" style={{ color: 'var(--color-subjects)' }} />
          <div>
            <span className="text-3xl font-bold block">{totalSubjects}</span>
            <span className="text-sm text-muted">Matières</span>
          </div>
        </div>
        <div className="stat-item flex items-center justify-center gap-6 p-4 md:p-0">
          <CalendarCheck size="28" style={{ color: 'var(--color-review)' }} />
          <div>
            <span className="text-3xl font-bold block">{dueCardsCount}</span>
            <span className="text-sm text-muted">À réviser</span>
          </div>
        </div>
      </div>

      {/* 2. Section Actions */}
      <div className="actions-section grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="hero-card lg:col-span-2 bg-card border border-border rounded-2xl p-8 flex flex-col justify-center items-start min-h-[200px]"
             style={{background: 'radial-gradient(circle at 100% 0%, rgba(59, 130, 246, 0.1), transparent 60%), var(--bg-card)'}}>
          <h2 className="text-2xl font-bold mb-2">Prêt à apprendre ?</h2>
          <p className="text-muted mb-6">Lancez votre session quotidienne pour maintenir votre série.</p>
          <motion.button
            onClick={() => setShowReviewSetupModal(true)}
            className="btn-review flex items-center gap-3 bg-primary-gradient text-white font-semibold py-3 px-8 rounded-xl shadow-lg transition-transform hover:scale-105"
            whileTap={{ scale: 0.95 }}
          >
            <PlayCircle size={22} />
            Démarrer ({dueCardsCount})
          </motion.button>
        </div>

        <div className="quick-actions-grid grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => setShowAddContentModal(true)}
              className="action-card flex flex-col items-center justify-center gap-2 bg-card border border-border rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/5 hover:border-primary hover:-translate-y-1"
              whileTap={{ scale: 0.95 }}
            >
                <PlusSquare size="24" className="text-primary" />
                <span className="font-semibold text-center text-sm">Carte</span>
            </motion.button>
            <motion.button
              onClick={() => setShowAddSubjectModal(true)}
              className="action-card flex flex-col items-center justify-center gap-2 bg-card border border-border rounded-2xl p-6 cursor-pointer transition-all hover:bg-white/5 hover:border-primary hover:-translate-y-1"
              whileTap={{ scale: 0.95 }}
            >
                <FolderPlus size="24" style={{color: 'var(--color-subjects)'}} />
                <span className="font-semibold text-center text-sm">Matière</span>
            </motion.button>
        </div>
      </div>

      {/* 3. Section Données */}
      <div className="data-section grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="card lg:col-span-2 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-6">Prévisions (7j)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={forecast} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-body)', border: '1px solid var(--border)', borderRadius: '12px' }} cursor={{fill: 'rgba(255, 255, 255, 0.05)'}} />
              <Bar dataKey="cartes" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Répartition</h3>
          <DonutChart data={cardStatusData} />
           <div style={{display:'flex', justifyContent:'space-around', marginTop:'1rem', fontSize:'0.8rem'}}>
              <span className="flex items-center gap-2 text-muted"><span className="w-2 h-2 rounded-full" style={{backgroundColor: '#F59E0B'}}></span>Nouvelles</span>
              <span className="flex items-center gap-2 text-muted"><span className="w-2 h-2 rounded-full" style={{backgroundColor: '#10B981'}}></span>En cours</span>
              <span className="flex items-center gap-2 text-muted"><span className="w-2 h-2 rounded-full" style={{backgroundColor: '#3B82F6'}}></span>Acquises</span>
           </div>
        </div>

        {pinnedMemos.length > 0 && (
            <div className="card lg:col-span-3 bg-card border border-border rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Mémos Épinglés</h3>
                <div className="memo-list grid grid-cols-1 md:grid-cols-3 gap-4">
                    {pinnedMemos.map(memo => (
                        <div key={memo.id} onClick={() => handleMemoClick(memo)} className={`memo p-4 rounded-lg text-sm cursor-pointer ${'memo-' + memo.color}`}>
                            <p className="line-clamp-4">{memo.content}</p>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>

    </motion.div>
  );
};

export default HomePage;

import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDataSync as useData } from '../context/DataSyncContext';
import { useUIState } from '../context/UIStateContext';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Brain, Pin, Plus, BookOpen, Layers, Library, FolderPlus } from 'lucide-react';

const HomePage = () => {
  // ==========================================================================
  // LOGIQUE DE DONNÉES (INTACTE)
  // ==========================================================================
  const { cards = [], memos = [], subjects = [], getCardsToReview } = useData();
  const { session } = useAuth();
  const { setShowAddContentModal, setMemoToEdit, setShowMemoModal, setShowReviewSetupModal } = useUIState();
  const navigate = useNavigate();
  const [dueCardsCount, setDueCardsCount] = useState(0);
  const [userCardProgress, setUserCardProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // MOVED USEMEMO HERE TO AVOID REFERENCE ERRORS
  const { totalCards, totalSubjects, forecast, pinnedMemos, cardStatusData } = useMemo(() => {
    if (!cards || !memos || !userCardProgress) return { totalCards: 0, totalSubjects: 0, forecast: [], pinnedMemos: [], cardStatusData: [] };
    const progressMap = new Map(userCardProgress.map(p => [p.cardId, p]));
    const forecastData = Array(7).fill(0).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const count = cards.reduce((acc, card) => {
        const progress = progressMap.get(card.id);
        if (!progress || !progress.dueDate) return acc;
        const reviewDate = new Date(progress.dueDate);
        reviewDate.setHours(0, 0, 0, 0);
        if (reviewDate.getTime() === date.getTime()) return acc + 1;
        return acc;
      }, 0);
      return { day: dayName, cartes: count };
    });
    const statusCounts = { 'Nouvelle': 0, 'En apprentissage': 0, 'Maîtrisée': 0 };
    cards.forEach(card => {
      const progress = progressMap.get(card.id);
      const status = progress?.status || 'Nouvelle';
      if (status === 'new' || status === 'Nouvelle') statusCounts['Nouvelle']++;
      else if (status === 'learning' || status === 'En apprentissage') statusCounts['En apprentissage']++;
      else if (status === 'review' || status === 'Maîtrisée') statusCounts['Maîtrisée']++;
      else statusCounts['Nouvelle']++;
    });
    const cardStatusData = Object.entries(statusCounts).filter(([_, value]) => value > 0).map(([name, value]) => ({ name, value }));
    const pinned = memos.filter(memo => memo.isPinned).slice(0, 8);
    return { totalCards: cards.length, totalSubjects: subjects?.length || 0, forecast: forecastData, pinnedMemos: pinned, cardStatusData };
  }, [cards, memos, subjects, userCardProgress]);

  useEffect(() => {
    const loadProgress = async () => {
      if (!session?.user?.id) return;
      try {
        const { db } = await import('../db');
        const progress = await db.user_card_progress.where('userId').equals(session.user.id).toArray();
        setUserCardProgress(progress);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur chargement progression:', error);
        setIsLoading(false);
      }
    };
    loadProgress();
  }, [session, cards]);

  useEffect(() => {
    const calculateDueCards = async () => {
      if (!cards || cards.length === 0) {
        setDueCardsCount(0);
        return;
      }
      try {
        const dueTodayCards = await getCardsToReview(['all'], { includeFuture: false });
        setDueCardsCount(dueTodayCards.length);
      } catch (error) {
        console.error('Erreur calcul cartes dues:', error);
        setDueCardsCount(0);
      }
    };
    calculateDueCards();
  }, [cards, getCardsToReview, userCardProgress]);

  const COLORS = ['#3B82F6', '#F59E0B', '#10B981'];

  const handleStartReview = () => setShowReviewSetupModal(true);
  const handleMemoClick = (memo) => { setMemoToEdit(memo); setShowMemoModal(true); };

  // ==========================================================================
  // NOUVEAU JSX (STYLE MAQUETTE)
  // ==========================================================================
  if (isLoading) {
    return <div className="main-content flex items-center justify-center"><div className="spinner" /></div>;
  }

  return (
    <div className="main-content">
      {/* Bannière de statistiques */}
      <div className="glass-card mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="stat-item">
            <span className="stat-label">Total des cartes</span>
            <span className="stat-value" style={{color: 'var(--stat-value-total)'}}>{totalCards}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">À réviser aujourd'hui</span>
            <span className="stat-value" style={{color: 'var(--stat-value-review)'}}>{dueCardsCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Matières</span>
            <span className="stat-value" style={{color: 'var(--stat-value-subjects)'}}>{totalSubjects}</span>
          </div>
        </div>
      </div>

      {/* Actions Rapides */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={handleStartReview} className="btn btn-primary text-base py-3">
              <Brain size={18} />
              <span>Réviser ({dueCardsCount})</span>
            </button>
            <button onClick={() => setShowAddContentModal(true)} className="btn btn-secondary text-base py-3">
              <Plus size={18} />
              <span>Ajouter du contenu</span>
            </button>
             <button onClick={() => navigate('/courses')} className="btn btn-secondary text-base py-3">
              <BookOpen size={18} />
              <span>Parcourir les cours</span>
            </button>
        </div>
      </div>

      {/* Grille du tableau de bord */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-heading-color mb-4">Prévisions de révision (7 jours)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={forecast} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
              <YAxis allowDecimals={false} stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: 'var(--background-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}/>
              <Bar dataKey="cartes" fill="var(--primary-color)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-heading-color mb-4">Répartition des cartes</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={cardStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {cardStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: 'var(--background-card)', border: '1px solid var(--border-color)', borderRadius: '12px' }}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Mémos Épinglés */}
      {pinnedMemos.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-heading-color mb-4 flex items-center gap-2">
            <Pin size={20} style={{ transform: 'rotate(45deg)' }} />
            Mémos Épinglés
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pinnedMemos.map(memo => (
              <div
                key={memo.id}
                className={`memo-card memo-${memo.color} p-4 rounded-lg cursor-pointer transition-transform hover:scale-105`}
                onClick={() => handleMemoClick(memo)}
              >
                <p className="text-sm line-clamp-6">{memo.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './context/AuthContext';
import { useDataSync } from './context/DataSyncContext';
import { useUIState } from './context/UIStateContext';

import Auth from './components/Auth';
import ReviewMode from './components/ReviewMode';
import ReviewSessionSetup from './components/ReviewSessionSetup';
import HomePage from './components/HomePage';
import CoursePage from './components/CoursePage';
import CourseViewer from './components/CourseViewer';
import FlashcardsPage from './components/FlashcardsPage';
import MainLayout from './components/MainLayout';
import MemoWallPage from './components/MemoWallPage'; 
import StatsPage from './components/StatsPage';
import CardFanLoader from './components/CardFanLoader';

const App = () => {
  const { session, isConfigured, loading: authLoading } = useAuth();
  const { startReview, isLoading: dataLoading } = useDataSync();
  const { reviewMode, reviewCards, selectedSubjects } = useUIState();
  const navigate = useNavigate();
  const location = useLocation();

  if (authLoading || dataLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-bg-body">
        <CardFanLoader />
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  const handleStartReview = async (options) => {
    const success = await startReview(selectedSubjects, options.isCramMode, options.includeFuture);
    if (success) {
      navigate('/'); 
    }
  };

  if (reviewMode && reviewCards.length > 0) {
    return <ReviewMode />;
  }

  return (
    <MainLayout>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={ <HomePage isConfigured={isConfigured} /> } />
          <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/courses" element={<CoursePage />} />
        <Route path="/courses/:courseId" element={<CourseViewer />} />
        
        <Route path="/memos" element={<MemoWallPage />} />
        <Route path="/stats" element={<StatsPage />} />
        
        <Route path="/review/setup" element={
          <ReviewSessionSetup
            onStartReview={handleStartReview}
            onClose={() => navigate('/')}
          />}
        />
        </Routes>
      </AnimatePresence>
    </MainLayout>
  );
};

export default App;
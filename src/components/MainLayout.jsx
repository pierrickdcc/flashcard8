import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import AppHeader from './AppHeader';
import { useUIState } from '../context/UIStateContext';
import { useAuth } from '../context/AuthContext';
import { useDataSync } from '../context/DataSyncContext';

// Import all modals
import ProfileModal from './ProfileModal';
import AddContentModal from './AddContentModal';
import AddSubjectModal from './AddSubjectModal';
import ConfigModal from './ConfigModal';
import DeleteSubjectModal from './DeleteSubjectModal';
import SignOutConfirmationModal from './SignOutConfirmationModal';
import MemoModal from './MemoModal';
import ReviewSessionSetup from './ReviewSessionSetup';

const MainLayout = ({ children }) => {
  const {
    showAddContentModal, setShowAddContentModal,
    cardToEdit, courseToEdit,
    showAddSubjectModal, setShowAddSubjectModal,
    showConfigModal, setShowConfigModal,
    showDeleteSubjectModal, setShowDeleteSubjectModal,
    showSignOutModal, setShowSignOutModal,
    showMemoModal, setShowMemoModal,
    memoToEdit, subjectToDelete,
    showReviewSetupModal, setShowReviewSetupModal,
  } = useUIState();

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { session } = useAuth();
  const { signOut, subjects, startReview } = useDataSync();

  const handleStartReview = async (options) => {
    const subjectFilter = options.subjectId === 'all' ? ['all'] : [options.subjectId];
    const success = await startReview(subjectFilter, options.isCramMode, options.includeFuture);
    if (success) {
      setShowReviewSetupModal(false);
    }
  };

  const location = useLocation();
  let fabOnClick = () => setShowAddContentModal(true);
  if (location.pathname === '/memos') {
    fabOnClick = () => setShowMemoModal(true);
  }

  return (
    <div className="flex h-screen bg-[var(--bg-body)] text-[var(--text-main)] overflow-hidden font-sans selection:bg-indigo-500/30">
      <Sidebar />
      
      <div className="flex-1 flex flex-col h-full relative min-w-0 transition-all duration-300">
        <AppHeader onProfileClick={() => setIsProfileModalOpen(true)} />

        {/* Main Content Area - Matches Dashboard Layout requirements */}
        <main className="flex-1 overflow-y-auto scroll-smooth relative">
          {children}
        </main>
      </div>

      <MobileNav
        onFabClick={fabOnClick}
        onProfileClick={() => setIsProfileModalOpen(true)}
      />
      
      {/* Modals */}
      <AddContentModal isOpen={showAddContentModal} onClose={() => setShowAddContentModal(false)} cardToEdit={cardToEdit} courseToEdit={courseToEdit} />
      <AddSubjectModal isOpen={showAddSubjectModal} onClose={() => setShowAddSubjectModal(false)} />
      <ConfigModal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)} />
      <DeleteSubjectModal isOpen={showDeleteSubjectModal} onClose={() => setShowDeleteSubjectModal(false)} subjectToDelete={subjectToDelete} />
      <SignOutConfirmationModal isOpen={showSignOutModal} onClose={() => setShowSignOutModal(false)} />
      <MemoModal isOpen={showMemoModal} onClose={() => setShowMemoModal(false)} memoToEdit={memoToEdit} />
      <ReviewSessionSetup isOpen={showReviewSetupModal} onClose={() => setShowReviewSetupModal(false)} onStartReview={handleStartReview} subjects={subjects} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} userEmail={session?.user?.email} onSignOut={signOut} />
    </div>
  );
};

export default MainLayout;

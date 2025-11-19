import React from 'react';
import { motion } from 'framer-motion';
import { useUIState } from '../context/UIStateContext';
import MemoWall from './MemoWall';

const MemoWallPage = () => {
  const { setMemoToEdit, setShowMemoModal } = useUIState();

  const handleMemoSelect = (memo) => {
    setMemoToEdit(memo);
    setShowMemoModal(true);
  };

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
      className="main-content p-8"
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mes Mémos</h1>
          <p className="text-muted-foreground">Votre mur de post-it personnel.</p>
        </div>
      </div>
      <MemoWall onMemoSelect={handleMemoSelect} />
    </motion.div>
  );
};

export default MemoWallPage;
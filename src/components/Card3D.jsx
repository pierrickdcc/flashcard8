import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

const Card3D = ({ children, className }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Inverser la rotation pour un effet naturel
  const rotateX = useTransform(y, [-150, 150], [10, -10]);
  const rotateY = useTransform(x, [-150, 150], [-10, 10]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculer la position du curseur par rapport au centre de la carte
    const mouseX = event.clientX - rect.left - width / 2;
    const mouseY = event.clientY - rect.top - height / 2;

    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    // Revenir à la position initiale
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      className={className}
      style={{
        perspective: '1000px', // Appliquer la perspective ici ou sur le parent
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d', // Important pour la 3D
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default Card3D;

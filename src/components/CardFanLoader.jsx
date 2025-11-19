import React from "react";
import { motion } from "framer-motion";

const cardVariants = {
  // État initial (cartes empilées)
  stacked: {
    x: 0,
    y: 0,
    rotate: 0,
    scale: 0.9,
    zIndex: 0,
    transition: {
      duration: 0.8,
      ease: "easeInOut"
    }
  },
  // État déployé (éventail)
  fanned: (i) => ({
    x: (i - 1) * 24, // Décalage horizontal : -24px, 0, +24px
    y: Math.abs(i - 1) * -8, // Légère courbe : la carte du milieu est plus haute
    rotate: (i - 1) * 12, // Rotation : -12deg, 0, +12deg
    scale: 1,
    zIndex: i, // Gestion de la profondeur
    transition: {
      duration: 0.8,
      ease: "easeInOut",
      delay: i * 0.1 // Léger décalage pour un effet "vague"
    }
  })
};

const CardFanLoader = () => {
  // On utilise des styles inline pour les couleurs spécifiques
  const colors = [
    "var(--color-flashcards)",   // Gauche
    "var(--color-subjects)", // Milieu
    "var(--primary)"  // Droite
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
      <div className="relative w-24 h-32">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="stacked"
            animate={["fanned", "stacked"]} // Boucle entre les deux états
            transition={{
              repeat: Infinity,
              repeatType: "reverse", // Aller-retour fluide
              duration: 1.6
            }}
            className="absolute inset-0 rounded-xl shadow-lg border border-white/10"
            style={{
              backgroundColor: colors[i],
              transformOrigin: "center bottom", // Le pivot de l'éventail est en bas
            }}
          >
            {/* Petit détail visuel sur la carte (optionnel) */}
            <div className="w-full h-full opacity-20 bg-gradient-to-br from-white to-transparent rounded-xl" />
          </motion.div>
        ))}
      </div>
      
      {/* Texte de chargement optionnel en dessous */}
      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
        className="absolute mt-40 text-sm font-medium text-muted"
      >
        Chargement...
      </motion.p>
    </div>
  );
};

export default CardFanLoader;

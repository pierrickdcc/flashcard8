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
  // Couleurs basées sur le thème (Tailwind config)
  const colors = [
    "bg-blue-500",  // Gauche
    "bg-indigo-500", // Milieu
    "bg-purple-500"  // Droite
  ];

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      {/* Conteneur de l'éventail */}
      <div className="relative w-16 h-24">
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
            className={`absolute inset-0 rounded-xl shadow-lg border border-white/10 ${colors[i]}`}
            style={{
              transformOrigin: "center bottom", // Le pivot de l'éventail est en bas
            }}
          >
            {/* Petit détail visuel sur la carte (optionnel) */}
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-white/30" />
          </motion.div>
        ))}
      </div>

      {/* Texte de chargement optionnel en dessous */}
      <motion.p
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.8 }}
        className="absolute mt-40 text-sm font-medium text-text-muted whitespace-nowrap"
      >
        Chargement...
      </motion.p>
    </div>
  );
};

export default CardFanLoader;

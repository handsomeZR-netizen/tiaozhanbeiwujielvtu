import React from 'react';
import { motion } from 'framer-motion';

export const NeonSphere: React.FC = () => {
  return (
    <div className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center pointer-events-none">
      {/* Central Abstract Form */}
      <motion.div 
        className="absolute w-24 h-24 bg-gradient-to-tr from-indigo-100 to-purple-50 rounded-full blur-xl opacity-80"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      
      {/* Core Seed */}
      <div className="absolute w-4 h-4 bg-indigo-600 rounded-full z-10 shadow-lg shadow-indigo-200" />

      {/* Ring 1 - Kinetic Fine Line */}
      <motion.div 
        className="absolute w-[60%] h-[60%] border border-slate-300/60 rounded-full"
        style={{ borderTopColor: 'transparent', borderBottomColor: 'transparent' }}
        animate={{ rotateX: 360, rotateY: 180, rotateZ: 45 }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      />
      
      {/* Ring 2 - Artistic Gradient Stroke */}
      <motion.div 
        className="absolute w-[80%] h-[80%] border-[1.5px] border-indigo-300/40 rounded-full"
        style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent' }}
        animate={{ rotateX: 180, rotateY: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Ring 3 - Dashed Tech Orbit */}
      <motion.div 
        className="absolute w-[110%] h-[110%] border border-slate-200 rounded-full border-dashed"
        animate={{ rotateZ: -360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating Particles */}
      <motion.div 
        className="absolute w-full h-full"
        animate={{ rotateZ: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-purple-500 rounded-full shadow-sm transform -translate-x-1/2 -translate-y-1.5" />
      </motion.div>

       <motion.div 
        className="absolute w-[90%] h-[90%]"
        animate={{ rotateZ: -360, rotateX: 45 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute bottom-0 right-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full transform translate-x-1/2 translate-y-1.5" />
      </motion.div>
    </div>
  );
};
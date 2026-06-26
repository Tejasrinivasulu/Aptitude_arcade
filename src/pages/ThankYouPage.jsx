import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';

const ThankYouPage = () => {
  // Generate random trajectories for the sparks so they explode outward organically
  const sparks = useMemo(() => {
    return Array.from({ length: 40 }).map(() => ({
      // Random target position anywhere on screen
      targetX: `${50 + (Math.random() - 0.5) * 150}%`,
      targetY: `${50 + (Math.random() - 0.5) * 150}%`,
      // Random fall distance after explosion
      fallY: `${(Math.random() * 20) + 10}%`,
      scale: Math.random() * 1.5 + 0.5,
      duration: Math.random() * 1.5 + 1.5,
    }));
  }, []);

  return (
    // The Screen Shake Wrapper
    <motion.div 
      animate={{ 
        x: [0, -20, 20, -15, 15, -10, 10, -5, 5, 0], 
        y: [0, 15, -15, 10, -10, 8, -8, 4, -4, 0] 
      }}
      transition={{ duration: 0.7, delay: 1.4 }} // Exact moment of impact
      className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-sans"
    >
      
      {/* 
        ========================================
        THE ASTEROID STRIKE ANIMATION
        ========================================
      */}

      {/* 1. The Falling Asteroid */}
      <motion.div
        initial={{ top: '-20%', left: '120%', opacity: 1, scale: 1 }}
        animate={{ 
          top: '50%', 
          left: '50%', 
          opacity: [1, 1, 0],
          scale: [1, 1, 0]
        }}
        transition={{ 
          duration: 1.5, 
          ease: 'easeIn',
          times: [0, 0.99, 1] 
        }}
        className="absolute z-50 w-0 h-0"
      >
        {/* The Rock */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-yellow-100 rounded-full shadow-[0_0_100px_50px_#f97316] z-10" />
        
        {/* Outer Tail */}
        <div 
          className="absolute top-1/2 left-1/2 w-[80vw] h-16 bg-gradient-to-r from-orange-400 via-red-600 to-transparent blur-xl opacity-90 origin-left"
          style={{ transform: 'translateY(-50%) rotate(-35deg)' }} 
        />
        
        {/* Inner Bright Tail */}
        <div 
          className="absolute top-1/2 left-1/2 w-[50vw] h-6 bg-gradient-to-r from-yellow-200 via-orange-500 to-transparent blur-md opacity-100 origin-left"
          style={{ transform: 'translateY(-50%) rotate(-35deg)' }} 
        />
      </motion.div>

      {/* 2. The Impact Flash & Shockwave */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 3, 5] }}
        transition={{ duration: 1.2, delay: 1.4, ease: 'easeOut' }}
        className="absolute top-1/2 left-1/2 w-[100vw] h-[100vw] rounded-full bg-white transform -translate-x-1/2 -translate-y-1/2 z-[60] pointer-events-none mix-blend-screen"
        style={{ background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(249,115,22,0.8) 20%, rgba(0,0,0,0) 70%)' }}
      />
      
      {/* Pure white screen flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1.2, delay: 1.4, ease: 'easeOut' }}
        className="fixed inset-0 bg-white z-[70] pointer-events-none"
      />

      {/* 3. The Scattered Sparks */}
      {sparks.map((spark, i) => (
        <motion.div
          key={i}
          initial={{ left: '50%', top: '50%', opacity: 0, scale: 0 }}
          animate={{ 
            left: spark.targetX, 
            top: `calc(${spark.targetY} + ${spark.fallY})`, // They shoot out, then fall down slightly
            opacity: [0, 1, 1, 0],
            scale: [0, spark.scale, spark.scale, 0]
          }}
          transition={{ 
            duration: spark.duration, 
            delay: 1.4, 
            ease: [0.1, 0.9, 0.2, 1] // Fast out, slow fall
          }}
          className="absolute w-2 h-2 rounded-full z-[65]"
          style={{
            backgroundColor: i % 2 === 0 ? '#f97316' : '#fef08a',
            boxShadow: i % 2 === 0 ? '0 0 15px 4px #ea580c' : '0 0 15px 4px #ca8a04'
          }}
        />
      ))}

      {/* 
        ========================================
        MAIN CONTENT (Revealed after flash)
        ========================================
      */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.8 }}
        className="relative z-10 max-w-4xl mx-auto w-full flex flex-col items-center p-6"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-orange-900/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="text-center space-y-6 mb-12 mt-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.2, type: 'spring', bounce: 0.5 }}
            className="flex items-center justify-center mb-6"
          >
            <span className="px-6 py-2 rounded-full bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-400/30 text-sm font-bold tracking-widest uppercase text-orange-400 flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] backdrop-blur-md">
              <PartyPopper className="w-5 h-5 text-orange-400" />
              It's a Wrap!
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 2.0 }}
            className="text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-orange-100 to-gray-500 tracking-tighter"
          >
            Thank You!
          </motion.h1>
          
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.4 }}
            className="text-2xl md:text-3xl text-orange-400 font-medium pb-4"
          >
            Thank you for your incredible participation.
          </motion.h2>
          
          <div className="space-y-6 text-gray-300 md:text-xl leading-relaxed max-w-3xl mx-auto font-light">
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.6 }}
            >
              We have successfully completed the <strong className="text-white font-medium">Aptitude Arcade</strong>, and with this, we have officially come to the end of the <span className="text-blue-400 font-semibold drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">Nexera 2k26</span> online summer events.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 2.8 }}
            >
              The energy, dedication, and analytical skills you brought to these challenges were truly inspiring. Thank you for making this event an unforgettable experience! We hope to see you again.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ThankYouPage;

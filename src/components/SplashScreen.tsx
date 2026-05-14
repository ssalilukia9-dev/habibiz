import { motion } from 'motion/react';
import { Compass } from 'lucide-react';

export default function SplashScreen() {
  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[999] bg-brand-depth flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Background Ambience */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-[50vw] h-[50vw] bg-brand-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[40vw] h-[40vw] bg-purple-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.23, 1, 0.32, 1],
            opacity: { duration: 0.8 }
          }}
          className="relative mb-8"
        >
          {/* Decorative Rings */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-brand-primary/20 rounded-full -m-4 md:-m-8"
          />
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-white/5 rounded-full -m-8 md:-m-16"
          />

          <div className="w-24 h-24 md:w-32 md:h-32 bg-brand-primary rounded-[2.5rem] flex items-center justify-center text-brand-depth shadow-2xl shadow-brand-primary/20 relative overflow-hidden group">
            <Compass size={48} className="md:size-64 opacity-10 absolute -right-4 -bottom-4 rotate-12" />
            <Compass size={40} className="md:size-56 relative z-10" />
            
            {/* Shimmer Effect */}
            <motion.div 
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
            />
          </div>
        </motion.div>

        {/* Text Branding */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic mb-2">
            Sanctuary
          </h1>
          <div className="flex items-center justify-center gap-3">
             <span className="h-px w-8 bg-brand-primary/30" />
             <p className="text-[10px] md:text-small font-black text-brand-primary uppercase tracking-[0.4em]">
               Digital Spiritual Haven
             </p>
             <span className="h-px w-8 bg-brand-primary/30" />
          </div>
        </motion.div>
      </div>

      {/* Loading Indicator */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 2.5, ease: "circIn" }}
        className="fixed bottom-0 left-0 right-0 h-1 bg-brand-primary origin-left"
      />
      
      <div className="fixed bottom-12 left-0 right-0 text-center">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Aligning with the Divine...
        </p>
      </div>
    </motion.div>
  );
}

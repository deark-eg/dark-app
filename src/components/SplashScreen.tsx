import { FC, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2400); // 2.4 seconds to allow smooth exit animations

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#163B63] overflow-hidden">
      {/* Background elegant radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,161,74,0.15)_0%,transparent_70%)]" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        {/* Glowing surrounding aura */}
        <div className="absolute -inset-4 bg-[#C9A14A]/10 rounded-full blur-xl animate-pulse duration-[3000ms]" />

        {/* Large Logo */}
        <Logo className="w-32 h-20 sm:w-40 sm:h-28" light withText={false} variant="splash" />

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-24 h-[2px] bg-[#C9A14A] my-6 rounded-full"
        />

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-sm sm:text-base text-gray-300 font-medium tracking-wide max-w-sm leading-relaxed font-arabic"
        >
          كل ما تحتاجه من عقارات وسكن وخدمات في مكان واحد
        </motion.p>
      </motion.div>

      {/* Decorative lower lines */}
      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-center text-[10px] text-gray-400 font-mono select-none">
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.2 }}>
          SYS-ONLINE // 2026
        </motion.span>
        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.2 }}>
          PREMIUM APARTMENTS
        </motion.span>
      </div>
    </div>
  );
};

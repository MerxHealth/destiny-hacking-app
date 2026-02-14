import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * SplashScreen - Native app-like loading screen shown on first app open.
 * Features:
 * - Animated logo with pulse effect
 * - Brand name with staggered letter animation
 * - Smooth fade-out transition
 * - Only shows once per session (sessionStorage)
 */
export function SplashScreen() {
  const [visible, setVisible] = useState(() => {
    // Only show splash once per browser session
    return !sessionStorage.getItem("splash_shown");
  });

  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem("splash_shown", "true");
    }, 2200);

    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {/* Animated glow ring */}
          <motion.div
            className="absolute w-48 h-48 rounded-full"
            style={{
              background: "radial-gradient(circle, oklch(0.78 0.18 160 / 20%) 0%, transparent 70%)",
            }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: [0, 0.8, 0.5] }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Merx X Logo */}
          <motion.div
            className="relative z-10 flex items-center justify-center w-28 h-28 rounded-full mb-6 overflow-hidden"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.1,
            }}
          >
            <motion.img
              src="https://files.manuscdn.com/user_upload_by_module/session_file/111904132/CLAYatWdmCtjixTW.jpeg"
              alt="Merx Logo"
              className="w-full h-full object-cover"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            />
          </motion.div>

          {/* App name with staggered animation */}
          <motion.div className="relative z-10 flex flex-col items-center gap-2">
            <motion.h1
              className="text-3xl font-bold tracking-tight text-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              Destiny Hacking
            </motion.h1>
            <motion.p
              className="text-sm text-muted-foreground tracking-widest uppercase"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              Master Your Free Will
            </motion.p>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            className="absolute bottom-24 w-32 h-0.5 bg-muted rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ delay: 0.9, duration: 1.2, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

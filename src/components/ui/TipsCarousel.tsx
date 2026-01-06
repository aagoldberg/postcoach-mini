'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TIPS = [
  "Questions in posts get 47% more replies on average.",
  "Replies are weighted 3x more than likes in your engagement score.",
  "Consistent posting themes help build a loyal audience.",
  "Asking for thoughts ('thoughts?') is a high-performing CTA.",
  "We analyze your last 100 posts to find your unique patterns.",
  "Recasts are a strong signal of endorsement from your network.",
  "Posts with media (images/video) often see higher dwell time.",
];

export function TipsCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, 4000); // Change tip every 4 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-12 relative flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-sm text-zinc-500 dark:text-zinc-400 text-center italic absolute w-full px-4"
        >
          &ldquo;{TIPS[index]}&rdquo;
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface HelpTipProps {
  message: string;
  title?: string;
}

export function HelpTip({ message, title }: HelpTipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={title ?? 'Ayuda'}
        aria-expanded={open}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-gema-accent/10 text-gema-accent border border-gema-accent/30 text-xs font-bold cursor-pointer hover:bg-gema-accent/20 transition-colors"
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-72 max-w-xs rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-xl dark:border-white/10 dark:bg-gema-surface-dark"
            role="tooltip"
          >
            {title && (
              <p className="mb-1 font-heading font-bold text-gema-primary dark:text-white">{title}</p>
            )}
            <p className="text-gema-primary/70 dark:text-white/60">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

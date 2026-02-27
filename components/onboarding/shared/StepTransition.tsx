"use client";

import { motion } from "framer-motion";

interface StepTransitionProps {
  stepKey: number;
  children: React.ReactNode;
}

export function StepTransition({ stepKey, children }: StepTransitionProps) {
  return (
    <motion.div
      key={stepKey}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

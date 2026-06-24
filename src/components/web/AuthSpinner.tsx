import { motion } from "framer-motion";

export function AuthSpinner() {
  return (
    <motion.svg
      animate={{ rotate: 360 }}
      height="16"
      transition={{ duration: 0.8, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
      viewBox="0 0 24 24"
      width="16"
    >
      <circle cx="12" cy="12" fill="none" opacity="0.2" r="8" stroke="#FFFFFF" strokeWidth="2" />
      <motion.circle
        cx="12"
        cy="12"
        fill="none"
        r="8"
        stroke="#FFFFFF"
        strokeDasharray="22 20"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </motion.svg>
  );
}

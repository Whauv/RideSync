import { motion } from "framer-motion";

import { tokens } from "@/design/tokens";

const ease = tokens.marketing.motion.sectionEase;

/** Renders a headline word-by-word with an on-mount upward stagger. */
export function splitHeadline(text: string) {
  return text.split(" ").map((word, index) => (
    <motion.span
      key={`${word}-${index}`}
      animate={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 14 }}
      style={{ display: "inline-block", marginRight: 10 }}
      transition={{ duration: 0.5, delay: 0.2 + index * 0.06, ease }}
    >
      {word}
    </motion.span>
  ));
}

/** Renders text word-by-word with an in-view upward stagger. */
export function staggerWords(text: string) {
  return text.split(" ").map((word, index) => (
    <motion.span
      key={`${word}-${index}`}
      initial={{ opacity: 0, y: 12 }}
      style={{ display: "inline-block", marginRight: 8 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {word}
    </motion.span>
  ));
}

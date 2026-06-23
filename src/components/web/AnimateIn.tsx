import type { CSSProperties, PropsWithChildren } from "react";
import { motion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "fade";

const offsetForDirection = (direction: Direction, distance: number) => {
  switch (direction) {
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "fade":
      return {};
    case "up":
    default:
      return { y: distance };
  }
};

export function AnimateIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 20,
  style
}: PropsWithChildren<{
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  style?: CSSProperties;
}>) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        ...offsetForDirection(direction, distance)
      }}
      style={style}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      viewport={{ once: true, margin: "-80px" }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0
      }}
    >
      {children}
    </motion.div>
  );
}

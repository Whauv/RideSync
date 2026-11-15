import type { CSSProperties, PropsWithChildren } from "react";
import { motion } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "fade" | "scale";

const ease = [0.16, 1, 0.3, 1] as const;

function initialOffset(direction: Direction, distance: number) {
  switch (direction) {
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    case "scale":
      return { scale: 0.98 };
    case "fade":
      return {};
    case "up":
    default:
      return { y: distance };
  }
}

export function AnimateIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.5,
  distance = 20,
  once = true,
  style
}: PropsWithChildren<{
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  style?: CSSProperties;
}>) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        ...initialOffset(direction, distance)
      }}
      style={style}
      transition={{ duration, delay, ease }}
      viewport={{ once, margin: "-80px" }}
      whileInView={{
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1
      }}
    >
      {children}
    </motion.div>
  );
}

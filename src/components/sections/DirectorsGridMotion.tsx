"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  DirectorCard,
  type DirectorCardData,
} from "@/components/sections/DirectorCard";

type DirectorsGridMotionProps = {
  directors: DirectorCardData[];
};

export function DirectorsGridMotion({ directors }: DirectorsGridMotionProps) {
  const reduced = useReducedMotion();

  return (
    <>
      {directors.map((director, i) => (
        <motion.div
          key={director.slug}
          className="w-director shrink-0 snap-start md:w-auto"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: i * 0.06,
            ease: [0.76, 0, 0.24, 1],
          }}
        >
          <DirectorCard director={director} />
        </motion.div>
      ))}
    </>
  );
}

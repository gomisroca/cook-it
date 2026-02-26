"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const words = [
  "Sushi 🍣",
  "Pasta 🍝",
  "Pizza 🍕",
  "Ramen 🍜",
  "Dessert 🍰",
  "Tacos 🌮",
];

export function Headline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const word = words[index];

  return (
    <h1 className="text-5xl md:text-6xl font-semibold tracking-tight text-center leading-tight">
      Craving some{" "}
      <span className="inline-block text-primary">
        <AnimatePresence mode="wait">
          <motion.span
            key={word}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.02,
                },
              },
              hidden: {},
            }}
            className="inline-block whitespace-nowrap"
          >
            {Array.from(word).map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, filter: "blur(8px)" },
                  visible: { opacity: 1, filter: "blur(0px)" },
                }}
                transition={{
                  duration: 0.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.span>
        </AnimatePresence>
      </span>
      ?
    </h1>
  );
}

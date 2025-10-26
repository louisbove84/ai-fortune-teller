import React from "react";
import { motion } from "framer-motion";
import { cn } from "./utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className, animate = true }) => {
  const Component = animate ? motion.div : "div";
  
  const animationProps = animate
    ? {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      }
    : {};

  return (
    <Component
      className={cn(
        "bg-mystic-900/80 backdrop-blur-lg rounded-2xl p-8 mystic-shadow",
        className
      )}
      {...animationProps}
    >
      {children}
    </Component>
  );
};

export default Card;


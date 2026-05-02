import React from "react";
import { motion } from "motion/react";

export const Sharingan: React.FC<{ size?: number; className?: string }> = ({ size = 24, className }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      initial={{ rotate: 0 }}
      animate={{ rotate: 360 }}
      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
    >
      {/* Outer Eye */}
      <circle cx="50" cy="50" r="45" fill="#cc0000" stroke="black" strokeWidth="2" />
      <circle cx="50" cy="50" r="15" fill="black" />
      
      {/* Tomoe 1 */}
      <g transform="rotate(0 50 50) translate(50 25)">
        <circle cx="0" cy="0" r="6" fill="black" />
        <path d="M 0,6 Q -10,6 -10,15" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
      </g>
      
      {/* Tomoe 2 */}
      <g transform="rotate(120 50 50) translate(50 25)">
        <circle cx="0" cy="0" r="6" fill="black" />
        <path d="M 0,6 Q -10,6 -10,15" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
      </g>
      
      {/* Tomoe 3 */}
      <g transform="rotate(240 50 50) translate(50 25)">
        <circle cx="0" cy="0" r="6" fill="black" />
        <path d="M 0,6 Q -10,6 -10,15" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" />
      </g>
    </motion.svg>
  );
};

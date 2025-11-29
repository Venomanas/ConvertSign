"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import clsx from "clsx";

type AnimatedButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
} & Omit<HTMLMotionProps<"button">, "children" | "className" | "disabled">;

const Animatedbutton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  disabled,
  ...rest
}) => {
  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 0 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed",
        className
      )}
      disabled={disabled}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default Animatedbutton;

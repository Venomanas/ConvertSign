"use client";

import React, { useCallback } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import clsx from "clsx";
import { useSound } from "@/hooks/useSound";

type AnimatedButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  /** Override the default 'click' sound with a specific sound, or pass null to suppress. */
  soundType?:
    | "click"
    | "select"
    | "deselect"
    | "tab"
    | "delete"
    | "save"
    | "toggle"
    | "upload"
    | "clear"
    | "expand"
    | "collapse"
    | null;
} & Omit<HTMLMotionProps<"button">, "children" | "className" | "disabled">;

const Animatedbutton: React.FC<AnimatedButtonProps> = ({
  children,
  className,
  disabled,
  soundType = "click",
  onClick,
  ...rest
}) => {
  const { play } = useSound();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!disabled && soundType !== null) {
        play(soundType ?? "click");
      }
      onClick?.(e);
    },
    [disabled, soundType, play, onClick],
  );

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.97, y: 0 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed",
        className,
      )}
      disabled={disabled}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </motion.button>
  );
};

export default Animatedbutton;

// GameLogButton.tsx
// A unified, on-brand button component for all major actions in the app.
import React from "react";
import clsx from "clsx";

interface GameLogButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  as?: "button" | "a";
  href?: string;
}

const base =
  "inline-flex items-center justify-center font-semibold rounded transition focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60 disabled:cursor-not-allowed";
const sizes = {
  sm: "px-3 py-1 text-sm",
  md: "px-5 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};
const variants = {
  primary:
    "bg-teal-500 hover:bg-teal-600 text-white border border-teal-500",
  secondary:
    "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700",
  danger:
    "bg-transparent border border-red-400 text-red-400 hover:bg-red-900 hover:text-white",
  outline:
    "bg-transparent border border-teal-400 text-teal-400 hover:bg-teal-900 hover:text-white",
};

export default function GameLogButton({
  variant = "primary",
  size = "md",
  as = "button",
  href,
  className = "",
  children,
  ...props
}: GameLogButtonProps) {
  const classes = clsx(base, sizes[size], variants[variant], className);
  if (as === "a" && href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

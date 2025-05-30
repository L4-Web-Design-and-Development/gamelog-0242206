import React from "react";

type GradientTextProps = {
  children: React.ReactNode;
  className?: string;
};

export default function GradientText({ children, className = "" }: GradientTextProps) {
  return (
    <span className="bg-gray-950 text-white">
      <span
        className={`bg-gradient-to-r from-blue-500 to-blue-300 bg-clip-text text-transparent ${className}`}
      >
        {children}
      </span>
    </span>
  );
}

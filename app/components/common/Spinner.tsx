import React from "react";

interface SpinnerProps {
  /** The size of the spinner */
  size?: "sm" | "md" | "lg" | "xl";
  /** If true, centers the spinner on the entire screen (useful for route guards) */
  fullScreen?: boolean;
  /** Optional hex or rgb color code. Defaults to a standard blue. */
  color?: string;
}

export default function Spinner({
  size = "md",
  fullScreen = false,
  color = "#3b82f6", // Default blue color
}: SpinnerProps) {
  const sizeMap = {
    sm: "16px",
    md: "32px",
    lg: "48px",
    xl: "64px",
  };

  const spinnerSvg = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={sizeMap[size]}
      height={sizeMap[size]}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: "spin 1s linear infinite" }}
    >
      <style>
        {`@keyframes spin { 
          0% { transform: rotate(0deg); } 
          100% { transform: rotate(360deg); } 
        }`}
      </style>
      {/* Creates a nice 3/4 circle spinner effect */}
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );

  if (fullScreen) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        {spinnerSvg}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      {spinnerSvg}
    </div>
  );
}
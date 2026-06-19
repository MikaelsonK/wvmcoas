"use client";

import React from "react";

interface PrintButtonProps {
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function PrintButton({ label = "🖨️ Print Report", className = "button-primary", style }: PrintButtonProps) {
  return (
    <button
      onClick={() => window.print()}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        ...style,
      }}
    >
      {label}
    </button>
  );
}

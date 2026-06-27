import { useEffect } from "react";

export function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2800);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    info: "#6366f1",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#f43f5e",
  };

  return (
    <div style={{
      position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
      zIndex: 1000, animation: "fadeInUp 0.3s ease",
    }}>
      <div style={{
        background: "rgba(17,17,24,0.95)",
        backdropFilter: "blur(20px)",
        border: `1px solid ${colors[type]}44`,
        borderRadius: 16,
        padding: "14px 24px",
        display: "flex", alignItems: "center", gap: 10,
        boxShadow: `0 8px 32px ${colors[type]}22`,
        minWidth: 200,
        justifyContent: "center",
      }}>
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: colors[type],
          boxShadow: `0 0 12px ${colors[type]}88`,
        }} />
        <span style={{ color: "#f0f0f5", fontSize: 14, fontWeight: 500 }}>{message}</span>
      </div>
    </div>
  );
}

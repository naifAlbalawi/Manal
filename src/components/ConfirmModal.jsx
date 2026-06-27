export function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText, confirmColor = "#f43f5e" }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, animation: "fadeIn 0.2s ease",
    }}>
      <div onClick={onCancel} style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
      }} />
      <div style={{
        position: "relative", zIndex: 1,
        background: "linear-gradient(145deg, #1a1a24, #111118)",
        borderRadius: 24,
        border: "1px solid rgba(255,255,255,0.08)",
        padding: 28,
        maxWidth: 340, width: "100%",
        boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
        animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#f0f0f5" }}>{title}</h3>
        <p style={{ margin: "0 0 24px", fontSize: 14, color: "#a0a0b0", lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "14px", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.1)",
            background: "transparent", color: "#a0a0b0",
            fontWeight: 600, fontSize: 14, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "14px", borderRadius: 14,
            border: "none", background: confirmColor,
            color: "#fff", fontWeight: 700, fontSize: 14,
            cursor: "pointer", boxShadow: `0 4px 20px ${confirmColor}44`,
          }}>{confirmText || "Confirm"}</button>
        </div>
      </div>
    </div>
  );
}

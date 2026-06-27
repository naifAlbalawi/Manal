import { useEffect, useRef } from "react";

export function BottomSheet({ open, onClose, title, children, maxHeight = "85vh" }) {
  const sheetRef = useRef(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${diff}px)`;
    }
  };

  const handleTouchEnd = () => {
    const diff = currentY.current - startY.current;
    if (diff > 100) {
      onClose();
    }
    if (sheetRef.current) {
      sheetRef.current.style.transform = "";
    }
  };

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 200,
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}>
      <div onClick={onClose} style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease",
      }} />
      <div ref={sheetRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          position: "relative", zIndex: 1,
          background: "linear-gradient(180deg, #151520 0%, #0a0a0f 100%)",
          borderRadius: "28px 28px 0 0",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          maxHeight, overflow: "auto",
          animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: "0 -20px 60px rgba(0,0,0,0.5)",
        }}>
        {/* Drag handle */}
        <div style={{
          display: "flex", justifyContent: "center", padding: "12px 0 4px",
        }}>
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: "rgba(255,255,255,0.15)",
          }} />
        </div>
        {title && (
          <div style={{
            padding: "12px 24px 16px",
            fontSize: 18, fontWeight: 700,
            color: "#f0f0f5",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}>
            {title}
          </div>
        )}
        <div style={{ padding: "16px 24px 32px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

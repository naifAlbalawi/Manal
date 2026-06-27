import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { t, isRTL } from "../../utils/i18n";

export default function AssetsPage() {
  const { state, addAsset, updateAsset, deleteAsset, showToast, currency } = useApp();
  const rtl = isRTL();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [type, setType] = useState("appliance");
  const [room, setRoom] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyUntil, setWarrantyUntil] = useState("");
  const [cost, setCost] = useState("");
  const [invoiceImage, setInvoiceImage] = useState(null);
  const [notes, setNotes] = useState("");

  const assets = state.assets?.items || [];

  const types = [
    { id: "appliance", label: t("appliance"), icon: "🔌" },
    { id: "furniture", label: t("furniture"), icon: "🪑" },
    { id: "plumbing", label: t("plumbing"), icon: "🚿" },
    { id: "electrical", label: t("electrical"), icon: "⚡" },
    { id: "hvac", label: t("hvac"), icon: "❄️" },
  ];

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setInvoiceImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) { showToast("Name required", "error"); return; }
    const item = {
      id: editing?.id || Date.now().toString(),
      name: name.trim(),
      type,
      room: room.trim(),
      purchaseDate,
      warrantyUntil,
      cost: parseFloat(cost) || 0,
      invoiceImage,
      notes,
      createdAt: editing?.createdAt || new Date().toISOString(),
      maintenanceHistory: editing?.maintenanceHistory || [],
    };
    if (editing) updateAsset(item);
    else addAsset(item);
    setSheetOpen(false);
    setEditing(null);
    resetForm();
    showToast(editing ? "Updated" : "Added", "success");
  };

  const resetForm = () => {
    setName(""); setType("appliance"); setRoom(""); setPurchaseDate("");
    setWarrantyUntil(""); setCost(""); setInvoiceImage(null); setNotes("");
  };

  const openEdit = (asset) => {
    setEditing(asset);
    setName(asset.name); setType(asset.type); setRoom(asset.room || "");
    setPurchaseDate(asset.purchaseDate || ""); setWarrantyUntil(asset.warrantyUntil || "");
    setCost(asset.cost?.toString() || ""); setInvoiceImage(asset.invoiceImage || null);
    setNotes(asset.notes || "");
    setSheetOpen(true);
  };

  const getTypeIcon = (typeId) => types.find(t => t.id === typeId)?.icon || "📦";
  const getTypeLabel = (typeId) => types.find(t => t.id === typeId)?.label || typeId;

  return (
    <div style={{ padding: "8px 0 100px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t("assets")}</h2>
        <div style={{ fontSize: 14, color: "#8b5cf6", fontWeight: 600 }}>
          {assets.length} {t("items")}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {assets.map((asset, i) => {
          const daysLeft = asset.warrantyUntil ? daysBetween(new Date(), asset.warrantyUntil) : null;
          const isExpired = daysLeft !== null && daysLeft <= 0;
          return (
            <div key={asset.id} onClick={() => openEdit(asset)} style={{
              padding: 16, borderRadius: 18,
              background: "linear-gradient(145deg, rgba(26,26,36,0.6), rgba(17,17,24,0.8))",
              border: `1px solid ${isExpired ? "rgba(244,63,94,0.15)" : "rgba(255,255,255,0.04)"}`,
              display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: "rgba(139,92,246,0.1)",
                border: "1px solid rgba(139,92,246,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22,
              }}>{getTypeIcon(asset.type)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f5" }}>{asset.name}</div>
                <div style={{ fontSize: 12, color: "#606070", marginTop: 2 }}>
                  {getTypeLabel(asset.type)} · {asset.room || "—"} · {currency}{asset.cost || 0}
                </div>
                {asset.warrantyUntil && (
                  <div style={{ fontSize: 11, color: isExpired ? "#f43f5e" : "#10b981", marginTop: 2 }}>
                    {isExpired ? `Warranty expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days warranty left`}
                  </div>
                )}
              </div>
              {asset.invoiceImage && <span style={{ fontSize: 16 }}>📎</span>}
            </div>
          );
        })}
        {assets.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#505060" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
            <div>{t("noItems")}</div>
          </div>
        )}
      </div>

      <button onClick={() => { resetForm(); setEditing(null); setSheetOpen(true); }} style={{
        position: "fixed", bottom: "calc(90px + env(safe-area-inset-bottom))", right: 20,
        width: 56, height: 56, borderRadius: 18,
        background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
        color: "#fff", fontSize: 24, border: "none",
        boxShadow: "0 8px 32px rgba(139,92,246,0.4)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50,
      }}>+</button>

      {/* Sheet */}
      {sheetOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
        }}>
          <div onClick={() => setSheetOpen(false)} style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          }} />
          <div style={{
            position: "relative", zIndex: 1,
            background: "linear-gradient(180deg, #1a1a24, #0a0a0f)",
            borderRadius: "28px 28px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "24px 20px calc(40px + env(safe-area-inset-bottom))",
            animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            maxHeight: "85vh", overflow: "auto",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{editing ? t("edit") : t("newAsset")}</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("assetName")}</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={t("name")}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("assetType")}</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {types.map(t => (
                  <button key={t.id} onClick={() => setType(t.id)} style={{
                    padding: "10px 14px", borderRadius: 12,
                    background: type === t.id ? "rgba(139,92,246,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${type === t.id ? "#8b5cf6" : "rgba(255,255,255,0.06)"}`,
                    color: type === t.id ? "#8b5cf6" : "#a0a0b0",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>{t.icon} {t.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("room")}</label>
              <input value={room} onChange={e => setRoom(e.target.value)} placeholder="Living Room, Kitchen..."
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("cost")} ({currency})</label>
                <input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0"
                  style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("warrantyUntil")}</label>
                <input type="date" value={warrantyUntil} onChange={e => setWarrantyUntil(e.target.value)}
                  style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Invoice Upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("uploadAttachment")}</label>
              {invoiceImage ? (
                <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <img src={invoiceImage} alt="invoice" style={{ width: "100%", height: 120, objectFit: "cover" }} />
                  <button onClick={() => setInvoiceImage(null)} style={{
                    position: "absolute", top: 8, right: 8,
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(0,0,0,0.6)", color: "#fff",
                    border: "none", cursor: "pointer", fontSize: 14,
                  }}>✕</button>
                </div>
              ) : (
                <label style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: 20, borderRadius: 14,
                  border: "2px dashed rgba(139,92,246,0.3)",
                  background: "rgba(139,92,246,0.03)",
                  color: "#8b5cf6", cursor: "pointer",
                }}>
                  📷 {t("uploadAttachment")}
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files[0])} style={{ display: "none" }} />
                </label>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("notes")}</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Installation details, warranty info..."
                rows={3}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box", resize: "vertical" }} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {editing && (
                <button onClick={() => { deleteAsset(editing.id); setSheetOpen(false); showToast("Deleted", "info"); }} style={{
                  flex: 1, padding: 14, borderRadius: 14,
                  background: "rgba(244,63,94,0.1)", color: "#f43f5e",
                  fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
                }}>{t("delete")}</button>
              )}
              <button onClick={handleSave} style={{
                flex: 1, padding: 14, borderRadius: 14,
                background: "linear-gradient(135deg, #8b5cf6, #a78bfa)",
                color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
              }}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function daysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}

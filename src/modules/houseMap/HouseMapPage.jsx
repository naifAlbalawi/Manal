import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { t, isRTL } from "../../utils/i18n";

export default function HouseMapPage() {
  const { state, updateHouseMap, showToast, currency } = useApp();
  const rtl = isRTL();
  const houseMap = state.houseMap || { rooms: [] };

  const [roomSheetOpen, setRoomSheetOpen] = useState(false);
  const [itemSheetOpen, setItemSheetOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Room form
  const [roomName, setRoomName] = useState("");
  const [roomColor, setRoomColor] = useState("#6366f1");

  // Item form
  const [itemName, setItemName] = useState("");
  const [itemType, setItemType] = useState("plumbing");
  const [itemStatus, setItemStatus] = useState("Good");
  const [installDate, setInstallDate] = useState("");
  const [itemCost, setItemCost] = useState("");
  const [itemInvoice, setItemInvoice] = useState(null);
  const [itemNotes, setItemNotes] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("maintenance");

  const roomColors = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#22d3ee", "#ec4899", "#84cc16"];

  const itemTypes = [
    { id: "plumbing", label: t("plumbing"), icon: "🚿" },
    { id: "electrical", label: t("electrical"), icon: "⚡" },
    { id: "hvac", label: t("hvac"), icon: "❄️" },
    { id: "appliance", label: t("appliance"), icon: "🔌" },
    { id: "furniture", label: t("furniture"), icon: "🪑" },
  ];

  const handleAddRoom = () => {
    if (!roomName.trim()) return;
    const newRoom = {
      id: Date.now().toString(),
      name: roomName.trim(),
      color: roomColor,
      items: [],
    };
    updateHouseMap({ rooms: [...houseMap.rooms, newRoom] });
    setRoomSheetOpen(false);
    setRoomName(""); setRoomColor("#6366f1");
    showToast("Room added", "success");
  };

  const handleAddItem = () => {
    if (!itemName.trim() || !selectedRoom) return;
    const newItem = {
      id: Date.now().toString(),
      name: itemName.trim(),
      type: itemType,
      status: itemStatus,
      installDate,
      cost: parseFloat(itemCost) || 0,
      invoiceImage: itemInvoice,
      notes: itemNotes,
      maintenanceType,
      createdAt: new Date().toISOString(),
    };
    const updatedRooms = houseMap.rooms.map(r => {
      if (r.id === selectedRoom.id) {
        return { ...r, items: [...r.items, newItem] };
      }
      return r;
    });
    updateHouseMap({ rooms: updatedRooms });
    setItemSheetOpen(false);
    resetItemForm();
    showToast("Item registered", "success");
  };

  const resetItemForm = () => {
    setItemName(""); setItemType("plumbing"); setItemStatus("Good");
    setInstallDate(""); setItemCost(""); setItemInvoice(null);
    setItemNotes(""); setMaintenanceType("maintenance");
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setItemInvoice(e.target.result);
    reader.readAsDataURL(file);
  };

  const openItemSheet = (room) => {
    setSelectedRoom(room);
    resetItemForm();
    setEditingItem(null);
    setItemSheetOpen(true);
  };

  const totalItems = houseMap.rooms.reduce((sum, r) => sum + (r.items?.length || 0), 0);
  const totalCost = houseMap.rooms.reduce((sum, r) => sum + (r.items?.reduce((s, i) => s + (i.cost || 0), 0) || 0), 0);

  return (
    <div style={{ padding: "8px 0 100px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t("houseMap")}</h2>
        <div style={{ fontSize: 14, color: "#22d3ee", fontWeight: 600 }}>
          {totalItems} {t("items")} · {currency}{totalCost.toFixed(0)}
        </div>
      </div>

      {/* Rooms Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {houseMap.rooms.map(room => {
          const itemCount = room.items?.length || 0;
          const roomCost = room.items?.reduce((s, i) => s + (i.cost || 0), 0) || 0;
          return (
            <div key={room.id} onClick={() => openItemSheet(room)} style={{
              padding: 16, borderRadius: 18,
              background: `linear-gradient(145deg, ${room.color}15, ${room.color}05)`,
              border: `1px solid ${room.color}25`,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f5", marginBottom: 4 }}>{room.name}</div>
              <div style={{ fontSize: 12, color: "#606070" }}>{itemCount} {t("items")} · {currency}{roomCost}</div>
              {itemCount > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                  {room.items.slice(0, 3).map((item, i) => (
                    <span key={i} style={{
                      padding: "3px 8px", borderRadius: 6,
                      background: "rgba(255,255,255,0.05)",
                      fontSize: 10, color: "#a0a0b0",
                    }}>{itemTypes.find(t => t.id === item.type)?.icon} {item.name}</span>
                  ))}
                  {itemCount > 3 && <span style={{ fontSize: 10, color: "#606070" }}>+{itemCount - 3}</span>}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Room Button */}
        <button onClick={() => setRoomSheetOpen(true)} style={{
          padding: 16, borderRadius: 18,
          background: "rgba(255,255,255,0.02)",
          border: "2px dashed rgba(255,255,255,0.08)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 8, color: "#606070", cursor: "pointer", minHeight: 100,
        }}>
          <span style={{ fontSize: 24 }}>+</span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{t("createMap")}</span>
        </button>
      </div>

      {/* All Items List */}
      {totalItems > 0 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{t("linkedAssets")}</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {houseMap.rooms.flatMap(r => (r.items || []).map(item => ({ ...item, roomName: r.name, roomColor: r.color }))).map((item, i) => (
              <div key={item.id} style={{
                padding: 14, borderRadius: 14,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.04)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 20 }}>{itemTypes.find(t => t.id === item.type)?.icon || "📦"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f5" }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: "#606070" }}>
                    {item.roomName} · {item.status} · {item.installDate || "—"}
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f0f0f5" }}>{currency}{item.cost || 0}</div>
                {item.invoiceImage && <span style={{ fontSize: 14 }}>📎</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Room Sheet */}
      {roomSheetOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
        }}>
          <div onClick={() => setRoomSheetOpen(false)} style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          }} />
          <div style={{
            position: "relative", zIndex: 1,
            background: "linear-gradient(180deg, #1a1a24, #0a0a0f)",
            borderRadius: "28px 28px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "24px 20px calc(40px + env(safe-area-inset-bottom))",
            animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{t("createMap")}</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("room")}</label>
              <input value={roomName} onChange={e => setRoomName(e.target.value)} placeholder="Living Room, Kitchen..."
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("color")}</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {roomColors.map(c => (
                  <button key={c} onClick={() => setRoomColor(c)} style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: c,
                    border: `3px solid ${roomColor === c ? "#fff" : "transparent"}`,
                    cursor: "pointer", transition: "all 0.2s",
                    boxShadow: roomColor === c ? `0 0 12px ${c}` : "none",
                  }} />
                ))}
              </div>
            </div>

            <button onClick={handleAddRoom} style={{
              width: "100%", padding: 14, borderRadius: 14,
              background: "linear-gradient(135deg, #22d3ee, #06b6d4)",
              color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
            }}>{t("save")}</button>
          </div>
        </div>
      )}

      {/* Add Item Sheet */}
      {itemSheetOpen && selectedRoom && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
        }}>
          <div onClick={() => setItemSheetOpen(false)} style={{
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
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{t("registerAsset")}</h3>
            <p style={{ fontSize: 13, color: "#606070", marginBottom: 16 }}>{selectedRoom.name}</p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("assetName")}</label>
              <input value={itemName} onChange={e => setItemName(e.target.value)} placeholder="Sink, AC Unit, Light Switch..."
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("assetType")}</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {itemTypes.map(t => (
                  <button key={t.id} onClick={() => setItemType(t.id)} style={{
                    padding: "10px 12px", borderRadius: 12,
                    background: itemType === t.id ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${itemType === t.id ? "#22d3ee" : "rgba(255,255,255,0.06)"}`,
                    color: itemType === t.id ? "#22d3ee" : "#a0a0b0",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>{t.icon} {t.label}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("maintenance")} / {t("installment")}</label>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ id: "maintenance", label: t("maintenance") }, { id: "installment", label: t("installment") }, { id: "new", label: "New" }].map(m => (
                  <button key={m.id} onClick={() => setMaintenanceType(m.id)} style={{
                    flex: 1, padding: "10px 12px", borderRadius: 12,
                    background: maintenanceType === m.id ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${maintenanceType === m.id ? "#22d3ee" : "rgba(255,255,255,0.06)"}`,
                    color: maintenanceType === m.id ? "#22d3ee" : "#a0a0b0",
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                  }}>{m.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("cost")} ({currency})</label>
                <input type="number" value={itemCost} onChange={e => setItemCost(e.target.value)} placeholder="0"
                  style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("installDate")}</label>
                <input type="date" value={installDate} onChange={e => setInstallDate(e.target.value)}
                  style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Invoice Upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("uploadAttachment")} ({t("warranty")})</label>
              {itemInvoice ? (
                <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <img src={itemInvoice} alt="invoice" style={{ width: "100%", height: 120, objectFit: "cover" }} />
                  <button onClick={() => setItemInvoice(null)} style={{
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
                  border: "2px dashed rgba(34,211,238,0.3)",
                  background: "rgba(34,211,238,0.03)",
                  color: "#22d3ee", cursor: "pointer",
                }}>
                  📷 {t("uploadAttachment")}
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files[0])} style={{ display: "none" }} />
                </label>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("notes")}</label>
              <textarea value={itemNotes} onChange={e => setItemNotes(e.target.value)} placeholder="Warranty details, plumber contact..."
                rows={2}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box", resize: "vertical" }} />
            </div>

            <button onClick={handleAddItem} style={{
              width: "100%", padding: 14, borderRadius: 14,
              background: "linear-gradient(135deg, #22d3ee, #06b6d4)",
              color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
            }}>{t("save")}</button>
          </div>
        </div>
      )}
    </div>
  );
}

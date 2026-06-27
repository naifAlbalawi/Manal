import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { BottomSheet } from "../../components/BottomSheet";
import { ConfirmModal } from "../../components/ConfirmModal";
import { t, isRTL } from "../../utils/i18n";

const DOC_TYPES = ["insurance", "registration", "inspection", "ownership"];

export default function FleetPage() {
  const { state, addFleetCar, updateFleetCar, deleteFleetCar, showToast, currency } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [activeTab, setActiveTab] = useState("cars"); // cars, parts, docs
  const [selectedCar, setSelectedCar] = useState(null);
  const rtl = isRTL();

  const cars = state.fleet?.cars || [];

  const openNewCar = () => {
    setEditingCar({
      id: "car_" + Date.now(),
      name: "", plateNumber: "", vin: "", mileage: 0,
      lastService: new Date().toISOString().slice(0, 10),
      nextService: "",
      parts: [],
      docs: [],
    });
    setSheetOpen(true);
  };

  const saveCar = () => {
    if (!editingCar?.name.trim()) { showToast("Name required", "error"); return; }
    const exists = cars.find(c => c.id === editingCar.id);
    if (exists) updateFleetCar(editingCar);
    else addFleetCar(editingCar);
    showToast("Saved", "success");
    setSheetOpen(false);
    setEditingCar(null);
  };

  const addPart = () => {
    if (!editingCar) return;
    const part = {
      id: "part_" + Date.now(),
      name: "", partNumber: "", installDate: new Date().toISOString().slice(0, 10),
      lifespanKm: 10000, currentKm: 0,
    };
    setEditingCar({ ...editingCar, parts: [...(editingCar.parts || []), part] });
  };

  const updatePart = (idx, field, value) => {
    if (!editingCar) return;
    const parts = [...(editingCar.parts || [])];
    parts[idx] = { ...parts[idx], [field]: value };
    setEditingCar({ ...editingCar, parts });
  };

  const removePart = (idx) => {
    if (!editingCar) return;
    setEditingCar({ ...editingCar, parts: (editingCar.parts || []).filter((_, i) => i !== idx) });
  };

  const addDoc = () => {
    if (!editingCar) return;
    const doc = {
      id: "doc_" + Date.now(),
      type: "insurance", issueDate: new Date().toISOString().slice(0, 10),
      expiryDate: "", imageData: null,
    };
    setEditingCar({ ...editingCar, docs: [...(editingCar.docs || []), doc] });
  };

  const updateDoc = (idx, field, value) => {
    if (!editingCar) return;
    const docs = [...(editingCar.docs || [])];
    docs[idx] = { ...docs[idx], [field]: value };
    setEditingCar({ ...editingCar, docs });
  };

  const removeDoc = (idx) => {
    if (!editingCar) return;
    setEditingCar({ ...editingCar, docs: (editingCar.docs || []).filter((_, i) => i !== idx) });
  };

  const handleDocImage = async (idx, file) => {
    if (!file || !editingCar) return;
    const base64 = await fileToBase64(file);
    updateDoc(idx, "imageData", base64);
    showToast("Document uploaded", "success");
  };

  const daysUntil = (dateStr) => {
    if (!dateStr) return null;
    const days = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
    return days;
  };

  const kmRemaining = (part) => {
    if (!part.lifespanKm || !part.currentKm) return null;
    return Math.max(0, part.lifespanKm - part.currentKm);
  };

  return (
    <div style={{ padding: "8px 0 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            <span style={{ background: "linear-gradient(135deg, #f59e0b, #f43f5e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t("fleet")}</span>
          </h1>
          <div style={{ fontSize: 12, color: "#606070", marginTop: 2 }}>
            {cars.length} {t("items")} · {t("fleetOverview")}
          </div>
        </div>
        <button onClick={openNewCar} style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg, #f59e0b, #f43f5e)",
          border: "none", color: "#fff", fontSize: 24, fontWeight: 300,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(245,158,11,0.4)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >+</button>
      </div>

      {/* Car Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cars.map((car, i) => {
          const urgentDocs = (car.docs || []).filter(d => {
            const days = daysUntil(d.expiryDate);
            return days !== null && days <= 30;
          }).length;
          const wornParts = (car.parts || []).filter(p => {
            const km = kmRemaining(p);
            return km !== null && km <= 1000;
          }).length;

          return (
            <div key={car.id} onClick={() => {
              setEditingCar({ ...car });
              setSelectedCar(car.id);
              setSheetOpen(true);
            }} style={{
              background: "linear-gradient(145deg, rgba(26,26,36,0.6), rgba(17,17,24,0.8))",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.04)",
              padding: 18, cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              animationDelay: `${i * 60}ms`,
            }}
            className="animate-fade-in-up"
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = "rgba(245,158,11,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(244,63,94,0.1))",
                  border: "1px solid rgba(245,158,11,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 24,
                }}>🚗</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{car.name || "Unnamed Car"}</div>
                  <div style={{ fontSize: 12, color: "#606070", marginTop: 2, fontFamily: "monospace" }}>{car.plateNumber || "—"}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  {urgentDocs > 0 && (
                    <span style={{
                      padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: "rgba(244,63,94,0.15)", color: "#f43f5e",
                    }}>⚠️ {urgentDocs} {t("urgent")}</span>
                  )}
                  {wornParts > 0 && (
                    <span style={{
                      padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
                      background: "rgba(245,158,11,0.15)", color: "#f59e0b",
                    }}>🔧 {wornParts} {t("upcoming")}</span>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <div style={{
                  background: "rgba(255,255,255,0.02)", borderRadius: 10,
                  padding: "10px 12px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 10, color: "#606070", marginBottom: 2 }}>{t("mileage")}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5" }}>{car.mileage?.toLocaleString() || 0}</div>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.02)", borderRadius: 10,
                  padding: "10px 12px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 10, color: "#606070", marginBottom: 2 }}>{t("parts")}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5" }}>{(car.parts || []).length}</div>
                </div>
                <div style={{
                  background: "rgba(255,255,255,0.02)", borderRadius: 10,
                  padding: "10px 12px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 10, color: "#606070", marginBottom: 2 }}>{t("legalDocs")}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5" }}>{(car.docs || []).length}</div>
                </div>
              </div>
            </div>
          );
        })}
        {cars.length === 0 && (
          <div style={{ textAlign: "center", color: "#303040", padding: 48, fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚗</div>
            {t("noParents")}
          </div>
        )}
      </div>

      {/* Car Edit Sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingCar?.id && cars.find(c => c.id === editingCar.id) ? t("edit") : t("addCar")} maxHeight="92vh">
        {editingCar && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 4 }}>
              {[
                { id: "cars", label: t("carName") },
                { id: "parts", label: t("parts") },
                { id: "docs", label: t("legalDocs") },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, padding: "10px 14px", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: activeTab === tab.id ? "rgba(245,158,11,0.12)" : "transparent",
                  color: activeTab === tab.id ? "#f59e0b" : "#606070",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  transition: "all 0.2s",
                }}>{tab.label}</button>
              ))}
            </div>

            {/* Car Info Tab */}
            {activeTab === "cars" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("carName")}</label>
                  <input value={editingCar.name} onChange={e => setEditingCar({ ...editingCar, name: e.target.value })} placeholder={t("carName")}
                    style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("plateNumber")}</label>
                    <input value={editingCar.plateNumber} onChange={e => setEditingCar({ ...editingCar, plateNumber: e.target.value })} placeholder="ABC-123"
                      style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("vinNumber")}</label>
                    <input value={editingCar.vin} onChange={e => setEditingCar({ ...editingCar, vin: e.target.value })} placeholder="VIN"
                      style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 13, fontFamily: "monospace", width: "100%", boxSizing: "border-box" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("mileage")} (km)</label>
                  <input value={editingCar.mileage} onChange={e => setEditingCar({ ...editingCar, mileage: parseInt(e.target.value) || 0 })} type="number"
                    style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("lastService")}</label>
                    <input value={editingCar.lastService} onChange={e => setEditingCar({ ...editingCar, lastService: e.target.value })} type="date"
                      style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("nextService")}</label>
                    <input value={editingCar.nextService} onChange={e => setEditingCar({ ...editingCar, nextService: e.target.value })} type="date"
                      style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
                  </div>
                </div>
              </div>
            )}

            {/* Parts Tab */}
            {activeTab === "parts" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button onClick={addPart} style={{
                  padding: "12px", borderRadius: 14,
                  border: "1px dashed rgba(245,158,11,0.4)",
                  background: "rgba(245,158,11,0.04)",
                  color: "#f59e0b", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>+ {t("add")} {t("parts")}</button>
                {(editingCar.parts || []).map((part, idx) => {
                  const kmLeft = kmRemaining(part);
                  const isLow = kmLeft !== null && kmLeft <= 1000;
                  return (
                    <div key={part.id} style={{
                      background: "rgba(255,255,255,0.02)", borderRadius: 14,
                      border: isLow ? "1px solid rgba(244,63,94,0.2)" : "1px solid rgba(255,255,255,0.04)",
                      padding: 14,
                    }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <input value={part.name} onChange={e => updatePart(idx, "name", e.target.value)} placeholder={t("partName")}
                          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13 }} />
                        <input value={part.partNumber} onChange={e => updatePart(idx, "partNumber", e.target.value)} placeholder={t("partNumber")}
                          style={{ width: 100, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 12, fontFamily: "monospace" }} />
                      </div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <input value={part.lifespanKm} onChange={e => updatePart(idx, "lifespanKm", parseInt(e.target.value) || 0)} type="number" placeholder={t("lifespan")}
                          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13 }} />
                        <input value={part.currentKm} onChange={e => updatePart(idx, "currentKm", parseInt(e.target.value) || 0)} type="number" placeholder="Current km"
                          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13 }} />
                        <button onClick={() => removePart(idx)} style={{
                          padding: "8px 12px", borderRadius: 10,
                          border: "1px solid rgba(244,63,94,0.3)",
                          background: "transparent", color: "#f43f5e",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                        }}>✕</button>
                      </div>
                      {kmLeft !== null && (
                        <div style={{ marginTop: 8, fontSize: 11, color: isLow ? "#f43f5e" : "#606070", fontWeight: 600 }}>
                          {kmLeft.toLocaleString()} km {t("remaining")}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(editingCar.parts || []).length === 0 && (
                  <div style={{ textAlign: "center", color: "#303040", fontSize: 13, padding: 20 }}>No parts tracked</div>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "docs" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <button onClick={addDoc} style={{
                  padding: "12px", borderRadius: 14,
                  border: "1px dashed rgba(245,158,11,0.4)",
                  background: "rgba(245,158,11,0.04)",
                  color: "#f59e0b", fontWeight: 700, fontSize: 13,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>+ {t("add")} {t("legalDocs")}</button>
                {(editingCar.docs || []).map((doc, idx) => {
                  const daysLeft = daysUntil(doc.expiryDate);
                  const isUrgent = daysLeft !== null && daysLeft <= 30;
                  const isExpired = daysLeft !== null && daysLeft < 0;
                  return (
                    <div key={doc.id} style={{
                      background: "rgba(255,255,255,0.02)", borderRadius: 14,
                      border: isExpired ? "1px solid rgba(244,63,94,0.3)" : isUrgent ? "1px solid rgba(245,158,11,0.2)" : "1px solid rgba(255,255,255,0.04)",
                      padding: 14,
                    }}>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                        <select value={doc.type} onChange={e => updateDoc(idx, "type", e.target.value)}
                          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13 }}>
                          {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button onClick={() => removeDoc(idx)} style={{
                          padding: "8px 12px", borderRadius: 10,
                          border: "1px solid rgba(244,63,94,0.3)",
                          background: "transparent", color: "#f43f5e",
                          fontSize: 12, fontWeight: 700, cursor: "pointer",
                        }}>✕</button>
                      </div>
                      <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                        <input value={doc.issueDate} onChange={e => updateDoc(idx, "issueDate", e.target.value)} type="date"
                          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13 }} />
                        <input value={doc.expiryDate} onChange={e => updateDoc(idx, "expiryDate", e.target.value)} type="date"
                          style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13 }} />
                      </div>
                      {daysLeft !== null && (
                        <div style={{ fontSize: 11, fontWeight: 600, color: isExpired ? "#f43f5e" : isUrgent ? "#f59e0b" : "#10b981", marginBottom: 10 }}>
                          {isExpired ? `Expired ${Math.abs(daysLeft)} days ago` : `${daysLeft} days remaining`}
                        </div>
                      )}
                      {doc.imageData ? (
                        <img src={`data:image/jpeg;base64,${doc.imageData}`} alt="doc" style={{ width: "100%", borderRadius: 10, maxHeight: 150, objectFit: "cover" }} />
                      ) : (
                        <label style={{
                          display: "block", padding: 12, borderRadius: 10,
                          border: "1px dashed rgba(255,255,255,0.1)",
                          background: "rgba(255,255,255,0.02)",
                          color: "#606070", fontSize: 12, textAlign: "center", cursor: "pointer",
                        }}>
                          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleDocImage(idx, e.target.files[0])} />
                          📷 Upload Document
                        </label>
                      )}
                    </div>
                  );
                })}
                {(editingCar.docs || []).length === 0 && (
                  <div style={{ textAlign: "center", color: "#303040", fontSize: 13, padding: 20 }}>No documents tracked</div>
                )}
              </div>
            )}

            {/* Save */}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={saveCar} style={{
                flex: 1, padding: 16, borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #f59e0b, #f43f5e)",
                color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15,
                boxShadow: "0 4px 20px rgba(245,158,11,0.3)",
              }}>{t("save")}</button>
              <button onClick={() => setSheetOpen(false)} style={{
                flex: 1, padding: 16, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "#606070", fontWeight: 700, cursor: "pointer", fontSize: 15,
              }}>{t("cancel")}</button>
            </div>
            {editingCar.id && cars.find(c => c.id === editingCar.id) && (
              <button onClick={() => { setConfirmId(editingCar.id); setSheetOpen(false); }} style={{
                padding: 14, borderRadius: 14, border: "1px solid rgba(244,63,94,0.3)",
                background: "transparent", color: "#f43f5e", fontWeight: 700,
                cursor: "pointer", fontSize: 14,
              }}>{t("delete")}</button>
            )}
          </div>
        )}
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title={t("delete")} message={t("deleteConfirm")}
        onConfirm={() => { deleteFleetCar(confirmId); setConfirmId(null); showToast("Deleted", "info"); }}
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

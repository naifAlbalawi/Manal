import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { BottomSheet } from "../../components/BottomSheet";
import { ConfirmModal } from "../../components/ConfirmModal";
import { t, isRTL } from "../../utils/i18n";

const SAMPLE_STORES = [
  { id: "lulu", name: "Lulu", nameAr: "لولو", color: "#f59e0b" },
  { id: "tamimi", name: "Tamimi", nameAr: "تميمي", color: "#10b981" },
  { id: "danube", name: "Danube", nameAr: "دانيوب", color: "#6366f1" },
  { id: "carrefour", name: "Carrefour", nameAr: "كارفور", color: "#f43f5e" },
  { id: "othaim", name: "Al Othaim", nameAr: "العثيم", color: "#22d3ee" },
  { id: "panda", name: "Panda", nameAr: "بنده", color: "#8b5cf6" },
];

export default function GroceriesPage() {
  const { state, addGroceryList, updateGroceryList, deleteGroceryList, showToast, currency } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [optimizeOpen, setOptimizeOpen] = useState(false);
  const [optimizingList, setOptimizingList] = useState(null);
  const rtl = isRTL();

  const lists = state.groceries?.lists || [];

  const openNewList = () => {
    setEditingList({
      id: "groc_" + Date.now(),
      name: "",
      date: new Date().toISOString().slice(0, 10),
      items: [],
      stores: [],
    });
    setSheetOpen(true);
  };

  const saveList = () => {
    if (!editingList?.name.trim()) { showToast("Name required", "error"); return; }
    const exists = lists.find(l => l.id === editingList.id);
    if (exists) updateGroceryList(editingList);
    else addGroceryList(editingList);
    showToast("Saved", "success");
    setSheetOpen(false);
    setEditingList(null);
  };

  const addItem = () => {
    if (!editingList) return;
    const item = {
      id: "item_" + Date.now(),
      name: "", qty: 1, unit: "pc",
      prices: SAMPLE_STORES.map(s => ({ storeId: s.id, price: 0, available: true })),
    };
    setEditingList({ ...editingList, items: [...(editingList.items || []), item] });
  };

  const updateItem = (idx, field, value) => {
    if (!editingList) return;
    const items = [...(editingList.items || [])];
    items[idx] = { ...items[idx], [field]: value };
    setEditingList({ ...editingList, items });
  };

  const updateItemPrice = (itemIdx, storeId, price) => {
    if (!editingList) return;
    const items = [...(editingList.items || [])];
    const prices = [...(items[itemIdx].prices || [])];
    const pIdx = prices.findIndex(p => p.storeId === storeId);
    if (pIdx >= 0) prices[pIdx] = { ...prices[pIdx], price: parseFloat(price) || 0 };
    items[itemIdx] = { ...items[itemIdx], prices };
    setEditingList({ ...editingList, items });
  };

  const removeItem = (idx) => {
    if (!editingList) return;
    setEditingList({ ...editingList, items: (editingList.items || []).filter((_, i) => i !== idx) });
  };

  // AI Optimization: Find best store combination
  const optimizePrices = (list) => {
    const items = list.items || [];
    if (items.length === 0) return null;

    // For each store, calculate total cost if buying ALL available items there
    const storeTotals = {};
    SAMPLE_STORES.forEach(s => { storeTotals[s.id] = { store: s, total: 0, items: 0, missing: [] }; });

    items.forEach(item => {
      (item.prices || []).forEach(p => {
        if (p.available && p.price > 0) {
          storeTotals[p.storeId].total += p.price * (item.qty || 1);
          storeTotals[p.storeId].items++;
        } else if (p.storeId && p.price === 0) {
          storeTotals[p.storeId].missing.push(item.name);
        }
      });
    });

    // Find best single store
    const bestSingle = Object.values(storeTotals)
      .filter(s => s.items === items.length)
      .sort((a, b) => a.total - b.total)[0];

    // Find best 2-store combination
    let bestCombo = null;
    for (let i = 0; i < SAMPLE_STORES.length; i++) {
      for (let j = i + 1; j < SAMPLE_STORES.length; j++) {
        const s1 = SAMPLE_STORES[i].id;
        const s2 = SAMPLE_STORES[j].id;
        let comboTotal = 0;
        let comboItems = 0;
        let allAvailable = true;

        items.forEach(item => {
          const p1 = (item.prices || []).find(p => p.storeId === s1 && p.price > 0);
          const p2 = (item.prices || []).find(p => p.storeId === s2 && p.price > 0);
          if (p1 && (!p2 || p1.price <= p2.price)) {
            comboTotal += p1.price * (item.qty || 1);
            comboItems++;
          } else if (p2) {
            comboTotal += p2.price * (item.qty || 1);
            comboItems++;
          } else {
            allAvailable = false;
          }
        });

        if (allAvailable && (!bestCombo || comboTotal < bestCombo.total)) {
          bestCombo = {
            stores: [SAMPLE_STORES[i], SAMPLE_STORES[j]],
            total: comboTotal,
            items: comboItems,
          };
        }
      }
    }

    return { bestSingle, bestCombo, allStores: Object.values(storeTotals) };
  };

  const runOptimization = (list) => {
    setOptimizingList(list);
    setOptimizeOpen(true);
  };

  return (
    <div style={{ padding: "8px 0 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            <span style={{ background: "linear-gradient(135deg, #10b981, #22d3ee)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{t("groceries")}</span>
          </h1>
          <div style={{ fontSize: 12, color: "#606070", marginTop: 2 }}>
            {lists.length} {t("lists")} · {t("optimize")} {t("prices")}
          </div>
        </div>
        <button onClick={openNewList} style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg, #10b981, #22d3ee)",
          border: "none", color: "#fff", fontSize: 24, fontWeight: 300,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(16,185,129,0.4)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >+</button>
      </div>

      {/* Lists */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {lists.map((list, i) => {
          const itemCount = (list.items || []).length;
          const totalItems = (list.items || []).reduce((s, it) => s + (it.qty || 1), 0);
          return (
            <div key={list.id} style={{
              background: "linear-gradient(145deg, rgba(26,26,36,0.6), rgba(17,17,24,0.8))",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.04)",
              overflow: "hidden",
              animationDelay: `${i * 60}ms`,
            }} className="animate-fade-in-up">
              <div onClick={() => {
                setEditingList({ ...list });
                setSheetOpen(true);
              }} style={{ padding: 18, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: "#f0f0f5" }}>{list.name || "Untitled List"}</div>
                  <div style={{ fontSize: 11, color: "#606070", background: "rgba(255,255,255,0.03)", padding: "4px 10px", borderRadius: 8 }}>
                    {list.date}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#606070" }}>
                  <span>{itemCount} {t("items")}</span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#404050" }} />
                  <span>{totalItems} {t("quantity")}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "0 18px 14px" }}>
                <button onClick={() => runOptimization(list)} style={{
                  flex: 1, padding: "10px 14px", borderRadius: 12,
                  border: "1px solid rgba(16,185,129,0.3)",
                  background: "rgba(16,185,129,0.06)",
                  color: "#10b981", fontSize: 12, fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(16,185,129,0.06)"; }}
                >
                  ⚡ {t("optimize")}
                </button>
                <button onClick={() => { setEditingList({ ...list }); setSheetOpen(true); }} style={{
                  padding: "10px 14px", borderRadius: 12,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "transparent", color: "#606070",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                }}>{t("edit")}</button>
              </div>
            </div>
          );
        })}
        {lists.length === 0 && (
          <div style={{ textAlign: "center", color: "#303040", padding: 48, fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
            No grocery lists yet
          </div>
        )}
      </div>

      {/* Optimization Results Sheet */}
      <BottomSheet open={optimizeOpen} onClose={() => setOptimizeOpen(false)} title={t("optimize")} maxHeight="90vh">
        {optimizingList && (() => {
          const result = optimizePrices(optimizingList);
          if (!result) return <div style={{ textAlign: "center", color: "#606070", padding: 40 }}>No items to optimize</div>;

          return (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Best Single Store */}
              {result.bestSingle && (
                <div style={{
                  background: "linear-gradient(145deg, rgba(16,185,129,0.08), rgba(34,211,238,0.05))",
                  borderRadius: 16, border: "1px solid rgba(16,185,129,0.15)",
                  padding: 18,
                }}>
                  <div style={{ fontSize: 12, color: "#10b981", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                    {t("bestPrice")} — {t("oneTime")} {t("store")}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 14,
                      background: result.bestSingle.store.color + "18",
                      border: `1px solid ${result.bestSingle.store.color}33`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20,
                    }}>🏪</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#f0f0f5" }}>
                        {rtl ? result.bestSingle.store.nameAr : result.bestSingle.store.name}
                      </div>
                      <div style={{ fontSize: 12, color: "#606070" }}>All items available</div>
                    </div>
                    <div style={{ marginLeft: "auto", fontSize: 20, fontWeight: 800, color: "#10b981" }}>
                      {currency}{result.bestSingle.total.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Best Combo */}
              {result.bestCombo && (
                <div style={{
                  background: "linear-gradient(145deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))",
                  borderRadius: 16, border: "1px solid rgba(99,102,241,0.15)",
                  padding: 18,
                }}>
                  <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
                    {t("optimize")} — 2 {t("stores")}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    {result.bestCombo.stores.map((s, idx) => (
                      <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 12,
                          background: s.color + "18",
                          border: `1px solid ${s.color}33`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 14,
                        }}>🏪</div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f5" }}>{rtl ? s.nameAr : s.name}</span>
                        {idx === 0 && <span style={{ color: "#606070", fontSize: 12 }}>+</span>}
                      </div>
                    ))}
                    <div style={{ marginLeft: "auto", fontSize: 18, fontWeight: 800, color: "#6366f1" }}>
                      {currency}{result.bestCombo.total.toFixed(2)}
                    </div>
                  </div>
                  {result.bestSingle && result.bestCombo.total < result.bestSingle.total && (
                    <div style={{
                      padding: "10px 14px", borderRadius: 10,
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.15)",
                      fontSize: 13, color: "#10b981", fontWeight: 700,
                    }}>
                      💰 Save {currency}{(result.bestSingle.total - result.bestCombo.total).toFixed(2)} ({((1 - result.bestCombo.total / result.bestSingle.total) * 100).toFixed(0)}%)
                    </div>
                  )}
                </div>
              )}

              {/* Per-item breakdown */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#606070", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
                  {t("comparePrices")}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {(optimizingList.items || []).map((item, idx) => (
                    <div key={item.id || idx} style={{
                      background: "rgba(255,255,255,0.02)", borderRadius: 14,
                      border: "1px solid rgba(255,255,255,0.04)",
                      padding: 14,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5" }}>{item.name || "Unnamed"}</div>
                          <div style={{ fontSize: 11, color: "#606070" }}>{item.qty} {item.unit}</div>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                        {(item.prices || []).map(p => {
                          const store = SAMPLE_STORES.find(s => s.id === p.storeId);
                          const isLowest = p.price > 0 && (item.prices || []).filter(op => op.price > 0).sort((a, b) => a.price - b.price)[0]?.storeId === p.storeId;
                          return (
                            <div key={p.storeId} style={{
                              padding: "8px 10px", borderRadius: 10,
                              background: isLowest ? store?.color + "15" : "rgba(255,255,255,0.02)",
                              border: isLowest ? `1px solid ${store?.color}33` : "1px solid rgba(255,255,255,0.04)",
                              textAlign: "center",
                            }}>
                              <div style={{ fontSize: 10, color: isLowest ? store?.color : "#606070", fontWeight: 700, marginBottom: 2 }}>
                                {rtl ? store?.nameAr : store?.name}
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 700, color: isLowest ? "#f0f0f5" : "#a0a0b0" }}>
                                {p.price > 0 ? `${currency}${p.price}` : "—"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </BottomSheet>

      {/* List Edit Sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingList?.id && lists.find(l => l.id === editingList.id) ? t("edit") : t("groceryList")} maxHeight="92vh">
        {editingList && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("name")}</label>
              <input value={editingList.name} onChange={e => setEditingList({ ...editingList, name: e.target.value })} placeholder={t("groceryList")}
                style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
            </div>
            <input value={editingList.date} onChange={e => setEditingList({ ...editingList, date: e.target.value })} type="date"
              style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15 }} />

            {/* Items */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "#606070", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{t("items")}</span>
                <button onClick={addItem} style={{
                  padding: "8px 14px", borderRadius: 10,
                  border: "none", background: "linear-gradient(135deg, #10b981, #22d3ee)",
                  color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
                }}>+ {t("addItem")}</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(editingList.items || []).map((item, idx) => (
                  <div key={item.id || idx} style={{
                    background: "rgba(255,255,255,0.02)", borderRadius: 16,
                    border: "1px solid rgba(255,255,255,0.04)",
                    padding: 14,
                  }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <input value={item.name} onChange={e => updateItem(idx, "name", e.target.value)} placeholder={t("itemName")}
                        style={{ flex: 1, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13 }} />
                      <input value={item.qty} onChange={e => updateItem(idx, "qty", parseInt(e.target.value) || 1)} type="number" placeholder={t("quantity")}
                        style={{ width: 60, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13 }} />
                      <select value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)}
                        style={{ width: 70, padding: 10, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13 }}>
                        <option value="pc">pc</option>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="L">L</option>
                        <option value="pack">pack</option>
                      </select>
                      <button onClick={() => removeItem(idx)} style={{
                        padding: "8px 12px", borderRadius: 10,
                        border: "1px solid rgba(244,63,94,0.3)",
                        background: "transparent", color: "#f43f5e",
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}>✕</button>
                    </div>
                    <div style={{ fontSize: 11, color: "#606070", marginBottom: 8, fontWeight: 600 }}>{t("prices")} ({t("store")})</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                      {(item.prices || []).map(p => {
                        const store = SAMPLE_STORES.find(s => s.id === p.storeId);
                        return (
                          <div key={p.storeId} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, color: store?.color || "#606070", fontWeight: 700, minWidth: 50 }}>{rtl ? store?.nameAr : store?.name}</span>
                            <input value={p.price} onChange={e => updateItemPrice(idx, p.storeId, e.target.value)} type="number" step="0.01"
                              style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 12 }} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                {(editingList.items || []).length === 0 && (
                  <div style={{ textAlign: "center", color: "#303040", fontSize: 13, padding: 20 }}>No items yet</div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={saveList} style={{
                flex: 1, padding: 16, borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #10b981, #22d3ee)",
                color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15,
                boxShadow: "0 4px 20px rgba(16,185,129,0.3)",
              }}>{t("save")}</button>
              <button onClick={() => setSheetOpen(false)} style={{
                flex: 1, padding: 16, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "#606070", fontWeight: 700, cursor: "pointer", fontSize: 15,
              }}>{t("cancel")}</button>
            </div>
            {editingList.id && lists.find(l => l.id === editingList.id) && (
              <button onClick={() => { setConfirmId(editingList.id); setSheetOpen(false); }} style={{
                padding: 14, borderRadius: 14, border: "1px solid rgba(244,63,94,0.3)",
                background: "transparent", color: "#f43f5e", fontWeight: 700,
                cursor: "pointer", fontSize: 14,
              }}>{t("delete")}</button>
            )}
          </div>
        )}
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title={t("delete")} message={t("deleteConfirm")}
        onConfirm={() => { deleteGroceryList(confirmId); setConfirmId(null); showToast("Deleted", "info"); }}
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

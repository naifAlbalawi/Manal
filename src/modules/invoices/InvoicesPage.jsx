import { useState, useRef, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { BottomSheet } from "../../components/BottomSheet";
import { ConfirmModal } from "../../components/ConfirmModal";
import { extractTextFromImage, parseItemsFromText } from "../../utils/ocr";
import { isAIEnabled, loadAIConfig, processWithAI } from "../../utils/aiConfig";
import { t, isRTL } from "../../utils/i18n";

export default function InvoicesPage() {
  const { state, addInvoice, updateInvoice, deleteInvoice, addExpense, showToast, currency, TODAY } = useApp();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [removeItemIdx, setRemoveItemIdx] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const fileRef = useRef(null);
  const rtl = isRTL();

  const openNew = () => {
    const timestamp = Date.now();
    setEditing({
      id: "inv_" + timestamp,
      name: "",
      generatedName: "invoice_" + timestamp,
      date: new Date().toISOString().slice(0, 10),
      image: null,
      imageData: null,
      extractedText: "",
      items: [],
      defaultTag: "invoices",
    });
    setSheetOpen(true);
  };

  const handleImage = async (file) => {
    if (!file) return;
    setProcessing(true);
    try {
      const base64 = await fileToBase64(file);
      const imageUrl = URL.createObjectURL(file);
      let text = "";
      let items = [];

      if (isAIEnabled()) {
        try {
          const aiConfig = loadAIConfig();
          const aiItems = await processWithAI(file, "", aiConfig);
          if (aiItems && aiItems.length > 0) {
            items = aiItems.map(it => ({ name: it.name, price: parseFloat(it.price) || 0, tag: "invoices", endDate: null }));
            text = aiItems.map(it => `${it.name} ${it.price}`).join("\n");
          }
        } catch (e) { console.error("AI failed", e); }
      }

      if (!text) {
        try {
          text = await extractTextFromImage(file);
          items = parseItemsFromText(text);
        } catch (e) { console.error("OCR failed", e); }
      }

      setEditing(prev => prev ? {
        ...prev,
        image: imageUrl,
        imageData: base64,
        extractedText: text || "",
        items: Array.isArray(items) ? items : [],
      } : null);
      showToast(`${items?.length || 0} ${t("items")} ${t("parsedItems")}`, items?.length ? "success" : "warning");
    } catch (e) {
      showToast("OCR failed", "error");
    } finally {
      setProcessing(false);
    }
  };

  // BUG FIX: Always ensure items is an array before filtering
  const removeItem = (idx) => {
    setEditing(prev => {
      if (!prev || !Array.isArray(prev.items)) return prev;
      return { ...prev, items: prev.items.filter((_, i) => i !== idx) };
    });
    showToast(t("itemRemoved"), "info");
    setRemoveItemIdx(null);
  };

  const updateItemTag = (idx, tag) => {
    setEditing(prev => {
      if (!prev || !Array.isArray(prev.items)) return prev;
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], tag };
      return { ...prev, items: newItems };
    });
  };

  const updateItemName = (idx, name) => {
    setEditing(prev => {
      if (!prev || !Array.isArray(prev.items)) return prev;
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], name };
      return { ...prev, items: newItems };
    });
  };

  const updateItemPrice = (idx, price) => {
    setEditing(prev => {
      if (!prev || !Array.isArray(prev.items)) return prev;
      const newItems = [...prev.items];
      newItems[idx] = { ...newItems[idx], price: parseFloat(price) || 0 };
      return { ...prev, items: newItems };
    });
  };

  const addItemAsExpense = (item, invId) => {
    const tag = item.tag || editing?.defaultTag || "invoices";
    addExpense({
      id: "e_" + Date.now() + Math.random().toString(36).slice(2, 5),
      name: item.name,
      tag: tag,
      amount: item.price,
      startDate: new Date().toISOString().slice(0, 10),
      days: 0,
      endDate: item.endDate || null,
      monthly: 0,
      status: "Paid",
      parentId: null,
      invoiceId: invId,
    });
    showToast(t("itemAdded"), "success");
  };

  const addAllItems = () => {
    if (!editing) return;
    const items = Array.isArray(editing.items) ? editing.items : [];
    items.forEach(it => addItemAsExpense(it, editing.id));
    showToast(t("allItemsAdded"), "success");
  };

  const saveInvoice = () => {
    if (!editing) return;
    if (!editing.name.trim()) { showToast("Name required", "error"); return; }
    const exists = state.invoices.find(i => i.id === editing.id);
    const toSave = { ...editing };
    delete toSave.image;
    if (!Array.isArray(toSave.items)) toSave.items = [];
    if (exists) updateInvoice(toSave);
    else addInvoice(toSave);
    showToast("Saved", "success");
    setSheetOpen(false);
    setEditing(null);
  };

  return (
    <div style={{ padding: "8px 0 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            <span className="text-gradient-rose">{t("invoices")}</span>
          </h1>
          <div style={{ fontSize: 12, color: "#606070", marginTop: 2 }}>
            {state.invoices.length} {t("items")}
          </div>
        </div>
        <button onClick={openNew} style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg, #f43f5e, #f59e0b)",
          border: "none", color: "#fff", fontSize: 24, fontWeight: 300,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(244,63,94,0.4)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >+</button>
      </div>

      {/* Invoice Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {state.invoices.map((inv, i) => {
          const imgUrl = inv.imageData ? `data:image/jpeg;base64,${inv.imageData}` : inv.image;
          const itemCount = Array.isArray(inv.items) ? inv.items.length : 0;
          return (
            <div key={inv.id} onClick={() => {
              setEditing({ ...inv, image: imgUrl, items: Array.isArray(inv.items) ? inv.items : [] });
              setSheetOpen(true);
            }} style={{
              background: "linear-gradient(145deg, rgba(26,26,36,0.6), rgba(17,17,24,0.8))",
              borderRadius: 20,
              border: "1px solid rgba(255,255,255,0.04)",
              overflow: "hidden", cursor: "pointer",
              transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              animationDelay: `${i * 60}ms`,
            }}
            className="animate-fade-in-up"
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "rgba(244,63,94,0.15)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(244,63,94,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {inv.imageData || inv.image ? (
                <img src={imgUrl} alt="invoice" style={{ width: "100%", height: 120, objectFit: "cover", opacity: 0.85 }} />
              ) : (
                <div style={{
                  width: "100%", height: 120, display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 40, background: "linear-gradient(135deg, rgba(244,63,94,0.08), rgba(245,158,11,0.08))",
                }}>
                  🧾
                </div>
              )}
              <div style={{ padding: 14 }}>
                <div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#f0f0f5" }}>
                  {inv.name || inv.generatedName || "Untitled"}
                </div>
                <div style={{ fontSize: 11, color: "#606070", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>{inv.date}</span>
                  <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#404050" }} />
                  <span>{itemCount} {t("items")}</span>
                </div>
              </div>
            </div>
          );
        })}
        {state.invoices.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#303040", padding: 48, fontSize: 14 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🧾</div>
            {t("noInvoices")}
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {imagePreviewOpen && editing?.image && (
        <div onClick={() => setImagePreviewOpen(false)} style={{
          position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.92)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          animation: "fadeIn 0.2s ease",
        }}>
          <img src={editing.image} alt="invoice full" style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: 16, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }} />
        </div>
      )}

      {/* Edit Sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editing?.id && state.invoices.find(i => i.id === editing.id) ? t("edit") : t("add")} maxHeight="92vh">
        {editing && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "4px 0" }}>
            {/* Invoice Name */}
            <div>
              <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("invoiceName")}</label>
              <input
                value={editing.name}
                onChange={e => setEditing({ ...editing, name: e.target.value })}
                placeholder={editing.generatedName}
                style={{
                  padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15,
                  width: "100%", boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(244,63,94,0.4)"}
                onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
              />
              <div style={{ fontSize: 11, color: "#404050", marginTop: 4 }}>{t("generatedName")}: {editing.generatedName}</div>
            </div>

            {/* Date */}
            <input
              value={editing.date}
              onChange={e => setEditing({ ...editing, date: e.target.value })}
              type="date"
              style={{
                padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15,
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(244,63,94,0.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
            />

            {/* Upload */}
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                padding: 14, borderRadius: 14,
                border: "1px dashed rgba(244,63,94,0.4)",
                background: "rgba(244,63,94,0.04)",
                color: "#f43f5e", fontWeight: 700, cursor: "pointer", fontSize: 14,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(244,63,94,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(244,63,94,0.04)"; }}
            >
              {processing ? (
                <>
                  <span style={{ display: "inline-block", width: 16, height: 16, border: "2px solid rgba(244,63,94,0.2)", borderTopColor: "#f43f5e", borderRadius: "50%", animation: "ring 0.8s linear infinite" }} />
                  {t("processing")}
                </>
              ) : (
                <>📷 {t("uploadImage")}</>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => handleImage(e.target.files[0])} />

            {/* Image Preview */}
            {editing.image && (
              <div onClick={() => setImagePreviewOpen(true)} style={{
                width: "100%", height: 160, overflow: "hidden", borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", position: "relative",
              }}>
                <img src={editing.image} alt="invoice" style={{
                  width: "100%", height: "200%", objectFit: "cover",
                  objectPosition: "top center", opacity: 0.85,
                }} />
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  height: 50, background: "linear-gradient(transparent, #0a0a0f)",
                  display: "flex", alignItems: "flex-end", justifyContent: "center",
                  paddingBottom: 10, fontSize: 12, color: "#606070", fontWeight: 500,
                }}>{t("tapToView")}</div>
              </div>
            )}

            {/* Extracted Text */}
            {editing.extractedText && (
              <textarea
                value={editing.extractedText}
                onChange={e => setEditing({ ...editing, extractedText: e.target.value })}
                rows={3}
                style={{
                  padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.03)", color: "#a0a0b0", fontSize: 13,
                  width: "100%", boxSizing: "border-box", resize: "vertical",
                  fontFamily: "monospace",
                }}
              />
            )}

            {/* Items Section */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: "#606070", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>{t("parsedItems")}</span>
                <button onClick={addAllItems} style={{
                  padding: "8px 14px", borderRadius: 10, border: "none",
                  background: "linear-gradient(135deg, #10b981, #22d3ee)",
                  color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(16,185,129,0.3)",
                }}>+ {t("addAllItems")}</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {(Array.isArray(editing.items) ? editing.items : []).map((it, idx) => (
                  <div key={idx} style={{
                    background: "linear-gradient(145deg, rgba(26,26,36,0.6), rgba(17,17,24,0.8))",
                    borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)",
                    padding: 14,
                  }}>
                    <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
                      <input
                        value={it.name || ""}
                        onChange={e => updateItemName(idx, e.target.value)}
                        placeholder={t("itemName")}
                        style={{
                          flex: 1, padding: 10, borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13,
                        }}
                      />
                      <input
                        value={it.price || 0}
                        onChange={e => updateItemPrice(idx, e.target.value)}
                        type="number"
                        step="0.01"
                        placeholder={t("price")}
                        style={{
                          width: 90, padding: 10, borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.02)", color: "#f0f0f5", fontSize: 13,
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <select
                        value={it.tag || editing.defaultTag || "invoices"}
                        onChange={e => updateItemTag(idx, e.target.value)}
                        style={{
                          padding: "8px 12px", borderRadius: 10,
                          border: "1px solid rgba(255,255,255,0.06)",
                          background: "rgba(255,255,255,0.02)", color: "#a0a0b0", fontSize: 12,
                        }}
                      >
                        {state.tags.map(t => <option key={t.id} value={t.id}>{rtl ? t.nameAr : t.name}</option>)}
                      </select>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          onClick={() => addItemAsExpense(it, editing.id)}
                          style={{
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
                            border: "none", borderRadius: 10, padding: "8px 14px",
                            fontSize: 12, fontWeight: 700, cursor: "pointer",
                            boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
                          }}
                        >+ {t("add")}</button>
                        <button
                          onClick={() => setRemoveItemIdx(idx)}
                          style={{
                            background: "transparent", color: "#f43f5e",
                            border: "1px solid rgba(244,63,94,0.3)",
                            borderRadius: 10, padding: "8px 14px",
                            fontSize: 12, fontWeight: 700, cursor: "pointer",
                          }}
                        >✕</button>
                      </div>
                    </div>
                  </div>
                ))}
                {(Array.isArray(editing.items) ? editing.items : []).length === 0 && (
                  <div style={{ textAlign: "center", color: "#303040", fontSize: 13, padding: 20 }}>{t("noItems")}</div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button onClick={saveInvoice} style={{
                flex: 1, padding: 16, borderRadius: 14, border: "none",
                background: "linear-gradient(135deg, #f43f5e, #f59e0b)",
                color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15,
                boxShadow: "0 4px 20px rgba(244,63,94,0.3)",
              }}>{t("save")}</button>
              <button onClick={() => setSheetOpen(false)} style={{
                flex: 1, padding: 16, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
                background: "transparent", color: "#606070", fontWeight: 700, cursor: "pointer", fontSize: 15,
              }}>{t("cancel")}</button>
            </div>
            {editing.id && state.invoices.find(i => i.id === editing.id) && (
              <button onClick={() => { setConfirmId(editing.id); setSheetOpen(false); }} style={{
                padding: 14, borderRadius: 14, border: "1px solid rgba(244,63,94,0.3)",
                background: "transparent", color: "#f43f5e", fontWeight: 700,
                cursor: "pointer", fontSize: 14,
              }}>{t("delete")}</button>
            )}
          </div>
        )}
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title={t("delete")} message={t("deleteConfirm")} 
        onConfirm={() => { deleteInvoice(confirmId); setConfirmId(null); showToast("Deleted", "info"); }} 
        onCancel={() => setConfirmId(null)} />
      <ConfirmModal open={removeItemIdx !== null} title={t("remove")} message={t("removeItemConfirm")} 
        onConfirm={() => removeItem(removeItemIdx)} 
        onCancel={() => setRemoveItemIdx(null)} confirmText={t("remove")} confirmColor="#f43f5e" />
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

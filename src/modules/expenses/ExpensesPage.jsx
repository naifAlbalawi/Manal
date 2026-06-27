import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { t, isRTL } from "../../utils/i18n";

export default function ExpensesPage() {
  const { state, addExpense, updateExpense, deleteExpense, showToast, currency } = useApp();
  const rtl = isRTL();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterTag, setFilterTag] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [name, setName] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [amount, setAmount] = useState("");
  const [tag, setTag] = useState("finances");
  const [status, setStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [monthly, setMonthly] = useState(false);
  const [parentId, setParentId] = useState("");
  const [invoiceImage, setInvoiceImage] = useState(null);

  const expenses = state.expenses || [];
  const tags = state.tags || [];
  const parents = state.parents || [];

  const filtered = useMemo(() => {
    let result = expenses;
    if (search) result = result.filter(e => (e.name || "").toLowerCase().includes(search.toLowerCase()) || (e.nameAr || "").includes(search));
    if (filterTag !== "all") result = result.filter(e => e.tag === filterTag);
    return result;
  }, [expenses, search, filterTag]);

  const currentTag = tags.find(t => t.id === tag);
  const availableStatuses = currentTag?.statuses || ["Fixed", "Variable"];

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setInvoiceImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name.trim()) { showToast("Name required", "error"); return; }
    const item = {
      id: editing?.id || Date.now().toString(),
      name: name.trim(),
      nameAr: nameAr.trim(),
      amount: parseFloat(amount) || 0,
      tag,
      status: status || availableStatuses[0],
      startDate,
      endDate,
      monthly: monthly ? (parseFloat(amount) || 0) : 0,
      parentId: parentId || null,
      invoiceImage,
      date: editing?.date || new Date().toISOString().slice(0, 10),
    };
    if (editing) updateExpense(item);
    else addExpense(item);
    setSheetOpen(false);
    setEditing(null);
    resetForm();
    showToast(editing ? "Updated" : "Added", "success");
  };

  const resetForm = () => {
    setName(""); setNameAr(""); setAmount(""); setTag("finances"); setStatus("");
    setStartDate(""); setEndDate(""); setMonthly(false); setParentId(""); setInvoiceImage(null);
  };

  const openEdit = (exp) => {
    setEditing(exp);
    setName(exp.name || ""); setNameAr(exp.nameAr || ""); setAmount(exp.amount?.toString() || "");
    setTag(exp.tag || "finances"); setStatus(exp.status || ""); setStartDate(exp.startDate || "");
    setEndDate(exp.endDate || ""); setMonthly(!!exp.monthly); setParentId(exp.parentId || "");
    setInvoiceImage(exp.invoiceImage || null);
    setSheetOpen(true);
  };

  const totalAmount = filtered.reduce((s, e) => s + (e.amount || 0), 0);
  const monthlyTotal = expenses.reduce((s, e) => s + (e.monthly || 0), 0);

  return (
    <div style={{ padding: "8px 0 100px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t("expenses")}</h2>
        <div style={{ fontSize: 14, color: "#6366f1", fontWeight: 600 }}>
          {currency}{totalAmount.toFixed(0)} · {currency}{monthlyTotal.toFixed(0)}/{t("monthly")}
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 12 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("search")}
          style={{
            width: "100%", padding: "12px 16px", borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)", color: "#f0f0f5",
            fontSize: 14, boxSizing: "border-box",
          }}
        />
      </div>

      {/* Filter Tags - Fixed for RTL */}
      <div style={{
        display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16,
        flexDirection: rtl ? "row-reverse" : "row",
        justifyContent: rtl ? "flex-end" : "flex-start",
      }} className="hide-scrollbar">
        <button onClick={() => setFilterTag("all")} style={{
          padding: "8px 16px", borderRadius: 12, flexShrink: 0,
          background: filterTag === "all" ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
          border: `1px solid ${filterTag === "all" ? "#6366f1" : "rgba(255,255,255,0.06)"}`,
          color: filterTag === "all" ? "#6366f1" : "#a0a0b0",
          fontSize: 12, fontWeight: 600, cursor: "pointer",
        }}>{t("all")}</button>
        {tags.map(t => (
          <button key={t.id} onClick={() => setFilterTag(t.id)} style={{
            padding: "8px 16px", borderRadius: 12, flexShrink: 0,
            background: filterTag === t.id ? `${t.color}15` : "rgba(255,255,255,0.03)",
            border: `1px solid ${filterTag === t.id ? t.color + "44" : "rgba(255,255,255,0.06)"}`,
            color: filterTag === t.id ? t.color : "#a0a0b0",
            fontSize: 12, fontWeight: 600, cursor: "pointer",
          }}>{rtl ? (t.nameAr || t.name) : t.name}</button>
        ))}
      </div>

      {/* View Toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["list", "board"].map(v => (
          <button key={v} onClick={() => setViewMode(v)} style={{
            padding: "6px 12px", borderRadius: 10,
            background: viewMode === v ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
            border: `1px solid ${viewMode === v ? "#6366f1" : "rgba(255,255,255,0.06)"}`,
            color: viewMode === v ? "#6366f1" : "#a0a0b0",
            fontSize: 12, cursor: "pointer",
          }}>{t(v)}</button>
        ))}
      </div>

      {/* Expenses List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(exp => {
          const tagObj = tags.find(t => t.id === exp.tag);
          const parent = parents.find(p => p.id === exp.parentId);
          return (
            <div key={exp.id} onClick={() => openEdit(exp)} style={{
              padding: 16, borderRadius: 18,
              background: "linear-gradient(145deg, rgba(26,26,36,0.6), rgba(17,17,24,0.8))",
              border: "1px solid rgba(255,255,255,0.04)",
              display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer", transition: "all 0.2s",
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: (tagObj?.color || "#6366f1") + "15",
                border: `1px solid ${(tagObj?.color || "#6366f1")}30`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20,
              }}>{exp.monthly ? "🔄" : "💰"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f5" }}>
                  {rtl ? (exp.nameAr || exp.name) : exp.name}
                </div>
                <div style={{ fontSize: 12, color: "#606070", marginTop: 2 }}>
                  {rtl ? (tagObj?.nameAr || tagObj?.name) : tagObj?.name}
                  {parent && ` · ${parent.name}`}
                  {exp.status && ` · ${exp.status}`}
                </div>
              </div>
              <div style={{ textAlign: rtl ? "left" : "right" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f5" }}>
                  {currency}{exp.amount}
                </div>
                {exp.monthly > 0 && (
                  <div style={{ fontSize: 11, color: "#6366f1" }}>{currency}{exp.monthly}/{t("monthly")}</div>
                )}
              </div>
              {exp.invoiceImage && <span style={{ fontSize: 16 }}>📎</span>}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#505060" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div>{t("noExpenses")}</div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => { resetForm(); setEditing(null); setSheetOpen(true); }} style={{
        position: "fixed", bottom: "calc(80px + env(safe-area-inset-bottom))", right: 20,
        width: 56, height: 56, borderRadius: 18,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#fff", fontSize: 24, border: "none",
        boxShadow: "0 8px 32px rgba(99,102,241,0.4)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 50,
      }}>+</button>

      {/* Add/Edit Sheet - Fixed for keyboard */}
      {sheetOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 300,
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
        }}>
          <div onClick={() => setSheetOpen(false)} style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
          }} />
          <div style={{
            position: "relative", zIndex: 1,
            background: "linear-gradient(180deg, #1a1a24, #0a0a0f)",
            borderRadius: "28px 28px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "24px 20px 20px",
            animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            maxHeight: "85vh", overflow: "auto",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{editing ? t("edit") : t("add")} {t("expenses")}</h3>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("name")}</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={t("name")}
                style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("nameAr")}</label>
              <input value={nameAr} onChange={e => setNameAr(e.target.value)} placeholder={t("nameAr")}
                style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("amount")} ({currency})</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
                  style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("tag")}</label>
                <select value={tag} onChange={e => { setTag(e.target.value); setStatus(""); }}
                  style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }}>
                  {tags.map(t => (
                    <option key={t.id} value={t.id}>{rtl ? (t.nameAr || t.name) : t.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {availableStatuses.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("status")}</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", flexDirection: rtl ? "row-reverse" : "row", justifyContent: rtl ? "flex-end" : "flex-start" }}>
                  {availableStatuses.map(s => (
                    <button key={s} onClick={() => setStatus(s)} style={{
                      padding: "8px 14px", borderRadius: 10,
                      background: status === s ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${status === s ? "#6366f1" : "rgba(255,255,255,0.06)"}`,
                      color: status === s ? "#6366f1" : "#a0a0b0",
                      fontSize: 12, fontWeight: 600, cursor: "pointer",
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("startDate")}</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("endDate")}</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                  style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                <input type="checkbox" checked={monthly} onChange={e => setMonthly(e.target.checked)} style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 14, color: "#f0f0f5" }}>{t("monthly")}</span>
              </label>
            </div>

            {parents.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("linkToParent")}</label>
                <select value={parentId} onChange={e => setParentId(e.target.value)}
                  style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }}>
                  <option value="">{t("none")}</option>
                  {parents.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Invoice Upload */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("uploadAttachment")}</label>
              {invoiceImage ? (
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <img src={invoiceImage} alt="invoice" style={{ width: "100%", height: 100, objectFit: "cover" }} />
                  <button onClick={() => setInvoiceImage(null)} style={{
                    position: "absolute", top: 6, right: 6,
                    width: 28, height: 28, borderRadius: 8,
                    background: "rgba(0,0,0,0.6)", color: "#fff",
                    border: "none", cursor: "pointer", fontSize: 14,
                  }}>✕</button>
                </div>
              ) : (
                <label style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: 16, borderRadius: 12,
                  border: "2px dashed rgba(99,102,241,0.3)",
                  background: "rgba(99,102,241,0.03)",
                  color: "#6366f1", cursor: "pointer",
                }}>
                  📷 {t("uploadAttachment")}
                  <input type="file" accept="image/*" onChange={e => handleImageUpload(e.target.files[0])} style={{ display: "none" }} />
                </label>
              )}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {editing && (
                <button onClick={() => { deleteExpense(editing.id); setSheetOpen(false); showToast("Deleted", "info"); }} style={{
                  flex: 1, padding: 12, borderRadius: 12,
                  background: "rgba(244,63,94,0.1)", color: "#f43f5e",
                  fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
                }}>{t("delete")}</button>
              )}
              <button onClick={handleSave} style={{
                flex: 1, padding: 12, borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
              }}>{t("save")}</button>
            </div>
            {/* Spacer for keyboard */}
            <div style={{ height: 20 }} />
          </div>
        </div>
      )}
    </div>
  );
}

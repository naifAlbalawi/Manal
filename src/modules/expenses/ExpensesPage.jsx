import { useState, useMemo } from "react";
import { useApp } from "../../context/AppContext";
import { BottomSheet } from "../../components/BottomSheet";
import { ConfirmModal } from "../../components/ConfirmModal";
import { t, isRTL } from "../../utils/i18n";

function fmt(n, currency) {
  return `${currency}${Number(n || 0).toFixed(2)}`;
}

function daysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

export default function ExpensesPage() {
  const { state, addExpense, updateExpense, deleteExpense, addTag, showToast, currency, TODAY } = useApp();
  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagNameAr, setNewTagNameAr] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [confirmId, setConfirmId] = useState(null);
  const [linkSearch, setLinkSearch] = useState("");
  const rtl = isRTL();

  const tagMeta = (tagId) => state.tags.find(t => t.id === tagId) || { name: tagId, nameAr: tagId, color: "#888" };

  const filtered = useMemo(() => {
    let list = state.expenses;
    if (tagFilter !== "all") list = list.filter(e => e.tag === tagFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(e => (e.name || "").toLowerCase().includes(q));
    }
    return list;
  }, [state.expenses, tagFilter, search]);

  const filteredInvoices = useMemo(() => {
    if (!linkSearch.trim()) return [];
    const q = linkSearch.toLowerCase();
    return state.invoices
      .filter(i => (i.name || i.generatedName || "").toLowerCase().includes(q))
      .slice(0, 20);
  }, [linkSearch, state.invoices]);

  const handleSave = (item) => {
    if (!item.name.trim()) { showToast("Name required", "error"); return; }
    if (item.id && state.expenses.find(e => e.id === item.id)) updateExpense(item);
    else addExpense(item);
    setSheetOpen(false);
    setEditingItem(null);
    showToast("Saved", "success");
  };

  const openNew = () => {
    setEditingItem({
      id: "e_" + Date.now() + Math.random().toString(36).slice(2, 5),
      name: "", tag: state.tags[0]?.id || "consumables", amount: 0, monthly: 0,
      startDate: fmtDate(TODAY), days: 30, endDate: addDays(fmtDate(TODAY), 30),
      status: "", parentId: null, invoiceId: null, hasEndDate: true,
      attachment: null,
    });
    setLinkSearch("");
    setSheetOpen(true);
  };

  const saveNewTag = () => {
    if (!newTagName.trim()) return;
    const tag = {
      id: "tag_" + Date.now(),
      name: newTagName.trim(),
      nameAr: newTagNameAr.trim() || newTagName.trim(),
      color: newTagColor,
      statuses: [],
    };
    addTag(tag);
    showToast("Group added", "success");
    setTagSheetOpen(false);
    setNewTagName("");
    setNewTagNameAr("");
    setNewTagColor("#6366f1");
    if (editingItem) setEditingItem({ ...editingItem, tag: tag.id });
  };

  return (
    <div style={{ padding: "8px 0 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>
            <span className="text-gradient">{t("expenses")}</span>
          </h1>
          <div style={{ fontSize: 12, color: "#606070", marginTop: 2 }}>
            {filtered.length} {t("items")} · {currency}{filtered.reduce((s, r) => s + (r.amount || 0), 0).toFixed(0)} {t("total")}
          </div>
        </div>
        <button onClick={openNew} style={{
          width: 48, height: 48, borderRadius: 16,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          border: "none", color: "#fff", fontSize: 24, fontWeight: 300,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
        >+</button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("search")}
          style={{
            width: "100%", padding: "14px 18px 14px 44px", borderRadius: 16,
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.03)", color: "#f0f0f5",
            fontSize: 15, outline: "none", boxSizing: "border-box",
          }}
        />
        <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", color: "#505060", fontSize: 16 }}>🔍</span>
      </div>

      {/* Tag Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 4 }} className="hide-scrollbar">
        <button onClick={() => setTagFilter("all")} style={{
          padding: "8px 16px", borderRadius: 20,
          border: tagFilter === "all" ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
          background: tagFilter === "all" ? "rgba(255,255,255,0.08)" : "transparent",
          color: tagFilter === "all" ? "#f0f0f5" : "#505060",
          fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
          transition: "all 0.2s",
        }}>{t("all")}</button>
        {state.tags.map(tag => (
          <button key={tag.id} onClick={() => setTagFilter(tag.id)} style={{
            padding: "8px 16px", borderRadius: 20,
            border: tagFilter === tag.id ? `1px solid ${tag.color}66` : "1px solid rgba(255,255,255,0.06)",
            background: tagFilter === tag.id ? tag.color + "18" : "transparent",
            color: tagFilter === tag.id ? tag.color : "#505060",
            fontSize: 12, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            transition: "all 0.2s",
          }}>
            {rtl ? tag.nameAr : tag.name}
          </button>
        ))}
      </div>

      {/* View Toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["list", "board"].map(v => (
          <button key={v} onClick={() => setView(v)} style={{
            padding: "8px 16px", borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.06)",
            background: view === v ? "rgba(99,102,241,0.15)" : "transparent",
            color: view === v ? "#6366f1" : "#505060",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
            transition: "all 0.2s",
          }}>{t(v)}</button>
        ))}
      </div>

      {/* Content */}
      {view === "list" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((r, i) => {
            const tag = tagMeta(r.tag);
            const d = r.endDate ? daysBetween(TODAY, r.endDate) : null;
            const isUrgent = d !== null && d <= 7;
            return (
              <div key={r.id}
                onClick={() => { setEditingItem({ ...r }); setSheetOpen(true); setLinkSearch(""); }}
                style={{
                  background: "linear-gradient(145deg, rgba(26,26,36,0.6), rgba(17,17,24,0.8))",
                  borderRadius: 18,
                  border: isUrgent ? "1px solid rgba(244,63,94,0.2)" : "1px solid rgba(255,255,255,0.04)",
                  padding: 16, display: "flex", alignItems: "center", gap: 14,
                  cursor: "pointer", transition: "all 0.2s",
                  animationDelay: `${i * 40}ms`,
                }}
                className="animate-fade-in-up"
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = isUrgent ? "rgba(244,63,94,0.2)" : "rgba(255,255,255,0.04)"; }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: tag.color + "18",
                  border: `1px solid ${tag.color}22`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: tag.color, fontSize: 16, fontWeight: 700,
                  position: "relative",
                }}>
                  {r.attachment ? "📎" : (tag.name || "?").slice(0, 1)}
                  {isUrgent && (
                    <span style={{
                      position: "absolute", top: -2, right: -2,
                      width: 10, height: 10, borderRadius: "50%",
                      background: "#f43f5e",
                      boxShadow: "0 0 8px #f43f5e",
                    }} />
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: "#606070", marginTop: 2 }}>
                    {rtl ? tag.nameAr : tag.name} · {r.status || "-"}
                    {r.invoiceId && " 📎"}
                    {r.attachment && " 📄"}
                  </div>
                </div>
                <div style={{ textAlign: rtl ? "left" : "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#f0f0f5" }}>{fmt(r.amount, currency)}</div>
                  <div style={{ fontSize: 11, color: isUrgent ? "#f43f5e" : "#404050" }}>
                    {r.endDate ? `${d}d` : t("noEndDate")}
                  </div>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "#303040", padding: 48, fontSize: 14 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
              {t("noExpenses")}
            </div>
          )}
        </div>
      ) : (
        <BoardView records={filtered} currency={currency} onEdit={r => { setEditingItem({ ...r }); setSheetOpen(true); }} onDelete={id => setConfirmId(id)} tagMeta={tagMeta} />
      )}

      {/* Form Sheet */}
      <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={editingItem?.id && state.expenses.find(e => e.id === editingItem.id) ? t("edit") : t("add")}>
        {editingItem && (
          <ExpenseForm
            item={editingItem}
            tags={state.tags}
            parents={state.parents}
            invoices={state.invoices}
            currency={currency}
            linkSearch={linkSearch}
            setLinkSearch={setLinkSearch}
            filteredInvoices={filteredInvoices}
            onChange={setEditingItem}
            onSave={handleSave}
            onCancel={() => setSheetOpen(false)}
            showToast={showToast}
            onAddTag={() => setTagSheetOpen(true)}
          />
        )}
      </BottomSheet>

      {/* New Tag Sheet */}
      <BottomSheet open={tagSheetOpen} onClose={() => setTagSheetOpen(false)} title={t("newTag")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder={t("optionNameEn")}
            style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15 }} />
          <input value={newTagNameAr} onChange={e => setNewTagNameAr(e.target.value)} placeholder={t("optionNameAr")}
            style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ fontSize: 12, color: "#606070" }}>{t("color")}</label>
            <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} style={{ width: 60, height: 44, borderRadius: 10, border: "none", background: "none" }} />
          </div>
          <button onClick={saveNewTag} style={{
            padding: 16, borderRadius: 14, border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15,
            boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
          }}>{t("save")}</button>
        </div>
      </BottomSheet>

      <ConfirmModal open={!!confirmId} title={t("delete")} message={t("deleteConfirm")} 
        onConfirm={() => { deleteExpense(confirmId); setConfirmId(null); showToast("Deleted", "info"); }} 
        onCancel={() => setConfirmId(null)} />
    </div>
  );
}

function BoardView({ records, currency, onEdit, onDelete, tagMeta }) {
  const groups = {};
  records.forEach(r => { const k = r.status || "Other"; if (!groups[k]) groups[k] = []; groups[k].push(r); });
  const rtl = isRTL();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {Object.entries(groups).map(([key, items]) => (
        <div key={key}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#606070", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            {key} <span style={{ color: "#404050" }}>({items.length})</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {items.map(r => {
              const tag = tagMeta(r.tag);
              return (
                <div key={r.id} onClick={() => onEdit(r)} style={{
                  background: "linear-gradient(145deg, rgba(26,26,36,0.6), rgba(17,17,24,0.8))",
                  borderRadius: 16, border: "1px solid rgba(255,255,255,0.04)",
                  padding: 16, cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.04)"; }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: "#606070" }}>{rtl ? tag.nameAr : tag.name}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginTop: 10, color: tag.color }}>
                    {currency}{r.amount}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpenseForm({ item, tags, parents, invoices, currency, linkSearch, setLinkSearch, filteredInvoices, onChange, onSave, onCancel, showToast, onAddTag }) {
  const tag = tags.find(t => t.id === item.tag) || tags[0];
  const statuses = tag?.statuses || [];
  const rtl = isRTL();

  const updateField = (field, value) => {
    let next = { ...item, [field]: value };
    if (field === "hasEndDate" && !value) { next.endDate = null; next.days = 0; }
    else if (field === "hasEndDate" && value && !next.endDate) { next.endDate = new Date().toISOString().slice(0, 10); next.days = 0; }
    if ((field === "startDate" || field === "days") && next.hasEndDate !== false) {
      if (next.startDate && next.days !== undefined) next.endDate = addDays(next.startDate, parseInt(next.days || 0));
    } else if (field === "endDate" && next.hasEndDate !== false) {
      if (next.startDate && next.endDate) next.days = daysBetween(next.startDate, next.endDate);
    }
    onChange(next);
  };

  const linkedInvoice = invoices.find(i => i.id === item.invoiceId);

  const handleAttachment = async (file) => {
    if (!file) return;
    const base64 = await fileToBase64(file);
    const number = "ATT-" + Date.now().toString().slice(-6);
    updateField("attachment", {
      id: "att_" + Date.now(),
      name: file.name || t("attachment"),
      number,
      imageData: base64,
    });
    showToast(t("attached"), "success");
  };

  const removeAttachment = () => updateField("attachment", null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("name")}</label>
        <input value={item.name} onChange={e => updateField("name", e.target.value)} placeholder={t("name")}
          style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
      </div>

      <div>
        <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("tag")}</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {tags.map(t => (
            <button key={t.id} onClick={() => updateField("tag", t.id)} style={{
              padding: "8px 14px", borderRadius: 12,
              border: item.tag === t.id ? `1px solid ${t.color}66` : "1px solid rgba(255,255,255,0.06)",
              background: item.tag === t.id ? t.color + "18" : "rgba(255,255,255,0.02)",
              color: item.tag === t.id ? t.color : "#606070",
              fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
            }}>
              {rtl ? t.nameAr : t.name}
            </button>
          ))}
          <button onClick={onAddTag} style={{
            padding: "8px 14px", borderRadius: 12,
            border: "1px dashed rgba(99,102,241,0.4)",
            background: "transparent", color: "#6366f1",
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}>+ {t("addTag")}</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("amount")} ({currency})</label>
          <input value={item.amount} onChange={e => updateField("amount", parseFloat(e.target.value) || 0)} type="number" step="0.01"
            style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("monthly")} ({currency})</label>
          <input value={item.monthly} onChange={e => updateField("monthly", parseFloat(e.target.value) || 0)} type="number" step="0.01"
            style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
        <input type="checkbox" checked={item.hasEndDate !== false} onChange={e => updateField("hasEndDate", e.target.checked)}
          style={{ width: 20, height: 20, accentColor: "#6366f1" }} />
        <span style={{ fontSize: 14, color: "#a0a0b0" }}>{t("includeInTimeline")}</span>
      </label>

      {item.hasEndDate !== false && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("startDate")}</label>
              <input value={item.startDate || ""} onChange={e => updateField("startDate", e.target.value)} type="date"
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("days")}</label>
              <input value={item.days || 0} onChange={e => updateField("days", parseInt(e.target.value) || 0)} type="number"
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("endDate")}</label>
            <input value={item.endDate || ""} onChange={e => updateField("endDate", e.target.value)} type="date"
              style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
          </div>
        </>
      )}

      {statuses.length > 0 && (
        <div>
          <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("status")}</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {statuses.map(s => (
              <button key={s} onClick={() => updateField("status", s)} style={{
                padding: "8px 14px", borderRadius: 12,
                border: item.status === s ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
                background: item.status === s ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.02)",
                color: item.status === s ? "#f0f0f5" : "#606070",
                fontSize: 12, fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              }}>{s}</button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("linkToParent")}</label>
        <select value={item.parentId || ""} onChange={e => updateField("parentId", e.target.value || null)}
          style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15 }}>
          <option value="">—</option>
          {parents.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <div>
        <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 6, display: "block" }}>{t("linkToInvoice")}</label>
        {linkedInvoice ? (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: 12, borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)",
            background: "rgba(99,102,241,0.06)",
          }}>
            <span style={{ color: "#6366f1" }}>📎 {linkedInvoice.name || linkedInvoice.generatedName}</span>
            <button onClick={() => updateField("invoiceId", null)} style={{ background: "none", border: "none", color: "#f43f5e", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>{t("remove")}</button>
          </div>
        ) : (
          <>
            <input value={linkSearch} onChange={e => setLinkSearch(e.target.value)} placeholder={t("searchInvoice")}
              style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 14, width: "100%", boxSizing: "border-box" }} />
            {filteredInvoices.length > 0 && (
              <div style={{ marginTop: 6, border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
                {filteredInvoices.map(inv => (
                  <div key={inv.id} onClick={() => { updateField("invoiceId", inv.id); setLinkSearch(""); showToast(`Linked to ${inv.name || inv.generatedName}`, "success"); }}
                    style={{ padding: "10px 14px", cursor: "pointer", borderBottom: "1px solid rgba(255,255,255,0.03)", fontSize: 13, color: "#a0a0b0" }}>
                    {inv.name || inv.generatedName}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Attachment (No OCR) */}
      <div style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 16, background: "rgba(255,255,255,0.02)" }}>
        <label style={{ fontSize: 12, color: "#606070", fontWeight: 500, marginBottom: 10, display: "block" }}>{t("attachInvoice")}</label>
        {item.attachment ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
              }}>📄</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.attachment.name}</div>
                <div style={{ fontSize: 11, color: "#606070", fontFamily: "monospace" }}>{item.attachment.number}</div>
              </div>
              <button onClick={removeAttachment} style={{
                padding: "8px 14px", borderRadius: 10,
                border: "1px solid rgba(244,63,94,0.3)",
                background: "transparent", color: "#f43f5e",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}>{t("remove")}</button>
            </div>
            {item.attachment.imageData && (
              <img src={`data:image/jpeg;base64,${item.attachment.imageData}`} alt="attachment" 
                style={{ width: "100%", borderRadius: 12, maxHeight: 200, objectFit: "cover" }} />
            )}
          </div>
        ) : (
          <label style={{
            display: "block", padding: 16, borderRadius: 14,
            border: "1px dashed rgba(99,102,241,0.3)",
            background: "rgba(99,102,241,0.03)",
            color: "#6366f1", fontWeight: 700, cursor: "pointer",
            fontSize: 14, textAlign: "center", transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.06)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(99,102,241,0.03)"; }}
          >
            <input type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={e => handleAttachment(e.target.files[0])} />
            📷 {t("uploadAttachment")}
          </label>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button onClick={() => onSave(item)} style={{
          flex: 1, padding: 16, borderRadius: 14, border: "none",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15,
          boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
        }}>{t("save")}</button>
        <button onClick={onCancel} style={{
          flex: 1, padding: 16, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
          background: "transparent", color: "#606070", fontWeight: 700, cursor: "pointer", fontSize: 15,
        }}>{t("cancel")}</button>
      </div>
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

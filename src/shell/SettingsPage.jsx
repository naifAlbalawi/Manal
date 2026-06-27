import { useState } from "react";
import { useApp, MODULES } from "../context/AppContext";
import { t, isRTL, setLang, getLang } from "../utils/i18n";

const CURRENCIES = [
  { code: "$", name: "USD" },
  { code: "€", name: "EUR" },
  { code: "£", name: "GBP" },
  { code: "﷼", name: "SAR" },
  { code: "د.إ", name: "AED" },
  { code: "د.ك", name: "KWD" },
  { code: "ر.ع", name: "OMR" },
  { code: "ر.ق", name: "QAR" },
  { code: "د.ب", name: "BHD" },
];

function SettingRow({ label, children, onClick }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
      cursor: onClick ? "pointer" : "default",
    }}>
      <span style={{ fontSize: 15, color: "#f0f0f5" }}>{label}</span>
      {children}
    </div>
  );
}

function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      display: "flex", flexDirection: "column", justifyContent: "flex-end",
    }}>
      <div onClick={onClose} style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease",
      }} />
      <div style={{
        position: "relative", zIndex: 1,
        background: "linear-gradient(180deg, #1a1a24, #0a0a0f)",
        borderRadius: "28px 28px 0 0",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "24px 20px calc(20px + env(safe-area-inset-bottom))",
        animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        maxHeight: "80vh", overflow: "auto",
      }}>
        <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />
        <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#f0f0f5" }}>{title}</h3>
        {children}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { state, setSettings, resetData, showToast, setBudget, setPinnedServices, updateTag, removeTag } = useApp();
  const rtl = isRTL();
  const [showCurrency, setShowCurrency] = useState(false);
  const [budgetSheetOpen, setBudgetSheetOpen] = useState(false);
  const [pinSheetOpen, setPinSheetOpen] = useState(false);
  const [tagSheetOpen, setTagSheetOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [budgetInput, setBudgetInput] = useState((state.budget?.limit || 0).toString());
  const [tempPinned, setTempPinned] = useState(state.pinnedServices || ["expenses", "groceries"]);
  const [tagName, setTagName] = useState("");
  const [tagNameAr, setTagNameAr] = useState("");
  const [tagColor, setTagColor] = useState("#6366f1");
  const [tagStatuses, setTagStatuses] = useState("");

  const handleLangChange = (lang) => {
    setLang(lang);
    setSettings({ language: lang });
    showToast(lang === "ar" ? "تم تغيير اللغة" : "Language changed", "success");
  };

  const handleCurrencyChange = (curr) => {
    setSettings({ currency: curr.code });
    setShowCurrency(false);
    showToast("Currency updated", "success");
  };

  const handleBudgetSave = () => {
    const limit = parseFloat(budgetInput) || 0;
    setBudget({ limit, alerts: true });
    setBudgetSheetOpen(false);
    showToast("Budget saved", "success");
  };

  const togglePin = (id) => {
    if (tempPinned.includes(id)) {
      setTempPinned(tempPinned.filter(pid => pid !== id));
    } else if (tempPinned.length < 2) {
      setTempPinned([...tempPinned, id]);
    }
  };

  const savePinned = () => {
    setPinnedServices(tempPinned);
    setPinSheetOpen(false);
    showToast("Footer updated", "success");
  };

  const openTagEdit = (tag) => {
    setEditingTag(tag);
    setTagName(tag.name || "");
    setTagNameAr(tag.nameAr || "");
    setTagColor(tag.color || "#6366f1");
    setTagStatuses((tag.statuses || []).join(", "));
    setTagSheetOpen(true);
  };

  const saveTag = () => {
    if (!tagName.trim()) { showToast("Name required", "error"); return; }
    const updatedTag = {
      ...editingTag,
      name: tagName.trim(),
      nameAr: tagNameAr.trim(),
      color: tagColor,
      statuses: tagStatuses.split(",").map(s => s.trim()).filter(Boolean),
    };
    updateTag(updatedTag);
    setTagSheetOpen(false);
    setEditingTag(null);
    showToast("Category updated", "success");
  };

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `amal_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    showToast("Exported", "success");
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.expenses && data.settings) {
          setSettings({ ...data.settings });
          showToast("Imported", "success");
        } else {
          showToast("Invalid file", "error");
        }
      } catch {
        showToast("Invalid JSON", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{ padding: "8px 0 100px" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>{t("settings")}</h2>

      {/* Appearance */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "#606070", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{t("appearance")}</h3>

        <SettingRow label={t("language")}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => handleLangChange("en")} style={{
              padding: "8px 16px", borderRadius: 10,
              background: getLang() === "en" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${getLang() === "en" ? "#6366f1" : "rgba(255,255,255,0.06)"}`,
              color: getLang() === "en" ? "#6366f1" : "#a0a0b0",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>{t("english")}</button>
            <button onClick={() => handleLangChange("ar")} style={{
              padding: "8px 16px", borderRadius: 10,
              background: getLang() === "ar" ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.03)",
              border: `1px solid ${getLang() === "ar" ? "#6366f1" : "rgba(255,255,255,0.06)"}`,
              color: getLang() === "ar" ? "#6366f1" : "#a0a0b0",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>{t("arabic")}</button>
          </div>
        </SettingRow>

        <SettingRow label={t("currency")} onClick={() => setShowCurrency(!showCurrency)}>
          <span style={{ color: "#a0a0b0", fontSize: 14 }}>{state.settings?.currency || "$"}</span>
        </SettingRow>
        {showCurrency && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 0 16px" }}>
            {CURRENCIES.map(c => (
              <button key={c.code} onClick={() => handleCurrencyChange(c)} style={{
                padding: "10px 16px", borderRadius: 12,
                background: state.settings?.currency === c.code ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${state.settings?.currency === c.code ? "#6366f1" : "rgba(255,255,255,0.06)"}`,
                color: state.settings?.currency === c.code ? "#6366f1" : "#a0a0b0",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}>
                {c.code} {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Budget */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "#606070", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{t("budget")}</h3>
        <div onClick={() => setBudgetSheetOpen(true)} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
          cursor: "pointer",
        }}>
          <span style={{ fontSize: 15, color: "#f0f0f5" }}>{t("monthlyBudget")}</span>
          <span style={{ color: "#a0a0b0", fontSize: 14 }}>
            {state.budget?.limit > 0 ? `${state.settings?.currency || "$"}${state.budget.limit}` : t("setBudget")}
          </span>
        </div>
      </div>

      {/* Footer Services */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "#606070", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{t("footerSlots")}</h3>
        <div onClick={() => { setTempPinned(state.pinnedServices || ["expenses", "groceries"]); setPinSheetOpen(true); }} style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
          cursor: "pointer",
        }}>
          <span style={{ fontSize: 15, color: "#f0f0f5" }}>{t("selectServices")}</span>
          <span style={{ color: "#a0a0b0", fontSize: 14 }}>
            {(state.pinnedServices || ["expenses", "groceries"]).map(id => MODULES.find(m => m.id === id)?.name).join(", ")}
          </span>
        </div>
      </div>

      {/* Manage Categories / Sub-groups */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "#606070", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{t("manageTags")}</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {state.tags.map(tag => (
            <div key={tag.id} onClick={() => openTagEdit(tag)} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "14px 16px", borderRadius: 14,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              cursor: "pointer", transition: "all 0.2s",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: (tag.color || "#6366f1") + "20",
                border: `1px solid ${(tag.color || "#6366f1")}40`,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f5" }}>
                  {rtl ? (tag.nameAr || tag.name) : tag.name}
                </div>
                <div style={{ fontSize: 11, color: "#606070" }}>
                  {(tag.statuses || []).join(", ")}
                </div>
              </div>
              <span style={{ color: "#a0a0b0", fontSize: 14 }}>✎</span>
            </div>
          ))}
        </div>
      </div>

      {/* Data */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, color: "#606070", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>{t("data")}</h3>
        <SettingRow label={t("export")}>
          <button onClick={handleExport} style={{
            padding: "8px 16px", borderRadius: 10,
            background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)",
            color: "#6366f1", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>JSON</button>
        </SettingRow>
        <SettingRow label={t("import")}>
          <label style={{
            padding: "8px 16px", borderRadius: 10,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            color: "#a0a0b0", fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "inline-block",
          }}>
            JSON
            <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
          </label>
        </SettingRow>
        <SettingRow label={t("reset")}>
          <button onClick={() => { if (confirm(t("deleteConfirm"))) { resetData(); showToast("Reset", "info"); } }} style={{
            padding: "8px 16px", borderRadius: 10,
            background: "rgba(244,63,94,0.1)", border: "1px solid rgba(244,63,94,0.2)",
            color: "#f43f5e", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>{t("reset")}</button>
        </SettingRow>
      </div>

      {/* Version */}
      <div style={{ textAlign: "center", padding: "20px 0", color: "#404050", fontSize: 12 }}>
        {t("version")}
      </div>

      {/* Budget Sheet */}
      <BottomSheet open={budgetSheetOpen} onClose={() => setBudgetSheetOpen(false)} title={t("monthlyBudget")}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 8 }}>{t("budgetLimit")}</label>
          <input
            type="number"
            value={budgetInput}
            onChange={e => setBudgetInput(e.target.value)}
            placeholder="0"
            style={{
              width: "100%", padding: 14, borderRadius: 14,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(255,255,255,0.03)", color: "#f0f0f5",
              fontSize: 16, boxSizing: "border-box",
            }}
          />
        </div>
        <button onClick={handleBudgetSave} style={{
          width: "100%", padding: 14, borderRadius: 14,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", fontSize: 15, fontWeight: 700,
          border: "none", cursor: "pointer",
        }}>{t("save")}</button>
      </BottomSheet>

      {/* Pin Services Sheet */}
      <BottomSheet open={pinSheetOpen} onClose={() => setPinSheetOpen(false)} title={t("selectServices")}>
        <p style={{ fontSize: 13, color: "#606070", marginBottom: 16 }}>{t("footerSlots")}: 2</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {MODULES.filter(m => m.id !== "invoices").map(mod => {
            const isPinned = tempPinned.includes(mod.id);
            const canPin = isPinned || tempPinned.length < 2;
            return (
              <button key={mod.id} onClick={() => canPin && togglePin(mod.id)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 16px", borderRadius: 14,
                  background: isPinned ? `${mod.color}12` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isPinned ? mod.color + "44" : "rgba(255,255,255,0.06)"}`,
                  color: "#f0f0f5", textAlign: "left", cursor: canPin ? "pointer" : "not-allowed",
                  opacity: canPin ? 1 : 0.5,
                }}
              >
                <span style={{ fontSize: 20 }}>
                  {mod.icon === "Wallet" && "💳"}
                  {mod.icon === "Car" && "🚗"}
                  {mod.icon === "ShoppingCart" && "🛒"}
                  {mod.icon === "Receipt" && "🧾"}
                  {mod.icon === "Box" && "📦"}
                  {mod.icon === "Map" && "🗺️"}
                </span>
                <span style={{ flex: 1 }}>{rtl ? mod.nameAr : mod.name}</span>
                {isPinned && <span style={{ color: mod.color, fontSize: 14 }}>✓</span>}
              </button>
            );
          })}
        </div>
        <button onClick={savePinned} style={{
          width: "100%", padding: 14, borderRadius: 14,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff", fontSize: 15, fontWeight: 700,
          border: "none", cursor: "pointer",
        }}>{t("save")}</button>
      </BottomSheet>

      {/* Edit Tag Sheet */}
      <BottomSheet open={tagSheetOpen} onClose={() => setTagSheetOpen(false)} title={t("edit")}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("optionNameEn")}</label>
          <input value={tagName} onChange={e => setTagName(e.target.value)}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("optionNameAr")}</label>
          <input value={tagNameAr} onChange={e => setTagNameAr(e.target.value)}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("color")}</label>
          <input type="color" value={tagColor} onChange={e => setTagColor(e.target.value)}
            style={{ width: 60, height: 44, borderRadius: 10, border: "none", background: "none" }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("statuses")} ({t("commaSeparated")})</label>
          <input value={tagStatuses} onChange={e => setTagStatuses(e.target.value)}
            style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { removeTag(editingTag.id); setTagSheetOpen(false); showToast("Deleted", "info"); }} style={{
            flex: 1, padding: 14, borderRadius: 14,
            background: "rgba(244,63,94,0.1)", color: "#f43f5e",
            fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
          }}>{t("delete")}</button>
          <button onClick={saveTag} style={{
            flex: 1, padding: 14, borderRadius: 14,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
          }}>{t("save")}</button>
        </div>
      </BottomSheet>
    </div>
  );
}

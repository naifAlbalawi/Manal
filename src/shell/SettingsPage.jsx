import { useState } from "react";
import { useApp, MODULES } from "../context/AppContext";
import { t, isRTL } from "../utils/i18n";
import { exportData, importData } from "../utils/exportImport";
import { loadAIConfig, saveAIConfig, AI_PROVIDERS } from "../utils/aiConfig";
import { BottomSheet } from "../components/BottomSheet";

const CURRENCIES = ["$", "€", "£", "¥", "SAR", "AED", "QAR", "KWD", "BHD", "OMR", "EGP"];

function Section({ title, children, icon }) {
  return (
    <div style={{
      background: "linear-gradient(145deg, rgba(26,26,36,0.6), rgba(17,17,24,0.8))",
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 12,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "16px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f5" }}>{title}</span>
      </div>
      <div style={{ padding: "8px 0" }}>{children}</div>
    </div>
  );
}

function SettingRow({ label, value, onClick, children }) {
  return (
    <div onClick={onClick} style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "14px 20px", cursor: onClick ? "pointer" : "default",
      borderBottom: "1px solid rgba(255,255,255,0.03)",
      transition: "background 0.15s",
    }}
    onMouseEnter={e => { if (onClick) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
    onMouseLeave={e => { if (onClick) e.currentTarget.style.background = "transparent"; }}
    >
      <span style={{ fontSize: 14, color: "#a0a0b0" }}>{label}</span>
      {value && <span style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f5" }}>{value}</span>}
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { state, setSettings, replaceAll, resetData, showToast, updateTag, removeTag, addTag } = useApp();
  const [showCurrency, setShowCurrency] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiConfig, setAiConfig] = useState(loadAIConfig());
  const [tagFormOpen, setTagFormOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagNameAr, setNewTagNameAr] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6366f1");
  const [newTagStatuses, setNewTagStatuses] = useState("");
  const rtl = isRTL();

  const aiEnabled = state.settings.aiEnabled || false;
  const selectedProvider = AI_PROVIDERS.find(p => p.id === aiConfig.provider) || AI_PROVIDERS[0];

  const updateAI = (key, value) => {
    const next = { ...aiConfig, [key]: value };
    setAiConfig(next);
    saveAIConfig(next);
  };

  const saveAIToSettings = () => {
    setSettings({ aiEnabled });
    showToast(t("aiSaved"), "success");
  };

  const handleExport = () => { exportData(state); showToast("Exported", "success"); };
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try { const data = await importData(file); replaceAll(data); showToast("Imported", "success"); }
    catch (err) { showToast("Import failed", "error"); }
  };

  const openTagForm = (tag = null) => {
    if (tag) {
      setEditingTag(tag);
      setNewTagName(tag.name || "");
      setNewTagNameAr(tag.nameAr || "");
      setNewTagColor(tag.color || "#6366f1");
      setNewTagStatuses((tag.statuses || []).join(", "));
    } else {
      setEditingTag(null);
      setNewTagName("");
      setNewTagNameAr("");
      setNewTagColor("#6366f1");
      setNewTagStatuses("");
    }
    setTagFormOpen(true);
  };

  const saveTag = () => {
    if (!newTagName.trim()) { showToast("Name required", "error"); return; }
    const tag = {
      id: editingTag ? editingTag.id : "tag_" + Date.now(),
      name: newTagName.trim(),
      nameAr: newTagNameAr.trim() || newTagName.trim(),
      color: newTagColor,
      statuses: newTagStatuses.split(",").map(s => s.trim()).filter(Boolean),
    };
    if (editingTag) updateTag(tag);
    else addTag(tag);
    showToast("Saved", "success");
    setTagFormOpen(false);
    setEditingTag(null);
  };

  const deleteTag = (id) => {
    if (state.expenses.some(e => e.tag === id)) {
      showToast("Cannot delete: expenses linked", "warning");
      return;
    }
    removeTag(id);
    showToast("Deleted", "info");
  };

  return (
    <div style={{ padding: "8px 0 24px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 20, letterSpacing: "-0.5px" }}>
        <span className="text-gradient">{t("settings")}</span>
      </h1>

      {/* Appearance */}
      <Section title={t("language")} icon="🌐">
        <SettingRow label="">
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setSettings({ language: "en" }); window.location.reload(); }}
              style={{
                padding: "10px 18px", borderRadius: 12,
                border: state.settings.language === "en" ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
                background: state.settings.language === "en" ? "rgba(99,102,241,0.12)" : "transparent",
                color: state.settings.language === "en" ? "#6366f1" : "#a0a0b0",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>{t("english")}</button>
            <button onClick={() => { setSettings({ language: "ar" }); window.location.reload(); }}
              style={{
                padding: "10px 18px", borderRadius: 12,
                border: state.settings.language === "ar" ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.1)",
                background: state.settings.language === "ar" ? "rgba(99,102,241,0.12)" : "transparent",
                color: state.settings.language === "ar" ? "#6366f1" : "#a0a0b0",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>{t("arabic")}</button>
          </div>
        </SettingRow>
      </Section>

      {/* Currency */}
      <Section title={t("currency")} icon="💱">
        <SettingRow label={t("currency")} value={state.settings.currency} onClick={() => setShowCurrency(!showCurrency)} />
        {showCurrency && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "8px 20px 16px" }}>
            {CURRENCIES.map(c => (
              <button key={c} onClick={() => { setSettings({ currency: c }); setShowCurrency(false); showToast("Updated", "success"); }}
                style={{
                  padding: "10px 16px", borderRadius: 12,
                  border: state.settings.currency === c ? "1px solid #6366f1" : "1px solid rgba(255,255,255,0.08)",
                  background: state.settings.currency === c ? "rgba(99,102,241,0.12)" : "transparent",
                  color: state.settings.currency === c ? "#6366f1" : "#a0a0b0",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}>{c}</button>
            ))}
          </div>
        )}
      </Section>

      {/* Manage Categories */}
      <Section title={t("manageTags")} icon="🏷️">
        <div style={{ padding: "0 20px 12px" }}>
          <button onClick={() => openTagForm()} style={{
            width: "100%", padding: "12px", borderRadius: 14,
            border: "1px dashed rgba(99,102,241,0.4)",
            background: "rgba(99,102,241,0.06)",
            color: "#6366f1", fontWeight: 700, fontSize: 13,
            cursor: "pointer", marginBottom: 12,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>+ {t("addTag")}</button>

          {state.tags.map(tag => (
            <div key={tag.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.03)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: 6,
                  background: tag.color,
                  boxShadow: `0 0 8px ${tag.color}44`,
                }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f5" }}>{rtl ? tag.nameAr : tag.name}</div>
                  <div style={{ fontSize: 11, color: "#505060" }}>{rtl ? tag.name : tag.nameAr}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => openTagForm(tag)} style={{
                  padding: "6px 12px", borderRadius: 8,
                  border: "1px solid rgba(99,102,241,0.3)",
                  background: "transparent", color: "#6366f1",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{t("edit")}</button>
                <button onClick={() => deleteTag(tag.id)} style={{
                  padding: "6px 12px", borderRadius: 8,
                  border: "1px solid rgba(244,63,94,0.3)",
                  background: "transparent", color: "#f43f5e",
                  fontSize: 12, fontWeight: 600, cursor: "pointer",
                }}>{t("delete")}</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* AI Settings */}
      <Section title={t("aiSettings")} icon="🤖">
        <SettingRow label={t("enableAI")}>
          <button onClick={() => { setSettings({ aiEnabled: !aiEnabled }); }}
            style={{
              width: 48, height: 28, borderRadius: 14, border: "none", cursor: "pointer",
              background: aiEnabled ? "#10b981" : "rgba(255,255,255,0.1)",
              position: "relative", transition: "background 0.25s",
            }}>
            <span style={{
              position: "absolute", top: 2, left: aiEnabled ? 22 : 2,
              width: 24, height: 24, borderRadius: 12, background: "#fff",
              transition: "left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }} />
          </button>
        </SettingRow>
        {aiEnabled && (
          <div style={{ padding: "8px 20px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: "#606070", marginBottom: 6, display: "block" }}>{t("aiProvider")}</label>
              <select value={aiConfig.provider} onChange={e => updateAI("provider", e.target.value)}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 14 }}>
                {AI_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            {aiConfig.provider === "custom" && (
              <div>
                <label style={{ fontSize: 12, color: "#606070", marginBottom: 6, display: "block" }}>{t("customEndpoint")}</label>
                <input value={aiConfig.customBaseUrl || ""} onChange={e => updateAI("customBaseUrl", e.target.value)} placeholder="https://api.example.com/v1"
                  style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 14, width: "100%", boxSizing: "border-box" }} />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, color: "#606070", marginBottom: 6, display: "block" }}>{t("model")}</label>
              <input value={aiConfig.model || ""} onChange={e => updateAI("model", e.target.value)} placeholder={selectedProvider.defaultModel}
                style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 14, width: "100%", boxSizing: "border-box" }} />
              <div style={{ fontSize: 11, color: "#404050", marginTop: 4 }}>Default: {selectedProvider.defaultModel}</div>
            </div>
            <div>
              <label style={{ fontSize: 12, color: "#606070", marginBottom: 6, display: "block" }}>{t("apiKey")}</label>
              <input type="password" value={aiConfig.apiKey || ""} onChange={e => updateAI("apiKey", e.target.value)} placeholder="sk-..."
                style={{ padding: 12, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 14, width: "100%", boxSizing: "border-box" }} />
            </div>
            <button onClick={saveAIToSettings} style={{
              padding: 14, borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15,
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            }}>{t("saveAI")}</button>
          </div>
        )}
      </Section>

      {/* Data */}
      <Section title="Data" icon="💾">
        <div style={{ padding: "8px 20px 16px", display: "flex", gap: 10 }}>
          <button onClick={handleExport} style={{
            flex: 1, padding: 14, borderRadius: 14,
            border: "1px solid rgba(99,102,241,0.3)",
            background: "rgba(99,102,241,0.06)", color: "#6366f1",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
          }}>{t("export")} JSON</button>
          <label style={{
            flex: 1, padding: 14, borderRadius: 14,
            border: "1px solid rgba(16,185,129,0.3)",
            background: "rgba(16,185,129,0.06)", color: "#10b981",
            fontWeight: 700, fontSize: 14, cursor: "pointer",
            textAlign: "center", display: "block",
          }}>
            <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
            {t("import")} JSON
          </label>
        </div>
        <button onClick={() => { if (confirm("Reset all data?")) { resetData(); showToast("Reset", "info"); } }} style={{
          width: "100%", padding: 16, border: "none",
          background: "transparent", color: "#f43f5e",
          fontWeight: 700, cursor: "pointer", fontSize: 14,
        }}>{t("reset")}</button>
      </Section>

      <div style={{ textAlign: "center", color: "#303040", fontSize: 12, padding: "24px 0" }}>{t("version")}</div>

      {/* Tag Form BottomSheet */}
      <BottomSheet open={tagFormOpen} onClose={() => setTagFormOpen(false)} title={editingTag ? t("edit") : t("newTag")}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#606070", marginBottom: 6, display: "block" }}>{t("optionNameEn")}</label>
            <input value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder={t("tagName")}
              style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#606070", marginBottom: 6, display: "block" }}>{t("optionNameAr")}</label>
            <input value={newTagNameAr} onChange={e => setNewTagNameAr(e.target.value)} placeholder={t("tagNameAr")}
              style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label style={{ fontSize: 12, color: "#606070" }}>{t("color")}</label>
            <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} style={{ width: 60, height: 44, borderRadius: 10, border: "none", background: "none" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#606070", marginBottom: 6, display: "block" }}>{t("statuses")} ({t("commaSeparated")})</label>
            <input value={newTagStatuses} onChange={e => setNewTagStatuses(e.target.value)} placeholder="Low, OK, Stocked"
              style={{ padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, width: "100%", boxSizing: "border-box" }} />
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button onClick={saveTag} style={{
              flex: 1, padding: 16, borderRadius: 14, border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 15,
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
            }}>{t("save")}</button>
            <button onClick={() => setTagFormOpen(false)} style={{
              flex: 1, padding: 16, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)",
              background: "transparent", color: "#606070", fontWeight: 700, cursor: "pointer", fontSize: 15,
            }}>{t("cancel")}</button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

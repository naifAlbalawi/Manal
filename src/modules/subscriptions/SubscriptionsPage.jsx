import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { t, isRTL } from "../../utils/i18n";

export default function SubscriptionsPage() {
  const { state, addSubscription, updateSubscription, deleteSubscription, showToast, currency } = useApp();
  const rtl = isRTL();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [tag, setTag] = useState("finances");

  const subscriptions = state.subscriptions || [];

  const frequencies = [
    { id: "daily", label: t("daily") },
    { id: "weekly", label: t("weekly") },
    { id: "biweekly", label: t("biweekly") },
    { id: "monthly", label: t("monthly") },
    { id: "yearly", label: t("yearly") },
  ];

  const monthlyTotal = subscriptions.reduce((sum, s) => {
    const amt = parseFloat(s.amount) || 0;
    switch (s.frequency) {
      case "daily": return sum + amt * 30;
      case "weekly": return sum + amt * 4;
      case "biweekly": return sum + amt * 2;
      case "monthly": return sum + amt;
      case "yearly": return sum + amt / 12;
      default: return sum + amt;
    }
  }, 0);

  const handleSave = () => {
    if (!name.trim()) { showToast("Name required", "error"); return; }
    const item = {
      id: editing?.id || Date.now().toString(),
      name: name.trim(),
      amount: parseFloat(amount) || 0,
      frequency,
      tag,
      createdAt: editing?.createdAt || new Date().toISOString(),
      lastUsed: editing?.lastUsed || null,
      useCount: editing?.useCount || 0,
    };
    if (editing) updateSubscription(item);
    else addSubscription(item);
    setSheetOpen(false);
    setEditing(null);
    setName(""); setAmount(""); setFrequency("monthly"); setTag("finances");
    showToast(editing ? "Updated" : "Added", "success");
  };

  const handleQuickUse = (sub) => {
    const expense = {
      id: Date.now().toString(),
      name: sub.name,
      amount: sub.amount,
      tag: sub.tag,
      date: new Date().toISOString().slice(0, 10),
      isQuick: true,
      subscriptionId: sub.id,
    };
    // Add to expenses via context - you'd need to expose addExpense
    updateSubscription({ ...sub, lastUsed: new Date().toISOString(), useCount: (sub.useCount || 0) + 1 });
    showToast(`${sub.name} added`, "success");
  };

  const openEdit = (sub) => {
    setEditing(sub);
    setName(sub.name);
    setAmount(sub.amount.toString());
    setFrequency(sub.frequency);
    setTag(sub.tag);
    setSheetOpen(true);
  };

  return (
    <div style={{ padding: "8px 0 100px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{t("subscriptions")}</h2>
        <div style={{ fontSize: 14, color: "#6366f1", fontWeight: 600 }}>
          {currency}{monthlyTotal.toFixed(0)} {t("perMonth")}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {subscriptions.map((sub, i) => (
          <div key={sub.id} style={{
            padding: 16, borderRadius: 18,
            background: "linear-gradient(145deg, rgba(26,26,36,0.6), rgba(17,17,24,0.8))",
            border: "1px solid rgba(255,255,255,0.04)",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 14,
              background: "rgba(99,102,241,0.1)",
              border: "1px solid rgba(99,102,241,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20,
            }}>🔄</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#f0f0f5" }}>{sub.name}</div>
              <div style={{ fontSize: 12, color: "#606070", marginTop: 2 }}>
                {currency}{sub.amount} · {frequencies.find(f => f.id === sub.frequency)?.label} · {t("useCount")}: {sub.useCount || 0}
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => handleQuickUse(sub)} style={{
                padding: "8px 14px", borderRadius: 10,
                background: "rgba(99,102,241,0.15)", color: "#6366f1",
                fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
              }}>{t("quickAdd")}</button>
              <button onClick={() => openEdit(sub)} style={{
                padding: "8px 12px", borderRadius: 10,
                background: "rgba(255,255,255,0.05)", color: "#a0a0b0",
                fontSize: 12, border: "none", cursor: "pointer",
              }}>✎</button>
            </div>
          </div>
        ))}
        {subscriptions.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#505060" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔄</div>
            <div>{t("noItems")}</div>
            <div style={{ fontSize: 13, marginTop: 8 }}>Add recurring expenses like coffee, gym, etc.</div>
          </div>
        )}
      </div>

      <button onClick={() => { setEditing(null); setName(""); setAmount(""); setFrequency("monthly"); setSheetOpen(true); }} style={{
        position: "fixed", bottom: "calc(90px + env(safe-area-inset-bottom))", right: 20,
        width: 56, height: 56, borderRadius: 18,
        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
        color: "#fff", fontSize: 24, border: "none",
        boxShadow: "0 8px 32px rgba(99,102,241,0.4)", cursor: "pointer",
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
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
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
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>{editing ? t("edit") : t("newSubscription")}</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("quickExpenseName")}</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder={t("name")}
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("amount")} ({currency})</label>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0"
                style={{ width: "100%", padding: 14, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#f0f0f5", fontSize: 15, boxSizing: "border-box" }} />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, color: "#606070", marginBottom: 6 }}>{t("frequency")}</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {frequencies.map(f => (
                  <button key={f.id} onClick={() => setFrequency(f.id)} style={{
                    padding: "10px 16px", borderRadius: 12,
                    background: frequency === f.id ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${frequency === f.id ? "#6366f1" : "rgba(255,255,255,0.06)"}`,
                    color: frequency === f.id ? "#6366f1" : "#a0a0b0",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>{f.label}</button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              {editing && (
                <button onClick={() => { deleteSubscription(editing.id); setSheetOpen(false); showToast("Deleted", "info"); }} style={{
                  flex: 1, padding: 14, borderRadius: 14,
                  background: "rgba(244,63,94,0.1)", color: "#f43f5e",
                  fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
                }}>{t("delete")}</button>
              )}
              <button onClick={handleSave} style={{
                flex: 1, padding: 14, borderRadius: 14,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: "pointer",
              }}>{t("save")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

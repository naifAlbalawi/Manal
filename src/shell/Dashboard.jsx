import { useMemo } from "react";
import { useApp, MODULES } from "../context/AppContext";
import { t, isRTL } from "../utils/i18n";
import { Link } from "react-router-dom";

function Card({ children, style = {}, onClick, accent }) {
  return (
    <div onClick={onClick} style={{
      background: "linear-gradient(145deg, rgba(26,26,36,0.8), rgba(17,17,24,0.9))",
      borderRadius: 20,
      border: "1px solid rgba(255,255,255,0.06)",
      padding: 20,
      position: "relative",
      overflow: "hidden",
      transition: "all 0.3s ease",
      cursor: onClick ? "pointer" : "default",
      ...style,
    }}
    onMouseEnter={onClick ? e => { e.currentTarget.style.borderColor = (accent || "rgba(255,255,255,0.12)"); e.currentTarget.style.transform = "translateY(-2px)"; } : undefined}
    onMouseLeave={onClick ? e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "none"; } : undefined}
    >
      {accent && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
          opacity: 0.6,
        }} />
      )}
      {children}
    </div>
  );
}

function StatCard({ label, value, subtext, color, icon, delay }) {
  return (
    <Card accent={color} style={{ animationDelay: `${delay}ms` }} className="animate-fade-in-up">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 14,
          background: color + "18",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20,
        }}>
          {icon}
        </div>
        <span style={{
          fontSize: 11, color: "#606070", fontWeight: 600,
          background: "rgba(255,255,255,0.03)", padding: "4px 10px", borderRadius: 8,
        }}>{label}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#f0f0f5", marginBottom: 4, letterSpacing: "-0.5px" }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: "#606070" }}>{subtext}</div>
    </Card>
  );
}

function ModuleCard({ mod, index }) {
  const rtl = isRTL();
  const expenseCount = mod.id === "expenses" ? useApp().state.expenses.length :
                       mod.id === "fleet" ? (useApp().state.fleet?.cars?.length || 0) :
                       mod.id === "invoices" ? useApp().state.invoices.length :
                       mod.id === "groceries" ? (useApp().state.groceries?.lists?.length || 0) : 0;

  return (
    <Card 
      accent={mod.color}
      style={{ animationDelay: `${300 + index * 80}ms` }}
      className="animate-fade-in-up"
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 16,
          background: `linear-gradient(135deg, ${mod.color}22, ${mod.color}08)`,
          border: `1px solid ${mod.color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>
          {mod.icon === "Wallet" && "💳"}
          {mod.icon === "Car" && "🚗"}
          {mod.icon === "ShoppingCart" && "🛒"}
          {mod.icon === "Receipt" && "🧾"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#f0f0f5", marginBottom: 2 }}>
            {rtl ? mod.nameAr : mod.name}
          </div>
          <div style={{ fontSize: 12, color: "#606070" }}>
            {expenseCount} {t("items")}
          </div>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: "rgba(255,255,255,0.04)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#606070", fontSize: 14,
        }}>
          →
        </div>
      </div>
      {/* Mini sparkline placeholder */}
      <div style={{ marginTop: 14, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
        <div style={{
          width: `${40 + Math.random() * 50}%`, height: "100%", borderRadius: 2,
          background: `linear-gradient(90deg, ${mod.color}66, ${mod.color})`,
        }} />
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { state, currency, monthly, TODAY } = useApp();
  const rtl = isRTL();

  const urgentCount = useMemo(() => 
    state.expenses.filter(e => e.endDate && daysBetween(TODAY, e.endDate) <= 7).length,
  [state.expenses, TODAY]);

  const activeCount = state.expenses.length;

  return (
    <div style={{ padding: "8px 0 24px" }}>
      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <StatCard 
          label={t("monthlySpend")}
          value={`${currency}${monthly.toFixed(0)}`}
          subtext={t("perMonth")}
          color="#6366f1"
          icon="💰"
          delay={0}
        />
        <StatCard 
          label={t("activeItems")}
          value={activeCount}
          subtext={t("tracking")}
          color="#10b981"
          icon="📊"
          delay={80}
        />
        <StatCard 
          label={t("upcomingEvents")}
          value={urgentCount}
          subtext={t("urgent")}
          color={urgentCount > 0 ? "#f43f5e" : "#f59e0b"}
          icon="⏰"
          delay={160}
        />
        <StatCard 
          label={t("budgetHealth")}
          value="92%"
          subtext={t("good")}
          color="#22d3ee"
          icon="❤️"
          delay={240}
        />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t("quickActions")}</h2>
        </div>
        <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }} className="hide-scrollbar">
          {[
            { label: t("add") + " " + t("expenses"), color: "#6366f1", icon: "+", action: "expenses" },
            { label: t("add") + " " + t("fleet"), color: "#f59e0b", icon: "+", action: "fleet" },
            { label: t("add") + " " + t("groceries"), color: "#10b981", icon: "+", action: "groceries" },
            { label: t("invoices"), color: "#f43f5e", icon: "🧾", action: "invoices" },
          ].map((action, i) => (
            <button key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 18px", borderRadius: 16,
              background: color + "12",
              border: `1px solid ${action.color}22`,
              color: "#f0f0f5", fontSize: 13, fontWeight: 600,
              whiteSpace: "nowrap", cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = action.color + "20"; }}
            onMouseLeave={e => { e.currentTarget.style.background = action.color + "12"; }}
            >
              <span style={{ color: action.color }}>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t("overview")}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {MODULES.map((mod, i) => (
            <ModuleCard key={mod.id} mod={mod} index={i} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t("recentActivity")}</h2>
          <span style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, cursor: "pointer" }}>{t("seeAll")}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {state.expenses.slice(-5).reverse().map((exp, i) => {
            const tag = state.tags.find(t => t.id === exp.tag);
            return (
              <div key={exp.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", borderRadius: 16,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                animationDelay: `${500 + i * 60}ms`,
              }} className="animate-fade-in-up">
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: (tag?.color || "#6366f1") + "18",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14,
                }}>
                  {tag?.icon || "◆"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {exp.name}
                  </div>
                  <div style={{ fontSize: 11, color: "#606070" }}>
                    {rtl ? tag?.nameAr : tag?.name} · {exp.date || exp.startDate}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: tag?.color || "#f0f0f5" }}>
                  {currency}{exp.amount}
                </div>
              </div>
            );
          })}
          {state.expenses.length === 0 && (
            <div style={{ textAlign: "center", color: "#404050", padding: 32, fontSize: 14 }}>
              {t("noExpenses")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function daysBetween(a, b) {
  if (!a || !b) return 0;
  return Math.max(0, Math.round((new Date(b) - new Date(a)) / 86400000));
}

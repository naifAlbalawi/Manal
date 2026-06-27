import { useMemo } from "react";
import { useApp, MODULES } from "../context/AppContext";
import { t, isRTL } from "../utils/i18n";

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
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 12,
          background: `linear-gradient(135deg, ${color}22, ${color}08)`,
          border: `1px solid ${color}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          {icon}
        </div>
        <div style={{ fontSize: 12, color: "#606070", fontWeight: 500 }}>{label}</div>
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: "#f0f0f5", letterSpacing: "-0.5px" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#505060", marginTop: 4 }}>{subtext}</div>
    </Card>
  );
}

function ModuleCard({ mod, index, onClick }) {
  const rtl = isRTL();
  const { state } = useApp();
  const expenseCount = mod.id === "expenses" ? state.expenses.length :
                       mod.id === "fleet" ? (state.fleet?.cars?.length || 0) :
                       mod.id === "invoices" ? state.invoices.length :
                       mod.id === "groceries" ? (state.groceries?.lists?.length || 0) :
                       mod.id === "assets" ? (state.assets?.items?.length || 0) :
                       mod.id === "houseMap" ? (state.houseMap?.rooms?.length || 0) : 0;

  return (
    <Card 
      accent={mod.color}
      onClick={onClick}
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
          {mod.icon === "Box" && "📦"}
          {mod.icon === "Map" && "🗺️"}
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
      <div style={{ marginTop: 14, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.03)", overflow: "hidden" }}>
        <div style={{
          width: `${40 + Math.random() * 50}%`, height: "100%", borderRadius: 2,
          background: `linear-gradient(90deg, ${mod.color}66, ${mod.color})`,
        }} />
      </div>
    </Card>
  );
}

export default function Dashboard({ setPage }) {
  const { state, currency, monthly, TODAY, budgetUsed } = useApp();
  const rtl = isRTL();

  const urgentCount = useMemo(() =>
    state.expenses.filter(e => e.endDate && daysBetween(TODAY, e.endDate) <= 7).length,
  [state.expenses, TODAY]);

  const activeCount = state.expenses.length;
  const budgetHealth = state.budget?.limit > 0 
    ? Math.max(0, 100 - budgetUsed) 
    : 92;

  return (
    <div style={{ padding: "8px 0 24px" }}>
      {/* Stats Row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: 12, 
        marginBottom: 20 
      }}>
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
          value={`${budgetHealth}%`} 
          subtext={budgetHealth > 80 ? "Good" : budgetHealth > 50 ? "OK" : "Warning"}
          color={budgetHealth > 80 ? "#10b981" : budgetHealth > 50 ? "#f59e0b" : "#f43f5e"}
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
            { label: t("add") + " " + t("expenses"), color: "#6366f1", icon: "+", page: "expenses" },
            { label: t("add") + " " + t("fleet"), color: "#f59e0b", icon: "+", page: "fleet" },
            { label: t("add") + " " + t("groceries"), color: "#10b981", icon: "+", page: "groceries" },
            { label: t("invoices"), color: "#f43f5e", icon: "🧾", page: "invoices" },
          ].map((action, i) => (
            <button key={i} onClick={() => setPage(action.page)} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "12px 18px", borderRadius: 16,
              background: action.color + "12",
              border: `1px solid ${action.color}22`,
              color: action.color,
              fontSize: 13, fontWeight: 600,
              whiteSpace: "nowrap", transition: "all 0.2s",
              cursor: "pointer", flexShrink: 0,
            }}>
              <span style={{ fontSize: 16 }}>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Modules Grid */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>{t("overview")}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {MODULES.map((mod, i) => (
            <ModuleCard 
              key={mod.id} 
              mod={mod} 
              index={i} 
              onClick={() => setPage(mod.route)}
            />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t("recentActivity")}</h2>
          <button onClick={() => setPage("expenses")} style={{ fontSize: 12, color: "#6366f1", background: "none" }}>{t("seeAll")}</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {state.expenses.slice(-5).reverse().map((exp, i) => {
            const tag = state.tags.find(t => t.id === exp.tag);
            return (
              <div key={exp.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px", borderRadius: 16,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.04)",
                animationDelay: `${i * 40}ms`,
              }} className="animate-fade-in-up">
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: (tag?.color || "#6366f1") + "15",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: tag?.color || "#6366f1",
                }}>
                  {tag?.icon || "◆"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f0f5" }}>{exp.name}</div>
                  <div style={{ fontSize: 11, color: "#505060", marginTop: 2 }}>
                    {rtl ? tag?.nameAr : tag?.name} · {exp.date || exp.startDate}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#f0f0f5" }}>
                  {currency}{exp.amount}
                </div>
              </div>
            );
          })}
          {state.expenses.length === 0 && (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#505060" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
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

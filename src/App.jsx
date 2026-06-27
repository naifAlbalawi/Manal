import { useState, useEffect, lazy, Suspense } from "react";
import { AppProvider, useApp, MODULES } from "./context/AppContext";
import { loadLang, t, isRTL } from "./utils/i18n";
import Logo from "./components/Logo";
import { Toast } from "./components/Toast";

// Lazy load pages for modular architecture
const Dashboard = lazy(() => import("./shell/Dashboard"));
const ExpensesPage = lazy(() => import("./modules/expenses/ExpensesPage"));
const InvoicesPage = lazy(() => import("./modules/invoices/InvoicesPage"));
const FleetPage = lazy(() => import("./modules/fleet/FleetPage"));
const GroceriesPage = lazy(() => import("./modules/groceries/GroceriesPage"));
const SettingsPage = lazy(() => import("./shell/SettingsPage"));

// Module icon mapping
const ICONS = {
  Wallet: ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 7v11a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Car: ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  ShoppingCart: ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  Receipt: ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8H8"/><path d="M16 12H8"/><path d="M10 16H8"/></svg>,
  Home: ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Settings: ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>,
  Sparkles: ({s,c}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M9 5H5"/><path d="M19 10v4"/><path d="M21 12h-4"/></svg>,
};

function ModuleIcon({ name, size = 20, color = "currentColor" }) {
  const Icon = ICONS[name];
  return Icon ? <Icon s={size} c={color} /> : <span style={{ fontSize: size }}>◆</span>;
}

function LoadingScreen() {
  return (
    <div style={{
      minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 20,
      background: "#0a0a0f",
    }}>
      <Logo size={80} animated />
      <div style={{
        width: 120, height: 3, borderRadius: 2,
        background: "rgba(99,102,241,0.15)", overflow: "hidden",
      }}>
        <div style={{
          width: "40%", height: "100%", borderRadius: 2,
          background: "linear-gradient(90deg, #6366f1, #22d3ee)",
          animation: "shimmer 1.5s ease-in-out infinite",
          backgroundSize: "200% 100%",
        }} />
      </div>
    </div>
  );
}

function AppShell() {
  const [page, setPage] = useState("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);
  const { toast, showToast, activeModule, setActiveModule, state } = useApp();
  const rtl = isRTL();

  useEffect(() => { loadLang(); }, []);

  const mainModules = MODULES.slice(0, 3);
  const moreModules = MODULES.slice(3);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "expenses": return <ExpensesPage />;
      case "fleet": return <FleetPage />;
      case "groceries": return <GroceriesPage />;
      case "invoices": return <InvoicesPage />;
      case "settings": return <SettingsPage />;
      default: return <Dashboard />;
    }
  };

  const navItems = [
    { id: "dashboard", icon: "Home", label: t("dashboard") },
    ...mainModules.map(m => ({ id: m.route, icon: m.icon, label: rtl ? m.nameAr : m.name, color: m.color })),
    { id: "more", icon: "Sparkles", label: t("more"), isMore: true },
    { id: "settings", icon: "Settings", label: t("settings") },
  ];

  return (
    <div style={{
      minHeight: "100dvh",
      background: "#0a0a0f",
      color: "#f0f0f5",
      paddingBottom: "calc(80px + env(safe-area-inset-bottom))",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient background glow */}
      <div style={{
        position: "fixed", top: "-20%", right: "-10%",
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: "10%", left: "-10%",
        width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 70%)",
        pointerEvents: "none", zIndex: 0,
      }} />

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "linear-gradient(180deg, rgba(10,10,15,0.95) 0%, rgba(10,10,15,0.8) 60%, transparent 100%)",
        backdropFilter: "blur(12px)",
        padding: "12px 20px 8px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo size={40} />
          <div>
            <div style={{ fontSize: 11, color: "#606070", fontWeight: 500, letterSpacing: 1 }}>{t("welcomeBack")}</div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: 0.5 }}>
              <span className="text-gradient">AMAL</span>
            </div>
          </div>
        </div>
        <button onClick={() => setPage("settings")} style={{
          width: 40, height: 40, borderRadius: 14,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#a0a0b0", transition: "all 0.2s",
        }}>
          <ModuleIcon name="Settings" size={18} />
        </button>
      </header>

      {/* Main Content */}
      <main style={{ position: "relative", zIndex: 1, padding: "0 16px" }}>
        <Suspense fallback={<LoadingScreen />}>
          <div className="page-enter page-enter-active">
            {renderPage()}
          </div>
        </Suspense>
      </main>

      {/* More Services Sheet */}
      {moreOpen && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 180,
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
        }}>
          <div onClick={() => setMoreOpen(false)} style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)", animation: "fadeIn 0.2s ease",
          }} />
          <div style={{
            position: "relative", zIndex: 1,
            background: "linear-gradient(180deg, #151520, #0a0a0f)",
            borderRadius: "28px 28px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "24px 20px calc(100px + env(safe-area-inset-bottom))",
            animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
            <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px" }} />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, color: "#f0f0f5" }}>{t("more")}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {moreModules.map(mod => (
                <button key={mod.id} onClick={() => { setPage(mod.route); setMoreOpen(false); }}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                    padding: "20px 16px", borderRadius: 20,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: "#f0f0f5", transition: "all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = mod.color + "44"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 16,
                    background: mod.color + "18",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <ModuleIcon name={mod.icon} size={24} color={mod.color} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{rtl ? mod.nameAr : mod.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}>
        <div style={{
          background: "linear-gradient(to top, rgba(10,10,15,0.98), rgba(10,10,15,0.85))",
          backdropFilter: "blur(24px) saturate(1.4)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex", alignItems: "center", justifyContent: "space-around",
          height: 72, padding: "0 8px",
          position: "relative",
        }}>
          {navItems.map((item, idx) => {
            const active = page === item.id || (item.isMore && moreOpen);
            const isCenter = idx === 2;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isMore) { setMoreOpen(!moreOpen); }
                  else { setPage(item.id); setMoreOpen(false); }
                }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 4, position: "relative",
                  width: isCenter ? 64 : 56, height: isCenter ? 64 : 56,
                  borderRadius: isCenter ? 20 : 14,
                  background: isCenter 
                    ? (active ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "linear-gradient(135deg, #6366f1, #8b5cf6)")
                    : active ? "rgba(255,255,255,0.06)" : "transparent",
                  border: isCenter ? "none" : active ? "1px solid rgba(255,255,255,0.1)" : "1px solid transparent",
                  color: isCenter ? "#fff" : active ? (item.color || "#f0f0f5") : "#505060",
                  fontSize: 10, fontWeight: active ? 700 : 500,
                  transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform: isCenter ? "translateY(-16px)" : "none",
                  boxShadow: isCenter 
                    ? "0 8px 32px rgba(99,102,241,0.4), 0 0 0 4px rgba(99,102,241,0.1)"
                    : active ? `0 0 16px ${(item.color || "#6366f1")}22` : "none",
                }}
              >
                <ModuleIcon 
                  name={item.icon} 
                  size={isCenter ? 26 : 20} 
                  color={isCenter ? "#fff" : active ? (item.color || "#f0f0f5") : "#505060"} 
                />
                {!isCenter && <span style={{ fontSize: 10 }}>{item.label}</span>}
                {active && !isCenter && (
                  <span style={{
                    position: "absolute", bottom: 6, width: 4, height: 4, borderRadius: "50%",
                    background: item.color || "#6366f1",
                    boxShadow: `0 0 8px ${item.color || "#6366f1"}`,
                  }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => {}} />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

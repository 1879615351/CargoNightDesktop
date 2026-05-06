import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const navItems = [
  { path: "/", label: "首页", icon: "🏠" },
  { path: "/games", label: "游戏", icon: "🎲" },
  { path: "/profile", label: "我的", icon: "👤" },
];

export default function Layout() {
  const location = useLocation();
  const { logout, user } = useAuthStore();
  const inRoom = location.pathname.startsWith("/room/");
  const isProfile = location.pathname === "/profile";

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      <header className="w-full shrink-0 z-50" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)', borderBottom: '0.67px solid rgba(255,255,255,0.1)' }}>
        <div className="w-full h-14 flex items-center justify-between px-4 sm:px-6">
          {inRoom ? (
            <Link to="/games" className="flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span>返回大厅</span>
            </Link>
          ) : (
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <span className="text-[10px]">🎲</span>
              </div>
              <span className="text-sm font-bold tracking-wide" style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>桌游平台</span>
            </Link>
          )}

          {!inRoom && (
            <nav className="hidden md:flex items-center gap-0.5">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${location.pathname === item.path ? 'bg-white/10 text-white' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'}`}>
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2 shrink-0">
            {user && !inRoom && <span className="text-white/25 text-xs hidden sm:block">{user.username}</span>}
            {isProfile && (
              <button onClick={logout} className="px-3 py-1.5 text-xs rounded-lg text-white/40 hover:text-white/70 transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '0.67px solid rgba(255,255,255,0.08)' }}>退出</button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full min-h-0" style={{ marginTop: '0px' }}>
        <Outlet />
      </main>

      {!inRoom && (
        <footer className="w-full shrink-0" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '0.67px solid rgba(255,255,255,0.1)', height: '44px' }}>
          <div className="w-full h-full flex items-center justify-center px-4">
            <span className="text-white/15 text-xs">© 2026 桌游平台 — 享受游戏，结交朋友</span>
          </div>
        </footer>
      )}
    </div>
  );
}

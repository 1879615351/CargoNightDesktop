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
      {/* Desktop Header */}
      <header className="w-full shrink-0 z-50 hidden md:block" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)', borderBottom: '0.67px solid rgba(255,255,255,0.1)' }}>
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
            <nav className="flex items-center gap-0.5">
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
            {user && !inRoom && <span className="text-white/25 text-xs">{user.username}</span>}
            {isProfile && (
              <button onClick={logout} className="px-3 py-1.5 text-xs rounded-lg text-white/40 hover:text-white/70 transition-colors" style={{ background: 'rgba(255,255,255,0.05)', border: '0.67px solid rgba(255,255,255,0.08)' }}>退出</button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="w-full shrink-0 z-50 md:hidden" style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(12px)', borderBottom: '0.67px solid rgba(255,255,255,0.1)' }}>
        <div className="w-full h-12 flex items-center justify-between px-3">
          {inRoom ? (
            <Link to="/games" className="flex items-center gap-1 text-white/60 text-xs">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              <span>返回</span>
            </Link>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                <span className="text-[8px]">🎲</span>
              </div>
              <span className="text-xs font-bold" style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>桌游平台</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            {user && <span className="text-white/30 text-[10px]">{user.username}</span>}
            {isProfile && (
              <button onClick={logout} className="px-2 py-1 text-[10px] rounded text-white/40" style={{ background: 'rgba(255,255,255,0.05)' }}>退出</button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 w-full min-h-0 overflow-auto">
        <Outlet />
      </main>

      {/* Mobile Bottom Tab Bar */}
      {!inRoom && (
        <nav className="w-full shrink-0 md:hidden z-50" style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(12px)', borderTop: '0.67px solid rgba(255,255,255,0.08)' }}>
          <div className="w-full h-14 flex items-center justify-around px-2 pb-safe">
            {navItems.map((item) => {
              const active = location.pathname === item.path || (item.path === "/games" && location.pathname.startsWith("/games"));
              return (
                <Link key={item.path} to={item.path}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all min-w-0 ${active ? 'text-white' : 'text-white/35'}`}>
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Desktop Footer */}
      {!inRoom && (
        <footer className="w-full shrink-0 hidden md:block" style={{ background: 'rgba(0,0,0,0.2)', borderTop: '0.67px solid rgba(255,255,255,0.1)', height: '44px' }}>
          <div className="w-full h-full flex items-center justify-center px-4">
            <span className="text-white/15 text-xs">© 2026 桌游平台 — 享受游戏，结交朋友</span>
          </div>
        </footer>
      )}
    </div>
  );
}

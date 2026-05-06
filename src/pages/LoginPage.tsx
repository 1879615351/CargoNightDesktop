import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api } from "../api/client";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, loading, error, clearError, isAuthenticated } = useAuthStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");

  useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    checkServer();
  }, []);

  const checkServer = async () => {
    setServerStatus("checking");
    try {
      await api.get("/games");
      setServerStatus("online");
    } catch {
      setServerStatus("offline");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!email.trim() || !password.trim()) {
      setLocalError("请填写所有字段");
      return;
    }
    if (mode === "register" && (!username.trim() || password.length < 6)) {
      setLocalError(mode === "register" && password.length < 6 ? "密码至少6位" : "请填写用户名");
      return;
    }

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(username, email, password);
      }
      navigate("/", { replace: true });
    } catch {
      // error is set in store
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl block mb-3">🎲</span>
          <h1 className="text-2xl font-bold text-white">CargoNight</h1>
          <p className="text-white/40 text-sm mt-1">在线桌游平台</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 sm:p-8">
          <div className="flex mb-6 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => { setMode("login"); clearError(); setLocalError(""); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "login" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              登录
            </button>
            <button
              onClick={() => { setMode("register"); clearError(); setLocalError(""); }}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
                mode === "register" ? "bg-blue-600 text-white" : "text-white/40 hover:text-white"
              }`}
            >
              注册
            </button>
          </div>

          {serverStatus === "checking" && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center gap-2">
              <span className="w-3 h-3 border border-amber-400 border-t-transparent rounded-full animate-spin" />
              正在连接服务器...
            </div>
          )}
          {serverStatus === "offline" && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              服务器未连接 — 请先运行 <code className="bg-red-500/10 px-1 rounded">start_all.bat</code>
              <button onClick={checkServer} className="ml-2 underline hover:text-red-300">重试</button>
            </div>
          )}

          {displayError && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {displayError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm text-white/60 mb-1.5">用户名</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                  placeholder="输入用户名"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-white/60 mb-1.5">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder="输入邮箱"
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 focus:outline-none focus:border-blue-500/50 transition-colors"
                placeholder={mode === "register" ? "至少6位密码" : "输入密码"}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-semibold transition-all"
            >
              {loading ? "请稍候..." : mode === "login" ? "登录" : "创建账号"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

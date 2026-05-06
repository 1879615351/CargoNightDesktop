import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import GameSelectionPage from "./pages/GameSelectionPage";
import GameLobbyPage from "./pages/GameLobbyPage";
import GameRoomPage from "./pages/GameRoomPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";

function ProtectedRoute() {
  const { token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export default function App() {
  const { token, fetchMe } = useAuthStore();

  useEffect(() => {
    if (token) fetchMe();
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="games" element={<GameSelectionPage />} />
            <Route path="games/:gameType" element={<GameLobbyPage />} />
            <Route path="room/:roomId" element={<GameRoomPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

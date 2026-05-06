import { useEffect } from "react";
import { useGameStore } from "../store/homeStore";
import GameCard from "../components/GameCard";
import Loading from "../components/Loading";

export default function GameSelectionPage() {
  const { games, loading, error, fetchGames } = useGameStore();
  useEffect(() => { fetchGames(); }, []);
  if (loading && games.length === 0) return <Loading />;

  return (
    <div className="w-full py-6 lg:py-8" style={{ paddingLeft: 'clamp(16px, 7vw, 102px)', paddingRight: 'clamp(16px, 7vw, 102px)' }}>
      <div className="max-w-[1024px] mx-auto w-full">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-white">选择游戏</h1>
          <p className="text-white/35 text-sm mt-2">浏览所有可用的桌游，选择你喜欢的游戏进入大厅</p>
        </div>
        {error && <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/15 text-red-400 text-sm">{error}<button onClick={fetchGames} className="ml-3 underline hover:text-red-300">重试</button></div>}
        <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 370px), 1fr))" }}>
          {games.map((game) => <GameCard key={game.id} game={game} />)}
        </div>
      </div>
    </div>
  );
}

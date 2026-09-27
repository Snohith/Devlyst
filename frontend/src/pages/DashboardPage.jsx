import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";
import { useAuthToken } from "../hooks/useAuthToken";
import { apiRequest } from "../lib/api";

export function DashboardPage() {
  const navigate = useNavigate();
  const { getToken, isLoaded } = useAuthToken();
  const [projects, setProjects] = useState([]);
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const data = await apiRequest("/api/projects", { token });
        if (!cancelled) setProjects(data);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded]);

  async function createProject() {
    const token = await getToken();
    const project = await apiRequest("/api/projects", { token, method: "POST", body: {} });
    navigate(`/room/${project.roomCode}`);
  }

  async function joinRoom(event) {
    event.preventDefault();
    const token = await getToken();
    const project = await apiRequest(`/api/projects/join/${roomCode}`, { token });
    navigate(`/room/${project.roomCode}`);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="mt-1 text-sm text-zinc-400">Create a project or join one with its room code.</p>
          </div>
          <button onClick={createProject} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950">New project</button>
        </div>
        <form onSubmit={joinRoom} className="mt-8 flex gap-2">
          <input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value)}
            inputMode="numeric"
            pattern="\d{5}"
            maxLength={5}
            placeholder="12345"
            aria-label="Room code"
            className="w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-2"
          />
          <button className="rounded-lg border border-white/15 px-4 py-2 text-sm" type="submit">Join room</button>
        </form>
        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}
        <section className="mt-8 grid gap-3">
          {loading && <p className="text-sm text-zinc-500">Loading projects...</p>}
          {!loading && projects.length === 0 && <p className="text-sm text-zinc-500">No projects yet.</p>}
          {projects.map((project) => (
            <button key={project.id} onClick={() => navigate(`/room/${project.roomCode}`)} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
              <span>
                <span className="block font-medium">{project.name}</span>
                <span className="text-xs text-zinc-500">Room {project.roomCode} · {project.role}</span>
              </span>
              <span className="text-xs text-zinc-500">{project.fileCount} files</span>
            </button>
          ))}
        </section>
      </main>
    </div>
  );
}

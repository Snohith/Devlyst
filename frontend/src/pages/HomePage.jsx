import { Link } from "react-router-dom";
import { Navbar } from "../components/layout/Navbar";

const features = [
  { title: "Live collaboration", body: "Share a five-digit room and edit the same files with remote cursors." },
  { title: "Run in the browser", body: "Execute supported languages through the server-side Piston proxy." },
  { title: "Projects that persist", body: "Rooms are projects. Files survive refresh because they are stored in PostgreSQL." },
];

export function HomePage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <main>
        <section className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-24">
          <p className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">Collaborative IDE</p>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">Code together, without leaving the browser.</h1>
          <p className="max-w-2xl text-lg text-zinc-400">Devlyst keeps the same room, editor, and run workflow, now backed by a real API, database, and authenticated collaboration socket.</p>
          <div className="flex gap-3">
            <Link to="/dashboard" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-zinc-950">Open dashboard</Link>
            <a href="#features" className="rounded-full border border-white/15 px-5 py-3 text-sm text-zinc-200">See features</a>
          </div>
        </section>
        <section id="features" className="mx-auto grid max-w-6xl gap-4 px-4 pb-24 md:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-medium">{feature.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{feature.body}</p>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

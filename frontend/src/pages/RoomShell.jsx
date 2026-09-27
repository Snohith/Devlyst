import { ArrowLeft, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { EDITOR_LANGUAGES } from "../../../shared/constants/languages.js";
import { CollaborativeEditor } from "../components/editor/CollaborativeEditor";
import { FileExplorer } from "../components/editor/FileExplorer";
import { OutputPanel } from "../components/editor/OutputPanel";
import {
  createProjectFile,
  deleteProjectFile,
  refreshProject,
  runProjectCode,
  updateProjectLanguage,
} from "./room-actions";

export function RoomShell({
  project,
  currentFile,
  collaboration,
  draft,
  result,
  error,
  running,
  onSelectFile,
  onDraft,
  onProject,
  onRunning,
  onResult,
  onError,
  getToken,
  setCurrentFileId,
}) {
  async function reload(preferredFileId = currentFile?.id) {
    const token = await getToken();
    const next = await refreshProject(project.id, token, preferredFileId);
    onProject(next.project);
    setCurrentFileId(next.selected?.id || null);
    onDraft(next.selected?.content || "");
  }

  async function createFile() {
    const name = window.prompt("File name");
    if (!name) return;
    const token = await getToken();
    const file = await createProjectFile(project.id, token, name);
    await reload(file.id);
  }

  async function removeFile(file) {
    if (!window.confirm(`Delete ${file.name}?`)) return;
    const token = await getToken();
    await deleteProjectFile(project.id, file.id, token);
    await reload();
  }

  async function changeLanguage(language) {
    const token = await getToken();
    onProject(await updateProjectLanguage(project.id, token, language));
  }

  async function run() {
    if (!currentFile) return;
    onRunning(true);
    onError("");
    try {
      const token = await getToken();
      onResult(await runProjectCode(token, {
        language: currentFile.language || project.language,
        code: draft,
        projectId: project.id,
        fileId: currentFile.id,
      }));
    } catch (requestError) {
      onError(requestError.message);
    } finally {
      onRunning(false);
    }
  }

  return (
    <main className="flex h-screen flex-col bg-zinc-950 text-white">
      <header className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          <Link to="/dashboard" aria-label="Back to dashboard" className="rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <img src="/logo.svg" alt="" className="h-8 w-8" />
          <div>
            <p className="text-sm font-medium">{project.name}</p>
            <p className="text-xs text-zinc-500">Room {project.roomCode} · {collaboration.status}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select value={project.language} onChange={(event) => changeLanguage(event.target.value)} className="rounded-md border border-white/10 bg-zinc-900 px-2 py-1 text-sm">
            {EDITOR_LANGUAGES.map((language) => <option key={language.value} value={language.value}>{language.label}</option>)}
          </select>
          <button onClick={run} disabled={running} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-zinc-950 disabled:opacity-50">
            <Play className="h-4 w-4" /> Run
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <FileExplorer files={project.files} currentFileId={currentFile?.id} onSelect={onSelectFile} onCreate={createFile} onDelete={removeFile} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="min-h-0 flex-1">
            <CollaborativeEditor key={currentFile?.id} file={currentFile} language={currentFile?.language || project.language} provider={collaboration.provider} doc={collaboration.doc} onChange={onDraft} />
          </div>
          <OutputPanel result={result} running={running} error={error} />
        </div>
      </div>
    </main>
  );
}

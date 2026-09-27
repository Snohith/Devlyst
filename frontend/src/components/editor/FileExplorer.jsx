import { Download, FilePlus, Trash2 } from "lucide-react";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { cn } from "../../lib/utils";

export function FileExplorer({ files, currentFileId, onSelect, onCreate, onDelete }) {
  async function download() {
    const zip = new JSZip();
    files.forEach((file) => zip.file(file.name, file.content || ""));
    saveAs(await zip.generateAsync({ type: "blob" }), "devlyst-project.zip");
  }

  return (
    <aside className="flex w-64 flex-col border-r border-white/10 bg-zinc-900/40">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3 text-xs uppercase tracking-widest text-zinc-500">
        <span>Explorer ({files.length})</span>
        <div className="flex gap-1">
          <button onClick={download} title="Download project" className="rounded p-1 hover:text-white"><Download className="h-4 w-4" /></button>
          <button onClick={onCreate} title="New file" className="rounded p-1 hover:text-white"><FilePlus className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-2">
        {files.map((file) => (
          <div key={file.id} className={cn("flex items-center justify-between rounded-md px-2 py-1.5 text-sm", file.id === currentFileId ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5")}>
            <button className="truncate text-left" onClick={() => onSelect(file)}>{file.name}</button>
            <button onClick={() => onDelete(file)} title={`Delete ${file.name}`} className="text-zinc-600 hover:text-red-300"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
      </div>
    </aside>
  );
}

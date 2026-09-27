import Editor from "@monaco-editor/react";
import { useEffect, useRef } from "react";
import { MonacoBinding } from "y-monaco";
import * as Y from "yjs";

export function CollaborativeEditor({
  file,
  language,
  provider,
  doc,
  onChange,
}) {
  const editorRef = useRef(null);
  const bindingRef = useRef(null);

  useEffect(() => () => bindingRef.current?.destroy(), []);

  function handleMount(editor) {
    editorRef.current = editor;
    bindingRef.current?.destroy();
    if (!doc || !provider || !file) return;

    const files = doc.getMap("files");
    let text = files.get(file.name);
    if (!(text instanceof Y.Text)) {
      text = new Y.Text();
      text.insert(0, file.content || "");
      files.set(file.name, text);
    }
    bindingRef.current = new MonacoBinding(text, editor.getModel(), new Set([editor]), provider.awareness);
  }

  return (
    <Editor
      height="100%"
      language={language}
      theme="vs-dark"
      value={doc ? undefined : file?.content || ""}
      onChange={(value) => onChange?.(value ?? "")}
      onMount={handleMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        padding: { top: 16 },
        scrollBeyondLastLine: false,
      }}
    />
  );
}

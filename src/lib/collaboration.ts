import type { editor as MonacoEditorNamespace } from "monaco-editor";
import type { Monaco } from "@monaco-editor/react";

/** The Monaco editor instance and its namespace, as handed out by `onMount`. */
export type MonacoEditor = MonacoEditorNamespace.IStandaloneCodeEditor;
export type MonacoApi = Monaco;

/** A remote participant, as published through Yjs awareness. */
export interface Collaborator {
    clientID: number;
    user?: { name: string; color: string };
    isTyping?: boolean;
}

/** Whether the collaboration socket is up, down or still connecting. */
export type ConnectionStatus = "connecting" | "connected" | "disconnected" | "error";

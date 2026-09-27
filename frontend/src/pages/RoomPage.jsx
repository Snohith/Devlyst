import { ArrowLeft, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { EDITOR_LANGUAGES } from "../../../shared/constants/languages.js";
import { useAuthToken } from "../hooks/useAuthToken";
import { useCollaboration } from "../hooks/useCollaboration";
import { apiRequest } from "../lib/api";
import { hasClerk } from "../lib/config";
import { RoomShell } from "./RoomShell";

export function RoomPage() {
  const { roomId } = useParams();
  const { getToken, isLoaded } = useAuthToken();
  const [project, setProject] = useState(null);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [token, setToken] = useState(null);
  const [draft, setDraft] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const collaboration = useCollaboration({
    projectId: project?.id,
    token,
    enabled: hasClerk && Boolean(project?.id && token),
  });

  useEffect(() => {
    if (!isLoaded) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const sessionToken = await getToken();
        setToken(sessionToken);
        const data = await apiRequest(`/api/projects/join/${roomId}`, { token: sessionToken });
        if (cancelled) return;
        setProject(data);
        setCurrentFileId(data.files[0]?.id || null);
        setDraft(data.files[0]?.content || "");
      } catch (requestError) {
        if (!cancelled) setError(requestError.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken, isLoaded, roomId]);

  const currentFile = useMemo(
    () => project?.files?.find((file) => file.id === currentFileId) || null,
    [project, currentFileId],
  );

  if (!project) {
    return <main className="grid h-screen place-items-center bg-zinc-950 text-zinc-400">{error || "Opening room..."}</main>;
  }

  return (
    <RoomShell
      project={project}
      currentFile={currentFile}
      collaboration={collaboration}
      draft={draft}
      result={result}
      error={error}
      running={running}
      onSelectFile={(file) => {
        setCurrentFileId(file.id);
        setDraft(file.content);
      }}
      onDraft={setDraft}
      onProject={setProject}
      onRunning={setRunning}
      onResult={setResult}
      onError={setError}
      getToken={getToken}
      setCurrentFileId={setCurrentFileId}
    />
  );
}


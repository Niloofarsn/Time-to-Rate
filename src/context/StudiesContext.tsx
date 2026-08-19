import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Participant, Study } from "../data/types";
import { DEFAULT_GROUPS } from "../data/mockData";
import { fetchStudies } from "../lib/studiesApi";
import { useAuth } from "./AuthContext";

interface StudiesContextValue {
  studies: Study[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getStudy: (id: string) => Study | undefined;
  addStudy: (study: Study) => void;
  updateStudy: (id: string, patch: Partial<Study>) => void;
  deleteStudy: (id: string) => void;
  duplicateStudy: (id: string) => Study | undefined;
  addParticipants: (studyId: string, participants: Participant[]) => void;
  removeParticipant: (studyId: string, participantId: string) => void;
}

const StudiesContext = createContext<StudiesContextValue | null>(null);

function randomCode() {
  return Math.random().toString(36).slice(2, 10);
}

export function createEmptyStudy(): Study {
  return {
    id: `s-${Date.now()}`,
    title: "",
    description: "",
    status: "bozza",
    code: randomCode(),
    piName: "Mario Rossi",
    startDate: null,
    endDate: null,
    groups: DEFAULT_GROUPS,
    schedules: [],
    notifications: [],
    consent: [],
    instructions: [],
    participants: [],
    createdAt: new Date().toISOString().slice(0, 10),
  };
}

export function StudiesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStudies(await fetchStudies());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Errore nel caricamento degli studi");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load studies from the backend once the user is authenticated.
  useEffect(() => {
    if (isAuthenticated) refresh();
    else setStudies([]);
  }, [isAuthenticated, refresh]);

  const value = useMemo<StudiesContextValue>(
    () => ({
      studies,
      loading,
      error,
      refresh,
      getStudy: (id) => studies.find((s) => s.id === id),
      // NOTE: the mutations below currently update local state only. Persisting
      // create/edit/delete to the backend is the next integration step.
      addStudy: (study) => setStudies((prev) => [study, ...prev]),
      updateStudy: (id, patch) =>
        setStudies((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s))),
      deleteStudy: (id) => setStudies((prev) => prev.filter((s) => s.id !== id)),
      duplicateStudy: (id) => {
        const original = studies.find((s) => s.id === id);
        if (!original) return undefined;
        const copy: Study = {
          ...original,
          id: `s-${Date.now()}`,
          title: `${original.title} - Copia`,
          status: "bozza",
          code: randomCode(),
          participants: [],
          startDate: null,
          endDate: null,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        setStudies((prev) => [copy, ...prev]);
        return copy;
      },
      addParticipants: (studyId, participants) =>
        setStudies((prev) =>
          prev.map((s) =>
            s.id === studyId ? { ...s, participants: [...s.participants, ...participants] } : s,
          ),
        ),
      removeParticipant: (studyId, participantId) =>
        setStudies((prev) =>
          prev.map((s) =>
            s.id === studyId
              ? { ...s, participants: s.participants.filter((p) => p.id !== participantId) }
              : s,
          ),
        ),
    }),
    [studies, loading, error, refresh],
  );

  return <StudiesContext.Provider value={value}>{children}</StudiesContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStudies() {
  const ctx = useContext(StudiesContext);
  if (!ctx) throw new Error("useStudies must be used within StudiesProvider");
  return ctx;
}

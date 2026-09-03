import { useEffect, useState } from "react";
import { Modal, Button, Input } from "../ui";
import { searchPIs, requestActivation } from "../../lib/avvisiApi";

/** Researcher flow: search a PI and send them a study-activation request. */
export function RequestActivationModal({
  studyId,
  onClose,
  onSent,
}: {
  studyId: string;
  onClose: () => void;
  onSent: () => void;
}) {
  const [query, setQuery] = useState("");
  const [pis, setPis] = useState<{ id: string; name: string; mail: string }[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search PIs as the user types (debounced), needs at least 3 characters.
  useEffect(() => {
    if (query.trim().length < 3) {
      setPis([]);
      return;
    }
    const t = setTimeout(() => {
      searchPIs(query.trim())
        .then(setPis)
        .catch(() => setPis([]));
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const send = async () => {
    if (!selected) return;
    setSending(true);
    setError(null);
    try {
      await requestActivation(studyId, selected);
      onSent();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invio non riuscito");
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Richiedi attivazione studio"
      footer={
        <>
          <Button variant="base" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={send} disabled={!selected || sending}>
            {sending ? "Invio…" : "Invia richiesta"}
          </Button>
        </>
      }
    >
      <p className="text-sm muted" style={{ marginTop: 0 }}>
        Solo un PI può attivare uno studio. Cerca e seleziona il PI a cui inviare la richiesta.
      </p>
      <Input
        label="Cerca PI"
        placeholder="Inserisci almeno 3 caratteri (nome o email)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <ul className="stack" style={{ listStyle: "none", padding: 0, marginTop: "var(--space-3)" }}>
        {pis.map((pi) => (
          <li key={pi.id}>
            <label
              className="row"
              style={{
                gap: "var(--space-2)",
                padding: "10px 12px",
                border: "1px solid var(--border-card)",
                borderRadius: "var(--radius-control)",
                cursor: "pointer",
                background: selected === pi.id ? "var(--color-primary-light)" : "transparent",
              }}
            >
              <input
                type="radio"
                name="pi"
                checked={selected === pi.id}
                onChange={() => setSelected(pi.id)}
              />
              <span>
                <span style={{ fontWeight: 500 }}>{pi.name}</span>{" "}
                <span className="muted text-sm">· {pi.mail}</span>
              </span>
            </label>
          </li>
        ))}
        {query.trim().length >= 3 && pis.length === 0 && (
          <li className="muted text-sm">Nessun PI trovato.</li>
        )}
      </ul>

      {error && (
        <p className="text-sm" style={{ color: "var(--color-danger)" }}>
          <i className="bi bi-exclamation-circle" aria-hidden /> {error}
        </p>
      )}
    </Modal>
  );
}

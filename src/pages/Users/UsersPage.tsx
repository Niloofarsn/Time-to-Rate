import { useEffect, useState, type FormEvent } from "react";
import {
  Button,
  Badge,
  ConfirmDialog,
  Input,
  Select,
  Table,
  EmptyState,
  Modal,
  FeedbackModal,
} from "../../components/ui";
import {
  fetchUsers,
  createUser,
  deleteUser,
  type ManagedUser,
  type UserRole,
} from "../../lib/usersApi";
import { formatDate } from "../../lib/format";

const ROLE_TONE: Record<UserRole, "green" | "yellow" | "gray"> = {
  PI: "green",
  RESEARCHER: "gray",
  ADMIN: "yellow",
};

const ROLE_LABEL: Record<UserRole, string> = {
  PI: "PI",
  RESEARCHER: "Ricercatore",
  ADMIN: "Amministratore",
};

export function UsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [adding, setAdding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [invited, setInvited] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetchUsers()
      .then(setUsers)
      .catch((e) => setError(e instanceof Error ? e.message : "Errore nel caricamento"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="container page">
      <div className="page-header">
        <h2>Gestione utenti</h2>
        <Button icon="person-plus" onClick={() => setAdding(true)}>
          Aggiungi utente
        </Button>
      </div>

      {loading && (
        <p className="muted text-sm" style={{ marginBottom: "var(--space-3)" }}>
          <i className="bi bi-arrow-repeat" aria-hidden /> Caricamento…
        </p>
      )}
      {error && (
        <p
          className="text-sm"
          style={{
            marginBottom: "var(--space-3)",
            color: "var(--color-danger)",
            background: "var(--soft-red-bg)",
            padding: "8px 12px",
            borderRadius: "var(--radius-control)",
          }}
        >
          <i className="bi bi-exclamation-circle" aria-hidden /> {error}
        </p>
      )}

      {!loading && users.length === 0 && !error ? (
        <EmptyState icon="people" title="Nessun utente" subtitle="Aggiungi PI e ricercatori con il pulsante in alto." />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Ruolo</th>
              <th>Data creazione</th>
              <th style={{ textAlign: "right" }}>Azioni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 500 }}>{u.fullName}</td>
                <td>{u.mail}</td>
                <td>
                  <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
                </td>
                <td>{formatDate(u.createdAt)}</td>
                <td>
                  <div className="cell-actions">
                    <button
                      className="icon-btn icon-btn--danger"
                      aria-label="Elimina"
                      onClick={() => setDeleteTarget(u)}
                    >
                      <i className="bi bi-trash" aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {adding && (
        <AddUserModal
          onClose={() => setAdding(false)}
          onCreated={(mail) => {
            setAdding(false);
            setInvited(mail);
            load();
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (deleteTarget) {
            await deleteUser(deleteTarget.id);
            load();
          }
        }}
        title={`Eliminare "${deleteTarget?.fullName}"?`}
        message="L'account verrà eliminato. Gli studi creati verranno mantenuti."
      />

      <FeedbackModal
        open={!!invited}
        variant="success"
        title="Utente creato"
        message={`È stata inviata un'email a ${invited} con il link per impostare la password.`}
        onClose={() => setInvited(null)}
      />
    </div>
  );
}

function AddUserModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (mail: string) => void;
}) {
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [mail, setMail] = useState("");
  const [role, setRole] = useState<UserRole>("RESEARCHER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createUser({ name, surname, mail: mail.trim(), role });
      onCreated(mail.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creazione non riuscita");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Aggiungi utente"
      footer={
        <>
          <Button variant="base" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={submit} disabled={saving || !name.trim() || !mail.trim()}>
            {saving ? "Creazione…" : "Crea"}
          </Button>
        </>
      }
    >
      <form className="stack" onSubmit={submit}>
        <p className="text-sm muted" style={{ margin: 0 }}>
          L'utente riceverà un'email con un link per impostare la propria password.
        </p>
        <Input label="Nome" required value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Cognome" value={surname} onChange={(e) => setSurname(e.target.value)} />
        <Input label="Email" type="email" required value={mail} onChange={(e) => setMail(e.target.value)} />
        <Select
          label="Ruolo"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={[
            { value: "RESEARCHER", label: "Ricercatore" },
            { value: "PI", label: "PI (Principal Investigator)" },
          ]}
        />
        {error && (
          <p className="text-sm" style={{ color: "var(--color-danger)", margin: 0 }}>
            <i className="bi bi-exclamation-circle" aria-hidden /> {error}
          </p>
        )}
      </form>
    </Modal>
  );
}

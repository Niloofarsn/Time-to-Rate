import { useState } from "react";
import { Modal, Button, Input, Select } from "../ui";
import type { Study } from "../../data/types";
import "./ShareModal.css";

interface SharedPerson {
  name: string;
  email: string;
  access: "editor" | "viewer";
}

export function ShareModal({
  study,
  open,
  onClose,
}: {
  study: Study;
  open: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [access, setAccess] = useState<"editor" | "viewer">("editor");
  const [people, setPeople] = useState<SharedPerson[]>([
    { name: "Mario Rossi", email: "mariorossi@unimib.it", access: "editor" },
    { name: "Anna Bianchi", email: "anna.bianchi@unimib.it", access: "editor" },
  ]);

  const add = () => {
    if (!email.trim()) return;
    setPeople((prev) => [...prev, { name: email.split("@")[0], email, access }]);
    setEmail("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Condividi "${study.title}"`}
      size="md"
      footer={
        <Button variant="base" onClick={onClose}>
          Fine
        </Button>
      }
    >
      <p className="text-sm muted share__intro">
        Aggiungi le persone a cui condividere lo studio.
      </p>

      <div className="share__add">
        <div className="share__add-email">
          <Input
            placeholder="placeholder"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="share__add-access">
          <Select
            label="Livello di accesso"
            value={access}
            onChange={(e) => setAccess(e.target.value as "editor" | "viewer")}
            options={[
              { value: "editor", label: "Editor" },
              { value: "viewer", label: "Viewer" },
            ]}
          />
        </div>
        <Button onClick={add}>Condividi</Button>
      </div>

      <p className="share__label text-sm">Chi ha accesso</p>
      <ul className="share__list">
        {people.map((p) => (
          <li key={p.email} className="share__person">
            <span className="share__avatar">
              {p.name.slice(0, 2).toUpperCase()}
            </span>
            <span className="share__person-info">
              <span className="share__person-name">{p.name}</span>
              <span className="share__person-email muted">{p.email}</span>
            </span>
            <select
              className="control control--select share__person-access"
              value={p.access}
              onChange={(e) =>
                setPeople((prev) =>
                  prev.map((x) =>
                    x.email === p.email
                      ? { ...x, access: e.target.value as "editor" | "viewer" }
                      : x,
                  ),
                )
              }
            >
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </li>
        ))}
      </ul>
    </Modal>
  );
}

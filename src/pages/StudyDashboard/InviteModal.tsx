import { useState } from "react";
import { Modal, Button, Input, Select, Checkbox, Textarea } from "../../components/ui";
import type { Participant, Study } from "../../data/types";
import { useStudies } from "../../context/StudiesContext";

const RANDOM = "__random__";

export function InviteModal({
  study,
  open,
  onClose,
  onSent,
}: {
  study: Study;
  open: boolean;
  onClose: () => void;
  onSent: () => void;
}) {
  const { addParticipants } = useStudies();
  const [email, setEmail] = useState("");
  const [isTester, setIsTester] = useState(false);
  const [condition, setCondition] = useState(RANDOM);

  const defaultBody = `Gentile,

la contatto per invitarla a partecipare allo studio "${study.title}", condotto dall'Università degli studi Milano-Bicocca.

Se interessato/a, può scaricare l'applicazione Time2Rate e inserire il codice dello studio: ${study.code}

Resto disponibile per qualsiasi informazione.

Cordiali saluti,
${study.piName}`;

  const [body, setBody] = useState(defaultBody);

  const send = () => {
    const emails = email
      .split(/[,\n]/)
      .map((e) => e.trim())
      .filter(Boolean);
    if (emails.length === 0) return;

    const groups = study.groups;
    const participants: Participant[] = emails.map((mail, i) => {
      const groupId =
        condition === RANDOM ? groups[i % groups.length].id : condition;
      return {
        id: `p-${Date.now()}-${i}`,
        name: mail.split("@")[0],
        email: mail,
        groupId,
        compliance: "inattivo",
        compliancePct: 0,
        lastResponse: null,
        status: "invitato",
        isTester,
      };
    });

    addParticipants(study.id, participants);
    setEmail("");
    onSent();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Invita partecipanti a "${study.title}"`}
      size="lg"
      footer={
        <>
          <Button variant="base" onClick={onClose}>
            Annulla
          </Button>
          <Button onClick={send}>Invia</Button>
        </>
      }
    >
      <p className="text-sm" style={{ fontWeight: 500, marginBottom: 4 }}>
        Aggiungi i partecipanti allo studio
      </p>
      <p className="text-sm muted" style={{ marginBottom: "var(--space-3)" }}>
        Puoi aggiungere fino a 100 partecipanti alla volta inserendone l'indirizzo email.
      </p>

      <div className="stack">
        <Input
          label="Email"
          placeholder="nome@example.com, altro@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Checkbox
          id="tester"
          label="Contrassegna come tester"
          checked={isTester}
          onChange={(e) => setIsTester(e.target.checked)}
        />

        <Select
          label="Seleziona la condizione a cui assegnare i partecipanti"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          options={[
            { value: RANDOM, label: "Assegnazione casuale a una condizione" },
            ...study.groups.map((g) => ({ value: g.id, label: g.name })),
          ]}
        />

        <Textarea
          label="Testo della email di invito allo studio"
          rows={9}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />

        <Checkbox id="attach" label="Allega all'email le istruzioni per utilizzare l'app di Time2Rate" />
      </div>
    </Modal>
  );
}

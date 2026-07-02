export interface WizardStep {
  slug: string;
  label: string;
  icon: string;
}

export const WIZARD_STEPS: WizardStep[] = [
  { slug: "dettagli", label: "Dettagli", icon: "card-text" },
  { slug: "pianificazioni", label: "Pianificazioni", icon: "calendar-week" },
  { slug: "notifiche", label: "Notifiche", icon: "bell" },
  { slug: "consenso", label: "Consenso informato", icon: "file-earmark-check" },
  { slug: "istruzioni", label: "Istruzioni", icon: "list-check" },
  { slug: "riepilogo", label: "Riepilogo", icon: "clipboard-check" },
  { slug: "attivazione", label: "Attivazione", icon: "rocket-takeoff" },
];

export function stepIndex(slug: string): number {
  return WIZARD_STEPS.findIndex((s) => s.slug === slug);
}

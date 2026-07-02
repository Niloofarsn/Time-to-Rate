import { useNavigate, useParams } from "react-router-dom";
import { useStudies } from "../../context/StudiesContext";
import type { Study } from "../../data/types";
import { WIZARD_STEPS, stepIndex } from "./steps";

/** Shared logic for wizard steps: current study + update + step navigation. */
export function useWizardStudy(currentSlug: string) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getStudy, updateStudy } = useStudies();
  const study = id ? getStudy(id) : undefined;

  const idx = stepIndex(currentSlug);
  const prev = WIZARD_STEPS[idx - 1];
  const next = WIZARD_STEPS[idx + 1];

  const update = (patch: Partial<Study>) => {
    if (id) updateStudy(id, patch);
  };

  const goTo = (slug: string) => navigate(`/studi/${id}/crea/${slug}`);
  const goNext = () => next && goTo(next.slug);
  const goPrev = () => prev && goTo(prev.slug);

  return { id, study, update, goTo, goNext, goPrev, prev, next, idx };
}

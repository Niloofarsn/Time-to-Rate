import { useParams } from "react-router-dom";
import { useStudies } from "../../context/StudiesContext";
import type { Study } from "../../data/types";

/** Load the study being edited plus a scoped update helper. */
export function useEditStudy() {
  const { id } = useParams();
  const { getStudy, updateStudy } = useStudies();
  const study = id ? getStudy(id) : undefined;

  const update = (patch: Partial<Study>) => {
    if (id) updateStudy(id, patch);
  };

  return { id, study, update };
}

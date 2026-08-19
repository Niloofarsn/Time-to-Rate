import { Link, NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import { useStudies } from "../../context/StudiesContext";
import { WIZARD_STEPS } from "../Wizard/steps";
import "../Wizard/Wizard.css";

/**
 * Edit view for an existing study ("modifica sezioni"): same left-rail sections
 * as the create wizard, but each section is a management view rather than a
 * linear step. Routed at /studi/:id/modifica/<section>.
 */
export function EditStudyLayout() {
  const { id } = useParams();
  const { getStudy } = useStudies();
  const study = id ? getStudy(id) : undefined;
  const location = useLocation();
  const activeSlug = location.pathname.split("/").pop();

  return (
    <div className="container page wizard">
      <nav className="wizard__breadcrumb text-sm">
        <Link to="/studi">I miei studi</Link>
        <i className="bi bi-chevron-right" aria-hidden />
        {study && <Link to={`/studi/${id}`}>{study.title}</Link>}
        <i className="bi bi-chevron-right" aria-hidden />
        <span>Modifica</span>
      </nav>

      <div className="wizard__body">
        <aside className="wizard__rail">
          {WIZARD_STEPS.map((step, i) => (
            <NavLink
              key={step.slug}
              to={`/studi/${id}/modifica/${step.slug}`}
              className={`wizard__step ${activeSlug === step.slug ? "is-active" : ""}`}
            >
              <span className="wizard__step-num">{i + 1}</span>
              <i className={`bi bi-${step.icon}`} aria-hidden />
              <span className="wizard__step-label">{step.label}</span>
            </NavLink>
          ))}
        </aside>

        <section className="wizard__content">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

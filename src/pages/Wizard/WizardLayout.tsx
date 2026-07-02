import { NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { useStudies } from "../../context/StudiesContext";
import { WIZARD_STEPS } from "./steps";
import "./Wizard.css";

export function WizardLayout() {
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
        <span>{study?.title || "Nuovo studio"}</span>
      </nav>

      <div className="wizard__body">
        <aside className="wizard__rail">
          {WIZARD_STEPS.map((step, i) => (
            <NavLink
              key={step.slug}
              to={`/studi/${id}/crea/${step.slug}`}
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

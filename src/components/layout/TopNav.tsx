import { NavLink, useNavigate } from "react-router-dom";
import { Dropdown } from "../ui";
import { CURRENT_USER } from "../../data/mockData";
import { initials } from "../../lib/format";
import "./TopNav.css";

export function TopNav() {
  const navigate = useNavigate();

  return (
    <header className="topnav">
      <div className="container topnav__inner">
        <div className="topnav__left">
          <NavLink to="/studi" className="topnav__brand">
            <span className="topnav__logo">
              <i className="bi bi-alarm-fill" aria-hidden />
            </span>
            Time2Rate
          </NavLink>
          <nav className="topnav__links">
            <NavLink to="/studi" className="topnav__link">
              I miei studi
            </NavLink>
            <NavLink to="/guida" className="topnav__link">
              Guida
            </NavLink>
          </nav>
        </div>

        <div className="topnav__right">
          <button className="topnav__icon" aria-label="Cerca">
            <i className="bi bi-search" aria-hidden />
          </button>
          <button className="topnav__icon" aria-label="Avvisi" onClick={() => navigate("/avvisi")}>
            <i className="bi bi-bell" aria-hidden />
          </button>
          <Dropdown
            align="right"
            trigger={<span className="topnav__avatar">{initials(CURRENT_USER.name)}</span>}
            items={[
              { label: "Profilo", icon: "person", onClick: () => navigate("/profilo") },
              { label: "Esci", icon: "box-arrow-right", onClick: () => navigate("/login") },
            ]}
          />
        </div>
      </div>
    </header>
  );
}

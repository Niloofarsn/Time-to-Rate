import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Checkbox } from "../../components/ui";
import "./LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("mariorossi@unimib.it");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Mock auth — any credentials route to the studies list.
    navigate("/studi");
  };

  return (
    <div className="login">
      <div className="login__card">
        <div className="login__brand">
          <span className="login__logo">
            <i className="bi bi-alarm-fill" aria-hidden />
          </span>
          <span className="login__name">Time2Rate</span>
        </div>

        <h4 className="login__title">Accedi al tuo account</h4>
        <p className="muted text-sm login__sub">
          Area riservata ai ricercatori.
        </p>

        <form className="login__form" onSubmit={onSubmit}>
          <Input
            id="email"
            type="email"
            label="Email"
            required
            placeholder="nome@università.it"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="login__pw">
            <Input
              id="password"
              type={showPw ? "text" : "password"}
              label="Password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="login__pw-toggle"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? "Nascondi password" : "Mostra password"}
            >
              <i className={`bi bi-${showPw ? "eye-slash" : "eye"}`} aria-hidden />
            </button>
          </div>

          <div className="login__row">
            <Checkbox id="remember" label="Ricordami" defaultChecked />
            <a href="#" className="text-sm">
              Password dimenticata?
            </a>
          </div>

          <Button type="submit" size="lg" className="login__submit">
            Accedi
          </Button>
        </form>

        <p className="login__foot muted text-sm">
          Non hai un account? <a href="#">Contatta l'amministratore</a>
        </p>
      </div>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Checkbox } from "../../components/ui";
import { useAuth } from "../../context/AuthContext";
import "./LoginPage.css";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate("/studi");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login non riuscito");
    } finally {
      setLoading(false);
    }
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

          {error && (
            <p className="login__error text-sm">
              <i className="bi bi-exclamation-circle" aria-hidden /> {error}
            </p>
          )}

          <Button type="submit" size="lg" className="login__submit" disabled={loading}>
            {loading ? "Accesso in corso…" : "Accedi"}
          </Button>
        </form>

        <p className="login__foot muted text-sm">
          Non hai un account? <a href="#">Contatta l'amministratore</a>
        </p>
      </div>
    </div>
  );
}

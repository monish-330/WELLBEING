import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.username.trim() || !form.password) {
      setError("Please enter both username and password.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await login(form);
      navigate("/");
    } catch (err) {
      console.error("Login failure:", err);
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-shell">
      <div className="login-hero">
        <div className="login-orb login-orb--one" />
        <div className="login-orb login-orb--two" />
        <div className="login-sticker login-sticker--top">✨</div>
        <div className="login-sticker login-sticker--mid">💗</div>
        <div className="login-sticker login-sticker--bottom">🌿</div>
        <div className="login-badge">Student Wellbeing App</div>
        <p className="login-kicker">Campus care, made simple</p>
        <h1>Support your students with a calmer, clearer daily wellbeing space.</h1>
        <p className="login-copy">
          Assessments, journaling, self-care, crisis guidance, and counselor support brought into one focused experience.
        </p>

        <div className="login-summary">
          <div className="login-summary-card">
            <span>Designed For</span>
            <strong>Students, counselors, and admins</strong>
          </div>
          <div className="login-summary-card">
            <span>Made For</span>
            <strong>Daily wellbeing check-ins at scale</strong>
          </div>
        </div>

        <div className="login-points">
          <div className="login-point">
            <span className="login-point-icon">🫶</span>
            <strong>Daily Assessment</strong>
            <span>Quick check-ins with guided next steps.</span>
          </div>
          <div className="login-point">
            <span className="login-point-icon">📝</span>
            <strong>Reflection</strong>
            <span>Journaling and mood history in one flow.</span>
          </div>
          <div className="login-point">
            <span className="login-point-icon">🤝</span>
            <strong>Real Support</strong>
            <span>Self-care tools and counselor connection.</span>
          </div>
        </div>
      </div>

      <div className="login-panel">
        <div className="login-card login-card--premium">
          <div className="login-card-glow" />
          <p className="eyebrow">Secure Login</p>
          <h2>Sign in</h2>
          <p className="login-form-copy">Continue into the wellbeing workspace with your approved account.</p>

          <form onSubmit={handleSubmit} className="stack">
            <label className="login-field">
              <span>User ID / Username</span>
              <input
                placeholder="Enter your username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={isSubmitting}
                autoComplete="username"
              />
            </label>

            <label className="login-field">
              <span>Password</span>
              <div className="login-password-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-password-toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error ? <p className="error">{error}</p> : null}

            <button type="submit" className="login-submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="login-submit-spinner" />
                  <span>Connecting...</span>
                </>
              ) : (
                "Enter App"
              )}
            </button>
          </form>

          <div className="login-footer-note">
            <span>Private access for student, counselor, and admin users.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

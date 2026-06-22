import { useState } from "react";
import styles from "./LoginView.module.css";

export function LoginView() {
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user, password }),
      });
      if (res.ok) {
        window.location.href = "/";
        return;
      }
      const data: unknown = await res.json().catch(() => ({}));
      const msg =
        data && typeof data === "object" && "error" in data
          ? String((data as { error: unknown }).error)
          : "Credenciales inválidas";
      setError(msg);
    } catch {
      setError("Error de conexión");
    }
    setLoading(false);
  }

  return (
    <div className={styles.wrap}>
      <form className={`${styles.card} slide-up`} onSubmit={handleSubmit}>
        <p className={styles.brand}>Portafolio Personal</p>
        <h1 className={styles.title}>Iniciar sesión</h1>

        <label className={styles.label}>
          <span>Usuario</span>
          <input
            className={styles.input}
            value={user}
            onChange={(e) => setUser(e.target.value)}
            autoComplete="username"
            autoFocus
          />
        </label>

        <label className={styles.label}>
          <span>Contraseña</span>
          <input
            className={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>

        <a className={styles.demoLink} href="/demo">
          Ver demo público →
        </a>
      </form>
    </div>
  );
}

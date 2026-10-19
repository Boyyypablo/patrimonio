"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, Loader2, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "@/lib/navigation";
import { AUTH_KEY } from "./shell";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    try {
      if (sessionStorage.getItem(AUTH_KEY)) void navigate({ to: "/", replace: true });
    } catch {
      /* sem sessão */
    }
  }, [navigate]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: { email?: string; password?: string } = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Informe um e-mail válido.";
    if (!password.trim()) next.password = "Informe a senha.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      sessionStorage.setItem(AUTH_KEY, "1");
    } catch {
      /* sem sessão */
    }
    setTimeout(() => navigate({ to: "/", replace: true }), 400);
  };

  return (
    <div className="login-page">
      <main className="login-main">
        <img src="/assets/778f5.png" width={240} height={67} decoding="async" alt="Mútua" className="login-logo" />
        <form className="login-card" onSubmit={submit} noValidate>
          <div className="login-field">
            <label htmlFor="email">E-mail</label>
            <div className="relative">
              <Mail className="login-icon" size={18} aria-hidden />
              <Input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                placeholder="seu@email.com"
                className="login-input pl-11"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={loading}
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && <p className="login-err">{errors.email}</p>}
          </div>
          <div className="login-field">
            <label htmlFor="password">Senha</label>
            <div className="relative">
              <Lock className="login-icon" size={18} aria-hidden />
              <Input
                id="password"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                className="login-input pl-11 pr-12"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={loading}
                aria-invalid={!!errors.password}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="login-eye absolute right-1 top-1/2 -translate-y-1/2"
                aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                onClick={() => setShow((value) => !value)}
              >
                {show ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            {errors.password && <p className="login-err">{errors.password}</p>}
          </div>
          <Button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </main>
      <footer className="login-footer">© Mútua. Todos os direitos reservados.</footer>
    </div>
  );
}

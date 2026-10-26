import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CircleAlert, Eye, EyeOff, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Logo } from "../components/brand/Logo";
import { Button, Input } from "../components/ui";
import { DEMO_PASSWORD } from "../mock/employees";

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter an email like name@company.com.";
  if (!password) errors.password = "Enter your password.";
  return errors;
}

export function LoginPage() {
  useDocumentTitle("Sign in");
  const { signIn, signInAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = location.state?.from?.pathname ?? "/dashboard";

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(null); // "form" | "admin" | "staff"

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    if (errors[field]) setErrors((errs) => ({ ...errs, [field]: undefined }));
  };

  const finish = async (action, key) => {
    setFormError("");
    setPending(key);
    try {
      await action();
      navigate(destination, { replace: true });
    } catch (error) {
      setFormError(error.message);
      setPending(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    finish(() => signIn(values.email, values.password), "form");
  };

  const busy = pending !== null;

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex flex-col items-center text-center">
            <Logo className="mb-6" />
            <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in to Orbinest</h1>
            <p className="mt-1.5 text-base text-ink-muted">Your team. Your tasks. One place.</p>
          </div>

          <div className="rounded-lg border border-line bg-surface p-6 sm:p-8">
            {formError && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-lg border border-danger-line bg-danger-soft px-3.5 py-3 text-sm text-danger-ink"
              >
                <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <p className="font-medium">{formError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <Input
                label="Email address"
                type="email"
                autoComplete="email"
                inputMode="email"
                value={values.email}
                onChange={update("email")}
                error={errors.email}
                autoFocus
              />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={values.password}
                onChange={update("password")}
                error={errors.password}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-pressed={showPassword}
                    className="grid size-9 place-items-center rounded-md text-ink-muted pointer-coarse:size-10 transition-colors hover:bg-sunken hover:text-ink"
                  >
                    {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </button>
                }
              />
              <Button type="submit" size="lg" fullWidth loading={pending === "form"} disabled={busy}>
                Sign in
              </Button>
            </form>

            <div className="my-6 flex items-center gap-3" role="presentation">
              <span className="h-px flex-1 bg-line" />
              <span className="text-sm text-ink-muted">or explore with a demo account</span>
              <span className="h-px flex-1 bg-line" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="secondary"
                icon={ShieldCheck}
                loading={pending === "admin"}
                disabled={busy}
                onClick={() => finish(() => signInAsDemo("admin"), "admin")}
              >
                Try as Admin
              </Button>
              <Button
                variant="secondary"
                icon={UserRound}
                loading={pending === "staff"}
                disabled={busy}
                onClick={() => finish(() => signInAsDemo("staff"), "staff")}
              >
                Try as Staff
              </Button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-ink-muted">
            Demo mode. Any team email works with the password{" "}
            <code className="rounded bg-sunken px-1.5 py-0.5 font-mono text-[13px] text-ink">{DEMO_PASSWORD}</code>.
          </p>
        </div>
      </main>
    </div>
  );
}

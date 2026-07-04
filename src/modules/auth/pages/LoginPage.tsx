import { useState } from "react";
import { Eye, EyeOff, Zap, Boxes, FileCheck2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/modules/auth/hooks/useAuth";
import { useAppDispatch } from "@/app/hooks";
import { setAuth } from "@/modules/auth/authSlice";
import { LogoFull } from "@/shared/components/Logo";
import { getApiErrorMessage } from "@/shared/api/http";

const schema = z.object({
  email: z.string().trim().email("Valid email required"),
  password: z.string().min(1, "Password is required"),
});
type FormValues = z.infer<typeof schema>;

const HIGHLIGHTS = [
  { icon: Zap, text: "Lead-to-sale pipeline with capacity sizing" },
  { icon: FileCheck2, text: "GST quotations & proforma invoices in seconds" },
  { icon: Boxes, text: "Live inventory, sales & full activity audit trail" },
];

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
  });

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const result = await loginMutation.mutateAsync(values);
      dispatch(setAuth(result));
      navigate("/", { replace: true });
    } catch (e) {
      setError(getApiErrorMessage(e));
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-sidebar p-12 text-sidebar-foreground">
        {/* Premium industrial backdrop (self-hosted Unsplash photo) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/login-bg.jpg')" }}
        />
        {/* Cobalt-tinted gradient for brand cohesion + text legibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-sidebar/95 via-sidebar/80 to-primary/55" />
        <div className="absolute inset-0 bg-sidebar/25" />
        <div className="relative flex items-center gap-3">
          <LogoFull height={104} />
        </div>
        <div className="relative space-y-8">
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            The modern way to run a generator sales &amp; service business.
          </h2>
          <ul className="space-y-4">
            {HIGHLIGHTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sidebar-foreground/80">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <span className="text-sm">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} SRF Power Machine · Generator Sales &amp; Service CRM
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <div className="mb-3 inline-flex justify-center">
              <LogoFull height={72} variant="auto" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            <h2 className="text-lg font-semibold text-card-foreground">Sign in to continue</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back. Enter your credentials.
            </p>

            {error ? (
              <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring transition"
                  placeholder="you@company.com"
                  autoComplete="email"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 pr-10 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring transition"
                    autoComplete="current-password"
                    {...form.register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="mt-1 text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending || !form.formState.isValid}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

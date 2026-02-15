import { useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, ArrowLeft, Compass, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

type AuthMode = "login" | "signup" | "forgot" | "reset";

export default function AuthPage() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  // Check URL for reset token
  const params = new URLSearchParams(window.location.search);
  const resetToken = params.get("token");
  const modeParam = params.get("mode");

  const [mode, setMode] = useState<AuthMode>(
    resetToken && modeParam === "reset" ? "reset" : "login"
  );

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  const utils = trpc.useUtils();

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success(t("Account created successfully!", "Conta criada com sucesso!"));
      utils.auth.me.invalidate();
      navigate("/");
    },
    onError: (err) => toast.error(err.message),
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success(t("Welcome back!", "Bem-vindo de volta!"));
      utils.auth.me.invalidate();
      navigate("/");
    },
    onError: (err) => toast.error(err.message),
  });

  const forgotMutation = trpc.auth.forgotPassword.useMutation({
    onSuccess: (data) => {
      toast.success(t(data.message, "Se uma conta existir com esse e-mail, um link de redefinição foi enviado."));
    },
    onError: (err) => toast.error(err.message),
  });

  const resetMutation = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      toast.success(t("Password reset successfully! Please log in.", "Senha redefinida com sucesso! Faça login."));
      setMode("login");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      if (password !== confirmPassword) {
        toast.error(t("Passwords do not match", "As senhas não coincidem"));
        return;
      }
      if (!agreedToTerms) {
        toast.error(t("You must agree to the Terms & Conditions and Privacy Policy", "Você deve concordar com os Termos e a Política de Privacidade"));
        return;
      }
      registerMutation.mutate({ email, password, name });
    } else if (mode === "login") {
      loginMutation.mutate({ email, password });
    } else if (mode === "forgot") {
      forgotMutation.mutate({ email });
    } else if (mode === "reset") {
      if (newPassword.length < 8) {
        toast.error(t("Password must be at least 8 characters", "A senha deve ter pelo menos 8 caracteres"));
        return;
      }
      resetMutation.mutate({ token: resetToken || "", newPassword });
    }
  };

  const isLoading = registerMutation.isPending || loginMutation.isPending || forgotMutation.isPending || resetMutation.isPending;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 bg-background">
      {/* Back to landing */}
      <div className="w-full max-w-md mb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("Back", "Voltar")}
        </Link>
      </div>

      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mb-3">
          <Compass className="w-6 h-6 text-emerald-400" />
        </div>
        <h1 className="text-xl font-bold text-foreground">Destiny Hacking</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("Master Your Free Will", "Domine Seu Livre Arbítrio")}
        </p>
      </div>

      <Card className="w-full max-w-md border-border/50 bg-card">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-lg">
            {mode === "login" && t("Welcome Back", "Bem-vindo de Volta")}
            {mode === "signup" && t("Create Account", "Criar Conta")}
            {mode === "forgot" && t("Reset Password", "Redefinir Senha")}
            {mode === "reset" && t("New Password", "Nova Senha")}
          </CardTitle>
          <CardDescription>
            {mode === "login" && t("Sign in to continue your journey", "Entre para continuar sua jornada")}
            {mode === "signup" && t("Begin your path to self-mastery", "Comece seu caminho para o autodomínio")}
            {mode === "forgot" && t("Enter your email to receive a reset link", "Digite seu e-mail para receber um link de redefinição")}
            {mode === "reset" && t("Choose a new password for your account", "Escolha uma nova senha para sua conta")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (signup only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">{t("Name", "Nome")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("Your name", "Seu nome")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email (not for reset) */}
            {mode !== "reset" && (
              <div className="space-y-2">
                <Label htmlFor="email">{t("Email", "E-mail")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            {/* Password (login & signup) */}
            {(mode === "login" || mode === "signup") && (
              <div className="space-y-2">
                <Label htmlFor="password">{t("Password", "Senha")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("Min. 8 characters", "Mín. 8 caracteres")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={mode === "signup" ? 8 : 1}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Password (signup only) */}
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("Confirm Password", "Confirmar Senha")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("Repeat password", "Repita a senha")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
              </div>
            )}

            {/* New Password (reset only) */}
            {mode === "reset" && (
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("New Password", "Nova Senha")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("Min. 8 characters", "Mín. 8 caracteres")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Terms & Conditions checkbox (signup only) */}
            {mode === "signup" && (
              <div className="flex items-start gap-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                  className="mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight cursor-pointer">
                  {t("I agree to the ", "Eu concordo com os ")}{" "}
                  <Link href="/terms" className="text-emerald-400 hover:underline">
                    {t("Terms & Conditions", "Termos e Condições")}
                  </Link>{" "}
                  {t("and ", "e ")}{" "}
                  <Link href="/privacy" className="text-emerald-400 hover:underline">
                    {t("Privacy Policy", "Política de Privacidade")}
                  </Link>
                </Label>
              </div>
            )}

            {/* Forgot password link (login only) */}
            {mode === "login" && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-sm text-emerald-400 hover:underline"
                >
                  {t("Forgot password?", "Esqueceu a senha?")}
                </button>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                <>
                  {mode === "login" && t("Sign In", "Entrar")}
                  {mode === "signup" && t("Create Account", "Criar Conta")}
                  {mode === "forgot" && t("Send Reset Link", "Enviar Link de Redefinição")}
                  {mode === "reset" && t("Reset Password", "Redefinir Senha")}
                </>
              )}
            </Button>
          </form>

          {/* Mode switcher */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === "login" && (
              <>
                {t("Don't have an account? ", "Não tem uma conta? ")}
                <button onClick={() => setMode("signup")} className="text-emerald-400 hover:underline">
                  {t("Sign Up", "Cadastre-se")}
                </button>
              </>
            )}
            {mode === "signup" && (
              <>
                {t("Already have an account? ", "Já tem uma conta? ")}
                <button onClick={() => setMode("login")} className="text-emerald-400 hover:underline">
                  {t("Sign In", "Entrar")}
                </button>
              </>
            )}
            {mode === "forgot" && (
              <>
                <button onClick={() => setMode("login")} className="text-emerald-400 hover:underline">
                  {t("Back to Sign In", "Voltar para Login")}
                </button>
              </>
            )}
            {mode === "reset" && (
              <>
                <button onClick={() => setMode("login")} className="text-emerald-400 hover:underline">
                  {t("Back to Sign In", "Voltar para Login")}
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer quote */}
      <p className="mt-8 text-xs text-muted-foreground/60 text-center italic max-w-xs">
        "I am the master of my fate, I am the captain of my soul."
      </p>
    </div>
  );
}

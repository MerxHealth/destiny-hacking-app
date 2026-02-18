import { Link } from "wouter";
import {
  Brain,
  Calendar,
  ChevronRight,
  Compass,
  Globe,
  Heart,
  Moon,
  Settings,
  Shield,
  Sprout,
  Star,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function More() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  const menuSections = [
    {
      title: t({ en: "Daily Practice", pt: "Prática Diária", es: "Práctica Diaria" }),
      items: [
        {
          icon: Compass,
          label: t({ en: "Daily Cycle", pt: "Ciclo Diário", es: "Ciclo Diario" }),
          description: t({ en: "Morning, midday & evening rituals", pt: "Rituais da manhã, meio-dia e noite", es: "Rituales de mañana, mediodía y noche" }),
          path: "/daily-cycle",
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        },
        {
          icon: Brain,
          label: t({ en: "Bias Clearing", pt: "Limpeza de Vieses", es: "Limpieza de Sesgos" }),
          description: t({ en: "Clear mental fog & biases", pt: "Limpe a névoa mental e vieses", es: "Despeja la niebla mental y los sesgos" }),
          path: "/bias-clearing",
          color: "text-purple-500",
          bg: "bg-purple-500/10",
        },
        {
          icon: Heart,
          label: t({ en: "Prayer Journal", pt: "Diário de Oração", es: "Diario de Oración" }),
          description: t({ en: "Four-part prayer protocol", pt: "Protocolo de oração em quatro partes", es: "Protocolo de oración en cuatro partes" }),
          path: "/prayer-journal",
          color: "text-rose-500",
          bg: "bg-rose-500/10",
        },
      ],
    },
    {
      title: t({ en: "Growth & Community", pt: "Crescimento e Comunidade", es: "Crecimiento y Comunidad" }),
      items: [
        {
          icon: Calendar,
          label: t({ en: "Weekly Review", pt: "Revisão Semanal", es: "Revisión Semanal" }),
          description: t({ en: "Reflect on your week", pt: "Reflita sobre sua semana", es: "Reflexiona sobre tu semana" }),
          path: "/weekly-review",
          color: "text-cyan-500",
          bg: "bg-cyan-500/10",
        },
        {
          icon: TrendingUp,
          label: t({ en: "Monthly Report", pt: "Relatório Mensal", es: "Informe Mensual" }),
          description: t({ en: "Monthly progress summary", pt: "Resumo mensal de progresso", es: "Resumen mensual de progreso" }),
          path: "/monthly-report",
          color: "text-teal-500",
          bg: "bg-teal-500/10",
        },
        {
          icon: Sprout,
          label: t({ en: "Sowing & Reaping", pt: "Semeadura e Colheita", es: "Siembra y Cosecha" }),
          description: t({ en: "Track cause-effect relationships", pt: "Acompanhe relações de causa e efeito", es: "Sigue las relaciones de causa y efecto" }),
          path: "/sowing-reaping",
          color: "text-green-500",
          bg: "bg-green-500/10",
        },
        {
          icon: Users,
          label: t({ en: "Inner Circle", pt: "Círculo Interno", es: "Círculo Íntimo" }),
          description: t({ en: "Connect with accountability partners", pt: "Conecte-se com parceiros de responsabilidade", es: "Conecta con compañeros de responsabilidad" }),
          path: "/inner-circle",
          color: "text-indigo-500",
          bg: "bg-indigo-500/10",
        },
        {
          icon: Star,
          label: t({ en: "Challenges", pt: "Desafios", es: "Desafíos" }),
          description: t({ en: "Group challenges & competitions", pt: "Desafios em grupo e competições", es: "Desafíos y competencias grupales" }),
          path: "/challenges",
          color: "text-pink-500",
          bg: "bg-pink-500/10",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t({ en: "Arsenal", pt: "Arsenal", es: "Arsenal" })}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t({ en: "Tools not on your Bridge", pt: "Ferramentas fora da sua Ponte", es: "Herramientas fuera de tu Puente" })}
            </p>
          </div>
          {/* Theme Toggle */}
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="relative w-14 h-8 rounded-full bg-muted border border-border transition-colors duration-300 flex items-center"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <div
                className={`absolute w-6 h-6 rounded-full bg-primary shadow-md flex items-center justify-center transition-transform duration-300 ${
                  theme === "dark" ? "translate-x-7" : "translate-x-1"
                }`}
              >
                {theme === "dark" ? (
                  <Moon className="h-3.5 w-3.5 text-primary-foreground" />
                ) : (
                  <Sun className="h-3.5 w-3.5 text-primary-foreground" />
                )}
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-6 pb-28">
        {menuSections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
              {section.title}
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/50 active:bg-accent transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Settings Section */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">
            {t({ en: "Settings", pt: "Configurações", es: "Ajustes" })}
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
            {/* Language Toggle Row */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{t({ en: "Language", pt: "Idioma", es: "Idioma" })}</div>
                <div className="text-xs text-muted-foreground">
                  {language === "en" ? "English" : language === "pt" ? "Português" : "Español"}
                </div>
              </div>
              <div className="inline-flex items-center bg-muted/60 rounded-full p-0.5 gap-0.5">
                <button
                  onClick={() => setLanguage("en")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    language === "en"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="text-sm leading-none">🇬🇧</span>
                  <span>EN</span>
                </button>
                <button
                  onClick={() => setLanguage("pt")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    language === "pt"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="text-sm leading-none">🇧🇷</span>
                  <span>PT</span>
                </button>
                <button
                  onClick={() => setLanguage("es")}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                    language === "es"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="text-sm leading-none">🇪🇸</span>
                  <span>ES</span>
                </button>
              </div>
            </div>

            {/* Theme Toggle Row */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-violet-500" />
                ) : (
                  <Sun className="w-5 h-5 text-violet-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{t({ en: "Appearance", pt: "Aparência", es: "Apariencia" })}</div>
                <div className="text-xs text-muted-foreground">
                  {theme === "dark" ? t({ en: "Dark mode", pt: "Modo escuro", es: "Modo oscuro" }) : t({ en: "Light mode", pt: "Modo claro", es: "Modo claro" })}
                </div>
              </div>
              {toggleTheme && (
                <button
                  onClick={toggleTheme}
                  className={`relative w-12 h-7 rounded-full transition-colors duration-300 flex items-center ${
                    theme === "dark" ? "bg-primary" : "bg-muted border border-border"
                  }`}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  <div
                    className={`absolute w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      theme === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              )}
            </div>

            {/* Settings Link */}
            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-accent/50 active:bg-accent transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-500/10 flex items-center justify-center flex-shrink-0">
                <Settings className="w-5 h-5 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{t({ en: "Settings", pt: "Configurações", es: "Ajustes" })}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {t({ en: "Notifications, export & preferences", pt: "Notificações, exportação e preferências", es: "Notificaciones, exportación y preferencias" })}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

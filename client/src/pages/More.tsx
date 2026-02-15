import { Link } from "wouter";
import {
  BarChart3,
  Brain,
  Calendar,
  ChevronRight,
  Compass,
  Globe,
  Heart,
  Layers,
  Lightbulb,
  Moon,
  ScrollText,
  Settings,
  Shield,
  Sprout,
  Star,
  Sun,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function More() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const menuSections = [
    {
      title: t("Daily Practice", "Prática Diária"),
      items: [
        {
          icon: Compass,
          label: t("Daily Cycle", "Ciclo Diário"),
          description: t("Morning, midday & evening rituals", "Rituais da manhã, meio-dia e noite"),
          path: "/daily-cycle",
          color: "text-amber-500",
          bg: "bg-amber-500/10",
        },
        {
          icon: Layers,
          label: t("Emotional Sliders", "Controles Emocionais"),
          description: t("Calibrate your inner state", "Calibre seu estado interior"),
          path: "/sliders",
          color: "text-blue-500",
          bg: "bg-blue-500/10",
        },
        {
          icon: Brain,
          label: t("Bias Clearing", "Limpeza de Vieses"),
          description: t("Clear mental fog & biases", "Limpe a névoa mental e vieses"),
          path: "/bias-clearing",
          color: "text-purple-500",
          bg: "bg-purple-500/10",
        },
        {
          icon: Heart,
          label: t("Prayer Journal", "Diário de Oração"),
          description: t("Four-part prayer protocol", "Protocolo de oração em quatro partes"),
          path: "/prayer-journal",
          color: "text-rose-500",
          bg: "bg-rose-500/10",
        },
      ],
    },
    {
      title: t("Growth & Tracking", "Crescimento e Acompanhamento"),
      items: [
        {
          icon: BarChart3,
          label: t("Progress Dashboard", "Painel de Progresso"),
          description: t("Your learning journey overview", "Visão geral da sua jornada"),
          path: "/progress",
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        },
        {
          icon: Compass,
          label: t("Command Bridge", "Ponte de Comando"),
          description: t("Destiny Score, radar chart & AI greeting", "Pontuação Destino, gráfico radar e saudação IA"),
          path: "/dashboard",
          color: "text-primary",
          bg: "bg-primary/10",
        },
        {
          icon: Trophy,
          label: t("Achievements", "Conquistas"),
          description: t("Badges & milestones earned", "Medalhas e marcos alcançados"),
          path: "/achievements",
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
        },
        {
          icon: Zap,
          label: t("Flashcards", "Cartões de Estudo"),
          description: t("Review key concepts", "Revise conceitos-chave"),
          path: "/flashcards",
          color: "text-orange-500",
          bg: "bg-orange-500/10",
        },
        {
          icon: Calendar,
          label: t("Weekly Review", "Revisão Semanal"),
          description: t("Reflect on your week", "Reflita sobre sua semana"),
          path: "/weekly-review",
          color: "text-cyan-500",
          bg: "bg-cyan-500/10",
        },
        {
          icon: TrendingUp,
          label: t("Monthly Report", "Relatório Mensal"),
          description: t("Before & after comparison", "Comparação antes e depois"),
          path: "/monthly-report",
          color: "text-teal-500",
          bg: "bg-teal-500/10",
        },
      ],
    },
    {
      title: t("Community & Tools", "Comunidade e Ferramentas"),
      items: [
        {
          icon: Users,
          label: t("Inner Circle", "Círculo Interno"),
          description: t("Connect with accountability partners", "Conecte-se com parceiros de responsabilidade"),
          path: "/inner-circle",
          color: "text-indigo-500",
          bg: "bg-indigo-500/10",
        },
        {
          icon: Sprout,
          label: t("Sowing & Reaping", "Semeadura e Colheita"),
          description: t("Track cause-effect relationships", "Acompanhe relações de causa e efeito"),
          path: "/sowing-reaping",
          color: "text-green-500",
          bg: "bg-green-500/10",
        },
        {
          icon: Lightbulb,
          label: t("AI Insights", "Insights de IA"),
          description: t("Pattern analysis & recommendations", "Análise de padrões e recomendações"),
          path: "/insights",
          color: "text-sky-500",
          bg: "bg-sky-500/10",
        },
        {
          icon: Star,
          label: t("Challenges", "Desafios"),
          description: t("Group challenges & competitions", "Desafios em grupo e competições"),
          path: "/challenges",
          color: "text-pink-500",
          bg: "bg-pink-500/10",
        },
        {
          icon: ScrollText,
          label: t("Philosophy", "Filosofia"),
          description: t("The Prologue — why this app exists", "O Prólogo — porque esta app existe"),
          path: "/philosophy",
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        },
        {
          icon: Shield,
          label: t("Privacy & Data", "Privacidade e Dados"),
          description: t("Your data sovereignty", "Sua soberania de dados"),
          path: "/privacy",
          color: "text-slate-500",
          bg: "bg-slate-500/10",
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
            <h1 className="text-2xl font-bold">{t("More", "Mais")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {t("All features & tools", "Todos os recursos e ferramentas")}
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
            {t("Settings", "Configurações")}
          </h2>
          <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border">
            {/* Language Toggle Row */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-emerald-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{t("Language", "Idioma")}</div>
                <div className="text-xs text-muted-foreground">
                  {language === "en" ? "English" : "Português"}
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
                <div className="font-medium text-sm">{t("Appearance", "Aparência")}</div>
                <div className="text-xs text-muted-foreground">
                  {theme === "dark" ? t("Dark mode", "Modo escuro") : t("Light mode", "Modo claro")}
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
                <div className="font-medium text-sm">{t("Settings", "Configurações")}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {t("Notifications, export & preferences", "Notificações, exportação e preferências")}
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

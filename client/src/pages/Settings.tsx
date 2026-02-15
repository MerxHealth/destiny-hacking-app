import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bell, Clock, Save, Download, FileJson, FileSpreadsheet, Shield, Sun, Moon, Palette, Globe, FileText, AlertTriangle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { downloadCSV, downloadJSON, convertToCSV, formatCompleteDataForExport, formatSliderHistoryForExport } from "@/lib/export";
import { requestNotificationPermission, areNotificationsEnabled, scheduleDailyReminder, sendLocalNotification } from "@/lib/pushNotifications";
import { AxisManagement } from "@/components/AxisManagement";
import { PageHeader } from "@/components/PageHeader";
import { NotificationScheduler } from "@/components/NotificationScheduler";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Settings() {
  const { theme, toggleTheme, switchable } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [, navigate] = useLocation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Fetch notification settings
  const { data: settings, isLoading: settingsLoading } = trpc.notifications.getSettings.useQuery(
    undefined,
    {  }
  );

  // Local state for form
  const [enabled, setEnabled] = useState(settings?.enabled || false);
  const [reminderTime, setReminderTime] = useState(settings?.reminderTime || "09:00");
  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when settings load
  useState(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setReminderTime(settings.reminderTime);
    }
  });

  // Mutations
  const utils = trpc.useUtils();
  const updateSettingsMutation = trpc.notifications.updateSettings.useMutation({
    onSuccess: () => {
      utils.notifications.getSettings.invalidate();
      setHasChanges(false);
      toast.success(t("Settings saved", "Configurações salvas"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteAccountMutation = trpc.auth.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success(t('Account deleted successfully', 'Conta excluída com sucesso'));
      // Clear any auth tokens and redirect to landing
      document.cookie = 'app_session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      localStorage.removeItem('token');
      window.location.href = '/';
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendTestMutation = trpc.notifications.sendTest.useMutation({
    onSuccess: () => {
      toast.success(t("Test notification sent to project owner", "Notificação de teste enviada"));
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleSave = async () => {
    // Schedule push notification if enabled
    if (enabled && areNotificationsEnabled()) {
      const [hour, minute] = reminderTime.split(':').map(Number);
      await scheduleDailyReminder(hour, minute);
    }
    
    updateSettingsMutation.mutate({
      enabled,
      reminderTime,
    });
  };

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    
    if (result.granted) {
      toast.success(t("Notification permission granted", "Permissão de notificação concedida"));
      setEnabled(true);
      setHasChanges(true);
      
      // Send a test notification
      sendLocalNotification("Destiny Hacking", {
        body: t("Daily reminders are now enabled!", "Lembretes diários ativados!"),
        icon: "/icon-192.png"
      });
    } else {
      toast.error(result.error || t("Notification permission denied", "Permissão de notificação negada"));
    }
  };

  const handleSendTest = () => {
    sendTestMutation.mutate();
  };

  // Export handlers
  const handleExportCSV = () => {
    toast.info(t("Exporting CSV...", "Exportando CSV..."));
    const sampleData = [
      { date: new Date().toISOString(), axis: 'Anxiety ↔ Calm', value: 75, context: 'work', notes: 'Sample data' }
    ];
    const csv = convertToCSV(sampleData, ['date', 'axis', 'value', 'context', 'notes']);
    const filename = `destiny-hacking-slider-history-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(filename, csv);
    toast.success(t("CSV exported successfully", "CSV exportado com sucesso"));
  };

  const handleExportJSON = () => {
    toast.info(t("Exporting JSON...", "Exportando JSON..."));
    const completeData = formatCompleteDataForExport({
      sliderHistory: [],
      dailyCycles: [],
      insights: [],
    });
    
    const filename = `destiny-hacking-complete-data-${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(filename, completeData);
    toast.success(t("JSON exported successfully", "JSON exportado com sucesso"));
  };

  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <PageHeader title={t("Settings", "Configurações")} subtitle={t("Preferences & notifications", "Preferências e notificações")} showBack />
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title={t("Settings", "Configurações")}
        subtitle={t("Preferences & notifications", "Preferências e notificações")}
        showBack
        rightAction={
          hasChanges ? (
            <Button
              size="sm"
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              {t("Save", "Salvar")}
            </Button>
          ) : undefined
        }
      />

      <main className="px-4 py-4 space-y-4 pb-24">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>{t('Appearance', 'Aparência')}</CardTitle>
            </div>
            <CardDescription>
              {t('Customize the look and feel of your experience', 'Personalize a aparência da sua experiência')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Theme Toggle */}
            {switchable && toggleTheme && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Sun className="h-5 w-5 text-amber-500" />
                  )}
                  <div>
                    <Label className="text-sm font-medium">{t('Theme', 'Tema')}</Label>
                    <p className="text-xs text-muted-foreground">
                      {theme === 'dark'
                        ? t('Dark mode active', 'Modo escuro ativo')
                        : t('Light mode active', 'Modo claro ativo')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="gap-2"
                >
                  {theme === 'dark' ? (
                    <><Sun className="h-4 w-4" /> {t('Light', 'Claro')}</>
                  ) : (
                    <><Moon className="h-4 w-4" /> {t('Dark', 'Escuro')}</>
                  )}
                </Button>
              </div>
            )}

            {/* Language Switcher */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-emerald-500" />
                <div>
                  <Label className="text-sm font-medium">{t('Language', 'Idioma')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'English' : 'Português'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant={language === 'en' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('en')}
                >
                  EN
                </Button>
                <Button
                  variant={language === 'pt' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLanguage('pt')}
                >
                  PT
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Axis Management */}
        <AxisManagement />

        {/* Client-Side Notification Scheduling */}
        <NotificationScheduler />

        {/* Data Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle>{t('Data Export', 'Exportar Dados')}</CardTitle>
            </div>
            <CardDescription>
              {t('Download your complete emotional calibration history and insights', 'Baixe seu histórico completo de calibração emocional e insights')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* CSV Export */}
              <Button variant="outline" onClick={handleExportCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                {t('Export History (.csv)', 'Exportar Histórico (.csv)')}
              </Button>

              {/* JSON Export */}
              <Button variant="outline" onClick={handleExportJSON}>
                <FileJson className="h-4 w-4 mr-2" />
                {t('Export All Data (.json)', 'Exportar Todos os Dados (.json)')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Legal & Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>{t('Legal & Privacy', 'Legal e Privacidade')}</CardTitle>
            </div>
            <CardDescription>
              {t('Your data belongs to you. Review our policies.', 'Seus dados pertencem a você. Revise nossas políticas.')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/terms">
                <FileText className="h-4 w-4 mr-2" />
                {t('Terms & Conditions', 'Termos e Condições')}
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/privacy">
                <Shield className="h-4 w-4 mr-2" />
                {t('Privacy Policy', 'Política de Privacidade')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-destructive/30">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">{t('Delete Account', 'Excluir Conta')}</CardTitle>
            </div>
            <CardDescription>
              {t(
                'Permanently delete your account and all associated data. This action cannot be undone.',
                'Exclua permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.'
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('Delete My Account', 'Excluir Minha Conta')}
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive">
                {t('Delete Account?', 'Excluir Conta?')}
              </AlertDialogTitle>
              <AlertDialogDescription className="space-y-3">
                <p>
                  {t(
                    'This will permanently delete your account, all calibration data, progress, streaks, achievements, and journal entries. This cannot be undone.',
                    'Isso excluirá permanentemente sua conta, todos os dados de calibração, progresso, sequências, conquistas e entradas de diário. Isso não pode ser desfeito.'
                  )}
                </p>
                <div className="pt-2">
                  <Label className="text-sm font-medium text-foreground">
                    {t('Type DELETE to confirm:', 'Digite DELETE para confirmar:')}
                  </Label>
                  <Input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="mt-2"
                  />
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
                {t('Cancel', 'Cancelar')}
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={async () => {
                  try {
                    await deleteAccountMutation.mutateAsync({ confirmation: 'DELETE' });
                  } catch (err: any) {
                    toast.error(err.message || t('Failed to delete account', 'Falha ao excluir conta'));
                  }
                }}
              >
                {t('Delete Everything', 'Excluir Tudo')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}

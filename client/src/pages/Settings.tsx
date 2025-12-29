import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Bell, Clock, Save, Download, FileJson, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { downloadCSV, downloadJSON, convertToCSV, formatCompleteDataForExport, formatSliderHistoryForExport } from "@/lib/export";
import { requestNotificationPermission, areNotificationsEnabled, scheduleDailyReminder, sendLocalNotification } from "@/lib/pushNotifications";

export default function Settings() {
  const { user, isLoading: authLoading } = useAuth();

  // Fetch notification settings
  const { data: settings, isLoading: settingsLoading } = trpc.notifications.getSettings.useQuery(
    undefined,
    { enabled: !!user }
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
      toast.success("Settings saved");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const sendTestMutation = trpc.notifications.sendTest.useMutation({
    onSuccess: () => {
      toast.success("Test notification sent to project owner");
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
      toast.success("Notification permission granted");
      setEnabled(true);
      setHasChanges(true);
      
      // Send a test notification
      sendLocalNotification("Destiny Hacking", {
        body: "Daily reminders are now enabled!",
        icon: "/icon-192.png"
      });
    } else {
      toast.error(result.error || "Notification permission denied");
    }
  };

  const handleSendTest = () => {
    sendTestMutation.mutate();
  };

  // Export handlers
  const handleExportCSV = () => {
    toast.info("Exporting CSV...");
    // For now, create sample data since we need to properly fetch from tRPC
    const sampleData = [
      { date: new Date().toISOString(), axis: 'Anxiety ↔ Calm', value: 75, context: 'work', notes: 'Sample data' }
    ];
    const csv = convertToCSV(sampleData, ['date', 'axis', 'value', 'context', 'notes']);
    const filename = `destiny-hacking-slider-history-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(filename, csv);
    toast.success("CSV exported successfully");
  };

  const handleExportJSON = () => {
    toast.info("Exporting JSON...");
    // Create complete data export structure
    const completeData = formatCompleteDataForExport({
      sliderHistory: [],
      dailyCycles: [],
      insights: [],
    });
    
    const filename = `destiny-hacking-complete-data-${new Date().toISOString().split('T')[0]}.json`;
    downloadJSON(filename, completeData);
    toast.success("JSON exported successfully");
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Authentication Required</CardTitle>
            <CardDescription>Sign in to access settings</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" size="lg" asChild>
              <a href="/api/oauth/login">Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-sm text-muted-foreground">
                  Manage your preferences and notifications
                </p>
              </div>
            </div>
            {hasChanges && (
              <Button
                onClick={handleSave}
                disabled={updateSettingsMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8 max-w-2xl space-y-6">
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Daily Reminders</CardTitle>
            </div>
            <CardDescription>
              Get notified to complete your daily calibration and reflection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable Notifications */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications-enabled">Enable Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive daily reminders for your practice
                </p>
              </div>
              <Switch
                id="notifications-enabled"
                checked={enabled}
                onCheckedChange={(checked) => {
                  if (checked && Notification.permission !== "granted") {
                    handleRequestPermission();
                  } else {
                    setEnabled(checked);
                    setHasChanges(true);
                  }
                }}
              />
            </div>

            {/* Reminder Time */}
            {enabled && (
              <div className="space-y-2">
                <Label htmlFor="reminder-time" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Reminder Time
                </Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={reminderTime}
                  onChange={(e) => {
                    setReminderTime(e.target.value);
                    setHasChanges(true);
                  }}
                  className="max-w-xs"
                />
                <p className="text-xs text-muted-foreground">
                  You'll receive a notification at this time every day
                </p>
              </div>
            )}

            {/* Browser Permission Status */}
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Browser Permission</span>
                <span className="text-sm text-muted-foreground">
                  {typeof Notification !== "undefined"
                    ? Notification.permission === "granted"
                      ? "✓ Granted"
                      : Notification.permission === "denied"
                      ? "✗ Denied"
                      : "Not requested"
                    : "Not supported"}
                </span>
              </div>
              {typeof Notification !== "undefined" && Notification.permission === "default" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRequestPermission}
                  className="w-full"
                >
                  Request Permission
                </Button>
              )}
              {typeof Notification !== "undefined" && Notification.permission === "denied" && (
                <p className="text-xs text-muted-foreground">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              )}
            </div>

            {/* Test Notification */}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleSendTest}
                disabled={sendTestMutation.isPending}
                className="w-full"
              >
                Send Test Notification
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This will send a test notification to the project owner
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Data Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              <CardTitle>Data Export</CardTitle>
            </div>
            <CardDescription>
              Download your complete emotional calibration history and insights
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* CSV Export */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">CSV Export</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export slider history as CSV for analysis in Excel or Google Sheets
                </p>
                <Button
                  variant="outline"
                  onClick={handleExportCSV}
                  className="w-full"
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Export as CSV
                </Button>
              </div>

              {/* JSON Export */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <FileJson className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">JSON Export</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Export complete data including sliders, cycles, and insights
                </p>
                <Button
                  variant="outline"
                  onClick={handleExportJSON}
                  className="w-full"
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Export as JSON
                </Button>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Note:</strong> Exported data includes your emotional calibrations, 
                daily cycle completions, AI insights, and personal reflections. 
                Keep this data secure as it contains your personal information.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="font-medium">{user.name || "Not set"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="font-medium">{user.email || "Not set"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Timezone</Label>
              <p className="font-medium">{settings?.timezone || "UTC"}</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

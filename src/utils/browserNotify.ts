/** Tarayıcı / PWA (telefon ana ekran) bildirimleri — uygulama kapalıyken gönderim için ayrı Web Push kurulumu gerekir. */

export function browserNotificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission> {
  if (!browserNotificationsSupported()) return "denied";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

export function tryShowDesktopNotification(title: string, body: string) {
  if (!browserNotificationsSupported()) return;
  if (Notification.permission !== "granted") return;
  try {
    const icon = typeof window !== "undefined" ? `${window.location.origin}/icon-192.png` : undefined;
    new Notification(title, {
      body,
      icon,
      tag: "demirdev-notification",
    });
  } catch {
    /* bazı mobil tarayıcılarda sessizce başarısız olabilir */
  }
}

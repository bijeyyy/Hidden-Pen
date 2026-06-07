// ============================================================
// [BAGO] sw.js — Service Worker para sa Web Push Notifications
// Ilagay ito sa /public/sw.js ng iyong project
// ============================================================

self.addEventListener("push", (event) => {
    // [BAGO] Kunin ang data mula sa push notification
    const data = event.data?.json() ?? {};

    const title = data.title || "HiddenPen";
    const options = {
        body: data.body || "You have a new anonymous message!",
        icon: "/icon.png", // palitan ng icon path mo
        badge: "/badge.png", // optional badge icon
        tag: "hiddenpen-message", // para hindi mag-stack ang notifications
        renotify: true, // mag-notify ulit kahit same tag
        data: {
            url: data.url || "/user_inbox", // URL na bubuksan pag na-click ang notif
        },
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// [BAGO] Pag na-click ang notification, buksan ang inbox
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data?.url || "/user_inbox")
    );
});
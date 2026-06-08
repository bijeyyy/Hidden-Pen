self.addEventListener("push", (event) => {
    const data = event.data?.json() ?? {};

    const title = data.title || "HiddenPen";
    const options = {
        body: data.body || "You have a new anonymous message!",
        icon: "/icon.png", 
        badge: "/badge.png", 
        tag: "hiddenpen-message", 
        renotify: true, 
        data: {
            url: data.url || "/user_inbox", 
        },
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow(event.notification.data?.url || "/user_inbox")
    );
});
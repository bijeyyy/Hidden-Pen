import { useEffect, useState } from "react";
import { supabase } from "../../lib/SupabaseClient";

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

function UserSettings() {
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [username, setUsername] = useState("");
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [passwordMsg, setPasswordMsg] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [providers, setProviders] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [pushSupported, setPushSupported] = useState(false);

    const [settings, setSettings] = useState({
        anon_messages: true,
        allow_link_sharing: true,

        msg_notifications: true,

        dark_mode: false,

        show_timestamps: true,
    });

    const hiddenLink = username
        ? `https://hiddenpen.app/u/${username}`
        : "";

    const applyTheme = (value) => {
        if (value) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    };

    const toggleDarkMode = (value) => {
        applyTheme(value);
        updateSetting("dark_mode", value);
    };

    const ToggleSwitch = ({ checked, onChange, disabled = false }) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${disabled
                ? "opacity-40 cursor-not-allowed bg-gray-300"
                : checked
                    ? "bg-primary focus:ring-primary"
                    : "bg-gray-300 focus:ring-gray-400"
                }`}
        >
            <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-5" : "translate-x-0.5"
                    }`}
            />
        </button>
    );

    useEffect(() => {
        const loadSettings = async () => {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserId(user.id);
            setUserEmail(user.email);

            setProviders(user.app_metadata?.providers || []);

            const { data: profile } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .single();

            if (profile) {
                setUsername(profile.username);
            }

            const { data } = await supabase
                .from("user_settings")
                .select("*")
                .eq("user_id", user.id)
                .single();

            const savedTheme = localStorage.getItem("theme");
            const syncedSettings = {
                ...(data || settings),
                dark_mode:
                    savedTheme === "dark" ? true
                        : savedTheme === "light" ? false
                            : (data || settings).dark_mode,
            };

            applyTheme(syncedSettings.dark_mode);

            if (!data) {
                await supabase.from("user_settings").insert({
                    user_id: user.id,
                    ...syncedSettings,
                });
                setSettings(syncedSettings);
                setLoading(false);
                return;
            }

            setSettings(syncedSettings);
            setLoading(false);
        };

        loadSettings();

        if ("serviceWorker" in navigator && "PushManager" in window) {
            setPushSupported(true);
        }
    }, []);

    const updateSetting = async (key, value) => {
        if (!userId) return;
        const updated = { ...settings, [key]: value };
        setSettings(updated);
        await supabase
            .from("user_settings")
            .update({ [key]: value })
            .eq("user_id", userId);
    };

    const subscribeToPush = async () => {
        try {
            const reg = await navigator.serviceWorker.register("/sw.js");
            const existing = await reg.pushManager.getSubscription();
            if (existing) return existing;

            const subscription = await reg.pushManager.getSubscription({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            await supabase.from("push_subscriptions").upsert({
                user_id: userId,
                subscription: JSON.stringify(subscription),
            });

            return subscription;
        } catch (err) {
            console.error("Push subscription error:", err);
        }
    };

    const unsubscribeFromPush = async () => {
        try {
            const reg = await navigator.serviceWorker.getRegistration("/sw.js");
            const sub = await reg?.pushManager.getSubscription();
            if (sub) await sub, unsubscribe();

            await supabase
                .from("push_notifications")
                .delete()
                .eq("user_id", userId);
        } catch (err) {
            console.error("Push unsubscribe error:", err);
        }
    };

    const handleNotificationToggle = async (value) => {
        if (!pushSupported) return;

        if (value) {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                alert("Please allow notifications in your browser settings to enable this.");
                return;
            }
            await subscribeToPush();
        } else {
            await unsubscribeFromPush();
        }

        updateSetting("msg_notifications", value);
    };

    const copyLink = async () => {
        if (!hiddenLink) return;

        await navigator.clipboard.writeText(hiddenLink);

        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    };

    const handleChangePassword = async () => {
        if (!userEmail) return;

        if (isGoogleOnly) {
            setPasswordMsg(
                "You signed in with Google. Password reser is not required."
            );
            return;
        }

        setPasswordLoading(true);
        setPasswordMsg("");

        const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
            redirectTo: "https://hiddenpen.app/reset-password", // <-- palitan ng tamang URL
        });

        setPasswordLoading(false);
        if (error) {
            setPasswordMsg("Something went wrong. Please try again.");
        } else {
            setPasswordMsg(`Reset link sent to ${userEmail}`);
        }
    };

    const isGoogleOnly =
        providers.includes("google") &&
        !providers.includes("email");

    if (loading) {
        return <div className="p-10 text-center">Loading settings...</div>;
    }

    return (
        <>
            <div className="min-h-screen bg-bg px-6 py-10">
                <h1 className="text-2xl font-bold mb-6">Settings</h1>

                {/* PRIVACY */}
                <div className="bg-bg p-5 rounded-xl shadow mb-4">
                    <h2 className="flex gap-2 font-semibold mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                        </svg>
                        Privacy
                    </h2>

                    {/* anon_messages — kung pwedeng mag-send ang hindi naka-login */}
                    <label className="flex items-center justify-between gap-4 py-2">
                        <div>
                            <span>Accept Anonymous Messages</span>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {settings.anon_messages
                                    ? "Anyone with your link can send you a message"
                                    : "Only logged-in users can message you"}
                            </p>
                        </div>
                        <ToggleSwitch
                            checked={settings.anon_messages}
                            onChange={(value) => updateSetting("anon_messages", value)}
                        />
                    </label>

                    {/* allow_link_sharing — on/off ang buong link mo */}
                    <label className="flex items-center justify-between gap-4 py-2">
                        <div>
                            <span>Receive Messages</span>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {settings.allow_link_sharing
                                    ? "Your hidden link is active — people can message you"
                                    : "Your hidden link is paused — no one can message you right now"}
                            </p>
                        </div>
                        <ToggleSwitch
                            checked={settings.allow_link_sharing}
                            onChange={(value) => updateSetting("allow_link_sharing", value)}
                        />
                    </label>
                </div>

                {/* NOTIFICATIONS */}
                <div className="bg-bg p-5 rounded-xl shadow mb-4">
                    <h2 className="flex gap-2 font-semibold mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                        </svg>
                        Notifications
                    </h2>

                    <label className="flex items-center justify-between gap-4 py-2">
                        <div>
                            <span>Message Notifications</span>
                            <p className="text-xs text-gray-400 mt-0.5">
                                {pushSupported
                                    ? "Get a push notification when someone messages you"
                                    : "Push notifications are not supported in your browser"}
                            </p>
                        </div>
                        <ToggleSwitch
                            checked={settings.msg_notifications}
                            onChange={handleNotificationToggle}
                            disabled={!pushSupported}
                        />
                    </label>
                </div>

                {/* APPEARANCE */}
                <div className="bg-bg p-5 rounded-xl shadow mb-4">
                    <h2 className="flex gap-2 font-semibold mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008Z" />
                        </svg>
                        Appearance
                    </h2>

                    <label className="flex items-center justify-between gap-4 py-2">
                        <span>Dark Mode</span>
                        <ToggleSwitch checked={settings.dark_mode} onChange={toggleDarkMode} />
                    </label>
                </div>

                {/* HIDDEN LINK */}
                <div className="bg-bg p-5 rounded-xl shadow mb-4">
                    <h2 className="flex gap-2 font-semibold mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                        </svg>
                        Hidden Link
                    </h2>

                    {!settings.allow_link_sharing ? (
                        <p className="text-sm text-gray-400 mb-3">
                            Your link is currently paused. Enable "Receive Messages" in Privacy to activate it.
                        </p>
                    ) : (
                        <p className="text-sm break-all mb-3">{hiddenLink}</p>
                    )}

                    <button
                        onClick={copyLink}
                        disabled={!settings.allow_link_sharing}
                        className={`px-4 py-2 rounded-lg text-white transition-all bg-primary ${!settings.allow_link_sharing
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                            }`}
                    >
                        {!settings.allow_link_sharing ? "Link Disabled" : copyFeedback ? "✓ Copied!" : "Copy Link"}
                    </button>
                </div>

                {/* MESSAGE SETTINGS */}
                <div className="bg-bg p-5 rounded-xl shadow mb-4">
                    <h2 className="flex gap-2 font-semibold mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 0 1 1.037-.443 48.282 48.282 0 0 0 5.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
                        </svg>
                        Message Settings
                    </h2>

                    <label className="flex items-center justify-between gap-4 py-2">
                        <div>
                            <span>Auto-delete after 30 days</span>
                            <p className="text-xs text-amber-500 mt-0.5">
                                ⚠ Messages older than 30 days will be permanently deleted
                            </p>
                        </div>
                    </label>

                    <label className="flex items-center justify-between gap-4 py-2">
                        <div>
                            <span>Show Timestamps</span>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Display when each message was sent
                            </p>
                        </div>
                        <ToggleSwitch
                            checked={settings.show_timestamps}
                            onChange={(value) => updateSetting("show_timestamps", value)}
                        />
                    </label>
                </div>

                {/* SECURITY */}
                <div className="bg-bg p-5 rounded-xl shadow">
                    <h2 className="flex gap-2 font-semibold mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                        </svg>
                        Security
                    </h2>

                    {isGoogleOnly ? (
                        <div className="py-2">
                            <p className="text-sm text-gray-400">
                                You signed in with Google.
                                Password reset is not required.
                            </p>
                        </div>
                    ) : (
                        <div className="py-2">
                            <button
                                onClick={handleChangePassword}
                                disabled={passwordLoading}
                                className="block w-full text-left py-2 disabled:opacity-50"
                            >
                                {passwordLoading
                                    ? "Sending reset link..."
                                    : "Change Password"}
                            </button>

                            {passwordMsg && (
                                <p
                                    className={`text-xs mt-1 ${passwordMsg.includes("sent")
                                        ? "text-green-500"
                                        : "text-red-500"
                                        }`}
                                >
                                    {passwordMsg}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </>
    );
}

export default UserSettings;
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/SupabaseClient";
import User from "../../assets/user_logo.png";
import Notif from "../../assets/notification.png";
import { createWebSocketModuleRunnerTransport } from "vite/module-runner";

function User_Dashboard() {
    const navigate = useNavigate();
    const [hiddenLink, setHiddenLink] = useState("");

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [profileImage, setProfileImage] = useState("");
    const [messageCount, setMessageCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [todayCount, setTodayCount] = useState(0);
    const [recentMessages, setRecentMessages] = useState([]);
    const [favoriteMessages, setFavoriteMessages] = useState([]);
    const [favoriteCount, setFavoriteCount] = useState(0);
    const [sessionUser, setSessionUser] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [settings, setSettings] = useState({allow_link_sharing: true,});
    {/* NOTIFICATIONS */ }
    const [isnotification, setNotification] = useState(false);
    const [notifications, setNotifications] = useState([]);

    {/* SOCIALS */ }
    const [copied, setCopied] = useState(false);
    const handleCopyLink = async () => {
        if (!hiddenLink) return;

        await navigator.clipboard.writeText(hiddenLink);

        setCopied(true);

        setTimeout(() => {
            setCopied(false);
        }, 2000);
    };

    const createProfileAndSettings = async (user) => {
        const username =
            user.user_metadata?.display_name
                ?.toLowerCase()
                .replace(/\s+/g, "") ||
            user.email.split("@")[0].toLowerCase();

        const { error: profileError } = await supabase
            .from("profiles")
            .upsert({
                id: user.id,
                username,
                display_name:
                    user.user_metadata?.display_name ||
                    user.user_metadata?.name ||
                    "Hidden Pen User",
                avatar_url:
                    user.user_metadata?.avatar_url ||
                    user.user_metadata?.picture ||
                    "",
            });

        if (profileError) {
            console.error("Profile error:", profileError);
        }

        const { error: settingsError } = await supabase
            .from("user_settings")
            .upsert({
                user_id: user.id,
            },
                {
                    onConflict: "user_id",
                }
            );

        if (settingsError) {
            console.error("Settings error:", settingsError);
        }
    };

    const loadDashboardMessages = async (userId) => {
        const { data, error } = await supabase
            .from("messages")
            .select(`
                *,
                message_reads (
                    user_id
                )
            `)
            .eq("receiver_id", userId)
            .order("created_at", { ascending: false }); 

        if (error) {
            console.error("Dashboard messages error:", error);
            return;
        }

        const messages = data || [];
        const today = new Date();
        const todayDate = today.toDateString();

        const todayMessages = messages.filter((msg) => {
            const messageDate = new Date(msg.created_at).toDateString();
            return messageDate === todayDate;
        });

        const unreadMessages = messages.filter(
            (msg) => 
                !msg.message_reads?.some(
                    (read) => read.user_id === userId
                )
        );

        const lovedMessages = messages
            .filter((msg) => msg.is_loved)
            .sort((a, b) => new Date(a.loved_at) - new Date(b.loved_at));

        setMessageCount(messages.length);
        setUnreadCount(unreadMessages.length);
        setTodayCount(todayMessages.length);

        setRecentMessages(messages.slice(0, 3));
        setFavoriteMessages(lovedMessages.slice(0, 3));
        setFavoriteCount(lovedMessages.length);

        setNotifications(

            unreadMessages
                .slice(0, 5)
                .map((msg) => ({
                    id: msg.id,
                    message: msg.message,
                    time: new Date(msg.created_at).toLocaleString(),
                }))
        );
    };

    const markNotificationsAsRead = async (messageIds, userId) => {
        if (!messageIds.length) return;

        const row = messageIds.map((messageId) => ({
            message_id: messageId,
            user_id: userId,
        }));

        const { error } = await supabase
            .from("message_reads")
            .upsert(rows, {
                onConflict: "message_id,user_id",
            });

        if (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setCurrentUser(session.user);

            if (!session) {
                navigate("/Login");
                return;
            }

            setSessionUser(session.user);
            setUserEmail(session.user.email);

            setDisplayName(
                session.user.user_metadata?.display_name ||
                session.user.user_metadata?.name ||
                "Hidden Pen User"
            );

            setProfileImage(
                session.user.user_metadata?.avatar_url ||
                session.user.user_metadata?.picture ||
                ""
            );

            await createProfileAndSettings(session.user);

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("*")
                .eq("id", session.user.id)
                .single();

            if (profileError) {
                console.error("Get profile error:", profileError);
                return;
            }

            setHiddenLink(`${window.location.origin}/u/${profile.username}`);

            await loadDashboardMessages(session.user.id);

            const { data: settingsData } = await supabase
                .from("user_settings")
                .select("allow_link_sharing")
                .eq("user_id", session.user.id)
                .single();

            if (settingsData) setSettings(settingsData);
        };

        checkUser();
    }, [navigate]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    return (
        <>
            <nav className="bg-bg fixed w-full z-20 top-0 border-b border-default">
                <div className="flex flex-wrap items-center justify-between mx-auto p-4">

                    {/* Logo */}
                    <span className="self-center text-md text-body font-semibold whitespace-nowrap">
                        Welcome, {displayName}
                    </span>

                    {/* USER MENU */}
                    <div className="relative flex items-center md:order-2 gap-8">
                        <button
                            type="button"
                            onClick={async () => {
                                const opening = !isnotification;
                                setNotification(opening);

                                if (opening && notifications.length > 0) {
                                    const ids = notifications.map((n) => n.id);
                                    await markNotificationsAsRead(ids, sessionUser.id);
                                    setUnreadCount(0);
                                    setNotifications([]);
                                }
                            }}
                            className="relative inline-flex items-center justify-center w-10 h-10">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-7 text-primary cursor-pointer">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                            {unreadCount > 0 && !isnotification && (
                                <span className="absolute -top-2 -right-2 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>

                        {isnotification && (
                            <div className="absolute right-0 top-12 z-50 bg-neutral-primary-medium border border-default-medium rounded-lg shadow-lg w-56">

                                <div className="px-4 py-3 text-sm border-b border-default">
                                    <span className="block text-heading font-medium">
                                        Notifications
                                    </span>
                                </div>

                                {/* NOTIFICATION LISTS */}
                                <div className="max-h-64 overflow-y-auto">

                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-3 text-sm text-gray-400">
                                            No notifications yet
                                        </div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div
                                                key={notif.id}
                                                className="px-4 py-3 hover:bg-neutral-primary-light cursor-pointer border-b border-default">

                                                <p className="text-sm text-text-primary">
                                                    {notif.message}
                                                </p>

                                                <span className="text-xs text-text-secondary">
                                                    {notif.time}
                                                </span>
                                            </div>
                                        ))
                                    )
                                    }

                                </div>

                                {/* VIEW ALL */}
                                <div className="px-4 py-2 border-t border-default text-center">
                                    <button
                                        onClick={() => navigate("/user_inbox")}
                                        className="text-xs text-primary hover:underline cursor-pointer">
                                        View all messages
                                    </button>
                                </div>

                            </div>
                        )}

                        <button
                            type="button"
                            onClick={() =>
                                setIsDropdownOpen(!isDropdownOpen)
                            }
                            className="w-10 h-10 rounded-full overflow-hidden border border-default hover:opacity-90 cursor-pointer">
                            <img
                                src={profileImage || User}
                                alt={displayName || "User"}
                                className="w-full h-full object-cover"
                            />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 top-12 z-50 bg-neutral-primary-medium border border-default-medium rounded-lg shadow-lg w-56">

                                <div className="px-4 py-3 text-sm border-b border-default">
                                    <span className="block text-heading font-medium">
                                        {displayName}
                                    </span>

                                    <span className="block text-body truncate">
                                        {userEmail}
                                    </span>
                                </div>

                                <ul className="p-2 text-sm text-body font-medium">

                                    <li>
                                        <Link to="/user_settings">
                                            <button
                                                className="w-full text-left p-2 hover:bg-neutral-tertiary-medium rounded"
                                            >
                                                Settings
                                            </button>
                                        </Link>
                                    </li>

                                    <li>
                                        <Link to="/user_profile">
                                            <button
                                                className="w-full text-left p-2 hover:bg-neutral-tertiary-medium rounded"
                                            >
                                                Profile
                                            </button>
                                        </Link>
                                    </li>

                                    <li>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left p-2 text-red-500 hover:bg-red-50 rounded"
                                        >
                                            Logout
                                        </button>
                                    </li>

                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* DASHBOARD CONTENT */}
            <div className="w-full px-6 mt-24">

                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* LEFT SIDE */}
                    <div className="space-y-6">

                        {/* INBOX PREVIEW */}
                        <div className="bg-card p-6 border border-default rounded-base shadow-xs">
                            <h5 className="mb-3 text-2xl font-semibold text-heading">
                                New Messages
                            </h5>

                            <p className="text-body mb-2">
                                You have{" "}
                                <span className="font-semibold text-heading">
                                    {unreadCount} unread messages
                                </span>
                            </p>

                            <p className="text-body mb-4 italic">
                                —
                            </p>

                            <p className="text-xs text-gray-400 mb-6">
                                Latest: — • +0 since yesterday
                            </p>

                            <Link
                                to="/user_inbox"
                                className="inline-flex justify-center items-center w-1/2 text-white bg-button hover:bg-button-hover font-medium rounded-base text-sm px-4 py-2.5"
                            >
                                View All
                            </Link>
                        </div>

                        {/* HIDDEN LINK CARD */}
<div className="bg-card p-6 border border-default rounded-base shadow-xs">

    <h5 className="mb-3 text-2xl font-semibold text-heading">
        Your Hidden Link
    </h5>

    <p className="text-body mb-4">
        {settings.allow_link_sharing
            ? "let people send you secrets, confessions, or compliments"
            : "Your link is paused - no one can message you right now"}
    </p>

    {/* LINK DISPLAY */}
    <div className="bg-bg border border-default rounded-base p-3 mb-4">
        {settings.allow_link_sharing ? (
            hiddenLink ? (
                <a
                    href={hiddenLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-light break-all underline hover:opacity-80"
                >
                    {hiddenLink}
                </a>
            ) : (
                <p className="text-sm text-text-secondary">
                    Creating your link...
                </p>
            )
        ) : (
            <p className="text-sm text-text-secondary">
                Link is currently disabled
            </p>
        )}
    </div>

    {/* ACTION BUTTON */}
    <div className="flex flex-wrap gap-2">

        <button
            onClick={handleCopyLink}
            disabled={!settings.allow_link_sharing || !hiddenLink}
            className="text-white md:w-1/4 w-1/2 bg-button hover:bg-button-hover text-sm px-4 py-2 rounded-base transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
            {copied ? "✓ Link Copied" : "Copy Link"}
        </button>

    </div>

</div>
                        {/* LOVED MESSAGES */}
                        <div className="bg-card p-6 border border-default rounded-base shadow-xs">
                            <div className="flex items-center justify-between mb-4">
                                <h5 className="text-xl font-semibold text-heading">
                                    Loved Messages ❤️
                                </h5>

                                <span className="text-sm text-primary-hover font-medium">
                                    {favoriteCount} Loved
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {favoriteMessages.length === 0 ? (
                                    <p className="text-sm text-gray-400 col-span-3">
                                        No saved messages yet.
                                    </p>
                                ) : (
                                    favoriteMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className="border border-default rounded-base p-4 bg-bg"
                                        >
                                            <p className="text-sm text-text-primary line-clamp-3">
                                                {msg.message}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-3">
                                                {new Date(msg.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Link to="/user_favorites">
                                <button className="w-1/2 mt-4 py-2 text-sm font-medium text-primary border hover:text-white border-button rounded-base hover:bg-button transition cursor-pointer">
                                    View All Favorites
                                </button>
                            </Link>
                        </div>

                    </div>

                    {/* RIGHT SIDE */}
                    <div className="space-y-6">

                        {/* QUICK STATS */}
                        <div className="grid grid-cols-3 gap-3">

                            <div className="bg-card from-white to-neutral-primary-soft p-4 border border-default rounded-base">
                                <p className="text-xs text-gray-500">
                                    Messages
                                </p>
                                <p className="text-2xl font-semibold text-heading">
                                    {messageCount}
                                </p>
                                <p className="text-xs text-gray-400">
                                    All time
                                </p>
                            </div>

                            <div className="bg-card from-white to-neutral-primary-soft p-4 border border-default rounded-base">
                                <p className="text-xs text-gray-500">
                                    Unread
                                </p>
                                <p className="text-2xl font-semibold text-heading">
                                    {unreadCount}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Needs attention
                                </p>
                            </div>

                            <div className="bg-card from-white to-neutral-primary-soft p-4 border border-default rounded-base">
                                <p className="text-xs text-gray-500">
                                    Today
                                </p>
                                <p className="text-2xl font-semibold text-heading">
                                    {todayCount}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Active now
                                </p>
                            </div>

                        </div>

                        {/* RECENT MESSAGES */}
                        <div className="bg-card p-6 border border-default rounded-base shadow-xs">

                            <div className="flex items-center justify-between mb-5">
                                <h5 className="text-xl font-semibold text-heading">
                                    Recent Messages
                                </h5>

                                <Link
                                    to="/user_inbox"
                                    className="text-sm text-primary hover:underline"
                                >
                                    See all
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {recentMessages.length === 0 ? (
                                    <p className="text-sm text-gray-400">
                                        No messages yet.
                                    </p>
                                ) : (
                                    recentMessages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className="border border-default rounded-base p-3 bg-bg"
                                        >
                                            <p className="text-sm text-text-primary line-clamp-2">
                                                {msg.message}
                                            </p>

                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(msg.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>

                    </div>

                </div>

            </div>
            {/* FOOTER */}
            <footer className="mt-16 border-t border-default py-6 text-center text-sm text-gray-400">
                <p>© {new Date().getFullYear()} Hidden Pen. All rights reserved.</p>
            </footer>
        </>
    );
}

export default User_Dashboard;
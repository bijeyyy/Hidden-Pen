import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/SupabaseClient";

function Toast({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="flex items-center w-full max-w-sm p-4 text-body bg-neutral-primary-soft rounded-base shadow-xs border border-default"
                    role="alert"
                >
                    <div className="ms-2.5 text-sm">
                        {toast.message}
                    </div>

                    <button
                        type="button"
                        onClick={() => removeToast(toast.id)}
                        className="ms-auto text-sm text-gray-500 hover:text-black"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
}

function UserFavorites() {

    const [favoriteMessages, setFavoriteMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toasts, setToasts] = useState([]);

    const showToast = (message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // =========================
    // LOAD FAVORITES (message_reactions)
    // =========================
    useEffect(() => {
        const loadFavorites = async () => {

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session) {
                setLoading(false);
                return;
            }

            const userId = session.user.id;

            const { data, error } = await supabase
                .from("message_reactions")
                .select(`
                    message_id,
                    messages (
                        id,
                        message,
                        created_at
                    )
                `)
                .eq("user_id", userId)
                .eq("is_loved", true)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Favorites error:", error);
                setLoading(false);
                return;
            }

            const formatted = (data || []).map(item => ({
                id: item.messages.id,
                message: item.messages.message,
                created_at: item.messages.created_at
            }));

            setFavoriteMessages(formatted);
            setLoading(false);
        };

        loadFavorites();
    }, []);

    // =========================
    // REMOVE FAVORITE (FIXED RELATIONAL DELETE)
    // =========================
    const removeFromFavorites = async (messageId) => {

        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        const userId = session.user.id;

        const { error } = await supabase
            .from("message_reactions")
            .delete()
            .eq("message_id", messageId)
            .eq("user_id", userId);

        if (error) {
            console.error("Remove favorite error:", error);
            showToast("Failed to remove from favorites.");
            return;
        }

        setFavoriteMessages((prev) =>
            prev.filter((msg) => msg.id !== messageId)
        );

        showToast("Removed from favorites");
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto py-8 px-6">
                <p className="text-body">Loading favorites...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-6">

            <div className="mt-6 mb-8">
                <h1 className="flex gap-2 text-3xl font-bold text-heading">
                    Loved Messages

                    <svg xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="size-9 text-primary"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                    </svg>
                </h1>

                <p className="mt-2 text-body">
                    You have {favoriteMessages.length} favorite messages
                </p>
            </div>

            {favoriteMessages.length === 0 ? (
                <div className="bg-bg border border-border rounded-base p-12 text-center shadow-xs">
                    <h2 className="text-2xl font-semibold text-heading">
                        No favorite messages yet
                    </h2>

                    <p className="mt-2 text-body">
                        Save messages you love and they'll appear here.
                    </p>

                    <Link to="/user_inbox">
                        <button className="mt-6 px-6 py-3 bg-button text-white rounded-base">
                            Go to Inbox
                        </button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">

                    {favoriteMessages.map((message) => (
                        <div
                            key={message.id}
                            className="bg-bg border border-border rounded-base p-5 shadow-xs hover:shadow-sm transition"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-medium text-heading">
                                    ❤️ Favorite Message
                                </span>

                                <span className="text-sm text-body">
                                    {new Date(message.created_at).toLocaleString()}
                                </span>
                            </div>

                            <p className="text-body">
                                {message.message}
                            </p>

                            <button
                                onClick={() => removeFromFavorites(message.id)}
                                className="mt-4 text-sm text-red-500 hover:underline"
                            >
                                Remove from Favorites
                            </button>
                        </div>
                    ))}

                </div>
            )}

            <Toast toasts={toasts} removeToast={removeToast} />

        </div>
    );
}

export default UserFavorites;
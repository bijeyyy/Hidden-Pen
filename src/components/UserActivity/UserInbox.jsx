import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/SupabaseClient";
import {
    Squares2X2Icon,
    EnvelopeIcon,
    HeartIcon,
    ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

function Toast({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="flex items-center w-full max-w-sm p-4 text-body bg-neutral-primary-soft rounded-base shadow-xs border border-default"
                    role="alert"
                >
                    <svg className="w-5 h-5 text-fg-brand" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 18-7 3 7-18 7 18-7-3Zm0 0v-5" />
                    </svg>
                    <div className="ms-2.5 text-sm border-s border-default ps-3.5">
                        {toast.message}
                    </div>
                    <button
                        type="button"
                        onClick={() => removeToast(toast.id)}
                        className="ms-auto flex items-center justify-center text-body hover:text-heading bg-transparent box-border border border-transparent hover:bg-neutral-secondary-medium focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded text-sm h-8 w-8 focus:outline-none"
                        aria-label="Close"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6" />
                        </svg>
                    </button>
                </div>
            ))}
        </div>
    );
}

function UserInbox() {
    const [activeTab, setActiveTab] = useState("all");
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    const [toasts, setToasts] = useState([]);

    const showToast = (message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => removeToast(id), 3000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !==id));
    };

    const loadMessages = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            setLoading(false);
            return;
        }

        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("receiver_id", session.user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Messages error:", error);
        } else {
            setMessages(data || []);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const markAsRead = async (id) => {
        const { error } = await supabase
            .from("messages")
            .update({ is_read: true })
            .eq("id", id);

        if (!error) {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === id ? { ...msg, is_read: true } : msg
                )
            );
        }
    };

    const toggleFavorite = async (msg) => {
        const willBeLoved = !msg.is_loved;

        const { error } = await supabase
            .from("messages")
            .update({
                is_loved: willBeLoved,
                loved_at: willBeLoved ? new Date().toISOString() : null,
            })
            .eq("id", msg.id);

        if (error) {
            console.error("Favorite update error:", error);
            return;
        }

        setMessages((prev) =>
            prev.map((item) =>
                item.id === msg.id
                    ? {
                        ...item,
                        is_loved: willBeLoved,
                        loved_at: willBeLoved ? new Date().toISOString() : null,
                    }
                    : item
            )
        );

        if (selectedMessage?.id === msg.id) {
            setSelectedMessage({
                ...selectedMessage,
                is_loved: willBeLoved,
                loved_at: willBeLoved ? new Date().toISOString() : null,
            });
        }

        showToast(willBeLoved ? "Message added to favorites." : "Message removed from favorites.");
    };

    const toggleArchive = async (msg) => {
        const willBeArchived = !msg.is_archived;
        const { error } = await supabase
            .from("messages")
            .update({ is_archived: willBeArchived })
            .eq("id", msg.id);

        if (!error) {
            setMessages((prev) =>
                prev.map((item) =>
                    item.id === msg.id
                        ? { ...item, is_archived: willBeArchived }
                        : item
                )
            );

            if (selectedMessage?.id === msg.id) {
                setSelectedMessage({
                    ...selectedMessage,
                    is_archived: willBeArchived,
                });
            }
            showToast(willBeArchived ? "Message archived." : "Message unarchived.");
        }
    };

    const deleteMessage = async (id) => {
        const { error } = await supabase
            .from("messages")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Delete message error:", error);
            return;
        }

        setMessages((prev) => prev.filter((msg) => msg.id !== id));
        setSelectedMessage(null);
        setDeleteSuccess(true);
    };

    const filteredMessages = messages.filter((msg) => {
        if (activeTab === "unread") return !msg.is_read;
        if (activeTab === "favorites") return msg.is_loved;
        if (activeTab === "archived") return msg.is_archived;
        return !msg.is_archived;
    });

    return (
        <>
            <div className="min-h-screen px-4 sm:px-8 lg:px-24 max-w-7xl mx-auto mt-12">
                <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                    Inbox
                </h1>

                <p className="text-text-secondary mb-8 text-sm sm:text-base">
                    View all your anonymous messages.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    <div className="bg-bg border border-default rounded-lg p-5 shadow-sm">
                        <p className="text-sm text-gray-400">All Messages</p>
                        <h2 className="text-3xl font-bold">
                            {messages.filter((msg) => !msg.is_archived).length}
                        </h2>
                    </div>

                    <div className="bg-bg border border-default rounded-lg p-5 shadow-sm">
                        <p className="text-sm text-gray-400">Unread</p>
                        <h2 className="text-3xl font-bold text-red-500">
                            {messages.filter((msg) => !msg.is_read && !msg.is_archived).length}
                        </h2>
                    </div>

                    <div className="bg-bg border border-default rounded-lg p-5 shadow-sm">
                        <p className="text-sm text-gray-400">Favorites</p>
                        <h2 className="text-3xl font-bold text-pink-500">
                            {messages.filter((msg) => msg.is_loved).length}
                        </h2>
                    </div>
                </div>

                <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                    {["all", "unread", "favorites", "archived"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 ${activeTab === tab
                                ? "bg-button text-white"
                                : "border border-default hover:bg-bg"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                <div className="space-y-5">
                    {loading ? (
                        <p className="text-text-secondary">Loading messages...</p>
                    ) : filteredMessages.length === 0 ? (
                        <div className="bg-bg border border-default rounded-lg p-10 text-center shadow-sm">
                            <h2 className="flex justify-center items-center text-xl font-semibold mb-2">
                                {activeTab === "all" && <Squares2X2Icon className="size-16 text-primary" />}
                                {activeTab === "unread" && <EnvelopeIcon className="size-16 text-primary" />}
                                {activeTab === "favorites" && <HeartIcon className="size-16 text-primary" />}
                                {activeTab === "archived" && <ArchiveBoxIcon className="size-16 text-primary" />}
                            </h2>

                            <p className="text-text-secondary">
                                Nothing to show in this section.
                            </p>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                onClick={() => {
                                    setSelectedMessage(msg);
                                    if (!msg.is_read) markAsRead(msg.id);
                                }}
                                className="bg-bg border border-border rounded-lg p-5 sm:p-6 shadow-sm cursor-pointer"
                            >
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-3">
                                    <span className="text-xs text-gray-400">
                                        Anonymous
                                    </span>

                                    <span className="text-xs text-gray-400">
                                        {new Date(msg.created_at).toLocaleString()}
                                    </span>
                                </div>

                                <p className="text-text-primary mb-5 text-sm sm:text-base line-clamp-2">
                                    {msg.message}
                                </p>

                                <div className="flex flex-wrap gap-4 text-sm">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleFavorite(msg);
                                        }}
                                        className="text-button hover:underline cursor-pointer"
                                    >
                                        {msg.is_loved ? "Favorited" : "Favorite"}
                                    </button>

                                    {!msg.is_read && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                markAsRead(msg.id);
                                            }}
                                            className="text-gray-500 hover:underline cursor-pointer"
                                        >
                                            Mark as read
                                        </button>
                                    )}

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleArchive(msg);
                                        }}
                                        className="text-gray-500 hover:underline cursor-pointer"
                                    >
                                        {msg.is_archived ? "Unarchive" : "Archive"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {selectedMessage && (
                <div className="fixed inset-0 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-card rounded-xl shadow-xl max-w-lg w-full p-6 relative">
                        <button
                            onClick={() => setSelectedMessage(null)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
                        >
                            x
                        </button>

                        <div className="mb-6">
                            <p className="text-sm text-gray-400">Anonymous</p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(selectedMessage.created_at).toLocaleString()}
                            </p>
                        </div>

                        <div className="bg-neutral-primary-soft rounded-lg p-5 mb-6">
                            <p className="text-text-primary leading-7 whitespace-pre-wrap">
                                {selectedMessage.message}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => toggleFavorite(selectedMessage)}
                                className="px-4 py-2 rounded-lg bg-button text-white hover:opacity-90 cursor-pointer"
                            >
                                {selectedMessage.is_loved ? "Remove Favorite" : "Favorite"}
                            </button>

                            <button
                                onClick={() => markAsRead(selectedMessage.id)}
                                className="px-4 py-2 rounded-lg border border-default hover:bg-gray-100 cursor-pointer"
                            >
                                Mark as Read
                            </button>

                            <button
                                onClick={() => toggleArchive(selectedMessage)}
                                className="px-4 py-2 rounded-lg border border-default hover:bg-gray-100 cursor-pointer"
                            >
                                {selectedMessage.is_archived ? "Unarchive" : "Archive"}
                            </button>

                            <button
                                onClick={() => deleteMessage(selectedMessage.id)}
                                className="px-4 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 cursor-pointer"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteSuccess && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
                        <h2 className="text-xl font-semibold text-text-primary mb-2">
                            Message Deleted
                        </h2>

                        <p className="text-text-secondary text-sm mb-5">
                            The message has been permanently deleted.
                        </p>

                        <button
                            onClick={() => setDeleteSuccess(false)}
                            className="px-4 py-2 rounded-lg bg-button text-white hover:bg-button-hover"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            <Toast toasts={toasts} removeToast={removeToast} />
        </>
    );
}

export default UserInbox;
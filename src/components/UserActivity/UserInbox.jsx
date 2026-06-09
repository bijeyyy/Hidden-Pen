import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/SupabaseClient";
import Logo from '../../../public/hidden_pen.svg';
import {
    Squares2X2Icon,
    EnvelopeIcon,
    HeartIcon,
    ArchiveBoxIcon,
    ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import html2canvas from "html2canvas-pro";

function Toast({ toasts, removeToast }) {
    return (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="flex items-center w-full max-w-sm p-4 text-body bg-neutral-primary-soft rounded-base shadow-xs border border-default"
                    role="alert"
                >
                    <img src={Logo} alt="logo" className="w-14 h-14" />
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

    const shareRef = useRef(null);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteSuccess, setDeleteSuccess] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [editingText, setEditingText] = useState("");
    const [isExporting, setIsExporting] = useState(false);
    const [selectedMessageReplies, setSelectedMessageReplies] = useState([]);
    const [repliesLoading, setRepliesLoading] = useState(false);
    const [allReplies, setAllReplies] = useState([]);
    const [allRepliesLoading, setAllRepliesLoading] = useState(false);
    const [toasts, setToasts] = useState([]);
    const exportWidth = typeof window !== "undefined" && window.innerWidth < 480 ? 360 : 480;

    const showToast = (message) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message }]);
        setTimeout(() => removeToast(id), 3000);
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const loadMessages = async () => {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
            setLoading(false);
            return;
        }

        const userId = session.user.id;

        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("receiver_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Messages error:", error);
            setLoading(false);
            return;
        }

        if (data?.length) {
            const now = new Date().toISOString;

            await supabase
                .from("message_reads")
                .upsert(
                    data.map(msg => ({
                        message_id: msg.id,
                        user_id: userId,
                        reat_at: now
                    })),
                    {
                        onConflict: "message_id,user_id"
                    }
                );
        }

        const { data: reads } = await supabase
            .from("message_reads")
            .select("message_id")
            .eq("user_id", userId);

        const { data: reactions } = await supabase
            .from("message_reactions")
            .select("message_id")
            .eq("user_id", userId)
            .eq("is_loved", true);

        const { data: archives } = await supabase
            .from("message_archives")
            .select("message_id")
            .eq("user_id", userId);

        const { data: repliedMsgIds } = await supabase
            .from("message_replies")
            .select("message_id")
            .eq("user_id", userId);

        const readSet = new Set(reads?.map(r => r.message_id));
        const loveSet = new Set(reactions?.map(r => r.message_id));
        const archiveSet = new Set(archives?.map(r => r.message_id));
        const repliedSet = new Set(repliedMsgIds?.map(r => r.message_id));

        setMessages((data || []).map(msg => ({
            ...msg,
            is_read: readSet.has(msg.id),
            is_loved: loveSet.has(msg.id),
            is_archived: archiveSet.has(msg.id),
            has_reply: repliedSet.has(msg.id),
        })));

        setLoading(false);
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const loadAllReplies = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        setAllRepliesLoading(true);

        const { data, error } = await supabase
            .from("message_replies")
            .select(`
                *,
                messages (
                    id,
                    message,
                    created_at
                )
            `)
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Replies load error:", error);
        } else {
            setAllReplies(data || []);
        }

        setAllRepliesLoading(false);
    };

    useEffect(() => {
        if (activeTab === "replies") {
            loadAllReplies();
        }
    }, [activeTab]);

    const loadRepliesForMessage = async (messageId) => {
        setRepliesLoading(true);
        const { data, error } = await supabase
            .from("message_replies")
            .select("*")
            .eq("message_id", messageId)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Load replies error:", error);
        } else {
            setSelectedMessageReplies(data || []);
        }
        setRepliesLoading(false);
    };

    const markAsRead = async (id) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        await supabase.from("message_reads").upsert({
            message_id: id,
            user_id: session.user.id,
            read_at: new Date().toISOString()
        });

        setMessages(prev =>
            prev.map(msg =>
                msg.id === id ? { ...msg, is_read: true } : msg
            )
        );
    };

    const toggleFavorite = async (msg) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;
        const willBeLoved = !msg.is_loved;

        if (willBeLoved) {
            await supabase.from("message_reactions").upsert({
                message_id: msg.id,
                user_id: userId,
                is_loved: true
            });
        } else {
            await supabase
                .from("message_reactions")
                .delete()
                .eq("message_id", msg.id)
                .eq("user_id", userId);
        }

        setMessages(prev =>
            prev.map(item =>
                item.id === msg.id
                    ? { ...item, is_loved: willBeLoved }
                    : item
            )
        );

        if (selectedMessage?.id === msg.id) {
            setSelectedMessage({
                ...selectedMessage,
                is_loved: willBeLoved
            });
        }

        showToast(
            willBeLoved
                ? "Message added to favorites."
                : "Message removed from favorites."
        );
    };

    const toggleArchive = async (msg) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const userId = session.user.id;
        const willBeArchived = !msg.is_archived;

        if (willBeArchived) {
            await supabase.from("message_archives").insert({
                message_id: msg.id,
                user_id: userId
            });
        } else {
            await supabase
                .from("message_archives")
                .delete()
                .eq("message_id", msg.id)
                .eq("user_id", userId);
        }

        setMessages(prev =>
            prev.map(item =>
                item.id === msg.id
                    ? { ...item, is_archived: willBeArchived }
                    : item
            )
        );

        if (selectedMessage?.id === msg.id) {
            setSelectedMessage({
                ...selectedMessage,
                is_archived: willBeArchived
            });
        }

        showToast(
            willBeArchived
                ? "Message archived."
                : "Message unarchived."
        );
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

        setMessages(prev => prev.filter(msg => msg.id !== id));
        setSelectedMessage(null);
        setDeleteSuccess(true);
    };

    const deleteReply = async (replyId) => {
        const { error } = await supabase
            .from("message_replies")
            .delete()
            .eq("id", replyId);

        if (error) {
            console.error("Delete reply error:", error);
            return;
        }

        setSelectedMessageReplies(prev => prev.filter(r => r.id !== replyId));

        if (selectedMessageReplies.length <= 1 && selectedMessage) {
            setMessages(prev =>
                prev.map(msg =>
                    msg.id === selectedMessage.id ? { ...msg, has_reply: false } : msg
                )
            );
        }

        setAllReplies(prev => prev.filter(r => r.id !== replyId));

        showToast("Reply deleted.");
    };

    const saveReply = async () => {
        if (!replyText.trim()) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
            .from("message_replies")
            .insert({
                message_id: selectedMessage.id,
                user_id: session.user.id,
                reply: replyText.trim()
            })
            .select()
            .single();

        if (error) {
            console.error("Save reply error:", error);
            return;
        }

        showToast("Reply saved!");
        setReplyText("");

        setSelectedMessageReplies(prev => [...prev, data]);

        setMessages(prev =>
            prev.map(msg =>
                msg.id === selectedMessage.id ? { ...msg, has_reply: true } : msg
            )
        );
    };

    const filteredMessages = messages.filter((msg) => {
        if (activeTab === "unread") return !msg.is_read;
        if (activeTab === "favorites") return msg.is_loved;
        if (activeTab === "archived") return msg.is_archived;
        return !msg.is_archived;
    });

    const tabs = ["all", "unread", "favorites", "archived", "replies"];

    const updateReply = async (replyId) => {
        if (!editingText.trim()) return;

        const { error } = await supabase
            .from("message_replies")
            .update({ reply: editingText.trim() })
            .eq("id", replyId);

        if (error) {
            console.error("Update reply error:", error);
            return;
        }

        setSelectedMessageReplies(prev =>
            prev.map(r =>
                r.id === replyId ? { ...r, reply: editingText } : r
            )
        );

        setAllReplies(prev =>
            prev.map(r =>
                r.id === replyId ? { ...r, reply: editingText } : r
            )
        );

        setEditingReplyId(null);
        setEditingText("");

        showToast("Reply updated!");
    };

    const generateShareImage = async () => {
        if (!shareRef.current) {
            showToast("Share card not ready yet.");
            return;
        }

        const node = shareRef.current;

        node.style.transform = "scale(1)";
        node.style.willChange = "auto";

        await document.fonts.ready;
        
        const rect = node.getBoundingClientReact();

        const canvas = await html2canvas(shareRef.current, {
            scale: 3,
            backgroundColor: "#ffffff",
            useCORS: true,
            allowTaint: false,
            
            width: rect.width,
            height: rect.height,
            windowWidth: rect.width,
            windowHeight: rect.height,
        });

        return canvas.toDataURL("image/png");
    };

    const downloadShareImage = async () => {
        console.log("clicked");

        if (!shareRef.current) {
            console.log("shareRef is null");
            return;
        }

        try {
            setIsExporting(true);

            await document.fonts.ready;

            console.log("creating canvas");

            const canvas = await html2canvas(shareRef.current, {
                scale: 2,
                backgroundColor: "#fff",
                useCORS: true,
                allowTaint: false,
            });

            console.log("canvas created");

            const Image = canvas.toDataURL("image/png");

            console.log(Image.slice(0, 100));

            const link = document.createElement("a");
            link.href = Image;
            link.download = `hiddenpen-${Date.now()}.png`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            console.log("download trigger");
        } catch (err) {
            console.error("html2canvas error:", err);
        } finally {
            setIsExporting(false);
        }
    };

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
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 flex items-center gap-1.5 ${activeTab === tab
                                ? "bg-button text-white"
                                : "border border-default hover:bg-bg"
                                }`}
                        >
                            {tab === "replies" && (
                                <ChatBubbleLeftRightIcon className="w-3.5 h-3.5" />
                            )}
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {activeTab === "replies" ? (
                    <div className="space-y-5">
                        {allRepliesLoading ? (
                            <p className="text-text-secondary">Loading replies...</p>
                        ) : allReplies.length === 0 ? (
                            <div className="bg-bg border border-default rounded-lg p-10 text-center shadow-sm">
                                <div className="flex justify-center mb-3">
                                    <ChatBubbleLeftRightIcon className="size-16 text-primary" />
                                </div>
                                <p className="text-text-secondary">
                                    You haven't saved any replies yet.
                                </p>
                            </div>
                        ) : (
                            allReplies.map((reply) => (
                                <div key={reply.id} className="bg-bg border border-border rounded-lg p-5 sm:p-6 shadow-sm">

                                    <div className="mb-3 p-3 bg-neutral-primary-soft/60 rounded-lg border-l-2 border-button">
                                        <p className="text-xs text-gray-400 mb-1">Original message</p>
                                        <p className="text-text-secondary text-sm line-clamp-2">
                                            {reply.messages?.message || "—"}
                                        </p>
                                    </div>

                                    <p className="text-text-primary text-sm sm:text-base mb-4">
                                        {reply.reply}
                                    </p>

                                    <div className="flex justify-between items-center text-xs text-gray-400">
                                        <span>
                                            Replied {new Date(reply.created_at).toLocaleString()}
                                        </span>
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase
                                                    .from("message_replies")
                                                    .delete()
                                                    .eq("id", reply.id);
                                                if (!error) {
                                                    setAllReplies(prev => prev.filter(r => r.id !== reply.id));
                                                    showToast("Reply deleted.");
                                                }
                                            }}
                                            className="text-red-400 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
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
                                        setSelectedMessageReplies([]);
                                        loadRepliesForMessage(msg.id);
                                        if (!msg.is_read) markAsRead(msg.id);
                                    }}
                                    className="bg-bg border border-border rounded-lg p-5 sm:p-6 shadow-sm cursor-pointer"
                                >
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">Anonymous</span>

                                            {msg.has_reply && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-button/10 text-button text-xs font-medium">
                                                    <ChatBubbleLeftRightIcon className="w-3 h-3" />
                                                    Replied
                                                </span>
                                            )}
                                        </div>
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
                )}
            </div>

            {selectedMessage && (
                <div className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                    <div className="bg-card rounded-t-2xl sm:rounded-2xl shadow-2xl max-w-lg w-full relative overflow-hidden max-h-[90vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-default flex-shrink-0">
                            <div>
                                <p className="text-sm font-semibold text-text-primary">Anonymous Message</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {new Date(selectedMessage.created_at).toLocaleString()}
                                </p>
                            </div>
                            <button
                                onClick={() => { setSelectedMessage(null); setReplyText(""); setSelectedMessageReplies([]); }}
                                className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-neutral-primary-soft text-gray-400 hover:text-text-primary transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 px-6 py-5">

                            <div
                                ref={shareRef}
                                className="bg-white rounded-2xl overflow-hidden"
                                style={{
                                    width: `${exportWidth}px`,
                                    position: "fixed",
                                    top: "0",
                                    left: "-99999px",
                                    pointerEvents: "none",
                                    zIndex: -1,
                                    fontFamily: "'Inter', sans-serif",
                                }}
                            >
                                {/* Header */}
                                <div className="flex flex-col items-center gap-2 px-8 pt-8 pb-5 border-b border-[#E5E7EB]">
                                    <div className="w-10 h-10 rounded-full bg-[#FCE4EF] flex items-center justify-center">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EC5FA6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                        </svg>
                                    </div>
                                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "15px", fontWeight: 600, color: "#1F2937", margin: 0 }}>
                                        Hidden Pen
                                    </p>
                                    <span style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        fontSize: "11px",
                                        background: "#FCE4EF",
                                        color: "#D94D95",
                                        padding: "3px 12px",
                                        borderRadius: "999px",
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: 500,
                                    }}>
                                        anonymous message
                                    </span>
                                </div>

                                <div className="px-8 py-6">
                                    <p style={{ fontSize: "10px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
                                        Message
                                    </p>
                                    <div style={{ background: "#F7F7F9", borderRadius: "12px", padding: "16px 20px", border: "1px solid #E5E7EB", marginBottom: "16px" }}>
                                        <p style={{ fontSize: "13.5px", lineHeight: "1.75", color: "#1F2937", margin: 0, whiteSpace: "pre-wrap" }}>
                                            {selectedMessage.message}
                                        </p>
                                    </div>

                                    {selectedMessageReplies?.length > 0 && (
                                        <>
                                            <p style={{ fontSize: "10px", fontWeight: 500, color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "6px" }}>
                                                Your reply
                                            </p>
                                            <div style={{ background: "#FFFFFF", borderRadius: "12px", padding: "16px 20px", border: "1px solid #E5E7EB", borderLeft: "3px solid #EC5FA6" }}>
                                                {selectedMessageReplies.map((r) => (
                                                    <p key={r.id} style={{ fontSize: "13.5px", lineHeight: "1.75", color: "#374151", margin: 0, marginBottom: "8px", whiteSpace: "pre-wrap" }}>
                                                        {r.reply}
                                                    </p>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div style={{ padding: "12px 32px 24px", display: "flex", justifyContent: "center" }}>
                                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                                        hidden-pen-web.vercel.app
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-5">
                                <button
                                    onClick={() => toggleFavorite(selectedMessage)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${selectedMessage.is_loved
                                        ? "bg-pink-100 text-pink-600 border border-pink-200"
                                        : "border border-default hover:bg-neutral-primary-soft text-text-secondary"
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill={selectedMessage.is_loved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                    </svg>
                                    {selectedMessage.is_loved ? "Favorited" : "Favorite"}
                                </button>

                                <button
                                    onClick={() => markAsRead(selectedMessage.id)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-default hover:bg-neutral-primary-soft transition-all ${selectedMessage.is_read ? "text-gray-400" : "text-text-secondary"
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5-6.037l-4.661-2.51m0 0L12 6.75m-7.5 3.75l4.661-2.51" />
                                    </svg>
                                    {selectedMessage.is_read ? "Read" : "Mark as Read"}
                                </button>

                                <button
                                    onClick={() => toggleArchive(selectedMessage)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${selectedMessage.is_archived
                                        ? "bg-blue-50 text-blue-600 border-blue-200"
                                        : "border-default hover:bg-neutral-primary-soft text-text-secondary"
                                        }`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                                    </svg>
                                    {selectedMessage.is_archived ? "Unarchive" : "Archive"}
                                </button>

                                <button
                                    onClick={() => deleteMessage(selectedMessage.id)}
                                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-red-200 text-red-500 hover:bg-red-50 transition-all ml-auto"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                    Delete
                                </button>
                            </div>

                            {repliesLoading ? (
                                <div className="mb-5 text-xs text-gray-400">Loading replies...</div>
                            ) : selectedMessageReplies.length > 0 ? (
                                <div className="mb-5">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                                        Your Saved Replies ({selectedMessageReplies.length})
                                    </p>
                                    <div className="space-y-2">
                                        {selectedMessageReplies.map((reply) => (
                                            <div
                                                key={reply.id}
                                                className="flex items-start gap-3 bg-neutral-primary-soft/60 border border-default rounded-lg px-4 py-3"
                                            >
                                                {editingReplyId === reply.id ? (
                                                    <div className="flex-1">
                                                        <textarea
                                                            className="w-full text-sm p-2 border border-default rounded-lg"
                                                            value={editingText}
                                                            onChange={(e) => setEditingText(e.target.value)}
                                                        />

                                                        <div className="flex gap-2 mt-2">
                                                            <button
                                                                onClick={() => updateReply(reply.id)}
                                                                className="px-3 py-1 text-xs bg-button text-white rounded"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingReplyId(null)}
                                                                className="px-3 py-1 text-xs border border-default rounded"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-text-primary text-sm flex-1 leading-relaxed whitespace-pre-wrap">
                                                            {reply.reply}
                                                        </p>

                                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                                            <span className="text-xs text-gray-400 whitespace-nowrap">
                                                                {new Date(reply.created_at).toLocaleDateString()}
                                                            </span>

                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingReplyId(reply.id);
                                                                        setEditingText(reply.reply);
                                                                    }}
                                                                    className="text-xs text-blue-400 hover:underline"
                                                                >
                                                                    Edit
                                                                </button>

                                                                <button
                                                                    onClick={() => deleteReply(reply.id)}
                                                                    className="text-xs text-red-400 hover:underline"
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : null}

                            <div className="border border-default rounded-xl overflow-hidden mb-4">
                                <div className="px-4 pt-3 pb-1">
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Your Reply</p>
                                    <textarea
                                        rows={3}
                                        placeholder="Write a reply... (only you can see this)"
                                        className="w-full bg-transparent text-sm text-text-primary placeholder-gray-400 resize-none outline-none leading-relaxed"
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        maxLength={500}
                                    />
                                </div>
                                <div className="flex items-center justify-between px-4 py-2 border-t border-default bg-neutral-primary-soft/40">
                                    <span className="text-xs text-gray-400">{replyText.length}/500</span>
                                    <button
                                        onClick={saveReply}
                                        disabled={!replyText.trim()}
                                        className="px-3 py-1.5 rounded-lg bg-button text-white text-xs font-medium disabled:opacity-40 hover:opacity-90 transition-opacity"
                                    >
                                        Save Reply
                                    </button>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
                                    Share
                                </p>

                                <button
                                    onClick={downloadShareImage}
                                    className="flex gap-2 px-3 py-2 rounded-lg border border-default hover:bg-neutral-primary-soft text-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    Download Image
                                </button>

                                <p className="text-xs text-gray-400 mt-2">
                                    Download image then post anywhere (Instagram, Facebook, etc.)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteSuccess && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
                        <h2 className="text-button text-xl font-semibold text-text-primary mb-2">
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
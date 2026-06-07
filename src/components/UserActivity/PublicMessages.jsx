import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/SupabaseClient";

function PublicMessagePage() {
    const { username } = useParams();

    const [receiver, setReceiver] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");
    const [receiverSettings, setReceiverSettings] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadReceiver = async () => {
            setLoading(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (isMounted) setCurrentUser(user || null);

            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("id, username, display_name, avatar_url")
                .eq("username", username)
                .single();

            if (profileError || !profile) {
                console.error(profileError);
                if (isMounted) setLoading(false);
                return;
            }

            if (isMounted) setReceiver(profile);

            const { data: settings, error: settingsError } = await supabase
                .from("user_settings")
                .select("allow_link_sharing, anon_messages")
                .eq("user_id", profile.id)
                .maybeSingle();

            if (settingsError) {
                console.error(settingsError);
            }

            if (isMounted) {
                setReceiverSettings(
                    settings || {
                        allow_link_sharing: true,
                        anon_messages: true,
                    }
                );
                setLoading(false);
            }
        };

        loadReceiver();

        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setCurrentUser(session?.user || null);
            }
        );

        return () => {
            isMounted = false;
            listener.subscription.unsubscribe();
        };
    }, [username]);

    const sendMessage = async () => {
        setError("");

        if (!message.trim() || !receiver) return;

        if (!receiverSettings?.allow_link_sharing) {
            setError("This user is not accepting messages right now.");
            return;
        }

        if (!receiverSettings?.anon_messages && !currentUser) {
            setError(
                "This user only accepts messages from logged-in users. Please log in."
            );
            return;
        }

        const { error: insertError } = await supabase.from("messages").insert({
            receiver_id: receiver.id,
            message: message.trim(),
            sender_id: currentUser?.id || null,
        });

        if (insertError) {
            console.error("Insert Error:", insertError);
            setError(insertError.message || "Failed to send message.");
            return;
        }

        setMessage("");
        setSent(true);
    };

    if (loading) return <p>Loading...</p>;
    if (!receiver) return <p>User not found.</p>;

    if (receiverSettings && !receiverSettings.allow_link_sharing) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="w-full max-w-md bg-card border border-default rounded-base p-6 text-center">
                    <h1 className="text-xl font-semibold mb-2">
                        Not Accepting Messages
                    </h1>
                    <p className="text-gray-400 text-sm">
                        This user has temporarily paused their hidden link.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-md bg-card border border-default rounded-base p-6">
                <h1 className="text-2xl font-semibold mb-2">
                    Send a message to {receiver.display_name}
                </h1>

                {!receiverSettings?.anon_messages && !currentUser && (
                    <p className="text-amber-500 text-sm mt-2 mb-4">
                        This user requires login before sending messages.
                    </p>
                )}

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border rounded-base p-3 mt-4"
                    rows="5"
                    placeholder="Write your message..."
                    disabled={
                        !receiverSettings?.anon_messages && !currentUser
                    }
                />

                {error && (
                    <p className="mt-2 text-red-500 text-sm">{error}</p>
                )}

                <button
                    onClick={sendMessage}
                    className="w-full mt-4 bg-button hover:bg-button-hover text-white py-2 rounded-base"
                >
                    Send Message
                </button>

                {sent && (
                    <p className="mt-3 text-green-600 text-sm">
                        Message sent successfully.
                    </p>
                )}
            </div>
        </div>
    );
}

export default PublicMessagePage;
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/SupabaseClient";

function PublicMessagePage() {
    const { username } = useParams();
    const navigate = useNavigate();

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

            const { data: profile, error } = await supabase
                .from("profiles")
                .select("id, username, display_name, avatar_url, email")
                .eq("username", username)
                .single();

            if (error || !profile) {
                if (isMounted) setLoading(false);
                return;
            }


            if (isMounted) setReceiver(profile);

            const { data: settings } = await supabase
                .from("user_settings")
                .select("allow_link_sharing, anon_messages")
                .eq("user_id", profile.id)
                .maybeSingle();

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
            setError("This user is not accepting messages.");
            return;
        }

        if (!receiverSettings?.anon_messages && !currentUser) {
            setError("Login required to send messages.");
            return;
        }

        const { error } = await supabase.from("messages").insert({
            receiver_id: receiver.id,
            receiver_email: recevier.email,
            message: message.trim(),
            sender_id: currentUser?.id ?? null,
        });

        if (error) {
            setError(error.message);
            return;
        }

        setMessage("");
        setSent(true);
    };

    if (loading) return <p>Loading...</p>;
    if (!receiver) return <p>User not found.</p>;

    return (
        <div className="min-h-screen flex items-center justify-center px-6">

            <div className="relative w-full max-w-md">
                <div className="absolute -top-16 right-0 w-44 bg-card border border-default rounded-base p-3 shadow-md">
                    <p className="text-xs text-gray-400 mb-2">
                        Want to receive messages too?
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="w-full bg-button hover:bg-button-hover text-white py-1.5 rounded-base text-xs"
                    >
                        Log in
                    </button>
                </div>

                {/* MAIN CARD */}
                <div className="bg-card border border-default rounded-base p-6">

                    <h1 className="text-2xl font-semibold mb-2">
                        Send a message to {receiver.display_name}
                    </h1>

                    {!receiverSettings?.anon_messages && !currentUser && (
                        <p className="text-amber-500 text-sm mt-2 mb-4">
                            Login required to send a message.
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
                </div>

                {/* MODAL */}
                {sent && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="w-full max-w-sm bg-card border border-default rounded-base p-6 text-center">

                            <h2 className="text-xl font-semibold mb-2">
                                Message Sent !!!
                            </h2>

                            <p className="text-sm text-gray-400 mb-4">
                                Your message has been delivered successfully.
                            </p>

                            <button
                                onClick={() => setSent(false)}
                                className="w-full bg-button hover:bg-button-hover text-white py-2 rounded-base"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default PublicMessagePage;
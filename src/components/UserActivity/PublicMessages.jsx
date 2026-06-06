import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../lib/SupabaseClient";

function PublicMessagePage() {
    const { username } = useParams();

    const [receiver, setReceiver] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [sent, setSent] = useState(false);

    useEffect(() => {
        const loadReceiver = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("id, username, display_name, avatar_url")
                .eq("username", username)
                .single();

            if (!error) {
                setReceiver(data);
            }

            setLoading(false);
        };

        loadReceiver();
    }, [username]);

    const sendMessage = async () => {
        if (!message.trim() || !receiver) return;

        const { error } = await supabase
            .from("messages")
            .insert({
                receiver_id: receiver.id,
                message: message.trim(),
            });

        if (!error) {
            setMessage("");
            setSent(true);
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    if (!receiver) {
        return <p>User not found.</p>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6">
            <div className="w-full max-w-md bg-card border border-default rounded-base p-6">
                <h1 className="text-2xl font-semibold mb-2">
                    Send a message to {receiver.display_name}
                </h1>

                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border rounded-base p-3 mt-4"
                    rows="5"
                    placeholder="Write your anonymous message..."
                />

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
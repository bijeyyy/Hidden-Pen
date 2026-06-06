import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/SupabaseClient";

function EmailConfirmed() {
    const navigate = useNavigate();

    const handleProceed = async () => {
        await supabase.auth.signOut();
        navigate("/Login");
    };

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
                <h1 className="text-3xl font-bold text-text-secondary mb-4">
                    Email Verified Successfully!
                </h1>

                <p className="mb-6 max-w-md text-text-secondary">
                    Your Hidden Pen account is now active.
                </p>
                
                <button onClick={handleProceed} className="px-4 py-2 bg-black text-white rounded cursor-pointer">
                    Proceed to Login
                </button>
            </div>
        </>
    );
}

export default EmailConfirmed
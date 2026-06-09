import { Link } from "react-router-dom";

function VerifyNotice() {
    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
                <h1 className="text-3xl font-bold text-text-secondary mb-4">
                    Check Your Email
                </h1>

                <p className="mb-6 max-w-md text-text-secondary">
                    We've sent a verification link to your email address.
                    Please verify your account before logging in.
                </p>

                <Link to="/Login">
                    <button className="px-4 py-2 bg-black text-white rounded cursor-pointer">
                        Back to Login
                    </button>
                </Link>
            </div>
        </>
    );
}

export default VerifyNotice
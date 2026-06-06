import { Link } from "react-router-dom";

function Forgot_Password() {
    return (
        <>
            <div className="bg-neutral-primary-soft block w-82 p-6 border border-default rounded-base shadow-xs">
                <h5 className="text-center mb-3 text-2xl font-heading font-semibold tracking-tight text-heading leading-8">
                    Change Password
                </h5>

                <div className="grid gap-4">
                    {/* EMAIL */}
                <div className="grid gap-1">
                    <label htmlFor="Email" className="text-gray-600 font-bold">
                        Email: 
                    </label>
                    <input type="text" placeholder="Enter your email" className="p-2 border border-gray-200 rounded-md text-xs" required />
                </div>

                {/* LOGIN BUTTON */}
                <div className="mt-8">
                    <button type="button" className="w-full text-white bg-button border-transparent box-border border hover:bg-button-hover hover:text-white shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                        Send Email
                    </button>
                </div>

                {/* BACK TO HOME */}
                <div className="flex justify-center items-center mt-6">
                    <Link to="/login" className="text-gray-400 text-xs hover:underline">
                        ← Back to login
                    </Link>
                </div>

                </div>

            </div>

        </>
    )
}

export default Forgot_Password;
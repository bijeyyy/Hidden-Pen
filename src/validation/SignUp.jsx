import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '../lib/SupabaseClient';
import google from '../assets/google.png';

function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: name 
        },
        emailRedirectTo: `${window.location.origin}/EmailConfirmed`
       }
    });
    setLoading(false);
    if (error) { 
      setError(error.message); 
      return; 
    }
    navigate('/VerifyNotice');
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/user_dashboard' }
    });
    if (error) setError(error.message);
  };

  return (
    <>
      <div className="justify-center items-center md:-mt-2 mt-18 bg-neutral-primary-soft block w-82 p-6 border border-default rounded-base shadow-xs">
        <h5 className="text-center mb-3 text-2xl font-heading font-semibold tracking-tight text-heading leading-8">Sign Up</h5>

        <form onSubmit={handleSignup} className="grid gap-4">
          <div className="grid gap-1">
            <label htmlFor="Name" className="text-gray-600 font-bold">Name:</label>
            <input id="Name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="p-2 border border-gray-200 rounded-md text-xs" required />
          </div>

          <div className="grid gap-1">
            <label htmlFor="Email" className="text-gray-600 font-bold">Email:</label>
            <input id="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="p-2 border border-gray-200 rounded-md text-xs" required />
          </div>

          <div className="grid gap-1">
            <label htmlFor="Password" className="text-gray-600 font-bold">Password:</label>
            <input id="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="p-2 border border-gray-200 rounded-md text-xs" required />
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}

          <div className="mt-8">
            <button type="submit" disabled={loading} className="w-full text-white bg-button border-transparent box-border border hover:bg-button-hover hover:text-white shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="flex justify-center items-center gap-2 m-3">
          <hr className="w-32 text-gray-300" />
          <span className="text-gray-500 text-sm">or</span>
          <hr className="w-32 text-gray-300" />
        </div>

        <div>
          <button type="button" onClick={handleGoogle} className="flex items-center w-full text-black bg-transparent box-border border border-gray-300 hover:bg-gray-100 shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
            <img src={google} alt="google" className="w-16 h-8" />
            <span className="ml-2">Continue with Google</span>
          </button>
        </div>

        <div className="flex justify-center items-center mt-5">
          <span className="text-xs text-gray-400">Already have an account? <a href="/Login" className="text-blue-500 hover:underline">Sign In</a></span>
        </div>

        <div className="flex justify-center items-center mt-10">
          <a href="/" className="text-gray-400 text-xs hover:underline">← Back to home</a>
        </div>
      </div>
    </>
  );
}

export default SignUp;

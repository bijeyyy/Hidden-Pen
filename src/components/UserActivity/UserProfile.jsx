import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/SupabaseClient";
import User from "../../assets/user_logo.png";

function UserProfile() {
  const navigate = useNavigate();
  const [hiddenLink, setHiddenLink] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [settings, setSettings] = useState({ allow_link_sharing: true, });

  const [profile, setProfile] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    avatarUrl: "",
    hiddenLink: "",
  });

  useEffect(() => {
    const getUserProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/Login");
        return;
      }

      const user = session.user;

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile({
        fullname: profileData.display_name || "",
        username: profileData.username || "",
        email: user.email || "",
        phone: profileData.phone || "",
        avatarUrl: profileData.avatar_url || "",
      });

      setHiddenLink(`${window.location.origin}/u/${profileData.username}`);

      setLoading(false);
    };

    getUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: profile.fullName,
        username: profile.username,
        phone: profile.phone,
        avatar_url: profile.avatarUrl,
      })
      .eq("id", session.user.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    setSuccessModal(true);
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(profile.hiddenLink);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-body">Loading profile...</p>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-bg px-6 py-10">
        <div className="max-w-3xl mx-auto bg-card border border-default rounded-base shadow-xs p-6">
          <div className="flex items-center gap-4 border-b border-default pb-6">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-default bg-neutral-primary-medium">
              <img
                src={profile.avatarUrl || User}
                alt={profile.fullName || "User"}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-heading">
                {profile.fullname || "Hidden Pen User"}
              </h1>
              <p className="text-body">{profile.email}</p>
              {profile.username && (
                <p className="text-sm text-primary">@{profile.username}</p>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <h2 className="text-lg font-semibold text-heading">
              Private Account Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="fullName"
                value={profile.fullname}
                onChange={handleChange}
                className="w-full text-text-light border border-default rounded-base p-2 bg-white dark:bg-neutral-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-400">
                Only you can see this information.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                className="w-full border text-text-light border-default rounded-base p-2 bg-white dark:bg-neutral-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-400">
                Your username is private. Other users will see you as Anonymous.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Email
              </label>
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full border border-default rounded-base p-2 bg-gray-100 text-gray-500 dark:bg-neutral-800"
              />
              <p className="mt-1 text-xs text-gray-400">
                This is used for login and account recovery.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-body mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full text-text-light border border-default rounded-base p-2 bg-white dark:bg-neutral-900 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-400">
                Optional and private.
              </p>
            </div>
          </div>

          <div className="mt-8 border-t border-default pt-6 space-y-3">
            <h2 className="text-lg font-semibold text-heading">
              Your Hidden Link
            </h2>

            <p className="text-sm text-body">
              Share this link so people can send you anonymous messages.
            </p>

            <div className="bg-bg border border-default rounded-base p-3 mb-4 space-y-2">

              {/* LINK TEXT */}
              <p className="text-sm text-text-secondary break-all">
                {settings.allow_link_sharing ? (
                  hiddenLink ? (
                    <a
                      href={hiddenLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-text-light break-all underline"
                    >
                      {hiddenLink}
                    </a>
                  ) : (
                    <p className="text-sm text-text-secondary">
                      Creating your link...
                    </p>
                  )
                ) : (
                  <p className="text-sm text-text-secondary">
                    Link is currently disabled
                  </p>
                )}
              </p>

            </div>

            <button
              onClick={handleCopyLink}
              disabled={!settings.allow_link_sharing || !hiddenLink}
              className="bg-button hover:bg-button-hover text-white px-4 py-2 rounded-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copied ? "Link Copied" : "Copy Link"}
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-button hover:bg-button-hover text-white px-4 py-2 rounded-base disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              onClick={() => navigate("/Login")}
              className="border border-text-light px-4 py-2 rounded-base text-text-secondary hover:bg-neutral-tertiary-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>

      {successModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm bg-card border border-default rounded-base shadow-lg p-6 text-center">
            <h2 className="text-xl font-semibold text-heading mb-2">
              Profile Updated
            </h2>

            <p className="text-body text-sm mb-6">
              Your account information has been saved successfully.
            </p>

            <button
              type="button"
              onClick={() => setSuccessModal(false)}
              className="bg-button hover:bg-button-hover text-white px-5 py-2 rounded-base"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default UserProfile;
import React, { useState } from "react";
import axios from "axios";
import { X, Lock, CheckCircle2 } from "lucide-react";

interface GitHubSignInProps {
  onLoginSuccess: (user: { username: string; name: string }) => void;
}

export const GitHubSignIn: React.FC<GitHubSignInProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter both username and password.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await axios.post("/api/auth/login", {
        username: username.trim(),
        password: password.trim(),
      });

      if (res.data.success && res.data.token) {
        localStorage.setItem("gitgo_auth_token", res.data.token);
        localStorage.setItem("gitgo_auth_user", JSON.stringify(res.data.user));
        // Set default Authorization header for subsequent axios requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        onLoginSuccess(res.data.user);
      } else {
        setErrorMessage(res.data.message || "Incorrect username or password.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "Incorrect username or password.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f8fa] flex flex-col justify-between py-8 px-4 text-[#1f2328] font-sans">
      <div className="w-full max-w-[340px] mx-auto mt-6 sm:mt-10">
        {/* GitHub Official Logo */}
        <div className="flex justify-center mb-6">
          <svg
            height="48"
            aria-hidden="true"
            viewBox="0 0 16 16"
            version="1.1"
            width="48"
            className="fill-[#1f2328]"
          >
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"></path>
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-light text-center text-[#1f2328] mb-4">
          Sign in to GitHub
        </h1>

        {/* GitHub Error Alert Banner */}
        {errorMessage && (
          <div className="bg-[#ffebe9] border border-[#ff8182]/50 text-[#1f2328] text-xs px-3.5 py-3 rounded-md mb-4 flex items-center justify-between shadow-2xs animate-fadeIn">
            <span>{errorMessage}</span>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-[#57606a] hover:text-[#1f2328] transition p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Sign In Form Card */}
        <div className="bg-white border border-[#d0d7de] rounded-md p-5 shadow-2xs space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1f2328] mb-1.5">
                Username or email address
              </label>
              <input
                type="text"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="mrsovoo"
                autoComplete="username"
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#d0d7de] rounded-md text-[#1f2328] focus:outline-none focus:ring-2 focus:ring-[#0969da]/30 focus:border-[#0969da] transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#1f2328]">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Standart parol: biznesgo2026");
                  }}
                  className="text-[11px] text-[#0969da] hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#d0d7de] rounded-md text-[#1f2328] focus:outline-none focus:ring-2 focus:ring-[#0969da]/30 focus:border-[#0969da] transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1f883d] hover:bg-[#1a7f37] active:bg-[#187431] text-white text-xs font-semibold py-2 rounded-md shadow-2xs transition disabled:opacity-60 cursor-pointer flex items-center justify-center space-x-1"
            >
              {loading ? <span>Signing in...</span> : <span>Sign in</span>}
            </button>
          </form>
        </div>

        {/* Create Account / Key Hint Box */}
        <div className="mt-4 border border-[#d0d7de] rounded-md p-4 text-center text-xs bg-white shadow-2xs">
          <span>New to GitHub? </span>
          <span className="text-[#0969da] font-semibold cursor-pointer hover:underline">
            Create an account
          </span>
          .
        </div>
      </div>

      {/* GitHub Official Footer Links */}
      <footer className="mt-12 text-center text-[11px] text-[#57606a] space-y-2">
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[#0969da]">
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
          <a href="#" className="hover:underline">Docs</a>
          <a href="#" className="hover:underline">Contact GitHub Support</a>
          <a href="#" className="hover:underline">Manage cookies</a>
          <a href="#" className="hover:underline">Do not share my personal information</a>
        </div>
      </footer>
    </div>
  );
};


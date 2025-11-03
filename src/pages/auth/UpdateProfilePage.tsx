// src/pages/auth/UpdateProfilePage.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";

export default function UpdateProfilePage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Rien à mettre à jour
    if (!username && !email && !password) {
      setError("Renseigne au moins un champ à modifier.");
      return;
    }

    try {
      setSubmitting(true);
      const payload: Record<string, string> = {};
      if (username) payload.username = username;
      if (email) payload.email = email;
      if (password) payload.password = password;

      const response = await apiFetch("/auth/update-profile", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log("Profile updated:", response);

      // Mettre à jour le localStorage
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (username) parsed.username = username;
        if (email) parsed.email = email;
        parsed.first_login = false;
        localStorage.setItem("user", JSON.stringify(parsed));
      }

      setSuccess("Profil mis à jour avec succès.");

      // Redirection selon le rôle
      const updated = localStorage.getItem("user");
      const userData = updated ? JSON.parse(updated) : null;
      const role = userData?.role?.toLowerCase?.();
      if (role === "company_user") navigate("/chat");
      else if (role === "company_admin") navigate("/company-admin");
      else navigate("/chat");
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err?.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#4A646A] text-white p-4">
      <div className="w-full max-w-md">
        {/* En-tête / marque */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-white/90">Aiva</h1>
          <p className="text-white/60 text-sm">Update your profile</p>
        </div>

        {/* Carte verre sombre */}
        <div className="bg-black/10 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Update Your Profile</h2>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm">
              <AlertCircle className="mt-0.5" size={18} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
              <CheckCircle2 className="mt-0.5" size={18} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-1 block text-sm text-white/80">New Username (optional)</label>
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 border border-slate-700 px-3">
                <User size={18} className="text-white/60" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john_doe"
                  className="w-full bg-transparent p-3 placeholder:text-white/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm text-white/80">New Email (optional)</label>
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 border border-slate-700 px-3">
                <Mail size={18} className="text-white/60" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-transparent p-3 placeholder:text-white/40 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm text-white/80">New Password (optional)</label>
              <div className="flex items-center gap-2 rounded-xl bg-slate-900/50 border border-slate-700 px-3">
                <Lock size={18} className="text-white/60" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent p-3 placeholder:text-white/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="p-2 rounded-lg hover:bg-white/10"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold shadow-md"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Updating...
                </>
              ) : (
                <>
                  Update and Continue <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

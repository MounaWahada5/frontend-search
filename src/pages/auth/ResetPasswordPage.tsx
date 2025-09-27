import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import robotImage from '../../assets/fonts/robot.png';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("No reset token provided");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    try {
      const data = await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setMessage(data.message || "Mot de passe réinitialisé avec succès");
      setError("");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Erreur lors de la réinitialisation du mot de passe");
      setMessage("");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center
                 bg-gradient-to-br from-[#E0FFFF] to-[#ADD8E6] text-gray-800"
    >
      <div className="flex w-full max-w-7xl h-[80vh] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Partie gauche : Image du robot */}
        <div className="w-1/2 flex items-center justify-center p-8 bg-[#ADD8E6] relative">
          <img
            src={robotImage}
            alt="Robot Assistant"
            className="max-h-full w-auto object-contain animate-float"
          />
          <div className="absolute top-1/4 left-1/4 bg-blue-400 text-white px-3 py-1 rounded-lg text-sm rotate-6 shadow-md">
            Hello!
          </div>
          <div className="absolute top-1/3 right-1/4 bg-green-400 text-white px-3 py-1 rounded-lg text-sm -rotate-3 shadow-md">
            How are you?
          </div>
        </div>

        {/* Partie droite : Formulaire de réinitialisation */}
        <div className="w-1/2 p-12 flex flex-col justify-center bg-white">
          <h2 className="text-4xl font-extrabold text-center text-[#2F4F4F] mb-8">
            Set New Password
          </h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {message && <p className="text-green-500 text-center mb-4">{message}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New Password"
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-[#ADD8E6] transition-all duration-200"
              required
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="w-full p-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-3 focus:ring-[#ADD8E6] transition-all duration-200"
              required
            />
            <button
              type="submit"
              className="w-full py-4 bg-[#4682B4] text-white rounded-xl font-bold text-lg
                         hover:bg-[#34658A] transition-all duration-300 transform hover:-translate-y-1 shadow-lg"
            >
              Reset Password
            </button>
          </form>

          <p className="text-base text-center mt-8 text-gray-700">
            Back to{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#4682B4] hover:underline font-semibold"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
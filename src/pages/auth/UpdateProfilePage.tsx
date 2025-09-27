
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../../utils/api";

export default function UpdateProfilePage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {};
      if (username) payload.username = username;
      if (email) payload.email = email;
      if (password) payload.password = password;

      const response = await apiFetch("/auth/update-profile", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      console.log("Profile updated:", response);

      // Update local storage if needed
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (username) parsedUser.username = username;
        if (email) parsedUser.email = email; // Assuming email update, but typically email might require verification
        parsedUser.first_login = false;
        localStorage.setItem("user", JSON.stringify(parsedUser));
      }

      // Navigate based on role
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData.role === "company_user") {
        navigate("/chat"); // Assuming company_user goes to chat
      } else if (userData.role === "company_admin") {
        navigate("/company-admin");
      } else {
        navigate("/chat"); // Default
      }
    } catch (err) {
      console.error("Update error:", err);
      setError(err.message || "Erreur lors de la mise à jour du profil");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E0FFFF] to-[#ADD8E6] text-gray-800">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-[#2F4F4F] mb-6">Update Your Profile</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="New Username (optional)"
            className="w-full p-4 border border-gray-300 rounded-xl"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="New Email (optional)"
            className="w-full p-4 border border-gray-300 rounded-xl"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password (optional)"
            className="w-full p-4 border border-gray-300 rounded-xl"
          />
          <button
            type="submit"
            className="w-full py-4 bg-[#4682B4] text-white rounded-xl font-bold"
          >
            Update and Continue
          </button>
        </form>
      </div>
    </div>
  );
}

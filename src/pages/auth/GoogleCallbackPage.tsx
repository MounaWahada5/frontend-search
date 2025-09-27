import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setToken } from "../../utils/api";

export default function GoogleCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userId = searchParams.get('user_id');
        const username = searchParams.get('username');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(error);
        }

        if (!token || !userId || !username) {
          throw new Error('Missing authentication data');
        }

        // Store token and user data
        setToken(token);
        localStorage.setItem("user_id", userId);
        localStorage.setItem("username", username);
        navigate("/chat");
      } catch (err) {
        navigate("/login", { state: { error: err.message || "Google authentication failed" } });
      }
    };

    handleGoogleCallback();
  }, [navigate, searchParams]);

  return (
    <div
      className="min-h-screen flex items-center justify-center
                 bg-gradient-to-br from-[#E0FFFF] to-[#ADD8E6] text-gray-800"
    >
      <div className="text-center">
        <h2 className="text-4xl font-extrabold text-[#2F4F4F] mb-4">
          Processing Google Authentication...
        </h2>
        <p className="text-gray-700">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
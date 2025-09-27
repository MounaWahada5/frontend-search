// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { FaUser, FaCrown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [username, setUsername] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const navTimeoutRef = useRef(null);

  // LOGIQUE COMPLÈTE: Une fonction robuste pour lire le nom d'utilisateur
  const readUsername = () => {
    const authRaw = localStorage.getItem("auth");
    if (authRaw) {
      try { const a = JSON.parse(authRaw); if (a?.user?.username) return a.user.username; } catch (e) {}
    }
    const userRaw = localStorage.getItem("user");
    if (userRaw) {
      try { const u = JSON.parse(userRaw); if (u?.username) return u.username; } catch (e) {}
    }
    return localStorage.getItem("username");
  };

  // LOGIQUE COMPLÈTE: Le hook écoute les changements pour une mise à jour en temps réel
  useEffect(() => {
    setUsername(readUsername());

    const handleAuthChange = () => {
      setUsername(readUsername());
    };

    // Écoute les événements de connexion/déconnexion et les changements dans d'autres onglets
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("auth-changed", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("auth-changed", handleAuthChange);
    };
  }, []);

  // LOGIQUE COMPLÈTE: La déconnexion envoie un signal à toute l'application
  const handleLogout = () => {
    ["token", "auth", "user", "username", "user_id"].forEach((key) =>
      localStorage.removeItem(key)
    );
    setUsername(null);
    // Envoi du signal pour que la HomePage (et autres) réagisse !
    window.dispatchEvent(new Event("auth-changed"));
    navigate("/");
  };

  const handleSignUp = () => navigate("/signup");
  const handleSignIn = () => navigate("/login");

  const handleMouseEnter = () => {
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
    }
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    navTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 300);
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 h-28 z-50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className={`absolute top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl
                   transform transition-all duration-500 ease-in-out
                   ${isVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0"}`}
      >
        <nav
          className="px-8 flex justify-between items-center h-20
                     bg-white/10 backdrop-blur-md 
                     rounded-2xl border border-white/20 shadow-lg"
        >
          {/* Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <FaCrown className="w-9 h-9 text-amber-400 drop-shadow-md" />
            <span className="text-3xl font-bold text-white tracking-tight" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}>
              QueryMind
            </span>
          </div>

          {/* Partie droite */}
          <div className="flex items-center gap-x-4">
            {username ? (
              <>
                <span className="text-white font-medium">Bonjour, {username}</span>
                <button
                  onClick={() => navigate("/chat")}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none"
                >
                  Mon Espace
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-rose-600 text-white rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSignUp}
                  className="flex items-center px-6 py-2.5 bg-white/20 text-white rounded-full font-bold hover:bg-white/30 transition-all duration-300 transform hover:scale-105 focus:outline-none"
                >
                  <FaUser className="mr-2" />
                  Sign Up
                </button>
                <button
                  onClick={handleSignIn}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-full font-bold transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none"
                >
                  Sign In
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </div>
  );
}
// src/pages/SignupPage.tsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../../utils/api";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import robotImage from '../../assets/fonts/mounamouna-removebg-preview.png'; // Utilisez une image transparente

// --- Composant SVG pour l'icône Google ---
const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-3" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path>
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.618-3.317-11.28-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.574l6.19 5.238C42.012 35.846 44 30.228 44 24c0-1.341-.138-2.65-.389-3.917z"></path>
    </svg>
);

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState("user");
  const [companyId, setCompanyId] = useState("");
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- Toute votre logique est conservée à 100% ---
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await apiFetch("/auth/companies", { method: "GET" });
        setCompanies(response.companies || []);
      } catch (err) {
        setError("Erreur lors du chargement des entreprises");
      }
    };
    if (role === 'company_user') {
        fetchCompanies();
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    setError("");
    try {
      const payload = {
        username, email, password, role,
        ...(role === "company_user" && companyId && { company_id: companyId }),
      };
      await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(payload) });
      navigate("/login");
    } catch (err: any) {
      setError(err.message || "Une erreur s'est produite lors de l'inscription");
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:5000/api/auth/google/login";
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: "url('/backgrounds/votre-image.jpg')" }}
    >
      <div className="absolute inset-0 bg-teal-900/50 z-0"></div>

      <div className="relative z-10 w-full max-w-4xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden" style={{ height: 'auto', maxHeight: '90vh' }}>
        <div className="grid md:grid-cols-2 h-full">
            
            <div className="hidden md:flex flex-col items-center justify-center p-12 text-center text-white border-r border-white/10">
                <img src={robotImage} alt="Assistant QueryMind" className="w-full max-w-[250px] mb-6"/>
                <h2 className="text-3xl font-bold mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    Bienvenue sur QueryMind
                </h2>
                <p className="text-white/80">
                    Créez votre compte pour débloquer votre plein potentiel stratégique.
                </p>
            </div>

            <div className="p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
                <h1 className="text-4xl font-bold text-center mb-6 text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
                    Create Account
                </h1>

                {error && (
                  <p className="bg-rose-500/80 text-white text-sm p-3 rounded-lg mb-4 text-center font-medium">
                    {error}
                  </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {role === "company_user" && (
                        <select
                          value={companyId}
                          onChange={(e) => setCompanyId(e.target.value)}
                          className="w-full p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white focus:outline-none focus:border-teal-300 transition appearance-none"
                          required
                        >
                            <option value="" disabled className="text-black">Select your company</option>
                            {companies.map((company: any) => (
                                <option key={company.id} value={company.id} className="text-black">{company.name}</option>
                            ))}
                        </select>
                    )}

                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder:text-white/70 focus:outline-none focus:border-teal-300 transition" required/>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder:text-white/70 focus:outline-none focus:border-teal-300 transition" required/>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder:text-white/70 focus:outline-none focus:border-teal-300 transition" required/>
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-white"><FaEye/></button>
                    </div>
                    <div className="relative">
                        <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="w-full p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder:text-white/70 focus:outline-none focus:border-teal-300 transition" required/>
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-white/70 hover:text-white"><FaEye/></button>
                    </div>

                    <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition shadow-lg hover:shadow-teal-400/50 transform hover:scale-105">
                        Sign Up
                    </button>
                </form>

                <div className="relative flex items-center my-6">
                  <div className="flex-grow border-t border-white/30"></div>
                  <span className="flex-shrink mx-4 text-white/80 text-sm">OR SIGN UP WITH</span>
                  <div className="flex-grow border-t border-white/30"></div>
                </div>

                <button onClick={handleGoogleSignup} className="w-full py-3 flex items-center justify-center bg-white text-slate-800 rounded-lg font-semibold hover:bg-slate-200 transition shadow-md transform hover:scale-105">
                  <GoogleIcon />
                  Continue with Google
                </button>

                <p className="text-center mt-8 text-sm text-white/80">
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold text-white hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
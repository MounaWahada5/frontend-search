// src/pages/HomePage.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import robotImage from '../assets/fonts/robot1.png'; // IMPORTANT: Pour ce design, une image avec fond transparent est fortement recommandée
import Navbar from '../components/Navbar';

// Le composant InnerSearchComponent avec le nouveau design "Glassmorphism"
function InnerSearchComponent({ compact = false }) {
  const [query, setQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState("llama3");
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const navigate = useNavigate();
  const queryRef = useRef(null);

  const isAuthenticated = !!localStorage.getItem("token");

  // La logique des placeholders dynamiques reste INCHANGÉE
  const dynamicPlaceholders = [
    "Que souhaitez-vous explorer aujourd'hui ?",
    "Je suis là pour vous aider...",
    "Posez-moi une question sur les tactiques d'affaires.",
    "Comment puis-je vous assister ?",
    "Entrez votre requête ici...",
  ];

  // La logique des modèles (verrouillés ou non) reste INCHANGÉE
  const modelOptions = isAuthenticated
    ? [
        { id: "llama2", name: "Llama 2", locked: false },
        { id: "gemma", name: "Gemma", locked: false },
        { id: "llama3", name: "Llama 3", locked: false },
        { id: "mistral", name: "Mistral", locked: false },
      ]
    : [
        { id: "llama3", name: "Llama 3", locked: false },
        { id: "mistral", name: "Mistral", locked: false },
        { id: "llama2", name: "Llama 2", locked: true },
        { id: "gemma", name: "Gemma", locked: true },
      ];

  // La logique de gestion de la saisie et de navigation reste INCHANGÉE
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && query.trim()) {
      e.preventDefault();
      navigate("/chat", {
        state: { query: query.trim(), model: selectedModel },
      });
      setQuery("");
    }
  };

  // La logique de changement de placeholder reste INCHANGÉE
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % dynamicPlaceholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  return (
    // MODIFIÉ : Le conteneur principal a maintenant l'effet de verre
    <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-lg">
      <div className="relative">
        <textarea
          ref={queryRef}
          placeholder={dynamicPlaceholders[placeholderIndex]}
          // MODIFIÉ : Style du textarea pour correspondre au look "verre"
          className={`w-full p-4 bg-white/10 rounded-xl resize-none outline-none text-white placeholder:text-white/70 border-2 border-transparent focus:border-teal-300 focus:bg-white/20 transition-all duration-200 ease-in-out font-medium ${compact ? 'h-28 text-base' : 'h-32 text-lg'}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          rows={compact ? 3 : 4}
        />
        <div className={`absolute right-3 bottom-3 w-5 h-5 flex items-center justify-center transition-opacity duration-300 ${query.length > 0 ? "opacity-100" : "opacity-0"}`}>
          <div className="flex space-x-1">
            <span className="w-1.5 h-1.5 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: "0s" }}></span>
            <span className="w-1.5 h-1.5 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
            <span className="w-1.5 h-1.5 bg-teal-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center items-center flex-wrap gap-2 mt-4">
        {modelOptions.map((model) => (
          <button
            key={model.id}
            onClick={() => !model.locked && setSelectedModel(model.id)}
            // MODIFIÉ : Style des boutons de modèles
            className={`relative flex items-center px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform ${selectedModel === model.id ? "bg-teal-500 text-white shadow-md" : "bg-white/20 text-white/80 hover:bg-white/30 hover:scale-[1.02]"} ${model.locked ? "opacity-60 cursor-not-allowed filter grayscale-[50%]" : "cursor-pointer"}`}
            disabled={model.locked}
          >
            {model.locked && <span className="absolute -top-1.5 -right-1.5 text-[0.6rem] bg-amber-400 text-black font-bold rounded-full px-1.5 py-0.5 animate-pulse">PRO</span>}
            {model.name}
            {selectedModel === model.id && <svg className="ml-1.5 w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>}
          </button>
        ))}
      </div>
    </div>
  );
}

// Le composant HomePage principal avec le nouveau design immersif
export default function HomePage() {
  const navigate = useNavigate();

  return (
    // CONTENEUR PRINCIPAL : C'est ici que vous définissez votre image de fond
    <div 
        className="relative flex flex-col min-h-screen items-center justify-center p-4 bg-cover bg-center text-white overflow-hidden"
        style={{ backgroundImage: "url('/backgrounds/votre-image-homepage.jpg')" }}
    >
      {/* Superposition de couleur pour la lisibilité */}
      <div className="absolute inset-0 bg-teal-900/60 z-0"></div>
      
      {/* La Navbar flottante s'intègre parfaitement */}
      <Navbar />
      
      <main className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-6xl pt-24">
        {/* Section de texte et barre de recherche */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-5xl md:text-5xl font-extrabold mb-5 leading-tight" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.4)' }}>
            From Query to Clarity
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-xl text-white/90">
           What if your next query could think for itself?
          </p>
          <button
            onClick={() => navigate("/read-more")}
            className="px-8 py-3 bg-teal-600 text-white rounded-full text-lg font-bold hover:bg-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg mb-10"
          >
            READ MORE
          </button>
          
          <div className="w-full max-w-xl">
            <InnerSearchComponent compact={true} />
          </div>
          
          <p className="text-xs mt-4 w-full max-w-xl text-white/70">
            By messaging QueryMind, you agree to our{" "}
            <a href="#" className="text-teal-300 hover:underline">Terms of Service</a>
            {" "}and{" "}
            <a href="#" className="text-teal-300 hover:underline">Privacy Policy</a>.
          </p>
        </div>

        {/* Section de l'image/robot */}
        <div className="relative hidden md:flex justify-center items-center">
            <img 
                src={robotImage} 
                alt="Chat bot on laptop"
                className="w-full max-w-md animate-float"
            />
            <div className="absolute top-1/4 left-1/4 bg-teal-500/80 backdrop-blur-sm text-white px-3 py-1 rounded-lg text-sm rotate-6 shadow-md">
                Hello!
            </div>
            <div className="absolute top-1/3 right-1/4 bg-amber-400/80 backdrop-blur-sm text-slate-900 px-3 py-1 rounded-lg text-sm -rotate-3 shadow-md">
                How are you?
            </div>
        </div>
      </main>
    </div>
  );
}
import { ChevronLast, ChevronFirst, LogOut } from "lucide-react";
import { useContext, createContext, useState, useEffect } from "react";
import HistoryItem from "./HistoryItem";
import ResourceItem from "./ResourceItem";
import { apiFetch } from "../utils/api";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SidebarContext = createContext();
export { SidebarContext };

export default function Sidebar({
  isOpen,
  toggleSidebar,
  position,
  resources = [],
  username,
  onLogout,
  onHistoryClick,
  onNewChat,
}) {
  const [expanded, setExpanded] = useState(isOpen);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState(null);
  const isAuthenticated = !!localStorage.getItem("token");
  const navigate = useNavigate();

  // scroll visible au survol
  const [scrollVisible, setScrollVisible] = useState(false);

  const handleReturnHome = () => {
    navigate("/");
  };

  const fetchHistory = async () => {
    if (!isAuthenticated) {
      setHistory([]);
      setHistoryError(null);
      return;
    }
    try {
      const data = await apiFetch("/history", { method: "GET" });
      setHistory(data.history || []);
      setHistoryError(null);
    } catch (error) {
      setHistoryError(error.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory();
    }
  }, [isAuthenticated]);

  const handleToggle = () => {
    setExpanded(!expanded);
    toggleSidebar && toggleSidebar();
  };

  return (
    <aside
      className={`h-screen transition-all duration-300 ${
        expanded ? (position === "right" ? "w-64" : "w-60") : "w-12"
      }`}
    >
      <nav className="h-full flex flex-col bg-zinc-50 border-zinc-300 shadow-sm">
        {/* toggle bouton */}
        <div className="p-4 pb-2 flex justify-between items-center">
          <button
            onClick={handleToggle}
            className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100"
          >
            {expanded ? <ChevronFirst /> : <ChevronLast />}
          </button>
        </div>

        <SidebarContext.Provider value={{ expanded }}>
          <ul className="flex flex-col flex-1 px-3">
            {position === "left" ? (
              <>
                {/* bouton new chat */}
                <li className="flex items-center py-2 px-3 my-1">
                  <button
                    onClick={onNewChat}
                    className={`w-full flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg px-4 py-2 transition-all ${
                      expanded ? "opacity-100" : "opacity-0 w-0 h-0"
                    }`}
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {expanded && "New chat"}
                  </button>
                </li>

                {/* bouton retour home */}
                <li className="flex items-center py-2 px-3 my-1">
                  <button
                    onClick={handleReturnHome}
                    className={`w-full flex items-center justify-center bg-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:text-gray-800 transition-all ${
                      expanded ? "opacity-100" : "opacity-0 w-0 h-0"
                    }`}
                  >
                    <FaArrowLeft className="w-5 h-5 mr-2" />
                    {expanded && "Return to Home"}
                  </button>
                </li>

                {/* historique */}
                {isAuthenticated && (
                  <>
                    <li className="text-gray-600 font-medium py-2">
                      {expanded && "History"}
                    </li>

                    {expanded && historyError && (
                      <li className="py-2 px-3 my-1 text-red-500">
                        Failed to load history: {historyError}
                      </li>
                    )}

                    {expanded && !historyError && (
                      <div
                        className={`pr-1 transition-all ${
                          scrollVisible ? "overflow-y-auto" : "overflow-hidden"
                        } scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent
                        max-h-[320px]`} // ≈ 8 items (8x40px)
                        onMouseEnter={() => setScrollVisible(true)}
                        onMouseLeave={() => setScrollVisible(false)}
                      >
                        {history.length === 0 ? (
                          <li className="py-2 px-3 my-1 text-gray-500">
                            No history available
                          </li>
                        ) : (
                          history.map((item, index) => (
                            <HistoryItem
                              key={index}
                              item={item}
                              onClick={() => onHistoryClick(item)}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* profil + sign out */}
                {isAuthenticated && (
                  <li className="mt-auto py-2 px-3 text-gray-600">
                    <div
                      className={`flex items-center gap-3 transition-all ${
                        expanded ? "opacity-100" : "opacity-0 w-0 h-0"
                      }`}
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          username || "User"
                        )}&background=c7d2fe&color=3730a3&bold=true`}
                        alt="Profile"
                        className="w-10 h-10 rounded-md"
                      />
                      <span className="truncate">
                        {expanded ? username || "User" : ""}
                      </span>
                    </div>
                    {expanded && (
                      <div className="mt-3">
                        <button
                          onClick={onLogout}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    )}
                  </li>
                )}
              </>
            ) : (
              <>
                {/* sidebar droite resources */}
                <li className="text-gray-600 font-medium py-2">
                  {expanded && "Resources"}
                </li>
                {expanded && resources.length === 0 && (
                  <li className="py-2 px-3 my-1 text-gray-500">
                    No resources available
                  </li>
                )}
                {expanded && resources.length > 0 && (
                  <div
                    className={`pr-1 transition-all ${
                      scrollVisible ? "overflow-y-auto" : "overflow-hidden"
                    } scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent
                    max-h-[320px]`} // pareil : scroll après 8 items
                    onMouseEnter={() => setScrollVisible(true)}
                    onMouseLeave={() => setScrollVisible(false)}
                  >
                    {resources.map((resource, index) => (
                      <ResourceItem key={index} resource={resource} />
                    ))}
                  </div>
                )}
              </>
            )}
          </ul>
        </SidebarContext.Provider>
      </nav>
    </aside>
  );
}

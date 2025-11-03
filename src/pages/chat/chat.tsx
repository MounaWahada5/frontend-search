import { ChatInput } from "@/components/custom/chatinput";
import { PreviewMessage, ThinkingMessage } from "../../components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { useState, useEffect, useRef } from "react";
import { Overview } from "@/components/custom/overview";
import { apiFetch, clearToken } from "../../utils/api";
import Sidebar from "../../components/Sidebar";
import { useNavigate, useLocation, useNavigationType } from "react-router-dom";

type StoredUser = {
  user_id?: number;
  username?: string;
  role?: string;
  company_id?: number | null;
};

export function Chat() {
  const [isNewConversation, setIsNewConversation] = useState(false);
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom();
  const [messages, setMessages] = useState<any[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resources, setResources] = useState<{ title: string; url: string }[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [historyId, setHistoryId] = useState<number | null>(null);
  const [username, setUsername] = useState(localStorage.getItem("username") || "User");
  const [historyError, setHistoryError] = useState<string | null>(null);
  const hasProcessedInitialQuery = useRef(false);
  const navigate = useNavigate();
  const { state } = useLocation() as { state?: { query?: string; model?: string } };
  const navigationType = useNavigationType();

  const isAuthenticated = !!localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const parsedUser: StoredUser | null = storedUser ? JSON.parse(storedUser) : null;
  const role = parsedUser?.role || "user";
  const userId = parsedUser?.user_id;

  // ✅ user d’entreprise si company_id existe OU rôle company
  const isCompanyUser =
    !!parsedUser?.company_id || role === "company_user" || role === "company_admin";

  // (facultatif) debug
  console.log("[Chat] role =", role, "company_id =", parsedUser?.company_id, "isCompanyUser =", isCompanyUser);

  const models = isAuthenticated
  ? ["llama3:latest", "mistral:latest", "gemma:7b", "codellama:latest"]
  : ["tinyllama:latest", "phi3:latest", "neural-chat:latest"];

  const [selectedModel, setSelectedModel] = useState<string>(state?.model || models[0]);

  // Redirect non-user roles (anonymous allowed)
  useEffect(() => {
    if (role === "company_admin") {
      navigate("/company-admin");
    } else if (role === "website_admin") {
      navigate("/website-admin");
    } else if (role !== "user" && role !== "company_user") {
      navigate("/login");
    }
  }, [role, navigate]);

  useEffect(() => {
    if (
      state?.query &&
      !isLoading &&
      !hasProcessedInitialQuery.current &&
      navigationType === "PUSH"
    ) {
      hasProcessedInitialQuery.current = true;
      setQuestion(state.query);
      // 2e param = webSearch (bool), undefined => false par défaut
      handleSubmit(state.query, undefined);
      navigate({ pathname: window.location.pathname }, { replace: true, state: {} });
    }
  }, [state?.query, isLoading, navigationType, navigate]);

  useEffect(() => {
    const storedUsername = parsedUser?.username || localStorage.getItem("username");
    setUsername(storedUsername || "User");

    // Clear conversation on mount
    setMessages([]);
    setResources([]);
    setHistory([]);
    setHistoryId(null);
    setHistoryError(null);
  }, []); // eslint-disable-line

  const fetchHistory = async () => {
    if (!isAuthenticated || !userId) {
      setHistory([]);
      setHistoryError(null);
      return;
    }
    try {
      const data = await apiFetch("/history", { method: "GET" });
      setHistory(data.history || []);
      setHistoryError(null);
    } catch (error: any) {
      setHistoryError(error.message || "Failed to load history");
    }
  };

  // 🔧 2e param = webSearch (booléen)
  async function handleSubmit(text?: string, webSearch?: boolean) {
    if (isLoading) return;

    const messageText = (text ?? question).trim();
    const modelToSend = (selectedModel || "mistral:latest").toLowerCase();

    if (!messageText) return;

    // Empêcher la duplication visuelle
    if (messages.some((msg) => msg.content === messageText && msg.role === "user")) {
      setIsLoading(true);
    } else {
      const newMessage = { content: messageText, role: "user", id: Date.now().toString() };
      setMessages((prev) => [...prev, newMessage]);
      setIsLoading(true);
    }

    if (isAuthenticated && (!userId || !Number.isInteger(userId) || userId <= 0)) {
      setMessages((prev) => [
        ...prev,
        {
          content:
            "Erreur: ID utilisateur invalide ou manquant. Veuillez vous reconnecter.",
          role: "assistant",
          id: Date.now().toString(),
        },
      ]);
      clearToken();
      navigate("/login");
      setIsLoading(false);
      return;
    }

    setQuestion("");

    const userMessage = { content: messageText, role: "user", id: Date.now().toString() };
    const payload = {
      query: messageText,
      user_id: isAuthenticated ? userId : null,
      messages: isNewConversation ? [userMessage] : messages.concat([userMessage]),
      history_id: isNewConversation ? null : historyId,
      model: modelToSend,          // ✅ string pour le backend
      web_search: !!webSearch,     // ✅ booléen
    };

    // debug
    console.log("[Chat] Sending payload to /chat:", payload);

    try {
      const data = await apiFetch("/chat", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      // debug retour serveur
      console.log("[Chat] /chat response:", data);

      const assistantMessage = {
        content: data.answer,
        role: "assistant",
        id: Date.now().toString(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      const formattedResources = (data.sources || []).map((s: string) => ({ title: s, url: s }));
      setResources(formattedResources);

      if (isAuthenticated) {
        if (data.history_id) {
          setHistoryId(data.history_id);
          setIsNewConversation(false);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              content: "Avertissement: La conversation n'a pas été sauvegardée correctement.",
              role: "assistant",
              id: Date.now().toString(),
            },
          ]);
        }
        await fetchHistory();
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          content: `Erreur: ${error.message || "Une erreur interne est survenue."}`,
          role: "assistant",
          id: Date.now().toString(),
        },
      ]);
      console.error("[Chat] /chat error:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  const restoreConversation = (historyItem: any) => {
    const uniqueMessages: any[] = [];
    const seen = new Set();
    for (const msg of historyItem.conversation.messages) {
      const key = `${msg.content}:${msg.role}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMessages.push(msg);
      }
    }
    setMessages(uniqueMessages);
    setResources(
      historyItem.conversation.sources.map((s: string) => ({ title: s, url: s }))
    );
    setQuestion("");
    setHistoryId(historyItem.id);
    setIsNewConversation(false);
  };

  const handleNewChat = () => {
    setMessages([]);
    setResources([]);
    setQuestion("");
    setHistory([]);
    setHistoryId(null);
    setHistoryError(null);
    setIsNewConversation(true);
    hasProcessedInitialQuery.current = false;
    navigate({ pathname: window.location.pathname }, { replace: true, state: {} });
    if (isAuthenticated) fetchHistory();
  };

  return (
    <div className="flex flex-row min-w-0 h-dvh bg-background">
      <Sidebar
        isOpen={true}
        toggleSidebar={() => {}}
        position="left"
        resources={[]}
        history={history}
        username={username}
        onLogout={handleLogout}
        onHistoryClick={restoreConversation}
        onNewChat={handleNewChat}
      />

      <div className="flex flex-col min-w-0 flex-1">
        {/* Model selector */}
        <div className="flex justify-center pt-4">
          <div className="relative inline-block text-left">
            <select
              className="block appearance-none w-40 bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map((model) => (
                <option key={model} value={model}>
                  {model.charAt(0).toUpperCase() + model.slice(1)}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div
          className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
          ref={messagesContainerRef}
        >
          {messages.length === 0 && <Overview />}
          {messages.map((message) => (
            <PreviewMessage key={message.id} message={message} />
          ))}
          {isLoading && <ThinkingMessage />}
          {historyError && <div className="text-red-500 p-4">History Error: {historyError}</div>}
          <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
        </div>

        {/* Chat input */}
        <div className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          <ChatInput
            question={question}
            setQuestion={setQuestion}
            onSubmit={handleSubmit}   // (text, webSearch)
            isLoading={isLoading}
            isCompanyUser={isCompanyUser} // 👈 important
          />
        </div>
      </div>

      <Sidebar
        isOpen={true}
        toggleSidebar={() => {}}
        position="right"
        resources={resources}
        history={[]}
        username={username}
        onLogout={handleLogout}
        onHistoryClick={restoreConversation}
        onNewChat={handleNewChat}
      />
    </div>
  );
}

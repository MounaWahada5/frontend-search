// src/pages/CompanyAdminPage.tsx
import { useEffect, useState, useCallback, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearToken } from "../utils/api";
import {
  LogOut,
  Users,
  FileUp,
  Trash2,
  ShieldCheck,
  FileText,
  Upload,
  LayoutDashboard,
  ChevronRight,
} from "lucide-react";

// ===== Types =====
interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  company_id: number | null;
}
interface Document {
  id: number;
  filename: string;
  file_path: string;
  uploaded_by: number;
  uploaded_at: string;
}
interface CurrentUser {
  id: number;
  username: string;
  role: string;
  company_id: number | null;
}

// ===== UI Helpers (DRY) =====
const Card: React.FC<{ title?: string; children: React.ReactNode; className?: string }> = ({
  title,
  children,
  className = "",
}) => (
  <section className={`bg-black/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg ${className}`}>
    {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
    {children}
  </section>
);

const Field: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full p-3 bg-slate-900/50 border border-slate-700 rounded-lg placeholder:text-white/60 focus:outline-none focus:border-teal-400 ${
      props.className ?? ""
    }`}
  />
);

const PrimaryBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  children,
  ...rest
}) => (
  <button
    {...rest}
    className={`px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition shadow-md inline-flex items-center gap-2 ${
      className ?? ""
    }`}
  >
    {children}
  </button>
);

const DangerBtn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  children,
  ...rest
}) => (
  <button {...rest} className={`p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white ${className ?? ""}`}>
    {children}
  </button>
);

const Skeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="h-12 bg-slate-900/50 rounded-lg animate-pulse" />
    ))}
  </div>
);

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="text-center py-10 px-6 bg-slate-900/50 rounded-lg">
    <ChevronRight className="mx-auto h-10 w-10 text-slate-500 rotate-90" />
    <h3 className="mt-2 text-sm font-semibold text-white/80">{message}</h3>
  </div>
);

type TabKey = "dashboard" | "users" | "documents";
const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "users", label: "Users", icon: <Users size={18} /> },
  { key: "documents", label: "Documents", icon: <FileText size={18} /> },
];

export default function CompanyAdminPage() {
  // ===== State =====
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); // anti double-submit ✅
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ===== Helpers to refresh (DRY) =====
  const refreshUsers = useCallback(
    async (companyId: number) => {
      const res = await apiFetch(`/company/${companyId}/users`, { method: "GET" });
      setUsers(res.users || []);
    },
    []
  );
  const refreshDocuments = useCallback(async () => {
    const res = await apiFetch(`/company/documents`, { method: "GET" });
    setDocuments(res.documents || []);
  }, []);

  // ===== Auth + Fetch =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Utilisateur non authentifié");
          navigate("/login", { state: { error: "Utilisateur non authentifié" } });
          return;
        }
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          setError("Données utilisateur non trouvées");
          navigate("/login", { state: { error: "Données utilisateur non trouvées" } });
          return;
        }
        const parsedUser = JSON.parse(storedUser);
        if (!parsedUser.user_id || !parsedUser.role) {
          setError("Données utilisateur invalides");
          navigate("/login", { state: { error: "Données utilisateur invalides" } });
          return;
        }
        if (parsedUser.role.toLowerCase() !== "company_admin") {
          setError("Accès non autorisé: Rôle incorrect");
          navigate("/login", { state: { error: "Accès non autorisé: Rôle incorrect" } });
          return;
        }
        if (!parsedUser.company_id) {
          setError("Aucune entreprise associée à cet utilisateur");
          navigate("/login", { state: { error: "Aucune entreprise associée à cet utilisateur" } });
          return;
        }

        setCurrentUser({
          id: parsedUser.user_id,
          username: parsedUser.username,
          role: parsedUser.role,
          company_id: parsedUser.company_id,
        });

        await Promise.all([refreshUsers(parsedUser.company_id), refreshDocuments()]);
        setError("");
      } catch (err: any) {
        if (err.message?.includes("401") || err.message?.includes("Session expired")) {
          setError(err.message || "Erreur lors du chargement des données");
          navigate("/login", { state: { error: err.message || "Erreur lors du chargement des données" } });
        } else {
          setError(err.message || "Erreur lors du chargement des données");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [navigate, refreshUsers, refreshDocuments]);

  // ===== Handlers =====
  const handleCreateUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return; // anti double-clic/Enter
      setError("");

      const email = newUserEmail.trim().toLowerCase();
      const username = newUserUsername.trim();
      const password = newUserPassword.trim();

      if (!email || !username || !password) {
        setError("Tous les champs sont requis");
        return;
      }

      try {
        setIsSubmitting(true);

        await apiFetch(`/company/users`, {
          method: "POST",
          body: JSON.stringify({
            email,
            username,
            password,
            role: "company_user",
            company_id: currentUser?.company_id,
          }),
        });

        if (currentUser?.company_id) {
          await refreshUsers(currentUser.company_id);
        }

        setNewUserEmail("");
        setNewUserUsername("");
        setNewUserPassword("");
      } catch (err: any) {
        setError(err.message || "Erreur lors de la création de l’utilisateur");
      } finally {
        setIsSubmitting(false);
      }
    },
    [isSubmitting, newUserEmail, newUserUsername, newUserPassword, currentUser, refreshUsers]
  );

  const handleUpdateUser = useCallback(
    async (userId: number, newRole: string) => {
      try {
        await apiFetch(`/company/users`, {
          method: "PUT",
          body: JSON.stringify({ user_id: userId, role: newRole, company_id: currentUser?.company_id }),
        });
        if (currentUser?.company_id) await refreshUsers(currentUser.company_id);
        setError("");
      } catch (err: any) {
        setError(err.message || "Erreur lors de la mise à jour de l’utilisateur");
      }
    },
    [currentUser, refreshUsers]
  );

  const handleDeleteUser = useCallback(
    async (userId: number) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;
      try {
        await apiFetch(`/company/users`, { method: "DELETE", body: JSON.stringify({ user_id: userId }) });
        setUsers((prev) => prev.filter((u) => u.id !== userId)); // optimistic
        if (currentUser?.company_id) await refreshUsers(currentUser.company_id); // sync
        setError("");
      } catch (err: any) {
        setError(err.message || "Erreur lors de la suppression de l’utilisateur");
      }
    },
    [currentUser, refreshUsers]
  );

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  }, []);

  const handleUploadDocument = useCallback(async () => {
    if (!file) {
      setError("Aucun fichier sélectionné");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      await apiFetch(`/company/documents`, { method: "POST", body: formData });
      await refreshDocuments();
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement | null;
      if (fileInput) fileInput.value = "";
      setError("");
    } catch (err: any) {
      setError(err.message || "Erreur lors du téléchargement du document");
    }
  }, [file, refreshDocuments]);

  const handleDeleteDocument = useCallback(
    async (documentId: number) => {
      if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
      try {
        await apiFetch(`/company/documents/${documentId}`, { method: "DELETE" });
        setDocuments((prev) => prev.filter((d) => d.id !== documentId)); // optimistic
        await refreshDocuments(); // sync
        setError("");
      } catch (err: any) {
        setError(err.message || "Erreur lors de la suppression du document");
      }
    },
    [refreshDocuments]
  );

  const handleLogout = useCallback(() => {
    clearToken();
    navigate("/login");
  }, [navigate]);

  // ===== UI =====
  return (
    <div className="flex h-screen bg-[#4A646A]">
      {/* Sidebar */}
      <aside className="w-64 h-full bg-black/10 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col flex-shrink-0">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-white">QueryMind</h1>
          <p className="text-sm text-white/60">Company Admin</p>
        </div>
        <ul className="space-y-2">
          {TABS.map((t) => (
            <li key={t.key}>
              <button
                onClick={() => setActiveTab(t.key)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition text-white ${
                  activeTab === t.key ? "bg-teal-600" : "hover:bg-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  {t.icon}
                  <span className="font-semibold">{t.label}</span>
                </div>
                <ChevronRight size={18} />
              </button>
            </li>
          ))}
        </ul>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/20 transition"
          >
            <LogOut size={20} />
            <span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto text-white">
        <h1 className="text-4xl font-bold mb-6">Company Admin Dashboard</h1>
        {error && <div className="bg-red-500/80 p-4 rounded-lg mb-6 text-center font-medium">{error}</div>}

        {/* Current User — sans affichage de l'ID (pour éviter la redondance avec Company ID) */}
        {currentUser && (
          <Card>
            <h3 className="text-2xl font-bold mb-4">Current User</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-white/80">
              <p>
                <span className="text-white/60">Username:</span> {currentUser.username}
              </p>
              <p>
                <span className="text-white/60">Role:</span>
                <span className="ml-2 px-2 py-0.5 rounded-md bg-white/10 border border-white/10 text-white/90 text-sm">
                  {currentUser.role}
                </span>
              </p>
              {currentUser.company_id !== null && (
                <p>
                  <span className="text-white/60">Company ID:</span> {currentUser.company_id}
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Dashboard (Upload retiré ici pour éviter la duplication — voir onglet Documents) */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
            <Card title="Create Company User">
              <form
                onSubmit={handleCreateUser}
                onKeyDown={(e) => {
                  if (isSubmitting && e.key === "Enter") e.preventDefault();
                }}
                className="space-y-3"
              >
                <Field
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="User email"
                  disabled={isSubmitting}
                />
                <Field
                  type="text"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  placeholder="Username"
                  disabled={isSubmitting}
                />
                <Field
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isSubmitting}
                />
                <PrimaryBtn type="submit" className="w-full justify-center" disabled={isSubmitting}>
                  <ShieldCheck size={18} />
                  {isSubmitting ? "Création..." : "Create"}
                </PrimaryBtn>
              </form>
            </Card>
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <Card title="Manage Users">
            {isLoading ? (
              <Skeleton />
            ) : users.length === 0 ? (
              <EmptyState message="No users found." />
            ) : (
              <ul className="space-y-2">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className="p-3 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {user.username} <span className="text-white/60 text-xs">({user.email})</span>
                      </p>
                      <p className="text-sm text-white/80">Role: {user.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        onChange={(e) => handleUpdateUser(user.id, e.target.value)}
                        value={user.role}
                        className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg"
                      >
                        <option value="company_user">Company User</option>
                        <option value="company_admin">Company Admin</option>
                      </select>
                      <DangerBtn onClick={() => handleDeleteUser(user.id)}>
                        <Trash2 size={16} />
                      </DangerBtn>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}

        {/* Documents */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <Card title="Upload Document">
              <div className="flex flex-col sm:flex-row gap-3">
                <Field type="file" accept=".pdf,.txt" onChange={handleFileChange as any} />
                <PrimaryBtn onClick={handleUploadDocument}>
                  <FileUp size={18} /> Upload
                </PrimaryBtn>
              </div>
            </Card>

            <Card title="Manage Documents">
              {isLoading ? (
                <Skeleton rows={2} />
              ) : documents.length === 0 ? (
                <EmptyState message="No documents yet." />
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li
                      key={doc.id}
                      className="p-3 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/5"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{doc.filename}</p>
                        <p className="text-xs text-white/60">
                          Uploaded by: {doc.uploaded_by} • {new Date(doc.uploaded_at).toLocaleString()}
                        </p>
                      </div>
                      <DangerBtn onClick={() => handleDeleteDocument(doc.id)}>
                        <Trash2 size={16} />
                      </DangerBtn>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}

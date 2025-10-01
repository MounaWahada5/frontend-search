// src/pages/CompanyAdminPage.tsx
import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearToken } from "../utils/api";
import { LogOut, Users, FileUp, Trash2, ShieldCheck, FileText, Upload } from "lucide-react";

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

export default function CompanyAdminPage() {
  // ==== STATE (préservé, search retiré) ====
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'documents'>("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ==== EFFECT (logique d'auth + fetch préservée) ====
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

        const usersResponse = await apiFetch(`/company/${parsedUser.company_id}/users`, { method: "GET" });
        setUsers(usersResponse.users || []);

        const documentsResponse = await apiFetch(`/company/documents`, { method: "GET" });
        setDocuments(documentsResponse.documents || []);
        setError("");
      } catch (err: any) {
        console.error("Error in fetchData:", err);
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
  }, [navigate]);

  // ==== HANDLERS (logique d'origine préservée) ====
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newUserEmail || !newUserUsername || !newUserPassword) {
        setError("Tous les champs sont requis");
        return;
      }
      const response = await apiFetch(`/company/users`, {
        method: "POST",
        body: JSON.stringify({
          email: newUserEmail,
          username: newUserUsername,
          password: newUserPassword,
          role: "company_user",
          company_id: currentUser?.company_id,
        }),
      });
      console.log("User created:", response);

      const usersResponse = await apiFetch(`/company/${currentUser?.company_id}/users`, { method: "GET" });
      setUsers(usersResponse.users || []);
      setNewUserEmail("");
      setNewUserUsername("");
      setNewUserPassword("");
      setError("");
    } catch (err: any) {
      console.error("Error in handleCreateUser:", err);
      setError(err.message || "Erreur lors de la création de l’utilisateur");
    }
  };

  const handleUpdateUser = async (userId: number, newRole: string) => {
    try {
      const response = await apiFetch(`/company/users`, {
        method: "PUT",
        body: JSON.stringify({ user_id: userId, role: newRole, company_id: currentUser?.company_id }),
      });
      console.log("User updated:", response);
      const usersResponse = await apiFetch(`/company/${currentUser?.company_id}/users`, { method: "GET" });
      setUsers(usersResponse.users || []);
      setError("");
    } catch (err: any) {
      console.error("Error in handleUpdateUser:", err);
      setError(err.message || "Erreur lors de la mise à jour de l’utilisateur");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        const response = await apiFetch(`/company/users`, {
          method: "DELETE",
          body: JSON.stringify({ user_id: userId }),
        });
        console.log("User deleted:", response);
        setUsers(users.filter((user) => user.id !== userId));
        setError("");
      } catch (err: any) {
        console.error("Error in handleDeleteUser:", err);
        setError(err.message || "Erreur lors de la suppression de l’utilisateur");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadDocument = async () => {
    if (!file) { setError("Aucun fichier sélectionné"); return; }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await apiFetch(`/company/documents`, { method: "POST", body: formData });
      console.log("Document uploaded:", response);
      const documentsResponse = await apiFetch(`/company/documents`, { method: "GET" });
      setDocuments(documentsResponse.documents || []);
      setFile(null);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      setError("");
    } catch (err: any) {
      console.error("Error in handleUploadDocument:", err);
      setError(err.message || "Erreur lors du téléchargement du document");
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        const response = await apiFetch(`/company/documents/${documentId}`, { method: "DELETE" });
        console.log("Document deleted:", response);
        setDocuments(documents.filter((doc) => doc.id !== documentId));
        setError("");
      } catch (err: any) {
        console.error("Error in handleDeleteDocument:", err);
        setError(err.message || "Erreur lors de la suppression du document");
      }
    }
  };

  const handleLogout = () => {
    clearToken();
    navigate("/login");
  };

  // ==== UI — Thème sombre/verre (comme WebsiteAdminPage), bloc Search retiré ====
  return (
    <div className="flex h-screen bg-[#4A646A]">
      {/* Sidebar */}
      <aside className="w-64 h-full bg-black/10 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col flex-shrink-0">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-bold text-white">QueryMind</h1>
          <p className="text-sm text-white/60">Company Admin</p>
        </div>
        <ul className="space-y-2">
          <li>
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center justify-between p-3 rounded-lg transition text-white ${activeTab === 'dashboard' ? 'bg-teal-600' : 'hover:bg-white/10'}`}>
              <div className="flex items-center gap-3"><ShieldCheck size={20} /><span className="font-semibold">Dashboard</span></div>
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('users')} className={`w-full flex items-center justify-between p-3 rounded-lg transition text-white ${activeTab === 'users' ? 'bg-teal-600' : 'hover:bg-white/10'}`}>
              <div className="flex items-center gap-3"><Users size={20} /><span className="font-semibold">Users</span></div>
            </button>
          </li>
          <li>
            <button onClick={() => setActiveTab('documents')} className={`w-full flex items-center justify-between p-3 rounded-lg transition text-white ${activeTab === 'documents' ? 'bg-teal-600' : 'hover:bg-white/10'}`}>
              <div className="flex items-center gap-3"><FileText size={20} /><span className="font-semibold">Documents</span></div>
            </button>
          </li>
        </ul>
        <div className="mt-auto">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/20 transition">
            <LogOut size={20} /><span className="font-semibold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto text-white">
        <h1 className="text-4xl font-bold mb-6">Company Admin Dashboard</h1>
        {error && <div className="bg-red-500/80 p-4 rounded-lg mb-6 text-center font-medium">{error}</div>}

        {/* Current user */}
        {currentUser && (
          <div className="mb-8 bg-black/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
            <h3 className="text-2xl font-bold mb-4">Current User</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-white/80">
              <p><span className="text-white/60">ID:</span> {currentUser.id}</p>
              <p><span className="text-white/60">Username:</span> {currentUser.username}</p>
              <p><span className="text-white/60">Role:</span> {currentUser.role}</p>
              <p><span className="text-white/60">Company ID:</span> {currentUser.company_id ?? 'None'}</p>
            </div>
          </div>
        )}

        {/* DASHBOARD TAB: create user + upload */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Create Company User */}
            <div className="bg-black/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Create Company User</h3>
              <form onSubmit={handleCreateUser} className="space-y-3">
                <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="User email" className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-lg placeholder:text-white/60 focus:outline-none focus:border-teal-400" />
                <input type="text" value={newUserUsername} onChange={(e) => setNewUserUsername(e.target.value)} placeholder="Username" className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-lg placeholder:text-white/60 focus:outline-none focus:border-teal-400" />
                <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Password" className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-lg placeholder:text-white/60 focus:outline-none focus:border-teal-400" />
                <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition shadow-md flex items-center justify-center gap-2"><ShieldCheck size={18}/> Create</button>
              </form>
            </div>

            {/* Upload */}
            <div className="bg-black/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Upload Document</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-lg" />
                <button onClick={handleUploadDocument} className="px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition shadow-md inline-flex items-center gap-2"><Upload size={18}/> Upload</button>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="bg-black/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Manage Users</h3>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-slate-900/50 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-slate-900/50 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-slate-900/50 rounded-lg animate-pulse"></div>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-10 px-6 bg-slate-900/50 rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-slate-500" />
                  <h3 className="mt-2 text-sm font-semibold text-white/80">No users found.</h3>
                </div>
              ) : (
                <ul className="space-y-2">
                  {users.map((user) => (
                    <li key={user.id} className="p-3 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/5">
                      <div className="min-w-0">
                        <p className="font-semibold">{user.username} <span className="text-white/60 text-xs">({user.email})</span></p>
                        <p className="text-sm text-white/80">Role: {user.role}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <select onChange={(e) => handleUpdateUser(user.id, e.target.value)} value={user.role} className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg">
                          <option value="company_user">Company User</option>
                          <option value="company_admin">Company Admin</option>
                        </select>
                        <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB — Search retiré */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            {/* Upload */}
            <div className="bg-black/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Upload Document</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="w-full p-3 bg-slate-900/50 border border-slate-700 rounded-lg" />
                <button onClick={handleUploadDocument} className="px-4 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition inline-flex items-center gap-2"><FileUp size={18}/> Upload</button>
              </div>
            </div>

            {/* List */}
            <div className="bg-black/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10">
              <h3 className="text-2xl font-bold mb-4">Manage Documents</h3>
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-slate-900/50 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-slate-900/50 rounded-lg animate-pulse"></div>
                </div>
              ) : documents.length === 0 ? (
                <div className="text-center py-10 px-6 bg-slate-900/50 rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-slate-500" />
                  <h3 className="mt-2 text-sm font-semibold text-white/80">No documents yet.</h3>
                </div>
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li key={doc.id} className="p-3 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/5">
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{doc.filename}</p>
                        <p className="text-xs text-white/60">Uploaded by: {doc.uploaded_by} • {new Date(doc.uploaded_at).toLocaleString()}</p>
                      </div>
                      <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"><Trash2 size={16} /></button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

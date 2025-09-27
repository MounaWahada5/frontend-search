import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, clearToken } from "../utils/api";

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
  const [users, setUsers] = useState<User[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching current user details from localStorage...");
        const token = localStorage.getItem("token");
        if (!token) {
          console.warn("No token found in localStorage");
          setError("Utilisateur non authentifié");
          navigate("/login", { state: { error: "Utilisateur non authentifié" } });
          return;
        }

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          console.warn("No user data found in localStorage");
          setError("Données utilisateur non trouvées");
          navigate("/login", { state: { error: "Données utilisateur non trouvées" } });
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        console.log("Stored user:", storedUser);
        console.log("Parsed user:", parsedUser);
        if (!parsedUser.user_id || !parsedUser.role) {
          console.warn("Invalid user data in localStorage:", parsedUser);
          setError("Données utilisateur invalides");
          navigate("/login", { state: { error: "Données utilisateur invalides" } });
          return;
        }

        if (parsedUser.role.toLowerCase() !== "company_admin") {
          console.warn("User role is not company_admin:", parsedUser.role);
          setError("Accès non autorisé: Rôle incorrect");
          navigate("/login", { state: { error: "Accès non autorisé: Rôle incorrect" } });
          return;
        }

        if (!parsedUser.company_id) {
          console.warn("No company_id found for company_admin user:", parsedUser);
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
        console.log("Current user set:", parsedUser);

        console.log("Fetching company users for company_id:", parsedUser.company_id);
        const usersResponse = await apiFetch(`/company/${parsedUser.company_id}/users`, {
          method: "GET",
        });
        console.log("Users response:", usersResponse);
        setUsers(usersResponse.users || []);

        console.log("Fetching company documents...");
        const documentsResponse = await apiFetch(`/company/documents`, {
          method: "GET",
        });
        console.log("Documents response:", documentsResponse);
        setDocuments(documentsResponse.documents || []);
      } catch (err) {
        console.error("Error in fetchData:", err);
        if (err.message.includes("401") || err.message.includes("Session expired")) {
          setError(err.message || "Erreur lors du chargement des données");
          navigate("/login", { state: { error: err.message || "Erreur lors du chargement des données" } });
        } else {
          setError(err.message || "Erreur lors du chargement des données");
        }
      }
    };
    fetchData();
  }, [navigate]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Creating user with:", { newUserEmail, newUserUsername, company_id: currentUser?.company_id });
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
      console.log("User created successfully:", response);

      console.log("Fetching updated users list...");
      const usersResponse = await apiFetch(`/company/${currentUser?.company_id}/users`, {
        method: "GET",
      });
      console.log("Updated users response:", usersResponse);
      setUsers(usersResponse.users || []);
      setNewUserEmail("");
      setNewUserUsername("");
      setNewUserPassword("");
      setError("");
    } catch (err) {
      console.error("Error in handleCreateUser:", err);
      setError(err.message || "Erreur lors de la création de l’utilisateur");
    }
  };

  const handleUpdateUser = async (userId: number, newRole: string) => {
    try {
      console.log("Updating user:", { userId, newRole, company_id: currentUser?.company_id });
      const response = await apiFetch(`/company/users`, {
        method: "PUT",
        body: JSON.stringify({
          user_id: userId,
          role: newRole,
          company_id: currentUser?.company_id,
        }),
      });
      console.log("User updated successfully:", response);

      console.log("Fetching updated users list...");
      const usersResponse = await apiFetch(`/company/${currentUser?.company_id}/users`, {
        method: "GET",
      });
      console.log("Updated users response:", usersResponse);
      setUsers(usersResponse.users || []);
      setError("");
    } catch (err) {
      console.error("Error in handleUpdateUser:", err);
      setError(err.message || "Erreur lors de la mise à jour de l’utilisateur");
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        console.log("Deleting user with ID:", userId);
        const response = await apiFetch(`/company/users`, {
          method: "DELETE",
          body: JSON.stringify({ user_id: userId }),
        });
        console.log("User deleted successfully:", response);
        setUsers(users.filter((user) => user.id !== userId));
        setError("");
      } catch (err) {
        console.error("Error in handleDeleteUser:", err);
        setError(err.message || "Erreur lors de la suppression de l’utilisateur");
      }
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      console.log("File selected:", e.target.files[0].name);
    }
  };

  const handleUploadDocument = async () => {
    if (!file) {
      setError("Aucun fichier sélectionné");
      return;
    }

    try {
      console.log("Uploading document:", file.name);
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiFetch(`/company/documents`, {
        method: "POST",
        body: formData,
      });
      console.log("Document uploaded successfully:", response);

      console.log("Fetching updated documents list...");
      const documentsResponse = await apiFetch(`/company/documents`, {
        method: "GET",
      });
      console.log("Updated documents response:", documentsResponse);
      setDocuments(documentsResponse.documents || []);
      setFile(null);
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      setError("");
    } catch (err) {
      console.error("Error in handleUploadDocument:", err);
      setError(err.message || "Erreur lors du téléchargement du document");
    }
  };

  const handleSearchDocuments = async () => {
    try {
      console.log("Searching documents with query:", searchQuery);
      const response = await apiFetch(`/company/documents/search`, {
        method: "POST",
        body: JSON.stringify({ query: searchQuery }),
      });
      console.log("Search documents response:", response);
      const searchResults = (response.results || []).map((result: any) => ({
        id: result.id,
        filename: result.filename,
        file_path: result.file_path || "",
        uploaded_by: result.uploaded_by || currentUser?.id || 0,
        uploaded_at: result.uploaded_at || new Date().toISOString(),
      }));
      setDocuments(searchResults);
      setError("");
    } catch (err) {
      console.error("Error in handleSearchDocuments:", err);
      setError(err.message || "Erreur lors de la recherche de documents");
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      try {
        console.log("Deleting document with ID:", documentId);
        const response = await apiFetch(`/company/documents/${documentId}`, {
          method: "DELETE",
        });
        console.log("Document deleted successfully:", response);
        setDocuments(documents.filter((doc) => doc.id !== documentId));
        setError("");
      } catch (err) {
        console.error("Error in handleDeleteDocument:", err);
        setError(err.message || "Erreur lors de la suppression du document");
      }
    }
  };

  const handleLogout = () => {
    console.log("Logging out...");
    clearToken();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E0FFFF] to-[#ADD8E6] text-gray-800 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold text-center text-[#2F4F4F]">
            Company Admin Dashboard
          </h2>
          <button
            onClick={handleLogout}
            className="py-2 px-4 bg-red-500 text-white rounded-xl font-bold"
          >
            Logout
          </button>
        </div>

        {currentUser && (
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-[#2F4F4F] mb-4">Current User</h3>
            <p>ID: {currentUser.id}</p>
            <p>Username: {currentUser.username}</p>
            <p>Role: {currentUser.role}</p>
            <p>Company ID: {currentUser.company_id || "None"}</p>
          </div>
        )}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#2F4F4F] mb-4">Create Company User</h3>
          <form onSubmit={handleCreateUser} className="flex space-x-2 mb-4">
            <input
              type="email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="User email"
              className="w-full p-4 border border-gray-300 rounded-xl"
            />
            <input
              type="text"
              value={newUserUsername}
              onChange={(e) => setNewUserUsername(e.target.value)}
              placeholder="Username"
              className="w-full p-4 border border-gray-300 rounded-xl"
            />
            <input
              type="password"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-4 border border-gray-300 rounded-xl"
            />
            <button
              type="submit"
              className="py-2 px-4 bg-[#4682B4] text-white rounded-xl font-bold"
            >
              Create
            </button>
          </form>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#2F4F4F] mb-4">Manage Users</h3>
          <ul className="space-y-2">
            {users.map((user) => (
              <li key={user.id} className="p-2 border rounded-xl flex justify-between">
                <span>
                  {user.username} ({user.email}) - Role: {user.role}
                </span>
                <div>
                  <select
                    onChange={(e) => handleUpdateUser(user.id, e.target.value)}
                    value={user.role}
                    className="mr-2 p-2 border rounded-xl"
                  >
                    <option value="company_user">Company User</option>
                    <option value="company_admin">Company Admin</option>
                  </select>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="py-1 px-2 bg-red-500 text-white rounded-xl"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#2F4F4F] mb-4">Upload Document</h3>
          <div className="flex space-x-2 mb-4">
            <input
              type="file"
              accept=".pdf,.txt"
              onChange={handleFileChange}
              className="w-full p-4 border border-gray-300 rounded-xl"
            />
            <button
              onClick={handleUploadDocument}
              className="py-2 px-4 bg-[#4682B4] text-white rounded-xl font-bold"
            >
              Upload
            </button>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-[#2F4F4F] mb-4">Search Documents</h3>
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents..."
              className="w-full p-4 border border-gray-300 rounded-xl"
            />
            <button
              onClick={handleSearchDocuments}
              className="py-2 px-4 bg-[#4682B4] text-white rounded-xl font-bold"
            >
              Search
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-[#2F4F4F] mb-4">Manage Documents</h3>
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id} className="p-2 border rounded-xl flex justify-between">
                <span>{doc.filename} (Uploaded by: {doc.uploaded_by})</span>
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="py-1 px-2 bg-red-500 text-white rounded-xl"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
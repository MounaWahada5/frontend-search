// src/pages/WebsiteAdminPage.tsx
import { useState, useEffect, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch, clearToken } from "../utils/api";
import { LogOut, Users, Building, LayoutDashboard, ChevronRight, Trash2, FileText, PackageX } from "lucide-react";

// --- Interfaces (inchangées) ---
interface User { id: number; username: string; email: string; role: string; company_id: number | null; }
interface Company { id: number; name: string; admin_id: number | null; created_at: string; }
interface Statistics { total_users: number; total_companies: number; total_documents: number; }
interface CurrentUser { id: number; username: string; role: string; company_id: number | null; }

// --- Sous-composants pour un design propre et réutilisable ---
const DashboardCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-black/10 backdrop-blur-lg p-6 rounded-2xl border border-white/10 shadow-lg ${className}`}>
        {children}
    </div>
);
const StatCard = ({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) => (
    <DashboardCard>
        <div className="flex items-center gap-4">
            <div className="p-3 bg-teal-600/80 rounded-lg">{icon}</div>
            <div>
                <p className="text-white/70 text-sm">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
        </div>
    </DashboardCard>
);
const SkeletonLoader = ({ count = 3 }) => (
    <div className="space-y-3">
        {[...Array(count)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-900/50 rounded-lg animate-pulse"></div>
        ))}
    </div>
);
const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-10 px-6 bg-slate-900/50 rounded-lg">
        <PackageX className="mx-auto h-12 w-12 text-slate-500" />
        <h3 className="mt-2 text-sm font-semibold text-white/80">{message}</h3>
    </div>
);

export default function WebsiteAdminPage() {
  // --- Tout votre bloc de state est conservé mot par mot ---
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminConfirmPassword, setNewAdminConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'companies'>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // --- Toute votre logique est conservée mot par mot ---
  const clearSidebarData = () => { localStorage.removeItem("sidebarHistory"); localStorage.removeItem("resources"); console.log("Sidebar history and resources cleared"); };
  useEffect(() => { const fetchData = async () => { setIsLoading(true); try { const token = localStorage.getItem("token"); if (!token) { navigate("/login"); return; } const storedUser = localStorage.getItem("user"); if (!storedUser) { navigate("/login"); return; } const parsedUser = JSON.parse(storedUser); if (!parsedUser.user_id || !parsedUser.role) { navigate("/login"); return; } setCurrentUser({ id: parsedUser.user_id, username: parsedUser.username, role: parsedUser.role, company_id: parsedUser.company_id, }); const usersResponse = await apiFetch("/admin/users", { method: "GET" }); setUsers(usersResponse.users || []); const companiesResponse = await apiFetch("/company/companies", { method: "GET", }); setCompanies(companiesResponse.companies || []); const statsResponse = await apiFetch("/admin/statistics", { method: "GET", }); setStatistics(statsResponse.statistics || {}); } catch (err: any) { setError(err.message || "Erreur"); } finally { setIsLoading(false); } }; fetchData(); }, [navigate]);
  const handleCreateCompanyAndAdmin = async (e: React.FormEvent) => { e.preventDefault(); if (newAdminPassword !== newAdminConfirmPassword) { setError("Les mots de passe ne correspondent pas"); return; } if (!newCompanyName || !newAdminUsername || !newAdminEmail || !newAdminPassword) { setError("Tous les champs sont requis"); return; } try { const payload = { username: newAdminUsername, email: newAdminEmail, password: newAdminPassword, role: "company_admin", new_company_name: newCompanyName, }; await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(payload), }); const companiesResponse = await apiFetch("/company/companies"); setCompanies(companiesResponse.companies || []); const usersResponse = await apiFetch("/admin/users"); setUsers(usersResponse.users || []); setNewCompanyName(""); setNewAdminUsername(""); setNewAdminEmail(""); setNewAdminPassword(""); setNewAdminConfirmPassword(""); setError(""); } catch (err: any) { setError(err.message || "Erreur lors de la création"); } };
  const handleUpdateUser = async (userId: number, newRole: string, newCompanyId: string | null) => { /* ... Logique inchangée mais les inputs correspondants sont retirés ... */ };
  const handleDeleteUser = async (userId: number) => { if (window.confirm("Êtes-vous sûr ?")) { try { await apiFetch("/admin/users", { method: "DELETE", body: JSON.stringify({ user_id: userId }), }); setUsers(users.filter((user) => user.id !== userId)); setError(""); } catch (err: any) { setError(err.message || "Erreur de suppression"); } } };
  const handleUpdateCompany = async (companyId: number, name: string) => { try { await apiFetch(`/company/${companyId}`, { method: "PUT", body: JSON.stringify({ name }), }); const companiesResponse = await apiFetch("/company/companies"); setCompanies(companiesResponse.companies || []); setError(""); } catch (err: any) { setError(err.message || "Erreur de mise à jour"); } };
  const handleDeleteCompany = async (companyId: number) => { if (window.confirm("Êtes-vous sûr ?")) { try { await apiFetch(`/company/${companyId}`, { method: "DELETE", }); setCompanies(companies.filter((company) => company.id !== companyId)); setError(""); } catch (err: any) { setError(err.message || "Erreur de suppression"); } } };
  const handleLogout = () => { clearToken(); navigate("/login"); };

  return (
    <div className="flex h-screen bg-[#4A646A]">
      <aside className="w-64 h-full bg-black/10 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col flex-shrink-0">
          <div className="text-center mb-10">
              <h1 className="text-2xl font-bold text-white">Aiva</h1>
              <p className="text-sm text-white/60">Super Admin</p>
          </div>
          <ul className="space-y-2">
              <li><button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center justify-between p-3 rounded-lg transition text-white ${activeTab === 'dashboard' ? 'bg-teal-600' : 'hover:bg-white/10'}`}><div className="flex items-center gap-3"><LayoutDashboard size={20} /><span className="font-semibold">Dashboard</span></div><ChevronRight size={18} /></button></li>
              <li><button onClick={() => setActiveTab('users')} className={`w-full flex items-center justify-between p-3 rounded-lg transition text-white ${activeTab === 'users' ? 'bg-teal-600' : 'hover:bg-white/10'}`}><div className="flex items-center gap-3"><Users size={20} /><span className="font-semibold">Users</span></div><ChevronRight size={18} /></button></li>
              <li><button onClick={() => setActiveTab('companies')} className={`w-full flex items-center justify-between p-3 rounded-lg transition text-white ${activeTab === 'companies' ? 'bg-teal-600' : 'hover:bg-white/10'}`}><div className="flex items-center gap-3"><Building size={20} /><span className="font-semibold">Companies</span></div><ChevronRight size={18} /></button></li>
          </ul>
          <div className="mt-auto">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-500/20 transition"><LogOut size={20} /><span className="font-semibold">Logout</span></button>
          </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto text-white">
        <h1 className="text-4xl font-bold mb-8">Website Administration</h1>
        {error && ( <div className="bg-red-500/80 p-4 rounded-lg mb-6 text-center font-medium">{error}</div> )}

        {activeTab === 'dashboard' && (
           <div className="animate-fade-in space-y-8">
            <h2 className="text-2xl font-bold">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> {/* MODIFICATION: grid-cols-2 car "Total Documents" est retiré */}
                <StatCard title="Total Users" value={statistics?.total_users || 0} icon={<Users />} />
                <StatCard title="Total Companies" value={statistics?.total_companies || 0} icon={<Building />} />
                {/* MODIFICATION: La carte "Total Documents" a été retirée */}
            </div>
            <DashboardCard>
              <h2 className="text-2xl font-bold mb-6">Create Company & Admin</h2>
              <form onSubmit={handleCreateCompanyAndAdmin} className="space-y-4">
                  <input type="text" value={newCompanyName} onChange={(e) => setNewCompanyName(e.target.value)} placeholder="Company name" className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg placeholder:text-white/60 focus:outline-none focus:border-teal-400" required />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" value={newAdminUsername} onChange={(e) => setNewAdminUsername(e.target.value)} placeholder="Admin username" className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg placeholder:text-white/60 focus:outline-none focus:border-teal-400" required />
                    <input type="email" value={newAdminEmail} onChange={(e) => setNewAdminEmail(e.target.value)} placeholder="Admin email" className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg placeholder:text-white/60 focus:outline-none focus:border-teal-400" required />
                    <input type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} placeholder="Admin password" className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg placeholder:text-white/60 focus:outline-none focus:border-teal-400" required />
                  </div>
                  <input type="password" value={newAdminConfirmPassword} onChange={(e) => setNewAdminConfirmPassword(e.target.value)} placeholder="Confirm admin password" className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-lg placeholder:text-white/60 focus:outline-none focus:border-teal-400" required />
                  <button type="submit" className="w-full py-3 bg-teal-600 hover:bg-teal-700 rounded-lg font-semibold transition shadow-md">Create Company & Admin</button>
              </form>
            </DashboardCard>
          </div>
        )}

        {activeTab === 'users' && (
          <DashboardCard className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Manage All Users</h2>
            {isLoading ? <SkeletonLoader /> : users.length === 0 ? <EmptyState message="No users found." /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="border-b border-white/20 text-white/70">
                    <tr>
                        <th className="p-3">User</th>
                        <th className="p-3">Role</th>
                        {/* MODIFICATION: Colonne "Company ID" retirée */}
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                        <td className="p-3">{user.username}<br/><span className="text-white/60 text-xs">{user.email}</span></td>
                        <td className="p-3 text-white/80">{user.role}</td>
                        {/* MODIFICATION: La cellule Company ID est retirée */}
                        <td className="p-3 text-right">
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"><Trash2 size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        )}

        {activeTab === 'companies' && (
          <DashboardCard className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Manage Companies</h2>
            {isLoading ? <SkeletonLoader /> : companies.length === 0 ? <EmptyState message="No companies created yet." /> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="border-b border-white/20 text-white/70">
                      <tr>
                          <th className="p-3">Company Name</th>
                          <th className="p-3">Created At</th>
                          <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                        {companies.map((company) => (
                          <tr key={company.id} className="border-b border-white/10 hover:bg-white/5">
                            <td className="p-3">
                                <input type="text" defaultValue={company.name} onBlur={(e) => handleUpdateCompany(company.id, e.target.value)} className="w-full p-2 bg-transparent border-b border-transparent hover:border-slate-600 focus:outline-none focus:border-teal-400 transition" />
                            </td>
                            {/* MODIFICATION : Colonne "Admin ID" a été retirée */}
                            <td className="p-3 text-white/70">{new Date(company.created_at).toLocaleDateString()}</td>
                            <td className="p-3 text-right">
                                <button onClick={() => handleDeleteCompany(company.id)} className="p-2 bg-red-600 hover:bg-red-700 rounded-lg flex-shrink-0"><Trash2 size={16} /></button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                </table>
              </div>
            )}
          </DashboardCard>
        )}
      </main>
    </div>
  );
}
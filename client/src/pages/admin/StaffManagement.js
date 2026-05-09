import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import axios from "axios";
import config from "../../config";
import { useSelector } from "react-redux";
import { BiUserPlus, BiShieldQuarter, BiHistory, BiSearch, BiEdit, BiTrash } from "react-icons/bi";
import Swal from "sweetalert2";

export default function StaffManagement() {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("staff"); // staff | logs | roles
  const [newRole, setNewRole] = useState({ name: "", permissions: [], description: "" });
  const [editingRole, setEditingRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAllUsers, setShowAllUsers] = useState(false);
  const auth = useSelector((state) => state.auth);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, logRes, roleRes] = await Promise.all([
        axios.get(`${config.API_BASE_URL}/api/v1/auth/all-users`, {
           headers: { Authorization: `Bearer ${auth.token}` }
        }),
        axios.get(`${config.API_BASE_URL}/api/v1/auth/logs`, {
           headers: { Authorization: `Bearer ${auth.token}` }
        }),
        axios.get(`${config.API_BASE_URL}/api/v1/auth/roles`, {
           headers: { Authorization: `Bearer ${auth.token}` }
        })
      ]);
      setUsers(userRes.data.users || []);
      setLogs(logRes.data.logs || []);
      setRoles(roleRes.data.roles || []);
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      if (editingRole) {
        const { data } = await axios.put(`${config.API_BASE_URL}/api/v1/auth/roles/${editingRole._id}`, newRole, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (data.success) {
          Swal.fire("Updated!", "Role has been updated.", "success");
          setEditingRole(null);
          setNewRole({ name: "", permissions: [], description: "" });
          fetchData();
        }
      } else {
        const { data } = await axios.post(`${config.API_BASE_URL}/api/v1/auth/roles`, newRole, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (data.success) {
          Swal.fire("Created!", "New role has been added.", "success");
          setNewRole({ name: "", permissions: [], description: "" });
          fetchData();
        }
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Operation failed", "error");
    }
  };

  const handleDeleteRole = async (id) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#f59e0b",
        cancelButtonColor: "#3f3f46",
        confirmButtonText: "Yes, delete it!"
      });

      if (result.isConfirmed) {
        const { data } = await axios.delete(`${config.API_BASE_URL}/api/v1/auth/roles/${id}`, {
          headers: { Authorization: `Bearer ${auth.token}` }
        });
        if (data.success) {
          Swal.fire("Deleted!", "Role has been deleted.", "success");
          fetchData();
        }
      }
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to delete role", "error");
    }
  };

  const handleEditClick = (role) => {
    setEditingRole(role);
    setNewRole({
      name: role.name,
      permissions: role.permissions,
      description: role.description
    });
  };

  const handleRoleChange = async (userId, roleId) => {

    try {
      const { data } = await axios.put(`${config.API_BASE_URL}/api/v1/auth/assign-role`, {
        userId,
        roleId: roleId === "revoke" ? null : roleId
      }, {
        headers: { Authorization: `Bearer ${auth.token}` }
      });

      if (data.success) {
        Swal.fire("Updated!", "User role has been changed.", "success");
        fetchData();
      }
    } catch (err) {
      Swal.fire("Error", "Failed to update role", "error");
    }
  };

  const getRoleBadge = (user) => {
    if (user.role === 1 && !user.dynamicRole) return <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">Super Admin</span>;
    if (user.dynamicRole) return <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">{user.dynamicRole.name}</span>;
    return <span className="bg-zinc-800 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black uppercase">User</span>;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Staff & Security</h1>
            <p className="text-zinc-500 font-medium">Manage granular permissions and audit admin activities.</p>
          </div>
          
          <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
             <button 
                onClick={() => setActiveTab("staff")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "staff" ? "bg-amber-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
             >
                <BiShieldQuarter size={20} /> Staff Roles
             </button>
             <button 
                onClick={() => setActiveTab("roles")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "roles" ? "bg-amber-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
             >
                <BiUserPlus size={20} /> Manage Roles
             </button>
             <button 
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${activeTab === "logs" ? "bg-amber-500 text-black shadow-lg" : "text-zinc-500 hover:text-white"}`}
             >
                <BiHistory size={20} /> Audit Logs
             </button>
          </div>
        </div>

        {activeTab === "staff" && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
               <div className="relative w-full md:w-96 group">
                  <input 
                    type="text"
                    placeholder="Search users by name or email..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-5 py-3 text-white outline-none focus:border-amber-500 transition-all pl-12"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-amber-500 transition-colors" size={20} />
               </div>
               
               <button 
                  onClick={() => setShowAllUsers(!showAllUsers)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all border ${showAllUsers ? "bg-white text-black border-white" : "text-zinc-400 border-zinc-800 hover:border-zinc-700"}`}
               >
                  {showAllUsers ? "Showing All Users" : "Showing Staff Only"}
               </button>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900 border-b border-zinc-800">
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Staff Member</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Current Role</th>
                      <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {users
                      .filter(u => {
                        const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
                        const isStaff = u.role > 0 || u.dynamicRole;
                        return matchesSearch && (showAllUsers ? true : isStaff);
                      })
                      .map((user) => (
                    <tr key={user._id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-black">
                             {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-white font-bold">{user.name}</p>
                            <p className="text-zinc-500 text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">{getRoleBadge(user)}</td>
                      <td className="px-6 py-5">
                        <select 
                          className="bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs rounded-xl px-4 py-2 outline-none focus:border-amber-500 transition-all cursor-pointer"
                          value={user.dynamicRole?._id || ""}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        >
                          <option value="">-- Select Role --</option>
                          {roles.map(r => (
                            <option key={r._id} value={r._id}>{r.name}</option>
                          ))}
                          <option value="revoke">Revoke All Staff Access</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        )}

        {activeTab === "roles" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800 h-fit">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-black text-white uppercase tracking-tight">{editingRole ? "Edit Role" : "Create New Role"}</h3>
                 {editingRole && (
                    <button 
                      onClick={() => { setEditingRole(null); setNewRole({ name: "", permissions: [], description: "" }); }}
                      className="text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest"
                    >
                      Cancel Edit
                    </button>
                 )}
              </div>

              <form onSubmit={handleCreateRole} className="space-y-6">
                <div>
                  <label className="text-xs font-black uppercase text-zinc-500 mb-2 block tracking-widest">Role Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Marketing Manager"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-amber-500 transition-all"
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-zinc-500 mb-2 block tracking-widest">Description</label>
                  <textarea 
                    placeholder="Describe what this role does..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 text-white outline-none focus:border-amber-500 transition-all min-h-[100px]"
                    value={newRole.description}
                    onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-zinc-500 mb-4 block tracking-widest">Permissions</label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: "manage_content", label: "Manage Content (Movies, Categories)" },
                      { id: "view_finance", label: "View Financial Data & Analytics" },
                      { id: "manage_finance", label: "Manage Coupons & Subscriptions" },
                      { id: "manage_users", label: "Manage User Roles & Bans" },
                      { id: "manage_reviews", label: "Moderate User Reviews" },
                      { id: "manage_settings", label: "Manage System & Homepage Settings" }
                    ].map(p => (
                      <label key={p.id} className="flex items-center gap-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 cursor-pointer hover:border-amber-500/50 transition-all group">
                        <input 
                          type="checkbox"
                          className="w-5 h-5 accent-amber-500 bg-zinc-900 border-zinc-700 rounded"
                          checked={newRole.permissions.includes(p.id)}
                          onChange={(e) => {
                             const perms = e.target.checked 
                               ? [...newRole.permissions, p.id]
                               : newRole.permissions.filter(x => x !== p.id);
                             setNewRole({...newRole, permissions: perms});
                          }}
                        />
                        <span className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <button className="w-full bg-amber-500 text-black py-4 rounded-2xl font-black hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10">
                   {editingRole ? "UPDATE ROLE" : "CREATE ROLE"}
                </button>
              </form>
            </div>

            <div className="space-y-4">
               <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">Existing Roles</h3>
               {roles.map(role => (
                  <div key={role._id} className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800 hover:border-zinc-700 transition-all group relative">
                     <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-black text-amber-500 uppercase tracking-tighter">{role.name}</h4>
                        <div className="flex items-center gap-2">
                           {role.isSystemRole ? (
                              <span className="text-[8px] font-black bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded uppercase">System Role</span>
                           ) : (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button 
                                   onClick={() => handleEditClick(role)}
                                   className="p-2 bg-zinc-800 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-black transition-all"
                                 >
                                    <BiEdit size={14} />
                                 </button>
                                 <button 
                                   onClick={() => handleDeleteRole(role._id)}
                                   className="p-2 bg-zinc-800 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"
                                 >
                                    <BiTrash size={14} />
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                     <p className="text-zinc-500 text-sm mb-4 leading-relaxed">{role.description || "No description provided."}</p>
                     <div className="flex flex-wrap gap-2">
                        {role.permissions.map(p => (
                           <span key={p} className="text-[9px] font-black bg-zinc-950 text-zinc-400 px-3 py-1 rounded-full border border-zinc-800 uppercase tracking-widest">
                              {p.replace("_", " ")}
                           </span>
                        ))}
                     </div>
                  </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800">
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Timestamp</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Admin</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Action</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Resource</th>
                    <th className="px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {logs.map((log) => (
                    <tr key={log._id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-5 text-zinc-500 text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-white font-bold text-sm">{log.admin?.name || "Deleted Admin"}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className="bg-zinc-800 text-zinc-300 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">
                           {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                         <p className="text-zinc-400 text-sm">{log.resource}</p>
                         <p className="text-[10px] text-zinc-600 truncate max-w-[200px]">{log.details}</p>
                      </td>
                      <td className="px-6 py-5 text-zinc-500 text-xs font-mono">{log.ipAddress}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-20 text-center text-zinc-600">
                        No audit logs found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

import React, { useState, useEffect, useRef, useCallback } from "react";
import MainLayout from "@/components/layout/Mainlayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import * as Icons from "lucide-react";
import { UserServices, type User } from "@/services/UserServices";
import { notify } from "@/util/notify";
import { format } from "date-fns";

const ManageUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "view">("add");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Pagination/Lazy Loading State
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef<IntersectionObserver | null>(null);

  // User Logs State
  const [userLogs, setUserLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    role: "user",
    password: "",
    password_confirmation: "",
    current_password: ""
  });

  // Infinite Scroll Trigger
  const lastUserElementRef = useCallback((node: HTMLTableRowElement) => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, hasMore]);

  // Initial load and Search reset
  useEffect(() => {
    setPage(1);
    setUsers([]);
    setHasMore(true);
    fetchUsers(1, true, searchQuery);
  }, [searchQuery]);

  // Load more pages
  useEffect(() => {
    if (page > 1) {
      fetchUsers(page, false, searchQuery);
    }
  }, [page]);

  const fetchUsers = async (pageNum: number, isInitial: boolean = false, search: string = "") => {
    setIsLoading(true);
    try {
      const response = await UserServices.getAll(pageNum, 15, search);
      
      setUsers(prev => {
        const newData = isInitial ? response.data : [...prev, ...response.data];
        // Ensure unique items by ID
        const uniqueData = Array.from(new Map(newData.map(item => [item.id, item])).values());
        return uniqueData;
      });
      
      setHasMore(response.current_page < response.last_page);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserLogs = async (userId: number) => {
    setIsLoadingLogs(true);
    try {
      const response = await UserServices.getLogs(userId);
      setUserLogs(response.data);
    } catch (error) {
      console.error("Failed to fetch user logs", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const openModal = (mode: "add" | "edit" | "view", user: User | null = null) => {
    setModalMode(mode);
    setSelectedUser(user);
    // Reset visibility when opening modal
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowCurrentPassword(false);

    if (user) {
      setFormData({
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        role: user.role,
        password: "",
        password_confirmation: "",
        current_password: ""
      });
      
      if (mode === "view") {
        fetchUserLogs(user.id);
      }
    } else {
      setFormData({
        fullname: "",
        username: "",
        email: "",
        role: "user",
        password: "",
        password_confirmation: "",
        current_password: ""
      });
      setUserLogs([]);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setUserLogs([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "fullname") {
      const filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
      setFormData(prev => ({ ...prev, [name]: filteredValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Password Strength Evaluation Helper
  const evaluatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "", bg: "", barPercent: 0, hasLength: false, hasUpper: false, hasLower: false, hasNumber: false, hasSpecial: false };

    const hasLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[^A-Za-z0-9]/.test(pass);

    let score = 0;
    if (hasLength) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSpecial) score += 1;

    if (score <= 1) {
      return { score, label: "Weak", color: "text-red-600", bg: "bg-red-500", barPercent: 25, hasLength, hasUpper, hasLower, hasNumber, hasSpecial };
    } else if (score === 2 || score === 3) {
      return { score, label: "Medium", color: "text-amber-600", bg: "bg-amber-500", barPercent: 65, hasLength, hasUpper, hasLower, hasNumber, hasSpecial };
    } else {
      return { score, label: "Strong", color: "text-emerald-600", bg: "bg-emerald-500", barPercent: 100, hasLength, hasUpper, hasLower, hasNumber, hasSpecial };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password Confirmation Check
    if (modalMode !== "view" && formData.password !== formData.password_confirmation) {
      notify.error("Password Mismatch", "The passwords you entered do not match.");
      return;
    }

    // Password Strength Check
    if (modalMode !== "view" && (modalMode === "add" || formData.password !== "")) {
      const strength = evaluatePasswordStrength(formData.password);
      if (strength.score < 2) {
        notify.warning("Weak Password", "Please choose a stronger password matching the security criteria.");
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (modalMode === "add") {
        await UserServices.create(formData);
      } else if (modalMode === "edit" && selectedUser) {
        const { password, password_confirmation, current_password, ...updateData } = formData;
        const payload = password ? { ...updateData, password, password_confirmation, current_password } : updateData;
        await UserServices.update(selectedUser.id, payload);
      }
      // Refresh first page
      setPage(1);
      setUsers([]);
      fetchUsers(1, true);
      closeModal();
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await UserServices.delete(id);
        setUsers(prev => prev.filter(u => u.id !== id));
      } catch (error) {
        console.error("Delete failed", error);
      }
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>
            <p className="text-muted-foreground">Manage your database portal users, their accounts, and roles.</p>
          </div>
          <Button onClick={() => openModal("add")} className="w-fit">
            <Icons.Plus className="mr-2 h-4 w-4" /> Add New User
          </Button>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table with Overlay Scrollbar */}
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>
              {users.length > 0 ? `Showing ${users.length} registered users.` : "A list of all registered users."}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-[600px] custom-scrollbar">
                <style>{`
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(var(--primary), 0.1); border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(var(--primary), 0.3); }
                    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(var(--primary), 0.1) transparent; }
                `}</style>
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="sticky top-0 z-10 bg-background border-b shadow-sm">
                  <tr className="bg-muted/50">
                    <th className="p-4 font-medium text-muted-foreground">Full Name</th>
                    <th className="p-4 font-medium text-muted-foreground">Username</th>
                    <th className="p-4 font-medium text-muted-foreground">Email Address</th>
                    <th className="p-4 font-medium text-muted-foreground">Role</th>
                    <th className="p-4 font-medium text-right text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user, index) => {
                      const isLast = users.length === index + 1;
                      return (
                        <tr 
                          key={user.id} 
                          ref={isLast ? lastUserElementRef : null}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-4 font-medium">{user.fullname}</td>
                          <td className="p-4 text-muted-foreground">@{user.username}</td>
                          <td className="p-4 text-muted-foreground">{user.email}</td>
                          <td className="p-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                              {user.role}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon-sm" onClick={() => openModal("view", user)}>
                                <Icons.MoreHorizontal className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="icon-sm" onClick={() => openModal("edit", user)}>
                                <Icons.Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="destructive" size="icon-sm" onClick={() => handleDelete(user.id)}>
                                <Icons.Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : !isLoading && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No users found.
                      </td>
                    </tr>
                  )}
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <Icons.Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Modal Overlay */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200 overflow-y-auto">
            <Card className="w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 my-8">
              <form onSubmit={handleSubmit}>
                <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
                  <div>
                    <CardTitle>
                      {modalMode === "add" && "Add New User"}
                      {modalMode === "edit" && "Edit User Details"}
                      {modalMode === "view" && "User Information"}
                    </CardTitle>
                    <CardDescription>
                      {modalMode === "add" && "Enter the user details to create a new account."}
                      {modalMode === "edit" && "Update the information for this user account."}
                      {modalMode === "view" && "Detailed view of the user's profile and activity."}
                    </CardDescription>
                  </div>
                  <Button type="button" variant="ghost" size="icon-sm" onClick={closeModal}>
                    <Icons.X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                        <Icons.User className="h-4 w-4 text-muted-foreground" /> Full Name
                        </label>
                        <input
                        type="text"
                        name="fullname"
                        value={formData.fullname}
                        onChange={handleInputChange}
                        disabled={modalMode === "view" || isSubmitting}
                        required
                        className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                        placeholder="Enter full name"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                        <Icons.UserPlus className="h-4 w-4 text-muted-foreground" /> Username
                        </label>
                        <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={modalMode === "view" || isSubmitting}
                        required
                        className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                        placeholder="username"
                        />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                        <Icons.Mail className="h-4 w-4 text-muted-foreground" /> Email Address
                        </label>
                        <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={modalMode === "view" || isSubmitting}
                        required
                        className="w-full px-3 py-2 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50"
                        placeholder="email@example.com"
                        />
                    </div>
                    {modalMode === "view" && (
                         <div className="space-y-2">
                         <label className="text-sm font-medium flex items-center gap-2">
                          <Icons.ShieldCheck className="h-4 w-4 text-muted-foreground" /> Role
                         </label>
                         <div className="px-3 py-2 rounded-md bg-muted border border-input capitalize">
                            {formData.role}
                         </div>
                     </div>
                    )}
                  </div>

                  {modalMode === "edit" && (
                    <div className="space-y-2 border-t border-border pt-4">
                        <label className="text-sm font-bold flex items-center gap-2 text-primary">
                            <Icons.Lock className="h-4 w-4" /> Verify Current Password
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleInputChange}
                                disabled={isSubmitting}
                                required={formData.password !== ""}
                                placeholder="Enter the user's current password to make changes"
                                className="w-full px-3 py-2 pr-10 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                {showCurrentPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                            </button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Required only if you are changing to a new password.
                        </p>
                    </div>
                  )}

                  {modalMode !== "view" && (() => {
                    const pwdStrength = evaluatePasswordStrength(formData.password);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">New Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    required={modalMode === "add"}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 pr-10 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                                </button>
                            </div>
                            
                            {/* Real-time Password Strength Meter & Checklist */}
                            {formData.password ? (
                              <div className="space-y-2 mt-2 pt-1.5 border-t border-slate-100 animate-in fade-in duration-200">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500 font-medium">Password Strength:</span>
                                  <span className={`font-extrabold ${pwdStrength.color}`}>{pwdStrength.label}</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className={`h-1.5 transition-all duration-300 rounded-full ${pwdStrength.bg}`}
                                    style={{ width: `${pwdStrength.barPercent}%` }}
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                                  <span className={`flex items-center gap-1 font-medium ${pwdStrength.hasLength ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                                    {pwdStrength.hasLength ? <Icons.CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Icons.Circle className="w-3 h-3 text-slate-300" />}
                                    8+ characters
                                  </span>
                                  <span className={`flex items-center gap-1 font-medium ${pwdStrength.hasUpper && pwdStrength.hasLower ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                                    {pwdStrength.hasUpper && pwdStrength.hasLower ? <Icons.CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Icons.Circle className="w-3 h-3 text-slate-300" />}
                                    Upper & lower
                                  </span>
                                  <span className={`flex items-center gap-1 font-medium ${pwdStrength.hasNumber ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                                    {pwdStrength.hasNumber ? <Icons.CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Icons.Circle className="w-3 h-3 text-slate-300" />}
                                    Number (0-9)
                                  </span>
                                  <span className={`flex items-center gap-1 font-medium ${pwdStrength.hasSpecial ? "text-emerald-600 font-semibold" : "text-slate-400"}`}>
                                    {pwdStrength.hasSpecial ? <Icons.CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Icons.Circle className="w-3 h-3 text-slate-300" />}
                                    Special symbol
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-muted-foreground">
                                {modalMode === "edit" ? "Leave blank to keep current password." : "Minimum 8 characters required."}
                              </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleInputChange}
                                    disabled={isSubmitting}
                                    required={modalMode === "add" || formData.password !== ""}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 pr-10 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    {showConfirmPassword ? <Icons.EyeOff size={16} /> : <Icons.Eye size={16} />}
                                </button>
                            </div>

                            {/* Live Password Match Indicator */}
                            {formData.password_confirmation ? (
                              <div className="mt-2 text-xs animate-in fade-in duration-200">
                                {formData.password === formData.password_confirmation ? (
                                  <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                    <Icons.CheckCircle2 className="w-3.5 h-3.5" />
                                    Passwords match
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1.5 text-red-500 font-bold">
                                    <Icons.XCircle className="w-3.5 h-3.5" />
                                    Passwords do not match
                                  </span>
                                )}
                              </div>
                            ) : null}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Activity Logs Section (View Mode Only) */}
                  {modalMode === "view" && (
                    <div className="space-y-3 pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold flex items-center gap-2">
                                <Icons.History className="h-4 w-4 text-primary" />
                                Recent Activity Logs
                            </h3>
                        </div>
                        <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
                            <div className="max-h-[250px] overflow-y-auto">
                                <table className="w-full text-xs text-left border-collapse">
                                    <thead className="sticky top-0 bg-background border-b z-10">
                                        <tr className="bg-muted/50">
                                            <th className="p-2 font-medium">Action</th>
                                            <th className="p-2 font-medium">IP Address</th>
                                            <th className="p-2 font-medium">Date & Time</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {isLoadingLogs ? (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center">
                                                    <Icons.Loader2 className="h-4 w-4 animate-spin inline mr-2 text-primary" />
                                                    Loading logs...
                                                </td>
                                            </tr>
                                        ) : userLogs.length > 0 ? (
                                            userLogs.map((log) => (
                                                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/40 transition-colors">
                                                    <td className="p-2">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                            log.action === 'login' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                        }`}>
                                                            {log.action}
                                                        </span>
                                                    </td>
                                                    <td className="p-2 text-muted-foreground font-mono">{log.ip_address}</td>
                                                    <td className="p-2 text-muted-foreground">
                                                        {format(new Date(log.created_at), "MMM dd, yyyy • hh:mm a")}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={3} className="p-4 text-center text-muted-foreground">
                                                    No activity logs found for this user.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                  )}
                </CardContent>
                <div className="flex items-center justify-end gap-3 p-6 border-t bg-muted/30">
                  <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                    {modalMode === "view" ? "Close" : "Cancel"}
                  </Button>
                  {modalMode !== "view" && (
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {modalMode === "add" ? "Create User" : "Save Changes"}
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ManageUsers;

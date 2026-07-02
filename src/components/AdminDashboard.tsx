/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Complaint, 
  Notification, 
  UserProfile, 
  AdminLog, 
  Reminder, 
  ComplaintStatus, 
  Priority, 
  Category 
} from '../types';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  ShieldAlert, 
  Search, 
  SlidersHorizontal, 
  Volume2, 
  Image as ImageIcon, 
  CheckCircle, 
  AlertOctagon, 
  Clock, 
  FileSpreadsheet, 
  FileText, 
  Activity, 
  Edit, 
  Trash2, 
  ChevronRight, 
  Sparkles, 
  ExternalLink,
  MessageSquare,
  Building,
  User,
  X,
  Play,
  Pause,
  Ban,
  UserX
} from 'lucide-react';

interface AdminDashboardProps {
  admin: UserProfile;
  complaints: Complaint[];
  notifications: Notification[];
  reminders: Reminder[];
  adminLogs: AdminLog[];
  onUpdateComplaintStatus: (id: string, status: ComplaintStatus, notes: string, priority?: Priority) => void;
  onDeleteComplaint: (id: string) => void;
  darkMode: boolean;
  blockedStudents: {
    email: string;
    name: string;
    department: string;
    blockedAt: string;
    reason: string;
  }[];
  onBlockStudent: (email: string, name: string, department: string, reason: string) => void;
  onUnblockStudent: (email: string) => void;
}

export default function AdminDashboard({
  admin,
  complaints,
  notifications,
  reminders,
  adminLogs,
  onUpdateComplaintStatus,
  onDeleteComplaint,
  darkMode,
  blockedStudents,
  onBlockStudent,
  onUnblockStudent
}: AdminDashboardProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'analytics' | 'complaints' | 'reminders' | 'logs' | 'blocked'>('analytics');

  // Blocking student state
  const [blockingStudent, setBlockingStudent] = useState<{
    email: string;
    name: string;
    department: string;
  } | null>(null);
  const [blockReason, setBlockReason] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBuilding, setFilterBuilding] = useState<string>('all');

  // Selected complaint for action modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState<ComplaintStatus>('pending');
  const [updatePriority, setUpdatePriority] = useState<Priority>('medium');

  // Image lightbox
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Voice player states
  const [playingMemoId, setPlayingMemoId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleMemoPlayback = (complaintId: string, url: string) => {
    if (url === 'simulated_voice_memo_attachment') {
      alert('Simulated playback active. Audio memo attached by student.');
      return;
    }

    if (playingMemoId === complaintId) {
      audioRef.current?.pause();
      setPlayingMemoId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url);
      audioRef.current.play();
      setPlayingMemoId(complaintId);
      audioRef.current.onended = () => {
        setPlayingMemoId(null);
      };
    }
  };

  // --- ANALYTICS DATA GENERATION (COMPUTED IN MEMO) ---
  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter(c => c.status === 'pending').length;
    const resolved = complaints.filter(c => c.status === 'resolved').length;
    const emergency = complaints.filter(c => c.priority === 'emergency' && c.status !== 'resolved').length;
    return { total, pending, resolved, emergency };
  }, [complaints]);

  // Chart 1: Complaints per Building
  const complaintsByBuilding = useMemo(() => {
    const counts: { [key: string]: number } = {};
    complaints.forEach(c => {
      counts[c.building] = (counts[c.building] || 0) + 1;
    });
    return Object.keys(counts).map(name => ({ name, count: counts[name] }));
  }, [complaints]);

  // Chart 2: Complaints per Category
  const complaintsByCategory = useMemo(() => {
    const counts: { [key: string]: number } = {};
    complaints.forEach(c => {
      const label = c.category.toUpperCase().replace('_', ' ');
      counts[label] = (counts[label] || 0) + 1;
    });
    return Object.keys(counts).map(name => ({ name, value: counts[name] }));
  }, [complaints]);

  // Chart 3: Monthly/Historical Reports (Simulated dynamic trend)
  const monthlyTrendsData = useMemo(() => {
    return [
      { name: 'Jan', Filed: 12, Resolved: 8 },
      { name: 'Feb', Filed: 18, Resolved: 15 },
      { name: 'Mar', Filed: 25, Resolved: 20 },
      { name: 'Apr', Filed: 30, Resolved: 26 },
      { name: 'May', Filed: 45, Resolved: 40 },
      { name: 'Jun', Filed: complaints.length + 15, Resolved: complaints.filter(c => c.status === 'resolved').length + 12 },
    ];
  }, [complaints]);

  // Chart 4: Average Resolution Time (Simulated average KPI)
  const averageResolutionTime = useMemo(() => {
    return [
      { name: 'Electrical', Hours: 14 },
      { name: 'Plumbing', Hours: 22 },
      { name: 'HVAC', Hours: 36 },
      { name: 'Furniture', Hours: 48 },
      { name: 'IT Network', Hours: 4 },
    ];
  }, []);

  const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#06b6d4'];

  // FILTER LOGIC
  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => {
      const matchesSearch = 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.roomNumber.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = filterCategory === 'all' || c.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || c.priority === filterPriority;
      const matchesStatus = filterStatus === 'all' || c.status === filterStatus;
      const matchesBuilding = filterBuilding === 'all' || c.building === filterBuilding;

      return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesBuilding;
    });
  }, [complaints, searchQuery, filterCategory, filterPriority, filterStatus, filterBuilding]);

  // BUILDINGS LIST
  const buildingsList = useMemo(() => {
    const list = new Set<string>();
    complaints.forEach(c => list.add(c.building));
    return Array.from(list);
  }, [complaints]);

  // COMPLAINT UPDATE ACTIONS
  const handleOpenUpdateModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setAdminNotes(complaint.adminNotes || '');
    setUpdateStatus(complaint.status);
    setUpdatePriority(complaint.priority);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    onUpdateComplaintStatus(selectedComplaint.id, updateStatus, adminNotes, updatePriority);
    setSelectedComplaint(null);
    setAdminNotes('');
  };

  // EXPORT TO EXCEL (CSV Generation)
  const handleExportCSV = () => {
    const headers = ['Complaint ID', 'Title', 'Description', 'Category', 'Priority', 'Building', 'Floor', 'Room', 'Status', 'Date Filed', 'Student Name', 'Department'];
    const rows = filteredComplaints.map(c => [
      c.id,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.description.replace(/"/g, '""')}"`,
      c.category,
      c.priority,
      c.building,
      c.floor,
      c.roomNumber,
      c.status,
      new Date(c.createdAt).toLocaleDateString(),
      c.studentName,
      c.studentDept
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CampusCare_MaintenanceReport_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // EXPORT TO PDF (Standard beautiful print sheet mechanism)
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* ADMIN SUBHEADER / BAR */}
      <div className={`px-6 py-5 border-b flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <ShieldAlert className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight flex items-center gap-1.5">
              Facilities Admin Control Room
              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400">
                Authorized
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Logged in as {admin.name} ({admin.department})</p>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <div className="flex items-center gap-1 bg-slate-950/40 p-1 rounded-xl border border-slate-800">
          <button 
            id="admin_tab_analytics"
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'analytics' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : `${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}`
            }`}
          >
            Analytics & KPIs
          </button>
          
          <button 
            id="admin_tab_complaints"
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'complaints' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : `${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}`
            }`}
          >
            View Complaints ({filteredComplaints.length})
          </button>

          <button 
            id="admin_tab_reminders"
            onClick={() => setActiveTab('reminders')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'reminders' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : `${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}`
            }`}
          >
            Active Reminders ({reminders.length})
          </button>

          <button 
            id="admin_tab_logs"
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'logs' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : `${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}`
            }`}
          >
            Estates Audit Log
          </button>

          <button 
            id="admin_tab_blocked"
            onClick={() => setActiveTab('blocked')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'blocked' 
                ? 'bg-indigo-600 text-white shadow-md' 
                : `${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-900'}`
            }`}
          >
            Blocked Students ({blockedStudents.length})
          </button>
        </div>
      </div>

      {/* STAGE CONTAINER */}
      <div className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10 overflow-y-auto">

        {/* SECTION A: ANALYTICS DASHBOARD */}
        {activeTab === 'analytics' && (
          <div className="space-y-10">
            {/* Bento Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} relative overflow-hidden`}>
                <div className="absolute top-4 right-4 h-9 w-9 bg-indigo-500/10 text-indigo-500 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total System Complaints</span>
                <span className="block text-3xl font-black mt-2 text-indigo-500">{stats.total}</span>
              </div>

              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} relative overflow-hidden`}>
                <div className="absolute top-4 right-4 h-9 w-9 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 animate-pulse" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Actions</span>
                <span className="block text-3xl font-black mt-2 text-amber-500">{stats.pending}</span>
              </div>

              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} relative overflow-hidden`}>
                <div className="absolute top-4 right-4 h-9 w-9 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved Infrastructure</span>
                <span className="block text-3xl font-black mt-2 text-emerald-500">{stats.resolved}</span>
              </div>

              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} relative overflow-hidden`}>
                <div className="absolute top-4 right-4 h-9 w-9 bg-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center">
                  <AlertOctagon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Emergency Alerts (Active)</span>
                <span className="block text-3xl font-black mt-2 text-rose-500">{stats.emergency}</span>
              </div>
            </div>

            {/* CHARTS GRID */}
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Chart 1: Complaints per Building */}
              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Complaints per Building block</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={complaintsByBuilding}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={10} />
                      <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#1e293b' : '#e2e8f0' }} />
                      <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Complaints per Category */}
              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Distribution per Operational Category</h3>
                <div className="h-80 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={complaintsByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {complaintsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#1e293b' : '#e2e8f0' }} />
                      <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Monthly aggregate volume */}
              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Monthly Ticket Flow Reports</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyTrendsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis dataKey="name" stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={10} />
                      <YAxis stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#1e293b' : '#e2e8f0' }} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="Filed" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="Resolved" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 4: Resolution KPI times */}
              <div className={`p-6 rounded-3xl border ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} space-y-4`}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Average Resolution KPI (Hours)</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={averageResolutionTime} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#f1f5f9"} />
                      <XAxis type="number" stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke={darkMode ? "#94a3b8" : "#64748b"} fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#1e293b' : '#e2e8f0' }} />
                      <Bar dataKey="Hours" fill="#ec4899" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SECTION B: WORKSPACE VIEW & RESOLUTION TABLE */}
        {activeTab === 'complaints' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight">Active Complaints Ledger</h2>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Filter by priority, category, or building. Listen to attached voice memos, review picture assets, and dispatch plumbers/electricians.
                </p>
              </div>

              {/* Export actions */}
              <div className="flex gap-3">
                <button 
                  id="btn_admin_export_excel"
                  onClick={handleExportCSV}
                  className="px-4 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 font-bold text-xs flex items-center gap-2 hover:bg-emerald-500/20 transition-all"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Excel Export (CSV)
                </button>
                <button 
                  id="btn_admin_export_pdf"
                  onClick={handlePrintPDF}
                  className="px-4 py-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-500 font-bold text-xs flex items-center gap-2 hover:bg-indigo-500/20 transition-all"
                >
                  <FileText className="h-4 w-4" />
                  Print Report (PDF)
                </button>
              </div>
            </div>

            {/* SEARCH AND FILTERS TOOLBAR */}
            <div className={`p-5 rounded-2xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            } grid sm:grid-cols-5 gap-4`}>
              
              <div className="relative col-span-1 sm:col-span-1">
                <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input 
                  id="input_admin_search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ID, Title, Student..."
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <select
                  id="select_filter_category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="all">All Categories</option>
                  <option value="electrical">Electrical</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="hvac">HVAC</option>
                  <option value="furniture">Carpentry</option>
                  <option value="it_network">IT Network</option>
                  <option value="janitorial">Janitorial</option>
                  <option value="security_safety">Safety</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <select
                  id="select_filter_priority"
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="all">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <select
                  id="select_filter_status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div>
                <select
                  id="select_filter_building"
                  value={filterBuilding}
                  onChange={(e) => setFilterBuilding(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <option value="all">All Buildings</option>
                  {buildingsList.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* COMPLAINTS CARD GRID LISTING */}
            {filteredComplaints.length === 0 ? (
              <p className="text-center text-slate-500 py-16">No complaints match your active filter settings.</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredComplaints.map((complaint) => (
                  <div 
                    key={complaint.id}
                    className={`p-6 rounded-3xl border transition-all relative flex flex-col justify-between gap-5 ${
                      darkMode ? 'bg-slate-900/40 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] text-slate-500">{complaint.id}</span>
                            <span className={`text-[9px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                              complaint.priority === 'emergency' ? 'bg-rose-500/10 text-rose-500 animate-pulse' :
                              complaint.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                              complaint.priority === 'medium' ? 'bg-indigo-500/10 text-indigo-500' :
                              'bg-slate-500/10 text-slate-500'
                            }`}>
                              {complaint.priority}
                            </span>
                            <span className="text-[10px] bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-full uppercase font-bold">
                              {complaint.category}
                            </span>
                          </div>
                          <h3 className="text-base font-bold mt-2 leading-snug">{complaint.title}</h3>
                        </div>

                        {/* Large status label */}
                        <div className="text-right">
                          <span className={`text-[10px] font-mono block text-slate-500`}>STATUS</span>
                          <span className={`text-xs font-black uppercase tracking-wider block mt-0.5 ${
                            complaint.status === 'resolved' ? 'text-emerald-500' :
                            complaint.status === 'in_progress' ? 'text-amber-500' :
                            complaint.status === 'accepted' ? 'text-indigo-500' : 'text-slate-400'
                          }`}>
                            {complaint.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {complaint.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/40 border border-slate-800/40 text-[10px] font-semibold text-slate-400">
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-slate-500 font-mono">Location</p>
                          <p className="truncate text-slate-200">{complaint.building}</p>
                          <p className="text-slate-400">Room: {complaint.roomNumber || 'N/A'}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[9px] uppercase text-slate-500 font-mono">Student Reporter</p>
                          <p className="truncate text-slate-200 font-bold">{complaint.studentName}</p>
                          <p className="text-slate-400 text-[9px] truncate">{complaint.studentEmail}</p>
                          <p className="text-slate-500 text-[9px] truncate">{complaint.studentDept}</p>
                          
                          {/* Block Student Button */}
                          {blockedStudents.some(s => s.email.toLowerCase() === complaint.studentEmail.toLowerCase()) ? (
                            <span className="inline-flex items-center gap-1 text-[9px] text-rose-500 font-bold mt-1.5 bg-rose-500/10 px-2 py-0.5 rounded-full">
                              <Ban className="h-2.5 w-2.5" /> Blocked User
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setBlockingStudent({
                                  email: complaint.studentEmail,
                                  name: complaint.studentName,
                                  department: complaint.studentDept
                                });
                                setBlockReason('');
                              }}
                              className="inline-flex items-center gap-1 text-[9px] text-rose-400 hover:text-rose-300 font-extrabold mt-1.5 transition-all hover:underline"
                            >
                              <UserX className="h-2.5 w-2.5" /> Block Student
                            </button>
                          )}
                        </div>
                      </div>

                      {/* PICTURES AND VOICE MEDIA ROW */}
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        {complaint.images.length > 0 && (
                          <div className="flex gap-1.5 items-center">
                            <span className="text-[10px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                              <ImageIcon className="h-3.5 w-3.5" /> Images:
                            </span>
                            {complaint.images.map((img, i) => (
                              <button 
                                key={i}
                                onClick={() => setLightboxImage(img)}
                                className="h-10 w-10 rounded-lg overflow-hidden border border-slate-800/80 cursor-pointer hover:scale-105 transition-all"
                              >
                                <img src={img} alt="attach" className="h-full w-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}

                        {complaint.voiceUrl && (
                          <button
                            onClick={() => toggleMemoPlayback(complaint.id, complaint.voiceUrl!)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1.5 transition-all shadow-md"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                            {playingMemoId === complaint.id ? 'Stop Voice Memo' : 'Play Voice Memo'}
                          </button>
                        )}
                      </div>

                      {complaint.adminNotes && (
                        <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                          darkMode ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-800'
                        }`}>
                          <strong>Notes:</strong> {complaint.adminNotes}
                        </div>
                      )}
                    </div>

                    {/* Operational controls */}
                    <div className="flex gap-2 pt-4 border-t border-slate-800/40 justify-end">
                      <button 
                        id={`btn_delete_complaint_${complaint.id}`}
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this complaint? This cannot be undone.')) {
                            onDeleteComplaint(complaint.id);
                          }
                        }}
                        className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Delete Ticket"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>

                      <button 
                        id={`btn_update_complaint_${complaint.id}`}
                        onClick={() => handleOpenUpdateModal(complaint)}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all"
                      >
                        <Edit className="h-4 w-4" />
                        Update Resolution & Priority
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SECTION C: ACTIVE REMINDERS (FLAGGED) */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black tracking-tight">Student Dispatch Reminders</h2>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                These complaints have been open for more than 3 days. Students have sent priority operational reminders.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
            } space-y-4`}>
              {reminders.length === 0 ? (
                <p className="text-center text-slate-500 py-16">No active operational reminders have been dispatched yet.</p>
              ) : (
                <div className="space-y-4">
                  {reminders.map((rem) => {
                    const comp = complaints.find(c => c.id === rem.complaintId);
                    return (
                      <div 
                        key={rem.id}
                        className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-6 ${
                          darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-indigo-500 font-bold">{rem.complaintId}</span>
                            <span className="text-[10px] text-slate-500 font-semibold">{new Date(rem.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs italic leading-relaxed text-slate-300">
                            "{rem.message}"
                          </p>
                          {comp && (
                            <p className="text-[10px] text-slate-500 font-bold">
                              Target Complaint Title: {comp.title} (Status: {comp.status})
                            </p>
                          )}
                        </div>

                        {comp && (
                          <button
                            onClick={() => handleOpenUpdateModal(comp)}
                            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                          >
                            Update Target Complaint
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION D: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black tracking-tight">Institutional Estates Audit Log</h2>
              <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                A persistent record of administrative actions, status adjustments, and resolution completions.
              </p>
            </div>

            <div className={`p-6 rounded-3xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            } space-y-4`}>
              {adminLogs.length === 0 ? (
                <p className="text-center text-slate-500 py-16">No audit logs logged yet.</p>
              ) : (
                <div className="space-y-3 font-mono text-[11px] leading-relaxed">
                  {adminLogs.map((log) => (
                    <div 
                      key={log.id}
                      className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        darkMode ? 'bg-slate-950/60 border-slate-850 hover:bg-slate-950' : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-400 font-bold">[{log.action}]</span>
                          {log.complaintId && <span className="text-slate-500">Ref: {log.complaintId}</span>}
                        </div>
                        <p className={`${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{log.details}</p>
                      </div>

                      <div className="text-left sm:text-right shrink-0">
                        <p className="text-slate-500">{log.adminName}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION E: BLOCKED STUDENTS MANAGEMENT */}
        {activeTab === 'blocked' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black tracking-tight">Student Portal Access Control</h2>
                <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Manage suspended student accounts. Blocked students are restricted from submitting facilities tickets.
                </p>
              </div>

              {/* Quick block button */}
              <button
                id="btn_manual_block_trigger"
                onClick={() => {
                  setBlockingStudent({
                    email: '',
                    name: '',
                    department: 'Computer Science & Engineering'
                  });
                  setBlockReason('');
                }}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <Ban className="h-4 w-4" />
                Restrict New Student Account
              </button>
            </div>

            <div className={`p-6 rounded-3xl border ${
              darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
            } space-y-4`}>
              {blockedStudents.length === 0 ? (
                <div className="text-center py-16 space-y-2">
                  <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-bold">All Student Accounts Active</p>
                  <p className="text-xs text-slate-500">There are currently no suspended student accounts in the campus system.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {blockedStudents.map((student) => (
                    <div 
                      key={student.email}
                      className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 ${
                        darkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-2.5 items-center">
                            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
                              <Ban className="h-4 w-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black">{student.name || 'Anonymous Student'}</h4>
                              <p className="text-[10px] font-mono text-slate-500 mt-0.5">{student.email}</p>
                            </div>
                          </div>

                          <span className="text-[8px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 font-mono shrink-0">
                            SUSPENDED
                          </span>
                        </div>

                        <div className="space-y-1.5 text-[10px] text-slate-400">
                          <p>
                            <span className="font-semibold text-slate-500">Department:</span> {student.department}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-500">Banned At:</span> {new Date(student.blockedAt).toLocaleString()}
                          </p>
                          <div className={`p-3 rounded-xl text-xs leading-relaxed mt-2 ${
                            darkMode ? 'bg-rose-500/5 border border-rose-500/10 text-rose-300' : 'bg-rose-50 border border-rose-100 text-rose-800'
                          }`}>
                            <strong className="font-bold text-[10px] uppercase block mb-1">Reason for Ban:</strong>
                            <p className="text-[11px]">{student.reason}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-800/10">
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to restore portal access for ${student.name || student.email}?`)) {
                              onUnblockStudent(student.email);
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] transition-all"
                        >
                          Restore G-Suite Access
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* LIGHTBOX FOR UPLOADED IMAGES */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm">
            <button 
              onClick={() => setLightboxImage(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-900 text-white border border-slate-800"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.img 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={lightboxImage} 
              alt="fullscreen evidence" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
            />
          </div>
        )}
      </AnimatePresence>

      {/* RESOLUTION & PRIORITY UPDATE MODAL */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg rounded-3xl border p-6 space-y-5 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-black">Dispatch Resolution Details</h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Operational Update for <strong className="font-mono text-indigo-500">{selectedComplaint.id}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <form 
                id="form_update_complaint_status"
                onSubmit={handleUpdateSubmit} 
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Assign Status</label>
                    <select
                      id="select_modal_status"
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value as ComplaintStatus)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Override Priority</label>
                    <select
                      id="select_modal_priority"
                      value={updatePriority}
                      onChange={(e) => setUpdatePriority(e.target.value as Priority)}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="low">Low Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="high">High Priority</option>
                      <option value="emergency">Emergency Response</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Estates Supervisor Notes</label>
                  <textarea 
                    rows={4}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Enter details of action completed, plumbers/electricians dispatched, or reasons for delay..."
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setSelectedComplaint(null)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold ${
                      darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    id="btn_update_modal_submit"
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/10"
                  >
                    Commit Dispatch & Notify Student
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SUSPEND STUDENT ACCOUNT MODAL */}
      <AnimatePresence>
        {blockingStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md rounded-3xl border p-6 space-y-5 ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-rose-500">
                  <Ban className="h-5 w-5" />
                  <h3 className="text-base font-black">Suspend Student Access</h3>
                </div>
                <button 
                  onClick={() => setBlockingStudent(null)}
                  className="p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
                Suspending this student G-Suite profile will restrict them from logging into the portal, viewing active complaints, and submitting new maintenance requests.
              </p>

              <form 
                id="form_suspend_student"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!blockingStudent.email) {
                    alert('Please provide a valid institutional email address.');
                    return;
                  }
                  onBlockStudent(
                    blockingStudent.email,
                    blockingStudent.name,
                    blockingStudent.department,
                    blockReason
                  );
                  setBlockingStudent(null);
                  setBlockReason('');
                  // Redirect to blocked tab to see results!
                  setActiveTab('blocked');
                }} 
                className="space-y-4"
              >
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Institutional Email</label>
                  <input 
                    type="email"
                    required
                    disabled={!!blockingStudent.email}
                    placeholder="student.name@pccoe.edu"
                    value={blockingStudent.email}
                    onChange={(e) => setBlockingStudent({ ...blockingStudent, email: e.target.value })}
                    className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                      blockingStudent.email ? 'cursor-not-allowed bg-slate-950/50 text-slate-400 border-slate-800' : 
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Student Full Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      value={blockingStudent.name}
                      onChange={(e) => setBlockingStudent({ ...blockingStudent, name: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Division / Department</label>
                    <select
                      value={blockingStudent.department}
                      onChange={(e) => setBlockingStudent({ ...blockingStudent, department: e.target.value })}
                      className={`w-full px-3 py-2.5 rounded-xl border text-xs font-semibold focus:outline-none ${
                        darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    >
                      <option value="Computer Science & Engineering">CS & Engineering</option>
                      <option value="Mechanical Engineering">Mechanical Eng</option>
                      <option value="IT Operations Division">IT Operations</option>
                      <option value="Electronics & Telecom">Telecom Eng</option>
                      <option value="Civil & Structural Wing">Civil Eng</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">Official Reason for Suspension</label>
                  <textarea 
                    rows={3}
                    required
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Enter reason (e.g. Repeated filing of false maintenance reports, offensive voice notes, inappropriate text description etc.)"
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setBlockingStudent(null)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold ${
                      darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                    }`}
                  >
                    Cancel
                  </button>
                  <button 
                    id="btn_suspend_modal_submit"
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-500/10 flex items-center gap-1"
                  >
                    <Ban className="h-3 w-3" />
                    Suspend Account & Revoke Access
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
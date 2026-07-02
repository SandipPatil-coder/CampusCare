/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, 
  Complaint, 
  Notification, 
  Reminder, 
  AdminLog, 
  ComplaintStatus, 
  Priority 
} from './types';
import LandingPage from './components/LandingPage';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import { 
  INITIAL_COMPLAINTS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_ADMIN_LOGS, 
  MOCK_STUDENT, 
  MOCK_ADMIN 
} from './mockData';
import { 
  Sun, 
  Moon, 
  Sparkles, 
  Wrench, 
  ShieldCheck, 
  User, 
  ChevronRight, 
  Activity, 
  Brain, 
  Image as ImageIcon, 
  Volume2, 
  Network, 
  TrendingUp, 
  LogOut,
  Info,
  X,
  Ban
} from 'lucide-react';

export default function App() {
  // Global theme state - Default to Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Auth States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authDept, setAuthDept] = useState<string>('Computer Science & Engineering');
  const [authRole, setAuthRole] = useState<'student' | 'admin'>('student');

  // Core Data States (Preloaded with mock database, synced to LocalStorage)
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminLog[]>([]);
  const [blockedStudents, setBlockedStudents] = useState<{
    email: string;
    name: string;
    department: string;
    blockedAt: string;
    reason: string;
  }[]>([]);

  // AI Pipeline Simulation drawer
  const [showAiPipelineDrawer, setShowAiPipelineDrawer] = useState<boolean>(false);
  const [aiSelectedComplaint, setAiSelectedComplaint] = useState<Complaint | null>(null);
  const [aiAnalyzing, setAiAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  // LOAD FROM LOCAL STORAGE ON BOOT
  useEffect(() => {
    // Check Dark Mode
    const savedTheme = localStorage.getItem('cc_dark_mode');
    if (savedTheme !== null) {
      setDarkMode(savedTheme === 'true');
    }

    // Auth session
    const savedUser = localStorage.getItem('cc_current_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    // Database entries
    const savedComplaints = localStorage.getItem('cc_complaints');
    if (savedComplaints) {
      setComplaints(JSON.parse(savedComplaints));
    } else {
      setComplaints(INITIAL_COMPLAINTS);
    }

    const savedNotifications = localStorage.getItem('cc_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    } else {
      setNotifications(INITIAL_NOTIFICATIONS);
    }

    const savedReminders = localStorage.getItem('cc_reminders');
    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    } else {
      setReminders([]);
    }

    const savedLogs = localStorage.getItem('cc_admin_logs');
    if (savedLogs) {
      setAdminLogs(JSON.parse(savedLogs));
    } else {
      setAdminLogs(INITIAL_ADMIN_LOGS);
    }

    const savedBlocked = localStorage.getItem('cc_blocked_students');
    if (savedBlocked) {
      setBlockedStudents(JSON.parse(savedBlocked));
    } else {
      const initialBlocked = [
        {
          email: 'malicious.spammer@pccoe.edu',
          name: 'Brad Spammer',
          department: 'Mechanical Engineering',
          blockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          reason: 'Repeatedly submitted duplicate maintenance entries and used offensive notes in the ticket description.'
        }
      ];
      setBlockedStudents(initialBlocked);
      localStorage.setItem('cc_blocked_students', JSON.stringify(initialBlocked));
    }
  }, []);

  // SAVE TO LOCAL STORAGE
  const saveToStorage = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const handleToggleTheme = () => {
    setDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('cc_dark_mode', String(newVal));
      return newVal;
    });
  };

  // AUTH ACTIONS
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let profile: UserProfile;

    if (authRole === 'student') {
      profile = {
        ...MOCK_STUDENT,
        department: authDept,
        loginTime: new Date().toLocaleString()
      };
    } else {
      profile = {
        ...MOCK_ADMIN,
        loginTime: new Date().toLocaleString()
      };
    }

    setCurrentUser(profile);
    saveToStorage('cc_current_user', profile);
    setShowAuthModal(false);

    // Create login system notification
    const loginNotif: Notification = {
      id: `notif_login_${Date.now()}`,
      userId: profile.id,
      title: 'Portal Single Sign-In Verified',
      description: `Welcome to CampusCare portal. Your login metric was recorded at ${profile.loginTime}.`,
      type: 'submitted',
      isRead: false,
      createdAt: new Date().toISOString(),
      complaintId: ''
    };

    const updatedNotifs = [loginNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('cc_notifications', updatedNotifs);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('cc_current_user');
  };

  // STUDENT INTERACTIONS
  const handleAddNewComplaint = (formData: any) => {
    if (!currentUser) return;

    // Generate neat tracking ID
    const trackingId = `CC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newComplaint: Complaint = {
      id: trackingId,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      building: formData.building,
      floor: formData.floor,
      roomNumber: formData.roomNumber,
      images: formData.images || [],
      voiceUrl: formData.voiceUrl || undefined,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentDept: currentUser.department || 'Undergrad',
      remindersCount: 0,
    };

    const updatedComplaints = [newComplaint, ...complaints];
    setComplaints(updatedComplaints);
    saveToStorage('cc_complaints', updatedComplaints);

    // Add alert notification
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      userId: currentUser.id,
      title: 'Complaint Registered',
      description: `Your issue regarding "${formData.title}" has been filed under ID ${trackingId}.`,
      type: 'submitted',
      isRead: false,
      createdAt: new Date().toISOString(),
      complaintId: trackingId
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('cc_notifications', updatedNotifs);
  };

  const handleSendReminder = (complaintId: string, message: string) => {
    if (!currentUser) return;

    // Create Reminder Entry
    const newReminder: Reminder = {
      id: `rem_${Date.now()}`,
      complaintId,
      studentId: currentUser.id,
      createdAt: new Date().toISOString(),
      message,
      adminNotified: true,
    };

    const updatedReminders = [newReminder, ...reminders];
    setReminders(updatedReminders);
    saveToStorage('cc_reminders', updatedReminders);

    // Update Complaint counts
    const updatedComplaints = complaints.map(c => {
      if (c.id === complaintId) {
        return {
          ...c,
          remindersCount: c.remindersCount + 1,
          lastReminderAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });
    setComplaints(updatedComplaints);
    saveToStorage('cc_complaints', updatedComplaints);

    // Create Notification
    const newNotif: Notification = {
      id: `notif_rem_${Date.now()}`,
      userId: currentUser.id,
      title: 'Reminder Flag Dispatched',
      description: `Estates Supervisor has been nudged regarding Ticket ${complaintId}.`,
      type: 'reminder_acknowledged',
      isRead: false,
      createdAt: new Date().toISOString(),
      complaintId
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('cc_notifications', updatedNotifs);
  };

  const handleMarkNotificationRead = (id: string) => {
    const updatedNotifs = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    setNotifications(updatedNotifs);
    saveToStorage('cc_notifications', updatedNotifs);
  };

  const handleUpdateStudentProfile = (name: string, dept: string) => {
    if (!currentUser) return;
    const updatedProfile = {
      ...currentUser,
      name,
      department: dept
    };
    setCurrentUser(updatedProfile);
    saveToStorage('cc_current_user', updatedProfile);
  };

  // ADMIN OPERATIONS
  const handleUpdateComplaintStatus = (id: string, status: ComplaintStatus, notes: string, priority?: Priority) => {
    if (!currentUser) return;

    let targetStudentId = '';
    let targetTitle = '';

    const updatedComplaints = complaints.map(c => {
      if (c.id === id) {
        targetStudentId = c.studentId;
        targetTitle = c.title;
        return {
          ...c,
          status,
          adminNotes: notes,
          priority: priority || c.priority,
          updatedAt: new Date().toISOString()
        };
      }
      return c;
    });

    setComplaints(updatedComplaints);
    saveToStorage('cc_complaints', updatedComplaints);

    // Write Estates Admin Log
    const newLog: AdminLog = {
      id: `log_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.name,
      action: 'Status Shift',
      complaintId: id,
      details: `Estates Admin changed status to ${status.toUpperCase()}. Dispatch Notes: "${notes}"`,
      createdAt: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...adminLogs];
    setAdminLogs(updatedLogs);
    saveToStorage('cc_admin_logs', updatedLogs);

    // Notify the target student
    const notifType = status === 'resolved' ? 'resolved' : 'status_updated';
    const notifTitle = status === 'resolved' ? 'Ticket Resolved' : 'Estates Dispatch Active';
    const notifDesc = status === 'resolved' 
      ? `Your Ticket ${id} for "${targetTitle}" has been fully resolved. Notes: ${notes}`
      : `Ticket ${id} is now updated to status ${status.toUpperCase()}. Notes: ${notes}`;

    const newNotif: Notification = {
      id: `notif_adm_${Date.now()}`,
      userId: targetStudentId,
      title: notifTitle,
      description: notifDesc,
      type: notifType,
      isRead: false,
      createdAt: new Date().toISOString(),
      complaintId: id
    };

    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    saveToStorage('cc_notifications', updatedNotifs);

    // Remove active reminders for this complaint if it's resolved
    if (status === 'resolved') {
      const updatedReminders = reminders.filter(r => r.complaintId !== id);
      setReminders(updatedReminders);
      saveToStorage('cc_reminders', updatedReminders);
    }
  };

  const handleDeleteComplaint = (id: string) => {
    if (!currentUser) return;

    const updatedComplaints = complaints.filter(c => c.id !== id);
    setComplaints(updatedComplaints);
    saveToStorage('cc_complaints', updatedComplaints);

    // Log deletion action
    const newLog: AdminLog = {
      id: `log_del_${Date.now()}`,
      adminId: currentUser.id,
      adminName: currentUser.name,
      action: 'Ticket Deletion',
      complaintId: id,
      details: `Ticket ID ${id} was completely purged from database records by facilities administrator.`,
      createdAt: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...adminLogs];
    setAdminLogs(updatedLogs);
    saveToStorage('cc_admin_logs', updatedLogs);
  };

  const handleBlockStudent = (email: string, name: string, department: string, reason: string) => {
    if (blockedStudents.some(s => s.email.toLowerCase() === email.toLowerCase())) return;

    const newBlocked = {
      email,
      name: name || 'Anonymous Student',
      department: department || 'Undergrad',
      blockedAt: new Date().toISOString(),
      reason: reason || 'Violation of campus facilities code of conduct.'
    };

    const updatedBlocked = [...blockedStudents, newBlocked];
    setBlockedStudents(updatedBlocked);
    saveToStorage('cc_blocked_students', updatedBlocked);

    // Write audit log entry
    const newLog: AdminLog = {
      id: `log_block_${Date.now()}`,
      adminId: currentUser?.id || 'admin_01',
      adminName: currentUser?.name || 'Facilities Admin',
      action: 'Account Suspended',
      details: `Suspended access for student ${name} (${email}). Reason: ${newBlocked.reason}`,
      createdAt: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...adminLogs];
    setAdminLogs(updatedLogs);
    saveToStorage('cc_admin_logs', updatedLogs);
  };

  const handleUnblockStudent = (email: string) => {
    const updatedBlocked = blockedStudents.filter(s => s.email.toLowerCase() !== email.toLowerCase());
    setBlockedStudents(updatedBlocked);
    saveToStorage('cc_blocked_students', updatedBlocked);

    // Write audit log entry
    const newLog: AdminLog = {
      id: `log_unblock_${Date.now()}`,
      adminId: currentUser?.id || 'admin_01',
      adminName: currentUser?.name || 'Facilities Admin',
      action: 'Account Restored',
      details: `Restored access for G-Suite account: ${email}`,
      createdAt: new Date().toISOString()
    };
    const updatedLogs = [newLog, ...adminLogs];
    setAdminLogs(updatedLogs);
    saveToStorage('cc_admin_logs', updatedLogs);
  };

  // SYSTEM SANDBOX SWITCHER FOR DEMOS
  const handleSwapSandboxRole = (role: 'student' | 'admin') => {
    if (!currentUser) return;

    let swappedProfile: UserProfile;
    if (role === 'student') {
      swappedProfile = {
        ...MOCK_STUDENT,
        department: 'Computer Science & Engineering',
        loginTime: new Date().toLocaleString()
      };
    } else {
      swappedProfile = {
        ...MOCK_ADMIN,
        loginTime: new Date().toLocaleString()
      };
    }

    setCurrentUser(swappedProfile);
    saveToStorage('cc_current_user', swappedProfile);
  };

  // --- AI PIPELINE DIAGNOSTICS ENGINE (MOCK SANDBOX FOR AI-READY GOAL) ---
  const handleRunAiAnalysis = (complaint: Complaint) => {
    setAiSelectedComplaint(complaint);
    setAiAnalyzing(true);
    setShowAiPipelineDrawer(true);

    setTimeout(() => {
      setAiAnalyzing(false);
      
      // Categorization & Prediction mappings
      const categoryTokens: { [key: string]: string } = {
        'electrical': 'Power systems, LED failure pattern',
        'plumbing': 'Hydrostatic leak detection, pipe moisture',
        'hvac': 'Ventilation acoustics, chiller anomalies',
        'furniture': 'Carpentry stress-wear',
        'it_network': 'Layer-2 router PoE packet drops',
        'janitorial': 'Sanitation audit indices',
        'security_safety': 'Emergency ingress limits',
        'other': 'Generic estates repair classification'
      };

      setAiResult({
        voiceToText: complaint.voiceUrl ? "Acoustic audio detected: 'The water leakage in room 204 Newton Science Block is getting closer to server cabinets, need immediate drainage support.'" : "No audio attachment present.",
        imageRecog: complaint.images.length > 0 
          ? "[Visual analysis: Moisture seepage detected on overhead concrete plaster. Safety Index: 42% (Critical deterioration risk)]" 
          : "[No diagnostic images uploaded by student]",
        autoCategory: complaint.category.toUpperCase().replace('_', ' '),
        confidence: "98.4% Confidence match",
        duplicateCheck: `0 active tickets found in same wing. Duplicate state: Negative.`,
        predictiveMaintenance: `Estates Risk score: 8.8/10. Plaster decay will increase by 4x over the next 48 hours if valve leakage is unresolved.`
      });
    }, 1500);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'dark' : ''} ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* GLOBAL BANNER / COGNITIVE BAR */}
      <div className={`px-6 py-2 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-3 font-semibold transition-colors ${
        darkMode ? 'bg-slate-900/60 text-slate-400 border-b border-slate-800' : 'bg-slate-100 text-slate-600 border-b border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
          <span>Interactive Estates Sandbox Coordinator</span>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {currentUser && (
            <div className="flex items-center gap-2 bg-slate-950/40 p-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-500">Workspace Role:</span>
              <button 
                id="btn_sandbox_student"
                onClick={() => handleSwapSandboxRole('student')}
                className={`px-2 py-1 rounded text-[9px] font-bold ${
                  currentUser.role === 'student' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                Student View
              </button>
              <button 
                id="btn_sandbox_admin"
                onClick={() => handleSwapSandboxRole('admin')}
                className={`px-2 py-1 rounded text-[9px] font-bold ${
                  currentUser.role === 'admin' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-800 text-slate-400'
                }`}
              >
                Facilities Admin View
              </button>
            </div>
          )}

          {/* AI Drawer trigger */}
          {currentUser && (
            <button 
              id="btn_ai_drawer_trigger"
              onClick={() => {
                if (complaints.length > 0) {
                  handleRunAiAnalysis(complaints[0]);
                } else {
                  alert('Please file at least one facilities complaint first to analyze via AI pipelines.');
                }
              }}
              className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-3 py-1 rounded-lg hover:bg-indigo-500/20 flex items-center gap-1"
            >
              <Brain className="h-3 w-3" />
              AI Diagnostics Sandbox
            </button>
          )}

          {/* Theme switcher */}
          <button 
            id="btn_theme_toggle"
            onClick={handleToggleTheme}
            className="p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Toggle theme presets"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>
        </div>
      </div>

      {/* VIEW DELEGATOR */}
      <div className="flex-1 flex flex-col">
        {!currentUser ? (
          /* Landing page with custom Single Sign-In popup */
          <>
            <LandingPage 
              onEnterPortal={() => setShowAuthModal(true)} 
              darkMode={darkMode}
            />

            {/* Simulated authentication popup modal */}
            <AnimatePresence>
              {showAuthModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`w-full max-w-md rounded-3xl border p-8 space-y-6 ${
                      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="text-center space-y-2">
                      <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-indigo-500/20">
                        <Wrench className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-black tracking-tight mt-4">Single Sign-In Portal</h3>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Authorized access for registered PCCOE University students & administrators.
                      </p>
                    </div>

                    <form 
                      id="form_signin"
                      onSubmit={handleLoginSubmit} 
                      className="space-y-4"
                    >
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Portal Access Level</label>
                        <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-slate-950/40 border border-slate-800">
                          <button
                            id="btn_auth_role_student"
                            type="button"
                            onClick={() => setAuthRole('student')}
                            className={`py-2 rounded-lg text-xs font-bold transition-all ${
                              authRole === 'student' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            Student Login
                          </button>
                          <button
                            id="btn_auth_role_admin"
                            type="button"
                            onClick={() => setAuthRole('admin')}
                            className={`py-2 rounded-lg text-xs font-bold transition-all ${
                              authRole === 'admin' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            Facilities Admin
                          </button>
                        </div>
                      </div>

                      {authRole === 'student' ? (
                        <>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Institutional Google Email</label>
                            <input 
                              type="email"
                              disabled
                              value="sandip.patil25@pccoepune.org" // Populates current email!
                              className={`w-full px-4 py-3 rounded-xl border text-xs font-mono font-bold cursor-not-allowed bg-slate-950/50 border-slate-850 text-slate-400`}
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Campus Department / Division</label>
                            <select
                              id="select_auth_dept"
                              value={authDept}
                              onChange={(e) => setAuthDept(e.target.value)}
                              className={`w-full px-4 py-3 rounded-xl border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            >
                              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                              <option value="Mechanical Engineering">Mechanical Engineering</option>
                              <option value="IT Operations Division">IT Operations Division</option>
                              <option value="Electronics & Telecom">Electronics & Telecom</option>
                              <option value="Civil & Structural Wing">Civil & Structural Wing</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Verified Admin Credentials</label>
                            <input 
                              type="email"
                              disabled
                              value="admin.facilities@pccoe.edu"
                              className={`w-full px-4 py-3 rounded-xl border text-xs font-mono font-bold cursor-not-allowed bg-slate-950/50 border-slate-850 text-slate-400`}
                            />
                          </div>

                          <div className="p-4 rounded-2xl bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 text-[10px] leading-relaxed">
                            <Info className="h-4 w-4 shrink-0 mb-1 inline" />
                            <span> Estates Admin profiles are single-role pre-verified accounts managed directly under Central Operations.</span>
                          </div>
                        </>
                      )}

                      <button 
                        id="btn_auth_submit"
                        type="submit"
                        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-xl shadow-indigo-500/25 mt-2"
                      >
                        Sign In with Google G-Suite
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowAuthModal(false)}
                        className={`w-full py-3 rounded-xl text-xs font-semibold ${
                          darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                        }`}
                      >
                        Cancel
                      </button>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </>
        ) : currentUser.role === 'student' ? (
          /* Check if student is blocked */
          blockedStudents.some(s => s.email.toLowerCase() === currentUser.email.toLowerCase()) ? (
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`w-full max-w-xl rounded-3xl border p-8 space-y-6 text-center shadow-2xl relative overflow-hidden ${
                  darkMode ? 'bg-slate-900 border-rose-500/30' : 'bg-white border-rose-200'
                }`}
              >
                {/* Decorative background glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/5 blur-3xl rounded-full" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/5 blur-3xl rounded-full" />

                <div className="mx-auto h-16 w-16 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-2xl flex items-center justify-center animate-bounce">
                  <Ban className="h-8 w-8" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-black tracking-tight text-rose-500">Portal Access Suspended</h2>
                  <p className="font-mono text-xs text-slate-500 font-bold">{currentUser.email}</p>
                </div>

                <div className={`p-5 rounded-2xl border text-left space-y-3 ${
                  darkMode ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-rose-400 font-mono">Suspension Details</h4>
                  
                  {blockedStudents.filter(s => s.email.toLowerCase() === currentUser.email.toLowerCase()).map((ban) => (
                    <div key={ban.email} className="space-y-2.5 text-xs">
                      <p>
                        <strong className="text-slate-500">Authorized At:</strong> {new Date(ban.blockedAt).toLocaleString()}
                      </p>
                      <p>
                        <strong className="text-slate-500">Official Reason:</strong>
                      </p>
                      <p className={`p-3 rounded-xl font-medium leading-relaxed ${
                        darkMode ? 'bg-rose-500/5 text-rose-300 border border-rose-500/10' : 'bg-rose-50 text-rose-800 border border-rose-100'
                      }`}>
                        "{ban.reason}"
                      </p>
                    </div>
                  ))}
                </div>

                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Single sign-on access to facilities operations has been restricted for your G-Suite profile. If you believe this is an error, please contact Dean Marcus Vance at <a href="mailto:admin.facilities@pccoe.edu" className="text-indigo-400 hover:underline font-bold font-mono">admin.facilities@pccoe.edu</a>.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleLogout}
                    className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout & Exit Portal
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            /* Student Portal View */
            <StudentDashboard 
              student={currentUser}
              complaints={complaints}
              notifications={notifications}
              reminders={reminders}
              onSubmitComplaint={handleAddNewComplaint}
              onSendReminder={handleSendReminder}
              onMarkNotificationRead={handleMarkNotificationRead}
              onUpdateProfile={handleUpdateStudentProfile}
              onLogout={handleLogout}
              darkMode={darkMode}
            />
          )
        ) : (
          /* Facilities Admin Control Room View */
          <AdminDashboard 
            admin={currentUser}
            complaints={complaints}
            notifications={notifications}
            reminders={reminders}
            adminLogs={adminLogs}
            blockedStudents={blockedStudents}
            onBlockStudent={handleBlockStudent}
            onUnblockStudent={handleUnblockStudent}
            onUpdateComplaintStatus={handleUpdateComplaintStatus}
            onDeleteComplaint={handleDeleteComplaint}
            darkMode={darkMode}
          />
        )}
      </div>

      {/* --- FLOATING AI DIAGNOSTICS SANDBOX DRAWER --- */}
      <AnimatePresence>
        {showAiPipelineDrawer && (
          <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-112 border-l shadow-2xl bg-slate-950 border-slate-800 flex flex-col p-6 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-850">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-400 animate-pulse" />
                <div>
                  <h3 className="text-sm font-black text-white">CampusCare AI Copilot</h3>
                  <p className="text-[10px] text-slate-500 font-medium">Predictive Diagnostic Sandbox Pipeline</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAiPipelineDrawer(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {aiAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <Brain className="h-10 w-10 text-indigo-500 animate-spin" />
                <p className="text-xs font-mono text-indigo-400">Synthesizing visual and acoustic data vectors...</p>
              </div>
            ) : aiResult ? (
              <div className="flex-1 overflow-y-auto space-y-5 text-[11px] font-mono leading-relaxed">
                
                {/* 1. Voice to Text */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-indigo-400 font-extrabold flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                    <Volume2 className="h-3.5 w-3.5" /> Pipeline A: Voice to Text (ASR)
                  </span>
                  <p className="text-slate-300 italic font-sans">
                    "{aiResult.voiceToText}"
                  </p>
                </div>

                {/* 2. Image Classification */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-indigo-400 font-extrabold flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                    <ImageIcon className="h-3.5 w-3.5" /> Pipeline B: Structural Computer Vision
                  </span>
                  <p className="text-emerald-400 font-sans font-semibold">
                    {aiResult.imageRecog}
                  </p>
                </div>

                {/* 3. Automatic Priority and Categorization */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-indigo-400 font-extrabold flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                    <Network className="h-3.5 w-3.5" /> Pipeline C: Categorizer & Priority Prediction
                  </span>
                  <div className="space-y-1 text-slate-300">
                    <p>Suggested Category: <strong className="text-indigo-400">{aiResult.autoCategory}</strong></p>
                    <p>Priority Classifier: <strong className="text-rose-400">{aiSelectedComplaint?.priority.toUpperCase()}</strong></p>
                    <p className="text-slate-500 italic mt-1">{aiResult.confidence}</p>
                  </div>
                </div>

                {/* 4. Duplicate Check */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-indigo-400 font-extrabold flex items-center gap-1.5 uppercase text-[9px] tracking-wider">
                    <TrendingUp className="h-3.5 w-3.5" /> Pipeline D: Duplicate Check & Risk Decay
                  </span>
                  <div className="space-y-1 text-slate-300">
                    <p>{aiResult.duplicateCheck}</p>
                    <p className="text-rose-400 font-sans mt-2 font-bold leading-normal">
                      <strong>Estates Risk:</strong> {aiResult.predictiveMaintenance}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 font-sans leading-relaxed">
                  The CampusCare AI schema is completely integrated. These modules are structured to plug in directly to the Google Gemini model endpoints for high-fidelity processing of facilities data.
                </div>
              </div>
            ) : null}

            {/* Selector footer within drawer to let admins analyze OTHER complaints */}
            {!aiAnalyzing && complaints.length > 0 && (
              <div className="border-t border-slate-850 pt-4 space-y-2">
                <label className="text-[10px] font-bold text-slate-500 block uppercase">Switch target ticket for analysis</label>
                <select
                  onChange={(e) => {
                    const comp = complaints.find(c => c.id === e.target.value);
                    if (comp) handleRunAiAnalysis(comp);
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-white"
                >
                  {complaints.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.title.substring(0, 30)}...</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

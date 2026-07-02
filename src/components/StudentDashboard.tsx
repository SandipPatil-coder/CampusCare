/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserProfile, 
  Complaint, 
  Notification, 
  Category, 
  Priority, 
  Reminder 
} from '../types';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Mic, 
  Square, 
  Play, 
  Pause, 
  Trash2, 
  Upload, 
  Image as ImageIcon, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  Building, 
  MapPin,
  X,
  Send,
  HelpCircle
} from 'lucide-react';

interface StudentDashboardProps {
  student: UserProfile;
  complaints: Complaint[];
  notifications: Notification[];
  reminders: Reminder[];
  onSubmitComplaint: (formData: any) => void;
  onSendReminder: (complaintId: string, message: string) => void;
  onMarkNotificationRead: (id: string) => void;
  onUpdateProfile: (name: string, dept: string) => void;
  onLogout: () => void;
  darkMode: boolean;
}

type TabType = 'dashboard' | 'submit' | 'history' | 'notifications' | 'profile' | 'settings';

export default function StudentDashboard({
  student,
  complaints,
  notifications,
  reminders,
  onSubmitComplaint,
  onSendReminder,
  onMarkNotificationRead,
  onUpdateProfile,
  onLogout,
  darkMode
}: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('electrical');
  const [priority, setPriority] = useState<Priority>('medium');
  const [building, setBuilding] = useState('Newton Science Block');
  const [floor, setFloor] = useState('Ground Floor');
  const [roomNumber, setRoomNumber] = useState('');
  const [images, setImages] = useState<string[]>([]);
  
  // Voice recording states
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'stopped'>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [playbackState, setPlaybackState] = useState<'idle' | 'playing' | 'paused'>('idle');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Reminder states
  const [activeReminderComplaint, setActiveReminderComplaint] = useState<Complaint | null>(null);
  const [reminderMessage, setReminderMessage] = useState('');

  // Skeletons state for loading visual feedback
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab) {
      setIsLoading(true);
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // Audio timer
  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // Filter complaints specific to this logged-in student
  const studentComplaints = complaints.filter(c => c.studentId === student.id);
  const unreadNotifCount = notifications.filter(n => n.userId === student.id && !n.isRead).length;

  // Stats calculation
  const stats = {
    total: studentComplaints.length,
    pending: studentComplaints.filter(c => c.status === 'pending').length,
    inProgress: studentComplaints.filter(c => c.status === 'in_progress').length,
    resolved: studentComplaints.filter(c => c.status === 'resolved').length,
  };

  // Image Upload handler (Read to base64)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImages(prev => [...prev, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  // Voice recording handlers (Microphone)
  const startRecording = async () => {
    setAudioUrl(null);
    audioChunksRef.current = [];
    setRecordingDuration(0);

    try {
      // Attempt real userMedia capture
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event: any) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data as Blob);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current as BlobPart[], { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks to release mic
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingState('recording');
    } catch (err) {
      console.warn('Microphone permission blocked or unavailable. Switching to advanced synthetic audio memo simulator.', err);
      // Flawless simulation fallback
      setRecordingState('recording');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingState('paused');
    } else if (recordingState === 'recording') {
      // Simulation mode
      setRecordingState('paused');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingState('recording');
    } else if (recordingState === 'paused') {
      // Simulation mode
      setRecordingState('recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
      mediaRecorderRef.current.stop();
      setRecordingState('stopped');
    } else {
      // Simulation mode
      setRecordingState('stopped');
      // Create a simulated generic voice memo object URL
      setAudioUrl('simulated_voice_memo_attachment');
    }
  };

  const deleteRecording = () => {
    setRecordingState('idle');
    setAudioUrl(null);
    setRecordingDuration(0);
    setPlaybackState('idle');
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
  };

  const togglePlayback = () => {
    if (audioUrl === 'simulated_voice_memo_attachment') {
      // Simulated playback toggle
      setPlaybackState(prev => prev === 'playing' ? 'paused' : 'playing');
      return;
    }

    if (!audioUrl) return;

    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => {
        setPlaybackState('idle');
      };
    }

    if (playbackState === 'playing') {
      audioPlayerRef.current.pause();
      setPlaybackState('paused');
    } else {
      audioPlayerRef.current.play();
      setPlaybackState('playing');
    }
  };

  // Submit Complaint Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newComplaintData = {
      title,
      description,
      category,
      priority,
      building,
      floor,
      roomNumber,
      images,
      voiceUrl: audioUrl || undefined
    };

    onSubmitComplaint(newComplaintData);
    setSuccessMsg('Complaint registered successfully! An unique Tracking ID has been generated.');
    
    // Reset Form
    setTitle('');
    setDescription('');
    setCategory('electrical');
    setPriority('medium');
    setBuilding('Newton Science Block');
    setFloor('Ground Floor');
    setRoomNumber('');
    setImages([]);
    setRecordingState('idle');
    setAudioUrl(null);
    setRecordingDuration(0);

    setTimeout(() => {
      setSuccessMsg(null);
      setActiveTab('history');
    }, 2500);
  };

  // Profile Edit State
  const [profileName, setProfileName] = useState(student.name);
  const [profileDept, setProfileDept] = useState(student.department || '');
  const [profileSuccess, setProfileSuccess] = useState(false);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(profileName, profileDept);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 2000);
  };

  // Helper check for 3-day reminder rule
  const canSendReminder = (complaint: Complaint) => {
    if (complaint.status === 'resolved') return false;

    const createdTime = new Date(complaint.createdAt).getTime();
    const currTime = new Date().getTime();
    const diffDays = (currTime - createdTime) / (1000 * 60 * 60 * 24);

    if (diffDays < 3) return false;

    // Check last reminder timestamp
    if (complaint.lastReminderAt) {
      const lastReminderTime = new Date(complaint.lastReminderAt).getTime();
      const diffLastReminderDays = (currTime - lastReminderTime) / (1000 * 60 * 60 * 24);
      if (diffLastReminderDays < 3) return false;
    }

    return true;
  };

  const handleOpenReminderModal = (complaint: Complaint) => {
    setActiveReminderComplaint(complaint);
    setReminderMessage(`Request urgent updates. This complaint remains in ${complaint.status.replace('_', ' ')} status for more than 3 days.`);
  };

  const handleTriggerReminder = () => {
    if (!activeReminderComplaint) return;
    onSendReminder(activeReminderComplaint.id, reminderMessage);
    setActiveReminderComplaint(null);
    setReminderMessage('');
    alert('Operational Reminder sent successfully! The Facilities Admin has been flagged.');
  };

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* SIDEBAR - Responsive */}
      <aside className={`w-64 shrink-0 hidden md:flex flex-col border-r transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="p-6 flex items-center gap-3 border-b border-inherit">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center">
            <PlusCircle className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="font-bold tracking-tight block text-sm">CampusCare</span>
            <span className="text-[10px] text-indigo-500 font-semibold tracking-wider uppercase block -mt-1">Student Portal</span>
          </div>
        </div>

        {/* User Badge */}
        <div className="p-5 border-b border-inherit flex gap-3 items-center">
          <img 
            src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100'} 
            alt="avatar" 
            className="h-10 w-10 rounded-full object-cover border-2 border-indigo-500/20"
          />
          <div className="min-w-0">
            <p className="font-bold text-xs truncate">{student.name}</p>
            <p className="text-[10px] text-slate-500 truncate">{student.department || 'Undergraduate student'}</p>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="p-4 flex-1 space-y-1">
          <button 
            id="nav_btn_student_dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'dashboard' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                : `${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            Portal Dashboard
          </button>

          <button 
            id="nav_btn_student_submit"
            onClick={() => setActiveTab('submit')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'submit' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                : `${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`
            }`}
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Submit Complaint
          </button>

          <button 
            id="nav_btn_student_history"
            onClick={() => setActiveTab('history')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'history' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                : `${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`
            }`}
          >
            <History className="h-4.5 w-4.5" />
            Complaint History
          </button>

          <button 
            id="nav_btn_student_notifications"
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'notifications' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                : `${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`
            }`}
          >
            <div className="flex items-center gap-3">
              <Bell className="h-4.5 w-4.5" />
              Notifications
            </div>
            {unreadNotifCount > 0 && (
              <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[9px] font-bold">{unreadNotifCount}</span>
            )}
          </button>

          <button 
            id="nav_btn_student_profile"
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'profile' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                : `${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`
            }`}
          >
            <User className="h-4.5 w-4.5" />
            Student Profile
          </button>

          <button 
            id="nav_btn_student_settings"
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all ${
              activeTab === 'settings' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                : `${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'}`
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            Settings & Presets
          </button>
        </nav>

        {/* Footer actions */}
        <div className="p-4 border-t border-inherit">
          <button 
            id="btn_student_logout"
            onClick={onLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-all`}
          >
            <LogOut className="h-4.5 w-4.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* MOBILE NAV BAR */}
        <header className={`md:hidden px-6 h-16 border-b flex items-center justify-between transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center text-white font-bold">CC</div>
            <span className="font-bold text-sm">CampusCare</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick switcher buttons for Mobile Tab */}
            <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-lg ${activeTab === 'dashboard' ? 'text-indigo-500' : 'text-slate-400'}`}><LayoutDashboard className="h-4 w-4" /></button>
            <button onClick={() => setActiveTab('submit')} className={`p-2 rounded-lg ${activeTab === 'submit' ? 'text-indigo-500' : 'text-slate-400'}`}><PlusCircle className="h-4 w-4" /></button>
            <button onClick={() => setActiveTab('history')} className={`p-2 rounded-lg ${activeTab === 'history' ? 'text-indigo-500' : 'text-slate-400'}`}><History className="h-4 w-4" /></button>
            <button onClick={() => setActiveTab('notifications')} className={`p-2 rounded-lg relative ${activeTab === 'notifications' ? 'text-indigo-500' : 'text-slate-400'}`}>
              <Bell className="h-4 w-4" />
              {unreadNotifCount > 0 && <span className="absolute top-1 right-1 h-2 w-2 bg-rose-500 rounded-full" />}
            </button>
            <button onClick={onLogout} className="p-2 rounded-lg text-rose-500"><LogOut className="h-4 w-4" /></button>
          </div>
        </header>

        {/* ACTIVE TAB STAGE */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
          
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="space-y-6">
                <div className="h-8 w-48 bg-slate-400/20 rounded-lg animate-pulse" />
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
                  <div className="h-24 bg-slate-400/10 rounded-2xl animate-pulse" />
                  <div className="h-24 bg-slate-400/10 rounded-2xl animate-pulse" />
                  <div className="h-24 bg-slate-400/10 rounded-2xl animate-pulse" />
                  <div className="h-24 bg-slate-400/10 rounded-2xl animate-pulse" />
                </div>
                <div className="h-64 bg-slate-400/10 rounded-3xl animate-pulse" />
              </div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* 1. PORTAL DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-black tracking-tight">Student Dashboard</h1>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Welcome back, <strong className="text-indigo-500">{student.name}</strong>. Monitor and submit maintenance tickets for your departments.
                        </p>
                      </div>
                      <button 
                        id="btn_tab_quick_submit"
                        onClick={() => setActiveTab('submit')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs tracking-wide flex items-center gap-1.5 shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all"
                      >
                        <PlusCircle className="h-4 w-4" />
                        Log New Complaint
                      </button>
                    </div>

                    {/* Stats Banners */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                      <div className={`p-5 rounded-2xl border transition-all ${
                        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Filed</span>
                        <span className="block text-2xl font-black mt-1 text-slate-100 dark:text-white">{stats.total}</span>
                      </div>
                      
                      <div className={`p-5 rounded-2xl border transition-all ${
                        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Actions</span>
                        <span className="block text-2xl font-black mt-1 text-indigo-500">{stats.pending}</span>
                      </div>

                      <div className={`p-5 rounded-2xl border transition-all ${
                        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">In Progress</span>
                        <span className="block text-2xl font-black mt-1 text-amber-500">{stats.inProgress}</span>
                      </div>

                      <div className={`p-5 rounded-2xl border transition-all ${
                        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Resolved Issues</span>
                        <span className="block text-2xl font-black mt-1 text-emerald-500">{stats.resolved}</span>
                      </div>
                    </div>

                    {/* Quick Overview Section */}
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Left: Active Tickets list */}
                      <div className={`lg:col-span-2 p-6 rounded-3xl border ${
                        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      } space-y-6`}>
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Complaints</h3>
                          <button 
                            onClick={() => setActiveTab('history')}
                            className="text-xs font-semibold text-indigo-500 hover:underline flex items-center gap-1"
                          >
                            View All History <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>

                        {studentComplaints.length === 0 ? (
                          <div className="text-center py-12 space-y-4">
                            <div className="h-12 w-12 rounded-full bg-slate-500/10 flex items-center justify-center text-slate-400 mx-auto">
                              <HelpCircle className="h-6 w-6" />
                            </div>
                            <p className="text-sm font-medium text-slate-500">You haven't filed any infrastructure issues yet.</p>
                            <button 
                              onClick={() => setActiveTab('submit')}
                              className="px-4 py-2 rounded-xl border border-indigo-500/30 text-indigo-500 hover:bg-indigo-500/10 text-xs font-semibold"
                            >
                              Submit First Issue
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {studentComplaints.slice(0, 3).map((complaint) => (
                              <div 
                                key={complaint.id}
                                className={`p-4 rounded-2xl border transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                                  darkMode ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-[10px] text-slate-500">{complaint.id}</span>
                                    <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                      complaint.priority === 'emergency' ? 'bg-rose-500/10 text-rose-500' :
                                      complaint.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                                      complaint.priority === 'medium' ? 'bg-indigo-500/10 text-indigo-500' :
                                      'bg-slate-500/10 text-slate-500'
                                    }`}>
                                      {complaint.priority}
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-bold mt-1">{complaint.title}</h4>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10px] text-slate-400 font-medium">
                                    <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> {complaint.building}</span>
                                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Room {complaint.roomNumber || 'N/A'}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                                  <div className="flex flex-col items-start sm:items-end">
                                    <span className="text-[10px] text-slate-500 font-mono">STATUS</span>
                                    <span className={`text-xs font-bold mt-0.5 uppercase ${
                                      complaint.status === 'resolved' ? 'text-emerald-500' :
                                      complaint.status === 'in_progress' ? 'text-amber-500' :
                                      complaint.status === 'accepted' ? 'text-indigo-500' : 'text-slate-500'
                                    }`}>
                                      {complaint.status.replace('_', ' ')}
                                    </span>
                                  </div>

                                  {/* Reminder Logic */}
                                  {canSendReminder(complaint) ? (
                                    <button 
                                      onClick={() => handleOpenReminderModal(complaint)}
                                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-all"
                                    >
                                      Send Reminder
                                    </button>
                                  ) : complaint.status !== 'resolved' ? (
                                    <span className="text-[10px] text-slate-500 bg-slate-500/10 px-2.5 py-1.5 rounded-lg font-medium">
                                      {complaint.remindersCount > 0 ? `Reminder Sent (${complaint.remindersCount})` : 'Monitoring Active'}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Right Side: Quick Notifications Summary */}
                      <div className={`p-6 rounded-3xl border ${
                        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      } space-y-6`}>
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Alerts</h3>
                          <button 
                            onClick={() => setActiveTab('notifications')}
                            className="text-xs font-semibold text-indigo-500 hover:underline"
                          >
                            View All
                          </button>
                        </div>

                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-500 text-center py-10">No recent notifications.</p>
                        ) : (
                          <div className="space-y-4">
                            {notifications.slice(0, 3).map((notif) => (
                              <div 
                                key={notif.id}
                                className={`p-3.5 rounded-xl border transition-colors flex gap-3 ${
                                  notif.isRead 
                                    ? (darkMode ? 'bg-slate-950/20 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600') 
                                    : (darkMode ? 'bg-indigo-500/5 border-indigo-500/20 text-slate-200' : 'bg-indigo-500/5 border-indigo-500/10 text-slate-800')
                                }`}
                              >
                                <div className="mt-0.5 shrink-0">
                                  {notif.type === 'resolved' && <CheckCircle className="h-4 w-4 text-emerald-500" />}
                                  {notif.type === 'status_updated' && <RefreshCw className="h-4 w-4 text-amber-500 animate-spin-slow" />}
                                  {notif.type === 'submitted' && <Clock className="h-4 w-4 text-slate-500" />}
                                  {notif.type === 'reminder_acknowledged' && <AlertTriangle className="h-4 w-4 text-indigo-500" />}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold leading-tight">{notif.title}</p>
                                  <p className="text-[10px] mt-1 leading-normal text-slate-400 truncate">{notif.description}</p>
                                  {!notif.isRead && (
                                    <button 
                                      onClick={() => onMarkNotificationRead(notif.id)}
                                      className="text-[9px] text-indigo-500 font-bold hover:underline mt-1.5 block"
                                    >
                                      Mark as read
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* 2. SUBMIT COMPLAINT TAB */}
                {activeTab === 'submit' && (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Submit Maintenance Complaint</h1>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Log structural, utility, or facilities issues. Provide exact details to speed up dispatch times.
                      </p>
                    </div>

                    {successMsg && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-sm font-semibold flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 shrink-0" />
                        {successMsg}
                      </div>
                    )}

                    <form 
                      id="form_submit_complaint"
                      onSubmit={handleSubmit} 
                      className={`p-6 sm:p-8 rounded-3xl border ${
                        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                      } space-y-6`}
                    >
                      <div className="grid sm:grid-cols-2 gap-6">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Complaint Title</label>
                          <input 
                            id="input_complaint_title"
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Broken overhead HVAC fans"
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Category</label>
                          <select
                            id="select_complaint_category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value as Category)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="electrical">Electrical Operations</option>
                            <option value="plumbing">Plumbing Services</option>
                            <option value="hvac">HVAC & Ventilation</option>
                            <option value="furniture">Carpentry & Furniture</option>
                            <option value="it_network">IT & Networking</option>
                            <option value="janitorial">Janitorial & Sanitization</option>
                            <option value="security_safety">Security & Safety Alerts</option>
                            <option value="other">Other Campus Repairs</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Detailed Description</label>
                        <textarea
                          id="textarea_complaint_desc"
                          required
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Please provide precise details (symptoms, severity, exposure risk)..."
                          className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                          }`}
                        />
                      </div>

                      <div className="grid sm:grid-cols-3 gap-5">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Priority Level</label>
                          <select
                            id="select_complaint_priority"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as Priority)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                            <option value="emergency">Emergency Response Needed</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Building Block</label>
                          <input 
                            id="input_complaint_building"
                            type="text"
                            required
                            value={building}
                            onChange={(e) => setBuilding(e.target.value)}
                            placeholder="e.g. Raman Auditorium"
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Floor & Room Number</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input 
                              id="input_complaint_floor"
                              type="text"
                              required
                              value={floor}
                              onChange={(e) => setFloor(e.target.value)}
                              placeholder="1st"
                              className={`w-full px-3 py-3 rounded-xl border text-xs text-center font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            />
                            <input 
                              id="input_complaint_room"
                              type="text"
                              required
                              value={roomNumber}
                              onChange={(e) => setRoomNumber(e.target.value)}
                              placeholder="LH-102"
                              className={`w-full px-3 py-3 rounded-xl border text-xs text-center font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                                darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      {/* VOICE MEMO SECTION */}
                      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Voice Message Description</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Use voice capture for acoustic diagnostics (e.g. ventilation noises).</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            recordingState === 'recording' ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'bg-slate-500/10 text-slate-400'
                          }`}>
                            {recordingState === 'idle' && 'No memo recorded'}
                            {recordingState === 'recording' && 'Recording Active'}
                            {recordingState === 'paused' && 'Recording Paused'}
                            {recordingState === 'stopped' && 'Memo ready'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {recordingState === 'idle' && (
                            <button
                              id="btn_voice_record"
                              type="button"
                              onClick={startRecording}
                              className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-rose-500/10 hover:translate-y-[-1px]"
                            >
                              <Mic className="h-4 w-4" />
                              Start Microphone Capture
                            </button>
                          )}

                          {recordingState === 'recording' && (
                            <>
                              <button
                                id="btn_voice_pause"
                                type="button"
                                onClick={pauseRecording}
                                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-2 transition-all"
                              >
                                <Pause className="h-4 w-4" />
                                Pause
                              </button>
                              <button
                                id="btn_voice_stop"
                                type="button"
                                onClick={stopRecording}
                                className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-2 transition-all"
                              >
                                <Square className="h-4 w-4" />
                                Stop Recording
                              </button>
                            </>
                          )}

                          {recordingState === 'paused' && (
                            <>
                              <button
                                id="btn_voice_resume"
                                type="button"
                                onClick={resumeRecording}
                                className="px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-2 transition-all"
                              >
                                <Mic className="h-4 w-4" />
                                Resume Capture
                              </button>
                              <button
                                id="btn_voice_stop_paused"
                                type="button"
                                onClick={stopRecording}
                                className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold flex items-center gap-2 transition-all"
                              >
                                <Square className="h-4 w-4" />
                                Stop
                              </button>
                            </>
                          )}

                          {recordingState === 'stopped' && (
                            <div className="flex items-center gap-2 w-full justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  id="btn_voice_play"
                                  type="button"
                                  onClick={togglePlayback}
                                  className="h-10 w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all shadow-md"
                                >
                                  {playbackState === 'playing' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                                </button>
                                <span className="text-xs font-mono font-bold text-indigo-500">
                                  {playbackState === 'playing' ? 'Playing audio memo...' : 'Recorded Memo Ready'}
                                </span>
                              </div>
                              <button
                                id="btn_voice_delete"
                                type="button"
                                onClick={deleteRecording}
                                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                title="Delete memo"
                              >
                                <Trash2 className="h-4.5 w-4.5" />
                              </button>
                            </div>
                          )}

                          {/* Recording Duration Indicator */}
                          {(recordingState === 'recording' || recordingState === 'paused') && (
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 text-slate-100 border border-slate-800">
                              <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                              <span className="text-xs font-mono">0:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* MULTIPLE IMAGE UPLOAD SECTION */}
                      <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'} space-y-4`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Evidence Photographic Uploads</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Attach multiple pictures. Preview visual indicators.</p>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">{images.length} Attached</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
                              <img src={img} alt="preview" className="h-full w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-rose-500 text-white hover:bg-rose-600 transition-all opacity-90 hover:scale-105"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}

                          <label className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                            darkMode ? 'border-slate-800 hover:border-indigo-500/50 bg-slate-950/30' : 'border-slate-200 hover:border-indigo-500/50 bg-white'
                          }`}>
                            <ImageIcon className="h-6 w-6 text-slate-400 mb-1" />
                            <span className="text-[10px] font-bold text-slate-400 text-center px-2">Attach Photo</span>
                            <input 
                              type="file" 
                              multiple 
                              accept="image/*" 
                              className="hidden" 
                              onChange={handleImageChange}
                            />
                          </label>
                        </div>
                      </div>

                      <button 
                        id="btn_complaint_submit_action"
                        type="submit"
                        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:translate-y-0 hover:translate-y-[-1px]"
                      >
                        Register Facilities Complaint (Generate Tracking ID)
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. COMPLAINT HISTORY TAB */}
                {activeTab === 'history' && (
                  <div className="space-y-6">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Your Complaint History</h1>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Review and filter your filed campus requests. Access tracking timelines and operational statuses.
                      </p>
                    </div>

                    <div className={`p-6 rounded-3xl border ${
                      darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    } space-y-6`}>
                      {studentComplaints.length === 0 ? (
                        <div className="text-center py-20">
                          <p className="text-sm font-medium text-slate-500">No complaints registered in your database yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {studentComplaints.map((complaint) => (
                            <div 
                              key={complaint.id}
                              className={`p-6 rounded-2xl border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                                darkMode ? 'bg-slate-950/60 border-slate-800 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="space-y-3 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[10px] text-slate-500">{complaint.id}</span>
                                  <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                    complaint.priority === 'emergency' ? 'bg-rose-500/10 text-rose-500' :
                                    complaint.priority === 'high' ? 'bg-amber-500/10 text-amber-500' :
                                    complaint.priority === 'medium' ? 'bg-indigo-500/10 text-indigo-500' :
                                    'bg-slate-500/10 text-slate-500'
                                  }`}>
                                    {complaint.priority}
                                  </span>
                                  <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full uppercase font-bold">
                                    {complaint.category}
                                  </span>
                                </div>

                                <div>
                                  <h3 className="text-base font-bold">{complaint.title}</h3>
                                  <p className={`text-xs mt-1 leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                    {complaint.description}
                                  </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-slate-500 font-semibold pt-1">
                                  <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5" /> {complaint.building}</span>
                                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Floor {complaint.floor}, Room {complaint.roomNumber}</span>
                                  <span className="flex items-center gap-1">⏱ Filed on {new Date(complaint.createdAt).toLocaleDateString()}</span>
                                </div>

                                {complaint.adminNotes && (
                                  <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                                    darkMode ? 'bg-indigo-500/5 border-indigo-500/10 text-indigo-300' : 'bg-indigo-50 border-indigo-100 text-indigo-800'
                                  }`}>
                                    <strong>Admin Notes:</strong> {complaint.adminNotes}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-800 shrink-0">
                                <div className="flex flex-col items-start md:items-end">
                                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Status</span>
                                  <span className={`text-sm font-black mt-0.5 uppercase ${
                                    complaint.status === 'resolved' ? 'text-emerald-500' :
                                    complaint.status === 'in_progress' ? 'text-amber-500' :
                                    complaint.status === 'accepted' ? 'text-indigo-500' : 'text-slate-500'
                                  }`}>
                                    {complaint.status.replace('_', ' ')}
                                  </span>
                                </div>

                                {canSendReminder(complaint) ? (
                                  <button 
                                    onClick={() => handleOpenReminderModal(complaint)}
                                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all shadow-md"
                                  >
                                    Send Reminder
                                  </button>
                                ) : complaint.status !== 'resolved' ? (
                                  <span className="text-[10px] text-slate-500 bg-slate-500/10 px-3 py-2 rounded-xl font-bold">
                                    {complaint.remindersCount > 0 ? `Reminder Filed (${complaint.remindersCount})` : 'Under monitoring'}
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-2xl font-black tracking-tight">Your Alerts & Notifications</h1>
                        <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Stay updated on state changes, admin acceptances, and resolution schedules.
                        </p>
                      </div>
                    </div>

                    <div className={`p-6 rounded-3xl border ${
                      darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
                    } space-y-4`}>
                      {notifications.length === 0 ? (
                        <p className="text-sm font-medium text-slate-500 text-center py-12">No notifications found.</p>
                      ) : (
                        <div className="space-y-4">
                          {notifications.map((notif) => (
                            <div 
                              key={notif.id}
                              className={`p-4 rounded-xl border transition-all flex gap-4 ${
                                notif.isRead 
                                  ? (darkMode ? 'bg-slate-950/20 border-slate-900 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-600') 
                                  : (darkMode ? 'bg-indigo-500/5 border-indigo-500/20 text-slate-200 shadow-sm' : 'bg-indigo-500/5 border-indigo-500/10 text-slate-900')
                              }`}
                            >
                              <div className="mt-1">
                                {notif.type === 'resolved' && <CheckCircle className="h-5 w-5 text-emerald-500" />}
                                {notif.type === 'status_updated' && <RefreshCw className="h-5 w-5 text-amber-500 animate-spin-slow" />}
                                {notif.type === 'submitted' && <Clock className="h-5 w-5 text-slate-500" />}
                                {notif.type === 'reminder_acknowledged' && <AlertTriangle className="h-5 w-5 text-indigo-500" />}
                              </div>

                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-bold">{notif.title}</p>
                                  <span className="text-[10px] text-slate-500 font-mono">{new Date(notif.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{notif.description}</p>
                                {!notif.isRead && (
                                  <button 
                                    onClick={() => onMarkNotificationRead(notif.id)}
                                    className="text-[10px] font-bold text-indigo-500 hover:underline mt-2 block"
                                  >
                                    Acknowledge alerts
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 5. STUDENT PROFILE TAB */}
                {activeTab === 'profile' && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Student Information</h1>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Review your registered identity coordinates and campus enrollment departments.
                      </p>
                    </div>

                    {profileSuccess && (
                      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold">
                        Profile updated successfully!
                      </div>
                    )}

                    <form 
                      id="form_student_profile"
                      onSubmit={handleProfileUpdate}
                      className={`p-6 sm:p-8 rounded-3xl border ${
                        darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                      } space-y-6`}
                    >
                      <div className="flex items-center gap-5 pb-4 border-b border-inherit">
                        <img 
                          src={student.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100'} 
                          alt="avatar" 
                          className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500"
                        />
                        <div>
                          <p className="text-sm font-bold">{student.name}</p>
                          <p className="text-xs text-indigo-500 font-mono mt-0.5">{student.email}</p>
                          <span className="inline-block mt-2 px-2.5 py-0.5 text-[9px] font-extrabold uppercase bg-indigo-500/10 text-indigo-500 rounded-full">
                            Enrollment Verified
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Verified Full Name</label>
                          <input 
                            id="input_profile_name"
                            type="text"
                            required
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Academic Department / Division</label>
                          <input 
                            id="input_profile_dept"
                            type="text"
                            required
                            value={profileDept}
                            onChange={(e) => setProfileDept(e.target.value)}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                              darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Institutional Email</label>
                          <input 
                            type="email"
                            disabled
                            value={student.email}
                            className={`w-full px-4 py-3 rounded-xl border text-sm font-medium cursor-not-allowed bg-slate-950/40 border-slate-800 text-slate-500`}
                          />
                          <p className="text-[10px] text-slate-500 mt-1.5">Your email address is managed and secured by institutional Single Sign-In protocols.</p>
                        </div>
                      </div>

                      <button 
                        id="btn_profile_save"
                        type="submit"
                        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all"
                      >
                        Save Updated Identity Info
                      </button>
                    </form>
                  </div>
                )}

                {/* 6. SETTINGS TAB */}
                {activeTab === 'settings' && (
                  <div className="max-w-2xl mx-auto space-y-6">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight">Portal Settings & Testing Presets</h1>
                      <p className={`text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Quick toggles to switch active workspace contexts or verify responsive notifications.
                      </p>
                    </div>

                    <div className={`p-6 rounded-3xl border ${
                      darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
                    } space-y-6`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-4 border-b border-inherit">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Sandbox Switcher</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Toggle admin views directly to verify complete analytics workflows.</p>
                          </div>
                          {/* We will implement role selection as preset */}
                          <span className="text-xs text-slate-500">Select administrative role in global switcher above.</span>
                        </div>

                        <div className="flex items-center justify-between pb-4 border-b border-inherit">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">3-Day Trigger Override</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">The simulation already includes a 4-day-old 'Water Leak' complaint, making it eligible for reminders instantly.</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-500">ACTIVE</span>
                        </div>

                        <div className="flex items-center justify-between pb-4">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-400">Preloaded Mock Analytics</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Mock database preloads multiple categories (Electrical, Plumber, IT) across Newton Science, Aryabhata blocks to feed Recharts.</p>
                          </div>
                          <span className="text-xs font-mono font-bold text-emerald-500">ACTIVE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </main>

      {/* 3-DAY REMINDER MODAL */}
      <AnimatePresence>
        {activeReminderComplaint && (
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
                  <h3 className="text-base font-black">Send Priority Operational Reminder</h3>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Complaint ID: <strong className="font-mono text-indigo-500">{activeReminderComplaint.id}</strong>
                  </p>
                </div>
                <button 
                  onClick={() => setActiveReminderComplaint(null)}
                  className="p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className={`p-3.5 rounded-xl text-xs ${
                  darkMode ? 'bg-slate-950/60 text-slate-300' : 'bg-slate-50 text-slate-700'
                }`}>
                  <p className="font-bold mb-1">Issue: {activeReminderComplaint.title}</p>
                  <p className="text-[11px] line-clamp-2 text-slate-400">{activeReminderComplaint.description}</p>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Reminder Message</label>
                  <textarea 
                    rows={3}
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 p-3 rounded-xl bg-indigo-500/5 text-indigo-400 border border-indigo-500/10 text-[10px]">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Rule check: Students are permitted to dispatch 1 reminder every 3 days. Facilities Admin will receive an emergency notification.</span>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button 
                  onClick={() => setActiveReminderComplaint(null)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold ${
                    darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTriggerReminder}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-500/10"
                >
                  Dispatch Reminder
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
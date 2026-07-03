/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'student' | 'admin';

export type Priority = 'low' | 'medium' | 'high' | 'emergency';

export type Category =
  | 'electrical'
  | 'plumbing'
  | 'carpentry'
  | 'cleanliness'
  | 'internet'
  | 'classroom'
  | 'laboratory'
  | 'hostel'
  | 'water'
  | 'security'
  | 'other';

export type ComplaintStatus = 'pending' | 'accepted' | 'in_progress' | 'resolved';

export interface UserProfile {
  id: string;

  // Personal Information
  name: string;
  email: string;
  prn: string;
  mobile: string;

  // Academic Details
  department: string;
  year: string;
  division: string;

  // Profile
  avatar?: string;
  role: Role;

  // Status
  profileCompleted: boolean;
  loginTime?: string;

  // Admin only
  designation?: string;
}

export interface Complaint {
  id: string; // E.g., CC-2026-8291
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  building: string;
  floor: string;
  roomNumber: string;
  images?: string[];
  voiceUrl?: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDept: string;
  remindersCount: number;
  lastReminderAt?: string;
  adminNotes?: string;
  assignedTo?: string;
  resolvedAt?: string;
}

export interface Reminder {
  id: string;
  complaintId: string;
  studentId: string;
  createdAt: string;
  message: string;
  adminNotified: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'submitted' | 'accepted' | 'status_updated' | 'reminder_acknowledged' | 'resolved';
  isRead: boolean;
  createdAt: string;
  complaintId: string;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  complaintId?: string;
  details: string;
  createdAt: string;
}

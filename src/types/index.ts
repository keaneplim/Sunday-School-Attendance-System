export interface Student {
  id: string;
  nickname?: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  parentName: string;
  parentPhone: string;
  medicalNotes?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sessionTime: string;
  checkinTimestamp: string;
}

export type Category = 'Nursery' | 'Preschool' | 'Elementary' | 'Teenager';

export type SessionTime = '09:30' | '11:00' | '14:00' | '16:00';

export interface SessionData {
  time: SessionTime;
  label: string;
  count: number;
}
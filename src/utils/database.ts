import { Student, AttendanceRecord } from '../types';
import { differenceInYears } from 'date-fns';

const STUDENTS_KEY = 'sunday_school_students';
const ATTENDANCE_KEY = 'sunday_school_attendance';

export class Database {
  static getStudents(): Student[] {
    const data = localStorage.getItem(STUDENTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveStudents(students: Student[]): void {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
  }

  static addStudent(student: Omit<Student, 'id' | 'createdAt'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...student,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    students.push(newStudent);
    this.saveStudents(students);
    return newStudent;
  }

  static updateStudent(id: string, updates: Partial<Student>): Student | null {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === id);
    if (index === -1) return null;
    
    students[index] = { ...students[index], ...updates };
    this.saveStudents(students);
    return students[index];
  }

  static getAttendanceRecords(): AttendanceRecord[] {
    const data = localStorage.getItem(ATTENDANCE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveAttendanceRecords(records: AttendanceRecord[]): void {
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
  }

  static addAttendanceRecord(studentId: string, sessionTime: string): AttendanceRecord {
    const records = this.getAttendanceRecords();
    const newRecord: AttendanceRecord = {
      id: crypto.randomUUID(),
      studentId,
      sessionTime,
      checkinTimestamp: new Date().toISOString(),
    };
    records.push(newRecord);
    this.saveAttendanceRecords(records);
    return newRecord;
  }

  static searchStudents(query: string): Student[] {
    const students = this.getStudents();
    const lowerQuery = query.toLowerCase();
    return students.filter(student => 
      student.firstName.toLowerCase().includes(lowerQuery) ||
      student.lastName.toLowerCase().includes(lowerQuery)
    );
  }

  static getStudentById(id: string): Student | null {
    const students = this.getStudents();
    return students.find(s => s.id === id) || null;
  }
}

export function calculateAge(dateOfBirth: string): number {
  return differenceInYears(new Date(), new Date(dateOfBirth));
}

export function getCategory(age: number): string {
  if (age <= 2) return 'Nursery';
  if (age <= 5) return 'Preschool';
  if (age <= 11) return 'Elementary';
  return 'Teenager';
}

export function isSunday(): boolean {
  const today = new Date();
  return today.getDay() === 0; // Sunday is 0
}

export function getCurrentSession(): string {
  if (!isSunday()) {
    return 'not-sunday';
  }
  
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const time = hours * 100 + minutes;

  if (time < 1030) return '09:30';
  if (time < 1330) return '11:00';
  if (time < 1500) return '14:00';
  return '16:00';
}
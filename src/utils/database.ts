import { Student, AttendanceRecord } from '../types';
import { differenceInYears, format } from 'date-fns';

const API_URL = 'http://localhost:4000/api'; // The address of our backend

// --- Student Functions ---

export async function getStudents(): Promise<Student[]> {
  const response = await fetch(`${API_URL}/students`);
  const result = await response.json();
  return result.data || [];
}

export async function addStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<Student> {
  const newStudent: Student = {
    ...student,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await fetch(`${API_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newStudent),
  });
  return newStudent;
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<void> {
  await fetch(`${API_URL}/students/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
}

// NEW: Function to delete a student
export async function deleteStudent(id: string): Promise<void> {
  await fetch(`${API_URL}/students/${id}`, {
    method: 'DELETE',
  });
}

// Function to clear all data
export async function clearAllData(): Promise<void> {
  await fetch(`${API_URL}/clear-all-data`, {
    method: 'DELETE',
  });
}

// --- Attendance Functions ---

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  const response = await fetch(`${API_URL}/attendance`);
  const result = await response.json();
  return result.data || [];
}

export async function addAttendanceRecord(studentId: string, sessionTime: string): Promise<AttendanceRecord> {
  const newRecord: AttendanceRecord = {
    id: crypto.randomUUID(),
    studentId,
    sessionTime,
    checkinTimestamp: new Date().toISOString(),
  };

  await fetch(`${API_URL}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newRecord),
  });
  return newRecord;
}


// --- Helper Functions (No changes needed here) ---

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

// This is the only function you need to replace in this file.
// Find the old printNameTag function and replace it with this one.

// Find the old printNameTag function and replace it with this new one.

export function printNameTag(student: Student) {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);

  const content = `
    <html>
      <head>
        <title>Print Name Tag</title>
        <style>
          @page {
            size: 90mm 38mm;
            margin: 0;
          }
          body {
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center; 
          }
          .tag {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            /* POINT 1: Change 'center' to 'flex-start' to align to the top */
            justify-content: flex-start; 
            align-items: center;
            /* POINT 2: Add some padding at the top */
            padding-top: 5px; 
          }
          h3 {
            font-size: 35pt;
            font-weight: bold;
            margin: 0 0 5px 0;
            padding: 0;
          }
          p {
            font-size: 20pt;
            font-weight: 600;
            color: #2563eb; /* blue */
            margin: 0;
            padding: 0;
          }
        </style>
      </head>
      <body>
        <div class="tag">
          <h3>${student.firstName} ${student.lastName}</h3>
          <p>${category}</p>
        </div>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'height=200,width=400');
  
  if (printWindow) {
    printWindow.document.write(content);
    
    printWindow.document.close();
    printWindow.onload = function() {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  }
}
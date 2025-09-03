import { Student, AttendanceRecord } from '../types';
import { differenceInYears, format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL;

// This function is for the initial login (Step 1)
export async function login(password: string): Promise<{ success: boolean; isAdmin: boolean; secret?: string }> {
  try {
    const response = await fetch(`${API_URL}/login`, { // Calls the main login route
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      return await response.json();
    }
    return { success: false, isAdmin: false };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, isAdmin: false };
  }
}

// This new function is for the admin-only login (Step 2)
export async function adminLogin(password: string, authToken: string): Promise<{ success: boolean; isAdmin: boolean; secret?: string }> {
  try {
    const response = await fetch(`${API_URL}/admin-login`, { // Calls the new admin-only route
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'auth-secret': authToken, // Must provide the initial auth token to prove we're already logged in
      },
      body: JSON.stringify({ password }),
    });
    if (response.ok) {
      return await response.json();
    }
    return { success: false, isAdmin: false };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, isAdmin: false };
  }
}

export async function verifyClearDataPassword(password: string, adminSecret: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/verify-clear-data-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'admin-secret': adminSecret,
      },
      body: JSON.stringify({ password }),
    });
    return response.ok;
  } catch (error) {
    console.error('Verify clear data password error:', error);
    return false;
  }
}

export async function getStudents(): Promise<Student[]> {
  try {
    const response = await fetch(`${API_URL}/students`);
    if (!response.ok) {
      throw new Error('Failed to fetch students');
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Get students error:', error);
    return [];
  }
}

export async function addStudent(student: Omit<Student, 'id' | 'createdAt'>, authToken: string): Promise<Student> {
  const newStudent: Student = { 
    ...student, 
    id: crypto.randomUUID(), 
    createdAt: new Date().toISOString() 
  };

  try {
    const response = await fetch(`${API_URL}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'auth-secret': authToken,
      },
      body: JSON.stringify(newStudent),
    });

    if (!response.ok) {
      throw new Error('Failed to add student');
    }

    return newStudent;
  } catch (error) {
    console.error('Add student error:', error);
    throw error;
  }
}

export async function updateStudent(id: string, updates: Partial<Student>, adminSecret: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'admin-secret': adminSecret,
        'role': 'admin'
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update student');
    }
  } catch (error) {
    console.error('Update student error:', error);
    throw error;
  }
}

export async function deleteStudent(id: string, adminSecret: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/students/${id}`, {
      method: 'DELETE',
      headers: {
        'admin-secret': adminSecret,
        'role': 'admin'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to delete student');
    }
  } catch (error) {
    console.error('Delete student error:', error);
    throw error;
  }
}

export async function clearAllData(adminSecret: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/clear-all-data`, {
      method: 'DELETE',
      headers: {
        'admin-secret': adminSecret,
      }
    });

    if (!response.ok) {
      throw new Error('Failed to clear all data');
    }
  } catch (error) {
    console.error('Clear all data error:', error);
    throw error;
  }
}

export async function getAttendanceRecords(): Promise<AttendanceRecord[]> {
  try {
    const response = await fetch(`${API_URL}/attendance`);
    if (!response.ok) {
      throw new Error('Failed to fetch attendance records');
    }
    const result = await response.json();
    return result.data || [];
  } catch (error) {
    console.error('Get attendance records error:', error);
    return [];
  }
}

export async function addAttendanceRecord(studentId: string, sessionTime: string): Promise<AttendanceRecord> {
  const newRecord: AttendanceRecord = {
    id: crypto.randomUUID(),
    studentId,
    sessionTime,
    checkinTimestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(`${API_URL}/attendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newRecord),
    });

    if (!response.ok) {
      throw new Error('Failed to add attendance record');
    }

    return newRecord;
  } catch (error) {
    console.error('Add attendance record error:', error);
    throw error;
  }
}

// --- Helper Functions ---

export function calculateAge(dateOfBirth: string): number {
  return differenceInYears(new Date(), new Date(dateOfBirth));
}

export function getCategory(age: number): string {
  if (age <= 2) return 'Love';
  if (age <= 5) return 'Hope';
  if (age <= 11) return 'Kindness';
  return 'Teenager';
}

export function isSunday(): boolean {
  return true
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

// --- UNIVERSAL PRINTING LOGIC ---

// --- 1. Desktop Printing (Laptops) ---
function printNameTagDesktop(student: Student, category: string, content: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(content);
    doc.close();
    
    // This 'onload' is the key to making it work reliably
    iframe.onload = function() {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    };
  }
}

// from project/src/utils/database.ts

// --- 2. Tablet & Mobile Printing ---
function printNameTagTablet(content: string) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Pop-up was blocked. Please allow pop-ups for this site to print.");
        return;
    }

    // This creates a simple page with just a print button.
    const tabletContent = `
        <html>
            <head>
                <title>Print Name Tag</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; font-family: sans-serif; background-color: #f0f0f0; }
                    .print-button { font-size: 24px; padding: 20px 40px; cursor: pointer; border: none; border-radius: 8px; background-color: #007bff; color: white; }
                    .print-area { display: none; }
                </style>
            </head>
            <body>
                <div class="print-area">${content}</div>
                
                // --- THIS IS THE BUTTON THE USER TAPS ---
                <button id="printBtn" class="print-button">Tap to Print</button>
                
                <script>
                    // --- THIS SCRIPT ATTACHES THE PRINT COMMAND TO THE BUTTON TAP ---
                    document.getElementById('printBtn').addEventListener('click', () => {
                        window.print();
                    });

                    // This script closes the window automatically after printing
                    window.addEventListener('afterprint', () => {
                        window.close();
                    });
                <\/script>
            </body>
        </html>
    `;

    printWindow.document.write(tabletContent);
    printWindow.document.close();
    printWindow.focus();
}

// --- 3. Main Print Dispatcher ---
export function printNameTag(student: Student) {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);

  // Define the printable content once
  const content = `
    <html>
      <head>
        <title>Name Tag - ${student.nickname}</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700;800&display=swap" rel="stylesheet">
        <style>
          @page { size: 90mm 38mm; margin: 0; }
          body { font-family: 'Poppins', sans-serif; margin: 0; padding: 0; width: 90mm; height: 38mm; }
          .tag { width: 100%; height: 100%; box-sizing: border-box; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 2mm 4mm; }
          .nickname { font-size: 28pt; font-weight: 800; text-align: center; line-height: 1.1; flex-grow: 1; display: flex; align-items: center; }
          .line { width: 100%; border-top: 1.5px solid black; margin: 2mm 0; }
          .footer { width: 100%; display: flex; justify-content: space-between; align-items: flex-end; font-size: 9pt; }
          .parent-info { text-align: left; line-height: 1.2; }
          .category { font-weight: 700; font-size: 11pt; }
        </style>
      </head>
      <body>
        <div class="tag">
          <div class="nickname">${student.nickname}</div>
          <div class="line"></div>
          <div class="footer">
            <div class="parent-info">
              <div>${student.parentName}</div>
              <div>${student.parentPhone}</div>
            </div>
            <div class="category">${category}</div>
          </div>
        </div>
      </body>
    </html>
  `;

  // Detect if the device is a tablet/mobile
  const userAgent = navigator.userAgent.toLowerCase();
  const isTabletOrMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  if (isTabletOrMobile) {
    printNameTagTablet(student, category, content);
  } else {
    printNameTagDesktop(student, category, content);
  }
}

import { Student, AttendanceRecord } from '../types';
import { differenceInYears, format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL;

// This function is for the initial login (Step 1)
export async function login(password: string): Promise<{ success: boolean; isAdmin: boolean; secret?: string }> {
  try {
    const response = await fetch(${API_URL}/login, { // Calls the main login route
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
    const response = await fetch(${API_URL}/admin-login, { // Calls the new admin-only route
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
    const response = await fetch(${API_URL}/verify-clear-data-password, {
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
    const response = await fetch(${API_URL}/students);
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
    const response = await fetch(${API_URL}/students, {
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
    const response = await fetch(${API_URL}/students/${id}, {
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
    const response = await fetch(${API_URL}/students/${id}, {
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
    const response = await fetch(${API_URL}/clear-all-data, {
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
    const response = await fetch(${API_URL}/attendance);
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
    const response = await fetch(${API_URL}/attendance, {
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

export function printNameTag(student: Student) {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);

  const content = `
    <html>
      <head>
        <title>Print Name Tag</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          @page {
            size: 90mm 38mm landscape;
            margin: 0;
          }
          body, html {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden; /* Prevents accidental scrollbars */
          }
          .tag {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            padding: 2mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            align-items: center;
          }
          
          .main-info {
            text-align: center;
          }

          h3 {
            font-size: 26pt;
            font-weight: bold;
            margin: 0;
            padding: 0;
            line-height: 1; /* Tighter line spacing */
          }
          
          .category {
            text-align: right;
            font-size: 16pt; /* Made category slightly larger */
            font-weight: 600;
            color: #4b5563;
          }
          
          .parent-info {
            text-align: left;
            font-size: 10pt;
            color: #4b5563;
          }
          
          .parent-info span {
            display: block;
          }

          hr {
            width: 100%;
            border: none;
            border-top: 2px solid black;
            margin: 1mm 0;
          }

            /* --- Footer Section --- */
          .footer {
            width: 100%;
            /* 3. Replaced absolute positioning with Flexbox */
            display: flex;
            justify-content: space-between; /* Pushes parent info left, category right */
            align-items: flex-end; /* Aligns them at the bottom */
          }

        </style>
      </head>
      <body>
        <div class="tag">
          <div class="main-info">
            <h3>${student.nickname}</h3>
          </div>
          <hr />
          <div class="footer">
            <div class="parent-info">
              <span>${student.parentName}</span>
              <span>${student.parentPhone}</span>
            </div>
            <div class="category">
              ${category}
            </div>
          </div>

        </div>
      </body>
    </html>

  `;

  // This method avoids pop-ups by using a hidden iframe.
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(content);
    doc.close();
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
  }

  // Clean up the iframe after a delay
  setTimeout(() => {
    if (document.body.contains(iframe)) {
      document.body.removeChild(iframe);
    }
  }, 1000);
}

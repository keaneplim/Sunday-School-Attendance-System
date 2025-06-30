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
  if (age <= 2) return 'Love';
  if (age <= 5) return 'Hope';
  if (age <= 11) return 'Kindness';
  return 'Teenager';
}

export function isSunday(): boolean {
  // Return true to enable check-in on any day for testing purposes
  return true; 
  
  // The original code is commented out below so you can easily switch back
  // const today = new Date();
  // return today.getDay() === 0; // Sunday is 0
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
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          @page {
            size: 90mm 38mm;
            margin: 0;
          }
          body {
            font-family: 'Poppins', sans-serif;
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
          }
          .tag {
            width: 100%;
            height: 100%;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            justify-content: flex-start; 
            align-items: center;
            padding-top: -5px; 
          }
          .main-info {
            text-align: center;
          }
            
          h3 {
            font-size: 26pt;
            font-weight: bold;
            margin: 0;
            padding: 0;
            /* text-decoration: underline */
          }
          .category {
            /* Positioned at the top right */
            position: absolute;
            bottom: 35px;
            right: 5px;
            text-align: right;
            font-size: 15pt; /* Smaller font size for parent info */
            color: #4b5563; /* gray-600 */
          }
          .parent-info {
            /* Positioned at the bottom left */
            position: absolute;
            bottom: 30px;
            left: 5px;
            text-align: left;
            font-size: 10pt; /* Smaller font size for parent info */
            color: #4b5563; /* gray-600 */
          }
          .parent-info span {
            display: block; /* Makes name and number appear on separate lines */
          }

          hr {
            width: 100%; /* Make the line slightly shorter than the tag */
            border: none;
            border-top: 2px solid black;
            margin: 8px 0; /* Add some space above and below the line */
          }

        </style>
      </head>
      <body onload="window.print()">
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
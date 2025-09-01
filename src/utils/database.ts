import { Student, AttendanceRecord } from '../types';
import { differenceInYears, format } from 'date-fns';

const API_URL = 'http://localhost:4000/api';

// This function is for the initial login (Step 1)
export async function login(password: string): Promise<{ success: boolean; isAdmin: boolean; secret?: string }> {
  const response = await fetch(`${API_URL}/login`, { // Calls the main login route
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (response.ok) {
    return await response.json();
  }
  return { success: false, isAdmin: false };
}

// This new function is for the admin-only login (Step 2)
export async function adminLogin(password: string, authToken: string): Promise<{ success: boolean; isAdmin: boolean; secret?: string }> {
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
}

export async function verifyClearDataPassword(password: string, adminSecret: string): Promise<boolean> {
    const response = await fetch(`${API_URL}/verify-clear-data-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'admin-secret': adminSecret,
        },
        body: JSON.stringify({ password }),
    });
    return response.ok;
}

export async function getStudents(): Promise<Student[]> {
  const response = await fetch(`${API_URL}/students`);
  const result = await response.json();
  return result.data || [];
}

export async function addStudent(student: Omit<Student, 'id' | 'createdAt'>, authToken: string): Promise<Student> {
  const newStudent: Student = { ...student, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  await fetch(`${API_URL}/students`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'auth-secret': authToken,
    },
    body: JSON.stringify(newStudent),
  });
  return newStudent;
}

export async function updateStudent(id: string, updates: Partial<Student>, adminSecret: string): Promise<void> {
  await fetch(`${API_URL}/students/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'admin-secret': adminSecret,
      'role': 'admin'
    },
    body: JSON.stringify(updates),
  });
}

export async function deleteStudent(id: string, adminSecret: string): Promise<void> {
    await fetch(`${API_URL}/students/${id}`, {
        method: 'DELETE',
        headers: {
            'admin-secret': adminSecret,
            'role': 'admin'
        }
    });
}

export async function clearAllData(adminSecret: string): Promise<void> {
  await fetch(`${API_URL}/clear-all-data`, {
    method: 'DELETE',
    headers: {
      'admin-secret': adminSecret,
    }
  });
}

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
  return true;
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

// Device detection function
function detectDevice() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent) || 
                  (window.screen && window.screen.width >= 768 && window.screen.height >= 1024) ||
                  (/android/i.test(userAgent) && !/mobile/i.test(userAgent));
  const isMobile = /mobile/i.test(userAgent) && !isTablet;
  const isDesktop = !isAndroid && !isIOS && !isTablet && !isMobile;

  return {
    isAndroid,
    isIOS,
    isTablet,
    isMobile,
    isDesktop
  };
}

// Enhanced print function for tablet compatibility
function printNameTagTablet(student: Student, category: string) {
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

          /* Tablet-specific optimizations */
          @media screen {
            body {
              background: #f5f5f5;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              padding: 20px;
            }
            
            .tag {
              background: white;
              border: 2px solid #333;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              width: 90mm;
              height: 38mm;
              position: relative;
            }
            
            .print-info {
              position: fixed;
              top: 20px;
              left: 50%;
              transform: translateX(-50%);
              background: #2196F3;
              color: white;
              padding: 10px 20px;
              border-radius: 6px;
              font-size: 14px;
              z-index: 1000;
              animation: fadeOut 3s ease-in-out;
            }
            
            @keyframes fadeOut {
              0% { opacity: 1; }
              70% { opacity: 1; }
              100% { opacity: 0; }
            }
          }

        </style>
      </head>
      <body onload="handlePrintLoad()">
        <div class="print-info" id="printInfo">Name tag printed successfully!</div>
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
        
        <script>
          function handlePrintLoad() {
            // Auto-print on load
            setTimeout(() => {
              window.print();
              
              // Show confirmation and auto-close after 3 seconds
              setTimeout(() => {
                window.close();
              }, 3000);
            }, 100);
          }
          
          // Handle print dialog events
          window.addEventListener('afterprint', function() {
            // Additional cleanup if needed
          });
          
          window.addEventListener('beforeprint', function() {
            // Hide print info during actual printing
            const printInfo = document.getElementById('printInfo');
            if (printInfo) {
              printInfo.style.display = 'none';
            }
          });
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '', 'height=600,width=800');

  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
  }
}

// Enhanced main print function with device detection
export function printNameTag(student: Student) {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);
  const device = detectDevice();

  // For tablets and mobile devices, use enhanced method
  if (device.isTablet || device.isMobile) {
    printNameTagTablet(student, category);
    return;
  }

  // Original laptop/desktop method (unchanged)
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

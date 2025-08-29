import { Student, AttendanceRecord } from '../types';
import { differenceInYears, format } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL;

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

// --- Desktop printing method (iframe) ---
// --- Desktop printing method (iframe) ---
function printNameTagDesktop(student: Student, category: string) {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';

  const content = `
    <html>
      <head>
        <title>Name Tag - ${student.nickname}</title>
        <style>
          body { font-family: Poppins, sans-serif; margin:0; padding:0; }
          .tag { 
            width: 90mm; height: 29mm;
            display: flex; justify-content: space-between; align-items: center;
            padding: 3mm 5mm; box-sizing: border-box; 
          }
          .left { font-size: 7pt; color:#000; line-height:1.2; }
          .center { text-align:center; font-size: 24pt; font-weight:bold; }
          .right { font-size: 8pt; font-weight:bold; text-align:right; }
          @page { size: 90mm 29mm; margin:0; }
        </style>
      </head>
      <body>
        <div class="tag">
          <div class="left">
            <div>${student.parentName || 'Parent'}</div>
            <div>${student.parentPhone || 'Phone'}</div>
          </div>
          <div class="center">${student.nickname}</div>
          <div class="right">${category}</div>
        </div>
      </body>
    </html>
  `;
  
  document.body.appendChild(iframe);

  iframe.contentDocument!.open();
  iframe.contentDocument!.write(content);
  iframe.contentDocument!.close();

  // --- FIX ---
  // Wait for the iframe to load before printing
  iframe.onload = function() {
    iframe.contentWindow!.focus();
    iframe.contentWindow!.print();
    
    // Clean up the iframe after a short delay
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  };
}

// --- IMPROVED PRINTING FUNCTIONS FOR ANDROID TABLETS ---

// Android-specific printing method using popup window
function printNameTagAndroidFallback(student: Student, category: string) {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  if (!printWindow) {
    alert('Please allow popups for printing to work. Alternatively, try the download option.');
    return;
  }

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
        <title>Name Tag - ${student.nickname}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Poppins, sans-serif;
            background: #f5f5f5;
            padding: 20px;
            line-height: 1.4;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            padding: 25px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            margin-bottom: 25px;
            color: #000;
          }
          
          .info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .info-label {
            font-weight: bold;
            color: #555;
          }
          
          .info-value {
            color: #333;
          }
          
          .tag-preview {
            width: 100%;
            max-width: 450px;
            height: 140px;
            border: 3px solid #000;
            margin: 25px auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 15px 25px;
            background: white;
            box-sizing: border-box;
            position: relative;
          }
          
          .tag-left {
            flex: 0 0 auto;
            font-size: 12px;
            color: #000;
            line-height: 1.4;
            margin-right: 15px;
          }
          
          .tag-center {
            flex: 1;
            text-align: center;
            padding: 0 20px;
          }
          
          .tag-name {
            font-size: 24px;
            font-weight: bold;
            color: #000;
            word-wrap: break-word;
            max-width: 100%;
          }
          
          .tag-right {
            flex: 0 0 auto;
            font-size: 16px;
            color: #000;
            font-weight: bold;
            margin-left: 15px;
          }
          
          .buttons {
            text-align: center;
            margin: 25px 0;
          }
          
          .btn {
            display: inline-block;
            padding: 14px 24px;
            margin: 8px;
            border-radius: 8px;
            border: none;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.3s ease;
          }
          
          .btn-print {
            background: #2196F3;
            color: white;
          }
          
          .btn-print:hover {
            background: #1976D2;
            transform: translateY(-2px);
          }
          
          
          .btn-close {
            background: #666;
            color: white;
          }
          
          .btn-close:hover {
            background: #444;
            transform: translateY(-2px);
          }
          
          .help-text {
            text-align: center;
            color: #777;
            font-size: 14px;
            margin-top: 20px;
            padding: 15px;
            background: #fff3cd;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
          }

          /* Mobile responsive */
          @media screen and (max-width: 768px) {
            body {
              padding: 10px;
            }
            
            .container {
              padding: 15px;
            }
            
            .tag-preview {
              height: 120px;
              padding: 12px 18px;
            }
            
            .tag-name {
              font-size: 20px;
            }
            
            .tag-left,
            .tag-right {
              font-size: 11px;
            }
            
            .btn {
              padding: 12px 20px;
              font-size: 15px;
              margin: 5px;
            }
          }
          
          /* Print styles - Simplified for Android compatibility */
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white;
              font-family: Poppins, sans-serif;
            }
            
            .container {
              box-shadow: none;
              max-width: none;
              padding: 0;
              background: white;
            }
            
            .header,
            .info,
            .buttons,
            .help-text {
              display: none !important;
            }
            
            .tag-preview {
              width: 90mm;
              height: 29mm;
              max-width: 90mm;
              margin: 0;
              padding: 3mm 5mm;
              page-break-inside: avoid;
              position: absolute;
              top: 0;
              left: 0;
            }
            
            .tag-left {
              font-size: 7pt;
              margin-right: 3mm;
            }
            
            .tag-center {
              padding: 0 2mm;
            }
            
            .tag-name {
              font-size: 12pt;
            }
            
            .tag-right {
              font-size: 8pt;
              margin-left: 3mm;
            }

            @page {
              size: 90mm 29mm;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📋 Name Tag Ready</h2>
          </div>
          
          <div class="info">
            <div class="info-row">
              <span class="info-label">Student:</span>
              <span class="info-value">${student.nickname}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Category:</span>
              <span class="info-value">${category}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Parent:</span>
              <span class="info-value">${student.parentName || 'Not specified'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${student.parentPhone || 'Not specified'}</span>
            </div>
          </div>
          
          <div class="tag-preview">
            <div class="tag-left">
              <div>${student.parentName || 'Parent'}</div>
              <div>${student.parentPhone || 'Phone'}</div>
            </div>
            <div class="tag-center">
              <div class="tag-name">${student.nickname}</div>
            </div>
            <div class="tag-right">
              ${category}
            </div>
          </div>
          
          <div class="buttons">
            <button class="btn btn-print" onclick="window.print()">🖨️ Print Tag</button>
            <button class="btn btn-close" onclick="window.close()">✖️ Close</button>
          </div>
          
          <div class="help-text">
            <strong>💡 Printing Tips:</strong><br>
            • Make sure your printer is set to 90mm x 29mm label size<br>
            • If direct printing fails, use "Download Image" and print from gallery<br>
            • For best results, use Chrome browser on Android
          </div>
        </div>

        <script>
          

          // Auto-focus window for better user experience
          window.focus();
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
}

// Improved mobile/tablet printing method
function printNameTagMobile(student: Student, category: string) {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  if (!printWindow) {
    alert('Please allow popups for printing to work.');
    return;
  }

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Name Tag - ${student.nickname}</title>
        <style>
          body { font-family: Poppins, sans-serif; margin:0; padding:0; }
          .print-tag {
            width: 90mm; height: 29mm;
            display: grid; grid-template-columns: 1fr 2fr 1fr;
            align-items: center;
            padding: 2mm 4mm;
            background: white;
            box-sizing: border-box;
          }
          .print-left { font-size: 7pt; line-height: 1.2; }
          .print-center { text-align: center; font-size: 26pt; font-weight: bold; }
          .print-right { font-size: 8pt; font-weight: bold; text-align: right; }
          @page { size: 90mm 29mm; margin: 0; }
        </style>
      </head>
      <body>
        <div class="print-tag">
          <div class="print-left">
            <div>${student.parentName || 'Parent'}</div>
            <div>${student.parentPhone || 'Phone'}</div>
          </div>
          <div class="print-center">${student.nickname}</div>
          <div class="print-right">${category}</div>
        </div>
        <script>
          window.onload = () => { window.print(); window.onafterprint = () => window.close(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
}


// Main print function with improved device detection
export function printNameTag(student: Student) {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);

  // Detailed device detection
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent) || 
                   (window.screen && window.screen.width >= 768 && window.screen.height >= 1024) ||
                   (/android/i.test(userAgent) && !/mobile/i.test(userAgent));
  const isMobile = /mobile/i.test(userAgent) && !isTablet;
  const isDesktop = !isAndroid && !isIOS && !isTablet && !isMobile;

  if (isAndroid) {
    // Android devices (both mobile and tablet) - use popup method
    printNameTagAndroidFallback(student, category);
  } else if (isIOS && isTablet) {
    // iPad - use mobile method
    printNameTagMobile(student, category);
  } else if (isMobile) {
    // Mobile phones - use mobile method
    printNameTagMobile(student, category);
  } else {
    // Desktop - use iframe method
    printNameTagDesktop(student, category);
  }
}

// Quick print function for simple usage
export function quickPrintNameTag(student: Student) {
  printNameTag(student);
}

// Utility function to check if device supports printing
export function isPrintingSupported(): boolean {
  return 'print' in window && typeof window.print === 'function';
}

// Enhanced function for better Android tablet compatibility
export function printNameTagWithOptions(student: Student, options: { 
  forceMethod?: 'popup' | 'mobile' | 'desktop' | 'download';
  showPreview?: boolean;
} = {}) {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);
  
  switch (options.forceMethod) {
    case 'popup':
      printNameTagAndroidFallback(student, category);
      break;
    case 'mobile':
      printNameTagMobile(student, category);
      break;
    case 'desktop':
      printNameTagDesktop(student, category);
      break;
    default:
      printNameTag(student); // Use auto-detection
  }
}

// Debug function to test different print methods
export function debugPrintMethods(student: Student) {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);
  
  console.log('=== Debug Print Methods ===');
  console.log('Student:', student);
  console.log('Category:', category);
  console.log('User Agent:', navigator.userAgent);
  console.log('Screen size:', window.screen.width, 'x', window.screen.height);
  console.log('Print supported:', isPrintingSupported());
}

// Function to handle print errors gracefully
export function handlePrintError(student: Student, error: Error) {
  console.error('Print error:', error);
  
  const fallbackMessage = `
    ❌ Printing failed. Here are your options:
    
    1. Try downloading the image instead
    2. Use a different browser (Chrome works best)
    3. Check your printer settings (90mm x 29mm)
    4. Contact support if the issue persists
    
    Student: ${student.nickname}
    Error: ${error.message}
  `;

  }
}

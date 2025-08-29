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
        <title>Name Tag - ${student.nickname}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Arial, sans-serif;
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
            color: #333;
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
            color: #666;
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
            color: #666;
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
              font-family: Arial, sans-serif;
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
              border: 2px solid #000;
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
  const originalContent = document.body.innerHTML;
  const originalTitle = document.title;
  const scrollY = window.scrollY;

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Name Tag - ${student.nickname}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @media screen {
            body {
              font-family: Arial, sans-serif;
              background: #f5f5f5;
              padding: 15px;
              line-height: 1.4;
            }
            
            .screen-only {
              display: block;
            }
            
            .print-only {
              display: none;
            }
            
            .controls {
              text-align: center;
              margin-bottom: 25px;
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            }
            
            .controls h2 {
              color: #333;
              margin-bottom: 15px;
              font-size: 24px;
            }
            
            .student-info {
              background: #f8f9fa;
              padding: 15px;
              border-radius: 8px;
              margin: 15px 0;
              text-align: left;
            }
            
            .student-info div {
              margin: 8px 0;
              font-size: 15px;
            }
            
            .student-info strong {
              color: #555;
              display: inline-block;
              width: 80px;
            }
            
            .button {
              display: inline-block;
              padding: 15px 25px;
              margin: 8px;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: bold;
              text-decoration: none;
              cursor: pointer;
              transition: all 0.3s ease;
              min-width: 140px;
            }
            
            .print-btn {
              background: #2196F3;
              color: white;
            }
            
            .print-btn:hover {
              background: #1976D2;
              transform: translateY(-2px);
            }
            
            .back-btn {
              background: #4CAF50;
              color: white;
            }
            
            .back-btn:hover {
              background: #388E3C;
              transform: translateY(-2px);
            }
            
            
            .preview-container {
              background: white;
              padding: 25px;
              border-radius: 10px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              margin: 20px auto;
              max-width: 650px;
            }
            
            .preview-title {
              text-align: center;
              margin-bottom: 20px;
              color: #333;
              font-size: 20px;
            }
            
            .preview-tag {
              width: 100%;
              max-width: 500px;
              height: 160px;
              margin: 0 auto 20px auto;
              border: 3px solid #333;
              background: white;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 20px 30px;
              font-family: Arial, sans-serif;
              box-sizing: border-box;
            }
            
            .preview-left {
              flex: 0 0 auto;
              font-size: 13px;
              color: #666;
              line-height: 1.4;
              margin-right: 20px;
            }
            
            .preview-center {
              flex: 1;
              text-align: center;
              padding: 0 20px;
            }
            
            .preview-name {
              font-size: 26px;
              font-weight: bold;
              color: #000;
              word-wrap: break-word;
              line-height: 1.2;
            }
            
            .preview-right {
              flex: 0 0 auto;
              font-size: 18px;
              color: #666;
              font-weight: bold;
              margin-left: 20px;
            }

            .help-text {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              border-radius: 8px;
              margin-top: 20px;
              font-size: 14px;
              color: #856404;
            }

            /* Mobile responsive adjustments */
            @media screen and (max-width: 768px) {
              body {
                padding: 10px;
              }
              
              .controls {
                padding: 15px;
              }
              
              .button {
                padding: 12px 20px;
                font-size: 15px;
                margin: 5px;
                min-width: 120px;
              }
              
              .preview-tag {
                height: 130px;
                padding: 15px 20px;
              }
              
              .preview-name {
                font-size: 22px;
              }
              
              .preview-left,
              .preview-right {
                font-size: 12px;
              }
            }
          }

          @media print {
            .screen-only {
              display: none !important;
            }
            
            .print-only {
              display: block !important;
              position: absolute;      /* Crucial for mobile rendering */
              top: 0;                  /* Crucial for mobile rendering */
              left: 0;                 /* Crucial for mobile rendering */
            }

            html, body {
              width: 100%;
              height: 100%;
              margin: 0;
              padding: 0;
              background: white;
              font-family: Arial, sans-serif;
            }

            .print-tag {
              width: 90mm;
              height: 29mm;
              border: 2px solid black;
              background: white;
              display: table;
              table-layout: fixed;
              font-family: Arial, sans-serif;
            }
            
            .print-content {
              display: table-row;
              width: 100%;
              height: 100%;
            }
            
            .print-left {
              display: table-cell;
              width: 25%;
              padding: 3mm;
              font-size: 7pt;
              color: #333;
              vertical-align: top;
              line-height: 1.2;
            }
            
            .print-center {
              display: table-cell;
              width: 50%;
              text-align: center;
              vertical-align: middle;
              padding: 2mm;
            }
            
            .print-name {
              font-size: 12pt;
              font-weight: bold;
              color: black;
            }
            
            .print-right {
              display: table-cell;
              width: 25%;
              text-align: right;
              vertical-align: middle;
              padding: 3mm;
              font-size: 8pt;
              font-weight: bold;
              color: #333;
            }

            @page {
              size: 90mm 29mm;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="screen-only">
          <div class="controls">
            <h2>📋 Name Tag Preview</h2>
            
            <div class="student-info">
              <div><strong>Student:</strong> ${student.nickname}</div>
              <div><strong>Category:</strong> ${category}</div>
              <div><strong>Parent:</strong> ${student.parentName || 'Not specified'}</div>
              <div><strong>Phone:</strong> ${student.parentPhone || 'Not specified'}</div>
            </div>
            
            <div style="margin-top: 20px;">
              <button class="button print-btn" onclick="window.print()">🖨️ Print Tag</button>
              <button class="button back-btn" onclick="goBack()">← Back</button>
            </div>
            
            <div class="help-text">
              <strong>💡 Printing Instructions:</strong><br>
              • Set your printer to 90mm x 29mm label size<br>
              • If printing fails, try the Download option<br>
              • For Android tablets, download works better than direct printing
            </div>
          </div>

          <div class="preview-container">
            <h3 class="preview-title">Preview (Actual Size Will Be Smaller)</h3>
            <div class="preview-tag">
              <div class="preview-left">
                <div>${student.parentName || 'Parent'}</div>
                <div>${student.parentPhone || 'Phone'}</div>
              </div>
              <div class="preview-center">
                <div class="preview-name">${student.nickname}</div>
              </div>
              <div class="preview-right">
                ${category}
              </div>
            </div>
          </div>
        </div>

        <div class="print-only">
          <div class="print-tag">
            <div class="print-content">
              <div class="print-left">
                <div>${student.parentName || 'Parent'}</div>
                <div>${student.parentPhone || 'Phone'}</div>
              </div>
              <div class="print-center">
                <div class="print-name">${student.nickname}</div>
              </div>
              <div class="print-right">
                ${category}
              </div>
            </div>
          </div>
        </div>

        <script>
          function goBack() {
            window.history.back();
          }
          
          window.addEventListener('popstate', function() {
            goBack();
          });
        </script>
      </body>
    </html>
  `;

  // Replace page content
  document.body.innerHTML = printContent;
  document.title = `Name Tag - ${student.nickname}`;

  // Handle back navigation
  const handlePopstate = () => {
    document.body.innerHTML = originalContent;
    document.title = originalTitle;
    window.scrollTo(0, scrollY);
    window.removeEventListener('popstate', handlePopstate);
  };
  
  window.addEventListener('popstate', handlePopstate);
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

// Function to show print options (useful for UI)
export function showPrintOptions(student: Student) {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = /android/i.test(userAgent);
  const isIOS = /iphone|ipad|ipod/i.test(userAgent);
  
  const options = {
    canPrint: isPrintingSupported(),
    canDownload: true, // Canvas is widely supported
    recommendDownload: isAndroid, // Recommend download for Android
    deviceType: isAndroid ? 'android' : isIOS ? 'ios' : 'desktop',
    studentInfo: {
      name: student.nickname,
      category: category,
      parentName: student.parentName,
      parentPhone: student.parentPhone
    }
  };
  
  return options;
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
    case 'download':
      downloadNameTag(student);
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
  console.log('Options:', showPrintOptions(student));
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
  
  if (confirm(fallbackMessage + '\n\nWould you like to download the image instead?')) {
    downloadNameTag(student);
  }
}

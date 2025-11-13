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
// --- Desktop printing method (iframe) ---

// Desktop printing method (improved version)
function printNameTagDesktop(student: Student, category: string) {
  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Name Tag - ${student.nickname}</title>
        <style>
          @page {
            size: 90mm 29mm;
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            width: 90mm;
            height: 29mm;
            background: white;
          }
          
          .tag {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 2mm 4mm;
            position: relative;
            box-sizing: border-box;
          }
          
          .left-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            font-size: 8pt;
            color: #666;
            line-height: 1.1;
            min-width: 20mm;
          }
          
          .center-section {
            flex: 1;
            text-align: center;
            padding: 0 3mm;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .student-name {
            font-size: 14pt;
            font-weight: bold;
            color: #000;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }
          
          .right-section {
            font-size: 10pt;
            color: #666;
            font-weight: bold;
            min-width: 15mm;
            text-align: right;
          }

          * {
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        <div class="tag">
          <div class="left-section">
            <div>${student.parentName || 'Parent'}</div>
            <div>${student.parentPhone || 'Phone'}</div>
          </div>
          <div class="center-section">
            <div class="student-name">${student.nickname}</div>
          </div>
          <div class="right-section">
            ${category}
          </div>
        </div>
      </body>
    </html>
  `;

  // Create iframe for desktop printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.style.opacity = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(content);
    doc.close();
    
    // Wait for content to load
    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        
        // Clean up
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 2000);
      }, 500);
    };
  }
}

// Alternative desktop printing method using new window (more reliable)
function printNameTagDesktopAlternative(student: Student, category: string) {
  const printWindow = window.open('', '_blank', 'width=600,height=400');
  
  if (!printWindow) {
    alert('Please allow popups for printing to work');
    return;
  }

  const content = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Name Tag - ${student.nickname}</title>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          body {
            font-family: Poppins, sans-serif;
            background: #f0f0f0;
            padding: 20px;
            line-height: 1.4;
          }
          
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          }
          
          .header {
            text-align: center;
            margin-bottom: 20px;
            color: #333;
          }
          
          .preview-section {
            text-align: center;
            margin: 20px 0;
          }
          
          .tag-preview {
            width: 360px;
            height: 116px;
            border: 3px solid #000;
            margin: 20px auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 20px;
            background: white;
            box-sizing: border-box;
            font-family: Poppins, sans-serif;
          }
          
          .preview-left {
            font-size: 10px;
            color: #000;
            line-height: 1.3;
            text-align: left;
            flex: 0 0 auto;
            margin-right: 15px;
          }
          
          .preview-center {
            flex: 1;
            text-align: center;
            font-size: 18px;
            font-weight: bold;
            color: #000;
            padding: 0 15px;
          }
          
          .preview-right {
            font-size: 12px;
            color: #000;
            font-weight: bold;
            text-align: right;
            flex: 0 0 auto;
            margin-left: 15px;
          }
          
          .buttons {
            text-align: center;
            margin: 25px 0;
          }
          
          .btn {
            display: inline-block;
            padding: 12px 20px;
            margin: 8px;
            border-radius: 6px;
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
          }
          
          .btn-close {
            background: #666;
            color: white;
          }
          
          .btn-close:hover {
            background: #444;
          }
          
          .instructions {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
            font-size: 14px;
            color: #1976d2;
            border-left: 4px solid #2196F3;
          }

          /* Print styles for desktop */
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white;
              width: 90mm;
              height: 29mm;
            }
            
            .container {
              box-shadow: none;
              max-width: none;
              padding: 0;
              background: white;
              margin: 0;
            }
            
            .header,
            .preview-section,
            .buttons,
            .instructions {
              display: none !important;
            }
            
            .tag-preview {
              width: 90mm;
              height: 29mm;
              max-width: 90mm;
              margin: 0;
              border: 1px solid #000;
              padding: 2.5mm 4mm;
              position: absolute;
              top: 0;
              left: 0;
              display: flex;
              align-items: center;
              justify-content: space-between;
              background: white;
            }
            
            .preview-left {
              font-size: 7pt;
              margin-right: 3mm;
              flex: 0 0 auto;
            }
            
            .preview-center {
              font-size: 14pt;
              flex: 1;
              padding: 0 2mm;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            
            .preview-right {
              font-size: 8pt;
              margin-left: 3mm;
              flex: 0 0 auto;
            }

            @page {
              size: 90mm 29mm;
              margin: 0;
            }
            
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Desktop Print Preview</h2>
            <p>Name tag for: <strong>${student.nickname}</strong></p>
          </div>
          
          <div class="preview-section">
            <p><strong>Preview (scaled for screen):</strong></p>
            
            <div class="tag-preview">
              <div class="preview-left">
                <div>${student.parentName || 'Parent'}</div>
                <div>${student.parentPhone || 'Phone'}</div>
              </div>
              <div class="preview-center">${student.nickname}</div>
              <div class="preview-right">${category}</div>
            </div>
          </div>
          
          <div class="buttons">
            <button class="btn btn-print" onclick="window.print()">Print Name Tag</button>
            <button class="btn btn-close" onclick="window.close()">Close</button>
          </div>
          
          <div class="instructions">
            <strong>Desktop Printing Instructions:</strong><br>
            • Make sure your Brother QL-820NWB is selected as printer<br>
            • Set paper size to 90mm x 29mm in print settings<br>
            • If print dialog doesn't appear, check popup blockers
          </div>
        </div>

        <script>
          // Auto-focus for better printing
          window.focus();
          
          // Optional: Auto-print after delay (uncomment if wanted)
          // setTimeout(() => window.print(), 1500);
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus();
}


// --- IMPROVED PRINTING FUNCTIONS FOR ANDROID TABLETS ---

// New direct printing method for Android
function printNameTagAndroidDirect(student: Student, category: string) {
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
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet">
        <title>Printing Name Tag - ${student.nickname}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          @media print {
            body {
              padding: 0;
              background: white;
              font-family: Poppins, sans-serif;
              margin: 0;
            }

            .container {
              box-shadow: none;
              max-width: none;
              padding: 0;
              background: white;
            }

            .header{
              display: none !important;
            }

            hr {
              width: 100%;
              border: none;
              border-top: 2px solid black;
              margin: 4px 0 4px 0;
              margin-left: auto;
              margin-right: auto;
            }

            .print-tag {
              width: 90mm;
              height: 28mm; /* Keep the actual label height */
              max-width: 90mm;
              margin: 0;
              padding: 3mm 5mm;
              page-break-inside: avoid;
              /* Use absolute positioning to push content down */
              position: absolute;
              top: 0mm; /* This pushes the content down by 10mm */
              left: 0;
            }
            
            .print-left {
              font-size: 11pt;
              margin-right: 3mm;
            }
            
            .print-center {
              padding: 0 2mm;
            }
            
            .print-name {
              font-size: 18pt;
              margin-bottom: 0;
              text-align: center;
              font-weight: bold;
            }
            
            .print-right {
              font-size: 13pt;
              margin-left: 3mm;
              font-weight: bold;
            }
            
            .print-bottom {
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: flex-start;
              gap: 80px; /* Reduced from 150px to fit better on the label */
              margin-top: 3px;
            }

            @page {
              size: 90mm 28mm; /* Set to what the printer detects */
              margin: 0;
            }
          }

        </style>
      </head>
      <body>

        <div class="container">

          <div class="print-tag">
            <div class="print-name">${student.nickname}</div>
            <hr />
            <div class="print-bottom">
              <div class="print-left">
                <div>${student.parentName || 'Parent'}</div>
                <div>${student.parentPhone || 'Phone'}</div>
              </div>
              <div class="print-right">
                ${category}
              </div>
            </div>
          </div>
        </div>


        <script>
          // Detect when print dialog is closed (user printed or cancelled)
          window.onafterprint = function() {
            setTimeout(() => {
              window.close();
            }, 100);
          };

          // Wait for everything to load including fonts
          function doPrint() {
            try {
              window.focus();
              setTimeout(() => {
                window.print();
              }, 100);
            } catch (e) {
              console.error('Print error:', e);
            }
          }

          // Wait for fonts and images to load
          if (document.readyState === 'complete') {
            doPrint();
          } else {
            window.addEventListener('load', () => {
              // Extra delay for font loading on Android
              setTimeout(doPrint, 300);
            });
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(content);
  printWindow.document.close();
  printWindow.focus(); // Focus the new window to help trigger the print dialog
}

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
        <title>Name Tag - Student Name</title>
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
          
          hr {
            width: 60%;
            border: none;
            border-top: 2px solid black;
            margin: 3px 0 8px 0;
            margin-left: auto;
            margin-right: auto;
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
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            align-items: stretch;
            padding: 15px 25px;
            height: 140px;
          }
          
          .tag-left {
            text-align: left;
            font-size: 14px;
            color: #000;
          }
          
          
          .tag-name {
            text-align: center;
            font-size: 34px;
            font-weight: bold;
            color: #000;
            margin-bottom: 2px;
          }
          
          .tag-right {
            text-align: right;
            font-size: 18px;
            color: #000;
            font-weight: bold;
          }
          
          .tag-bottom {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: flex-start;
            gap: 150px;
            margin-top: 3px;
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
          
          /* Print styles - Fixed for your printer issue */
          @media print {
            body {
              padding: 0;
              background: white;
              font-family: Poppins, sans-serif;
              margin: 0;
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
            
            hr {
              width: 100%;
              border: none;
              border-top: 2px solid black;
              margin: 4px 0 4px 0;
              margin-left: auto;
              margin-right: auto;
            }
            
            .tag-preview {
              width: 90mm;
              height: 28mm; /* Keep the actual label height */
              max-width: 90mm;
              margin: 0;
              padding: 3mm 5mm;
              page-break-inside: avoid;
              /* Use absolute positioning to push content down */
              position: absolute;
              top: 0mm; /* This pushes the content down by 10mm */
              left: 0;
            }
            
            .tag-left {
              font-size: 11pt;
              margin-right: 3mm;
            }
            
            .tag-center {
              padding: 0 2mm;
            }
            
            .tag-name {
              font-size: 18pt;
              margin-bottom: 0;
            }
            
            .tag-right {
              font-size: 13pt;
              margin-left: 3mm;
            }
            
            .tag-bottom {
              display: flex;
              flex-direction: row;
              justify-content: center;
              align-items: flex-start;
              gap: 80px; /* Reduced from 150px to fit better on the label */
              margin-top: 3px;
            }

            @page {
              size: 90mm 28mm; /* Set to what the printer detects */
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
              <span class="info-value">${student.parentName || 'Parent'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">${student.parentPhone || 'Phone'}</span>
            </div>
          </div>
          
          <div class="tag-preview">
            <div class="tag-name">${student.nickname}</div>
            <hr />
            <div class="tag-bottom">
              <div class="tag-left">
                <div>${student.parentName || 'Parent'}</div>
                <div>${student.parentPhone || 'Phone'}</div>
              </div>
              <div class="tag-right">
                Love
              </div>
            </div>
          </div>
          
          <div class="buttons">
            <button class="btn btn-print" onclick="window.print()">🖨 Print Tag</button>
            <button class="btn btn-close" onclick="window.close()">✖ Close</button>
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
    printNameTagAndroidDirect(student, category);
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

// Trigger Preview again

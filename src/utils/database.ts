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

// --- Tablet-Compatible Printing Functions ---

// Main print function that detects device and uses appropriate method
export function printNameTag(student: Student) {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);

  // Check if device is mobile/tablet
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Also check for touch capability as additional indicator
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isMobileDevice || isTouchDevice) {
    // Use direct window printing for mobile devices
    printNameTagMobile(student, category);
  } else {
    // Use iframe method for desktop (your existing method can work here)
    printNameTagDesktop(student, category);
  }
}

// Mobile/Tablet printing method
function printNameTagMobile(student: Student, category: string) {
  // Store original content
  const originalContent = document.body.innerHTML;
  const originalTitle = document.title;
  
  // Store scroll position
  const scrollY = window.scrollY;

  // Create print content
  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Name Tag - ${student.nickname}</title>
        <style>
          /* Reset all styles */
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          /* Screen styles */
          @media screen {
            body {
              font-family: 'Arial', sans-serif;
              background: #f0f0f0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            
            .print-only {
              display: none;
            }
            
            .screen-message {
              text-align: center;
              font-size: 18px;
              color: #333;
              margin: 30px 0;
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .preview {
              background: white;
              border: 3px solid #333;
              margin: 20px auto;
              padding: 0;
              box-shadow: 0 4px 15px rgba(0,0,0,0.2);
              border-radius: 5px;
            }

            .back-button {
              position: fixed;
              top: 20px;
              left: 20px;
              background: #4CAF50;
              color: white;
              border: none;
              padding: 12px 20px;
              font-size: 16px;
              border-radius: 25px;
              cursor: pointer;
              z-index: 1000;
              box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }

            .print-button {
              background: #2196F3;
              color: white;
              border: none;
              padding: 15px 30px;
              font-size: 18px;
              border-radius: 25px;
              cursor: pointer;
              margin-top: 20px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
          }

          /* Print-specific styles */
          @media print {
            body {
              margin: 0;
              padding: 0;
              background: white;
            }

            .screen-message, .back-button, .print-button {
              display: none !important;
            }

            .preview {
              display: none !important;
            }

            .print-only {
              display: block !important;
              position: absolute;     
              top: 0;              
              left: 0;              
            }

            /* Set exact page size to match your Brother QL-820NWB sticker */
            @page {
              size: 90mm 29mm; /* Width x Height - matches your printer */
              margin: 0;
              padding: 0;
            }

            .tag {
              width: 90mm;
              height: 29mm;
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 2mm 4mm;
              font-family: 'Arial', sans-serif;
              background: white;
              border: 1px solid #000;
              position: relative;
              page-break-after: avoid;
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

            /* Ensure colors print correctly on all devices */
            * {
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }

          /* Preview styles for screen */
          .preview .tag {
            width: 270px; /* 3x scale for preview */
            height: 87px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 6px 12px;
            font-family: Arial, sans-serif;
            background: white;
            border: none;
            position: relative;
            box-sizing: border-box;
          }

          .preview .left-section {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            font-size: 11px;
            color: #666;
            line-height: 1.2;
            min-width: 60px;
          }

          .preview .center-section {
            flex: 1;
            text-align: center;
            padding: 0 9px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .preview .student-name {
            font-size: 18px;
            font-weight: bold;
            color: #000;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }

          .preview .right-section {
            font-size: 14px;
            color: #666;
            font-weight: bold;
            min-width: 45px;
            text-align: right;
          }

          /* Responsive adjustments */
          @media screen and (max-width: 768px) {
            .preview .tag {
              width: 240px;
              height: 78px;
              padding: 5px 10px;
            }
            
            .preview .student-name {
              font-size: 16px;
            }
            
            .preview .left-section {
              font-size: 10px;
            }
            
            .preview .right-section {
              font-size: 12px;
            }
          }
        </style>
      </head>
      <body>
        <button class="back-button" onclick="window.history.back()">← Back</button>
        
        <div class="screen-message">
          <h2>📋 Name Tag Preview</h2>
          <p>This is how your name tag will look when printed</p>
          <p><strong>Student:</strong> ${student.nickname}</p>
          <p><strong>Category:</strong> ${category}</p>
          <button class="print-button" onclick="window.print()">🖨️ Print Name Tag</button>
        </div>

        <div class="preview">
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
        </div>

        <!-- This will only show when printing -->
        <div class="print-only">
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
        </div>
      </body>
    </html>
  `;

  // Replace body content
  document.body.innerHTML = printContent;
  document.title = `Name Tag - ${student.nickname}`;

  // Add event listener for back navigation
  const handlePopstate = () => {
    document.body.innerHTML = originalContent;
    document.title = originalTitle;
    window.scrollTo(0, scrollY);
    window.removeEventListener('popstate', handlePopstate);
  };
  
  window.addEventListener('popstate', handlePopstate);

  // Auto-print after a delay (optional - user can also click the print button)
  setTimeout(() => {
    // Uncomment the line below if you want automatic printing
    // window.print();
  }, 1000);
}

// Desktop printing method (improved version of your existing code)
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
            border: 1px solid #000;
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

// Alternative: Generate downloadable image for problematic devices
export function generateNameTagImage(student: Student): Promise<string> {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      resolve('');
      return;
    }
    
    // Set canvas size (90mm x 29mm at 300 DPI)
    canvas.width = 1063; // 90mm at 300 DPI
    canvas.height = 343;  // 29mm at 300 DPI
    
    // Fill background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw border
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    
    // Left section - Parent info
    ctx.fillStyle = '#666';
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(student.parentName || 'Parent', 40, 60);
    ctx.fillText(student.parentPhone || 'Phone', 40, 100);
    
    // Center section - Student name
    ctx.fillStyle = 'black';
    ctx.font = 'bold 42px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Handle long names
    let fontSize = 42;
    ctx.font = `bold ${fontSize}px Arial`;
    while (ctx.measureText(student.nickname).width > 400 && fontSize > 20) {
      fontSize -= 2;
      ctx.font = `bold ${fontSize}px Arial`;
    }
    
    ctx.fillText(student.nickname, canvas.width / 2, canvas.height / 2);
    
    // Right section - Category
    ctx.fillStyle = '#666';
    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(category, canvas.width - 40, canvas.height / 2);
    
    // Convert to data URL
    resolve(canvas.toDataURL('image/png'));
  });
}

// Function to download name tag as image (useful for tablets)
export async function downloadNameTag(student: Student) {
  try {
    const dataUrl = await generateNameTagImage(student);
    
    // Create blob for better browser compatibility
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = `${student.nickname.replace(/[^a-zA-Z0-9]/g, '_')}_nametag.png`;
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    };
    
    img.src = dataUrl;
  } catch (error) {
    console.error('Error generating name tag image:', error);
    
    // Fallback: try direct data URL download
    const dataUrl = await generateNameTagImage(student);
    const link = document.createElement('a');
    link.download = `${student.nickname.replace(/[^a-zA-Z0-9]/g, '_')}_nametag.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

// Quick print function for simple usage
export function quickPrintNameTag(student: Student) {
  // Force mobile printing method for better tablet compatibility
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);
  printNameTagMobile(student, category);
}

// Utility function to check if device supports printing
export function isPrintingSupported(): boolean {
  return 'print' in window && typeof window.print === 'function';
}

// Function to show print options (useful for UI)
export function showPrintOptions(student: Student) {
  const age = calculateAge(student.dateOfBirth);
  const category = getCategory(age);
  
  const options = {
    canPrint: isPrintingSupported(),
    canDownload: 'canvas' in document.createElement('canvas'),
    studentInfo: {
      name: student.nickname,
      category: category,
      parentName: student.parentName,
      parentPhone: student.parentPhone
    }
  };
  
  return options;
}

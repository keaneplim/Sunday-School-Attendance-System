import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import { getStudents, getAttendanceRecords, isSunday, getCurrentSession, clearAllData } from '../utils/database';
import { Student, AttendanceRecord } from '../types';
import { format } from 'date-fns';
import { ADMIN_PASSWORD_CLEAR_DATA } from '../App'; // Import the admin password


export const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [studentsData, attendanceData] = await Promise.all([
        getStudents(),
        getAttendanceRecords()
      ]);
      setStudents(studentsData);
      setAttendanceRecords(attendanceData);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  // Helper function to find a student by ID from the fetched list
  const getStudentById = (id: string) => students.find(s => s.id === id);

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayAttendance = attendanceRecords.filter(record => 
    record.checkinTimestamp.startsWith(today)
  );

  const sessionCounts = {
    '09:30': todayAttendance.filter(r => r.sessionTime === '09:30').length,
    '11:00': todayAttendance.filter(r => r.sessionTime === '11:00').length,
    '14:00': todayAttendance.filter(r => r.sessionTime === '14:00').length,
    '16:00': todayAttendance.filter(r => r.sessionTime === '16:00').length,
  };

  const totalToday = Object.values(sessionCounts).reduce((sum, count) => sum + count, 0);

  const recentCheckIns = todayAttendance
    .sort((a, b) => new Date(b.checkinTimestamp).getTime() - new Date(a.checkinTimestamp).getTime())
    .slice(0, 10)
    .map(record => {
      const student = getStudentById(record.studentId);
      return { ...record, student };
    });

  const currentSessionDisplay = () => {
    if (!isSunday()) {
      return 'Not Sunday';
    }
    const session = getCurrentSession();
    switch (session) {
      case '09:30': return '9:30 AM';
      case '11:00': return '11:00 AM';
      case '14:00': return '2:00 PM';
      case '16:00': return '4:00 PM';
      default: return 'Not Sunday';
    }
  };

  const stats = [
    {
      title: 'Total Students',
      value: students.length,
    },
    {
      title: 'Today\'s Attendance',
      value: totalToday,
    },
    {
      title: 'Current Session',
      value: currentSessionDisplay(),
    },
    {
      title: 'This Week',
      value: attendanceRecords.filter(r => new Date(r.checkinTimestamp) > new Date(new Date().setDate(new Date().getDate() - 7))).length,
    },
  ];

  
  const handleClearData = async () => {
    const password = prompt("This is a destructive action. Please enter the admin password to proceed.");

    if (password === null) { // User clicked 'Cancel'
        return; 
    }

    if (password === ADMIN_PASSWORD_CLEAR_DATA) {
        const confirmation = window.confirm("Password correct. FINAL CONFIRMATION: Are you sure you want to permanently delete all records?");
        if (confirmation) {
            try {
                await clearAllData();
                alert("All application data has been cleared successfully.");
                fetchData(); // Refresh the dashboard data
            } catch (error) {
                alert("An error occurred while clearing the data. Please check the server and try again.");
                console.error(error);
            }
        }
    } else {
        alert("Incorrect password. Data clearing has been cancelled.");
    }
  };
  

  if (isLoading) {
    return <div className="p-6 text-center">Loading dashboard...</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="font-bold text-gray-900 mb-2 text-[clamp(1.5rem,4vw,1.875rem)]">Dashboard</h2>
        <p className="text-gray-600 text-[clamp(0.875rem,2vw,1rem)]">
          {isSunday() 
            ? "Welcome back! Here's what's happening today." 
            : "Today is not Sunday. The system is ready for the next Sunday School session."
          }
        </p>
      </div>

      {!isSunday() && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6 mb-8">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-orange-800 text-[clamp(1rem,3vw,1.125rem)]">Not Sunday</h3>
              <p className="text-orange-700 text-[clamp(0.875rem,2vw,1rem)]">
                Sunday School sessions are only available on Sundays. Check-in will be enabled on the next Sunday.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="font-bold text-gray-900 mt-1 text-[clamp(1.875rem,5vw,2.25rem)]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-[clamp(1.125rem,3vw,1.25rem)]">Today's Sessions</h3>
          <div className="space-y-4">
            {Object.entries(sessionCounts).map(([time, count]) => (
              <div key={time} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 text-[clamp(0.875rem,2vw,1rem)]">{time === '09:30' ? '9:30 AM Service' : time === '11:00' ? '11:00 AM Service' : time === '14:00' ? '2:00 PM Service' : '4:00 PM Service'}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{count} students checked in</p>
                </div>
                <div className="font-bold text-blue-600 text-[clamp(1.25rem,4vw,1.5rem)]">{count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="font-semibold text-gray-900 mb-4 text-[clamp(1.125rem,3vw,1.25rem)]">Recent Check-ins</h3>
          <div className="space-y-3">
            {recentCheckIns.length > 0 ? recentCheckIns.map((checkIn) => (
              <div key={checkIn.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 text-[clamp(0.875rem,2vw,1rem)]">
                    {checkIn.student ? `${checkIn.student.firstName} ${checkIn.student.lastName}` : 'Unknown Student'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {format(new Date(checkIn.checkinTimestamp), 'h:mm a')} - Session {checkIn.sessionTime}
                  </p>
                </div>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">
                {isSunday() ? 'No check-ins today yet' : 'No check-ins available (not Sunday)'}
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* Uncomment this to clear data after it is backed up, if i show it to dashboard probably user will like to press it */}
      <div className="mt-12">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Actions</h3>
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Danger Zone</h3>
                    <div className="mt-2 text-sm text-red-700">
                        <p>Clearing all data will permanently delete every student and all attendance history. This action cannot be undone. Please make sure you have a backup first.</p>
                    </div>
                    <div className="mt-4">
                        <button
                            onClick={handleClearData}
                            className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div> 

    </div>
  );
};
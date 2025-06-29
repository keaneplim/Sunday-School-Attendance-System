import React from 'react';
import { Users, Clock, TrendingUp, Calendar, AlertCircle } from 'lucide-react';
import { Database, isSunday } from '../utils/database';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
  const students = Database.getStudents();
  const attendanceRecords = Database.getAttendanceRecords();
  
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
      const student = Database.getStudentById(record.studentId);
      return { ...record, student };
    });

  const currentSessionDisplay = () => {
    if (!isSunday()) {
      return 'It is not Sunday';
    }
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const time = hours * 100 + minutes;

    if (time < 1030) return '9:30 AM';
    if (time < 1330) return '11:00 AM';
    if (time < 1500) return '2:00 PM';
    return '4:00 PM';
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
      value: todayAttendance.length,
    },
  ];

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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
        {/* Session Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-[clamp(1.125rem,3vw,1.25rem)]">Today's Sessions</h3>
          <div className="space-y-4">
            {[
              { time: '09:30', label: '9:30 AM Service', count: sessionCounts['09:30'] },
              { time: '11:00', label: '11:00 AM Service', count: sessionCounts['11:00'] },
              { time: '14:00', label: '2:00 PM Service', count: sessionCounts['14:00'] },
              { time: '16:00', label: '4:00 PM Service', count: sessionCounts['16:00'] },
            ].map((session) => (
              <div key={session.time} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-sm sm:text-base text-gray-900 text-[clamp(0.875rem,2vw,1rem)]">{session.label}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{session.count} students checked in</p>
                </div>
                <div className="text-xl sm:text-2xl font-bold text-blue-600 text-[clamp(1.25rem,4vw,1.5rem)]">{session.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-[clamp(1.125rem,3vw,1.25rem)]">Recent Check-ins</h3>
          <div className="space-y-3">
            {recentCheckIns.length > 0 ? recentCheckIns.map((checkIn) => (
              <div key={checkIn.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div>
                  <p className="font-medium text-sm sm:text-base text-gray-900 text-[clamp(0.875rem,2vw,1rem)]">
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
    </div>
  );
};
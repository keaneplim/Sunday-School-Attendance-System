import React, { useState, useEffect } from 'react';
import { Download, Filter } from 'lucide-react';
import { getStudents, getAttendanceRecords, calculateAge, getCategory } from '../utils/database';
import { Student, AttendanceRecord } from '../types';
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  startOfYear,
  endOfDay,
} from 'date-fns';

export const Reports: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dateRange, setDateRange] = useState('thisWeek');
  const [selectedSession, setSelectedSession] = useState('all');
  const [customDates, setCustomDates] = useState({
    start: format(new Date(), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [studentsData, attendanceData] = await Promise.all([
        getStudents(),
        getAttendanceRecords(),
      ]);
      setStudents(studentsData);
      setAttendanceRecords(attendanceData);
      setIsLoading(false);
    };

    fetchData();
  }, []);
  
  const getStudentById = (id: string) => students.find(s => s.id === id);

  const now = new Date();
  let startDate: Date, endDate: Date;

  switch (dateRange) {
    case 'today':
      startDate = now;
      endDate = now;
      break;
    case 'thisWeek':
      startDate = startOfWeek(now, { weekStartsOn: 0 });
      endDate = endOfWeek(now, { weekStartsOn: 0 });
      break;
    case 'last7days':
        startDate = subDays(now, 6);
        endDate = now;
        break;
    case 'thisMonth':
      startDate = startOfMonth(now);
      endDate = endOfMonth(now);
      break;
    case 'thisYear':
      startDate = startOfYear(now);
      endDate = now;
      break;
    case 'custom':
      startDate = new Date(customDates.start);
      endDate = new Date(customDates.end);
      break;
    default:
      startDate = startOfWeek(now, { weekStartsOn: 0 });
      endDate = endOfWeek(now, { weekStartsOn: 0 });
  }

  const inclusiveEndDate = endOfDay(endDate);

  const filteredRecords = attendanceRecords.filter((record) => {
    const recordDate = new Date(record.checkinTimestamp);
    const inDateRange = recordDate >= startDate && recordDate <= inclusiveEndDate;
    const inSession = selectedSession === 'all' || record.sessionTime === selectedSession;
    return inDateRange && inSession;
  });

  const uniqueStudents = new Set(filteredRecords.map((r) => r.studentId)).size;
  const totalAttendance = filteredRecords.length;
  
  const activeSessions = new Set(filteredRecords.map(r => r.sessionTime));
  const numberOfActiveSessions = activeSessions.size > 0 ? activeSessions.size : 1;

  const sessionBreakdown = {
    '09:30': filteredRecords.filter((r) => r.sessionTime === '09:30').length,
    '11:00': filteredRecords.filter((r) => r.sessionTime === '11:00').length,
    '14:00': filteredRecords.filter((r) => r.sessionTime === '14:00').length,
    '16:00': filteredRecords.filter((r) => r.sessionTime === '16:00').length,
  };

  const categoryBreakdown = filteredRecords.reduce((acc, record) => {
    const student = getStudentById(record.studentId);
    if (student) {
      const age = calculateAge(student.dateOfBirth);
      const category = getCategory(age);
      if (!acc[category]) acc[category] = 0;
      acc[category]++;
    }
    return acc;
  }, {} as Record<string, number>);

  const recentAttendance = filteredRecords
    .sort((a, b) => new Date(b.checkinTimestamp).getTime() - new Date(a.checkinTimestamp).getTime())
    .slice(0, 20)
    .map((record) => {
      const student = getStudentById(record.studentId);
      return { ...record, student };
    });

  const stats = [
    { title: 'Total Attendance', value: totalAttendance },
    { title: 'Unique Students', value: uniqueStudents },
    { title: 'Average per Session', value: Math.round(totalAttendance / numberOfActiveSessions) || 0 },
    { title: 'Attendance Rate', value: students.length > 0 ? `${Math.round((uniqueStudents / students.length) * 100)}%` : '0%' },
  ];

  const handlePrint = () => {
    window.print();
  };
  
  if (isLoading) {
    return <div className="p-6 text-center">Loading report data...</div>;
  }
  
  return (
    <div id="report-container" className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-bold text-gray-900 mb-2 text-[clamp(1.25rem,4vw,1.875rem)]">
            Attendance Reports
          </h2>
          <p className="text-gray-600">Analyze attendance patterns and trends</p>
          <p className="text-[10px] text-gray-400 mt-1">V1.0.0.5</p>
        </div>
        <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Download className="h-4 w-4" />
          <span>Export Report</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="thisWeek">This Week</option>
              <option value="last7days">Last 7 Days</option>
              <option value="thisMonth">This Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          {dateRange === 'custom' && (
            <>
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates({ ...customDates, start: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={customDates.end}
                  onChange={(e) => setCustomDates({ ...customDates, end: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Session</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sessions</option>
              <option value="09:30">9:30 AM</option>
              <option value="11:00">11:00 AM</option>
              <option value="14:00">2:00 PM</option>
              <option value="16:00">4:00 PM</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="font-bold text-gray-900 mt-1 text-[clamp(1.5rem,5vw,2.25rem)]">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="print-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(sessionBreakdown).map(([time, count]) => {
              const percentage = totalAttendance > 0 ? (count / totalAttendance) * 100 : 0;
              return (
                <div key={time} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">{time === '09:30' ? '9:30 AM Service' : time === '11:00' ? '11:00 AM Service' : time === '14:00' ? '2:00 PM Service' : '4:00 PM Service'}</span>
                    <span className="text-sm text-gray-600">{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="print-card bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Age Group Breakdown</h3>
          <div className="space-y-4">
            {Object.keys(categoryBreakdown).length > 0 ? Object.entries(categoryBreakdown).map(([category, count]) => {
              const percentage = totalAttendance > 0 ? (count / totalAttendance) * 100 : 0;
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <span className="text-sm text-gray-600">{count} ({Math.round(percentage)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 text-center py-4">No data for this period.</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="print-card bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="border-b border-gray-200">
                          <th className="pb-3 text-sm font-medium text-gray-600">Student</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Age Group</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Session</th>
                          <th className="pb-3 text-sm font-medium text-gray-600">Check-in Time</th>
                      </tr>
                  </thead>
                  <tbody>
                      {recentAttendance.map((record) => (
                          <tr key={record.id} className="border-b border-gray-100">
                              <td className="py-3 text-sm text-gray-900">
                                  {record.student ? `${record.student.firstName} ${record.student.lastName}` : 'Unknown Student'}
                              </td>
                              <td className="py-3 text-sm text-gray-600">
                                  {record.student ? getCategory(calculateAge(record.student.dateOfBirth)) : 'N/A'}
                              </td>
                              <td className="py-3 text-sm text-gray-600">
                                  {record.sessionTime === '09:30' ? '9:30 AM' : record.sessionTime === '11:00' ? '11:00 AM' : record.sessionTime === '14:00' ? '2:00 PM' : '4:00 PM'}
                              </td>
                              <td className="py-3 text-sm text-gray-600">
                                  {format(new Date(record.checkinTimestamp), 'MMM d, yyyy h:mm a')}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
              {recentAttendance.length === 0 && (
                  <div className="text-center py-8">
                      <p className="text-gray-500">No attendance records found for the selected period</p>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
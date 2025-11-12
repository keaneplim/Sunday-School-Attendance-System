import React, { useState, useEffect } from 'react';
import { Search, Printer, UserCheck, AlertTriangle, AlertCircle } from 'lucide-react';
import { addAttendanceRecord, getStudents, calculateAge, getCategory, getCurrentSession, isSunday, printNameTag } from '../utils/database';
import { Student } from '../types';
import { format } from 'date-fns';

export const CheckIn: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingStudents, setIsFetchingStudents] = useState(true);

  useEffect(() => {
    getStudents().then(students => {
      setAllStudents(students);
      setIsFetchingStudents(false);
    });
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      const results = allStudents.filter(student =>
        student.firstName.toLowerCase().includes(lowerQuery) ||
        student.lastName.toLowerCase().includes(lowerQuery)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allStudents]);

  const handleCheckIn = async (student: Student) => {
    if (!isSunday()) {
      alert('Check-in is only available on Sundays!');
      return;
    }

    setIsLoading(true);
    setSelectedStudent(student);

    try {
      const currentSession = getCurrentSession();
      await addAttendanceRecord(student.id, currentSession);
      
      // Call the new print function
      printNameTag(student);

      setIsCheckedIn(true);
      
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        setIsCheckedIn(false);
        setSelectedStudent(null);
        setSearchQuery('');
      }, 3000);
    }
  };

  const NameTagPreview = ({ student }: { student: Student }) => {
    const age = calculateAge(student.dateOfBirth);
    const category = getCategory(age);
    
    return (
      <div className="bg-white border-2 border-gray-300 rounded-lg p-4 w-80 mx-auto">
        <div className="text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{student.firstName} {student.lastName}</h3>
          <p className="text-lg text-blue-600 font-semibold mb-2">{category}</p>
          {student.medicalNotes && (
            <div className="flex items-center justify-center text-red-600 mb-2">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Medical Alert
            </div>
          )}
          <p className="text-sm text-gray-600">{format(new Date(), 'MMM d, hh:mm a')}</p>
        </div>
      </div>
    );
  };

  if (isCheckedIn && selectedStudent) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <div className="mb-8">
            <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <UserCheck className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="font-bold text-gray-900 mb-2 text-[clamp(1.25rem,4vw,1.875rem)]">Check-in Successful!</h2>
            <p className="text-gray-600">Printing name tag...</p>
          </div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Name Tag Preview</h3>
            <NameTagPreview student={selectedStudent} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="font-bold text-gray-900 mb-2 text-[clamp(1.25rem,4vw,1.875rem)]">Student Check-in</h2>
        <p className="text-gray-600">
          {isSunday() ? "Search for a student and check them in for today's session" : "Check-in is only available on Sundays"}
        </p>
        <p className="text-[10px] text-gray-400 mt-1">V1.0.1.0</p>
      </div>

      {!isSunday() && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-orange-600" />
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Check-in Not Available</h3>
              <p className="text-orange-700">
                Student check-in is only available on Sundays during Sunday School sessions.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder={isFetchingStudents ? "Loading students..." : isSunday() ? "Search by first or last name..." : "Check-in disabled (not Sunday)"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={!isSunday() || isFetchingStudents}
            className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg ${!isSunday() || isFetchingStudents ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            autoFocus={isSunday()}
          />
        </div>

        {isSunday() && searchResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 mb-3">Found {searchResults.length} student(s)</p>
            {searchResults.map((student) => {
              const age = calculateAge(student.dateOfBirth);
              const category = getCategory(age);
              return (
                <div key={student.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{student.firstName} {student.lastName}</h3>
                        <p className="text-sm text-gray-600">Age {age} • {category} • Parent: {student.parentName}</p>
                        {student.medicalNotes && (
                          <div className="flex items-center text-red-600 text-sm mt-1">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Medical: {student.medicalNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => handleCheckIn(student)} disabled={isLoading} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Printer className="h-4 w-4" />
                        <span>Check-in & Print</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
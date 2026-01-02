import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, User, Phone, Calendar, AlertTriangle, Trash2 } from 'lucide-react';
import { getStudents, addStudent, updateStudent, deleteStudent, calculateAge, getCategory } from '../utils/database';
import { Student } from '../types';
import { format } from 'date-fns';

// This StudentForm component remains unchanged and should be at the top of the file.
const StudentForm = ({
  formData,
  handleSubmit,
  resetForm,
  editingStudent,
  formErrors,
  handleInputChange,
}: {
  formData: any;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  editingStudent: Student | null;
  formErrors: { firstName?: string; lastName?: string; nickname?: string; parentPhone?: string; };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      {editingStudent ? 'Edit Student' : 'Add New Student'}
    </h3>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nickname *</label>
          <input
              type="text"
              name="nickname"
              required
              value={formData.nickname}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.nickname ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
          />
          {formErrors.nickname && <p className="mt-2 text-sm text-red-600">{formErrors.nickname}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            name="firstName"
            required
            value={formData.firstName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
        />
        {formErrors.firstName && <p className="mt-2 text-sm text-red-600">{formErrors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
          />
          {formErrors.lastName && <p className="mt-2 text-sm text-red-600">{formErrors.lastName}</p>}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
          <input
            type="date"
            name="dateOfBirth"
            required
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
          <select
            name="grade"
            required
            value={formData.grade}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Grade</option>
            <option value="Belum Sekolah">Belum Sekolah</option>
            <option value="TK">TK</option>
            <option value="SD 1">SD 1</option>
            <option value="SD 2">SD 2</option>
            <option value="SD 3">SD 3</option>
            <option value="SD 4">SD 4</option>
            <option value="SD 5">SD 5</option>
            <option value="SD 6">SD 6</option>
            <option value="Teenager">Teenager</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name *</label>
          <input
            type="text"
            name="parentName"
            required
            value={formData.parentName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone Number *</label>
          <input
            type="tel"
            name="parentPhone"
            required
            value={formData.parentPhone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.parentPhone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
          />
          {formErrors.parentPhone && <p className="mt-2 text-sm text-red-600">{formErrors.parentPhone}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medical/Allergy Notes</label>
        <textarea
          name="medicalNotes"
          value={formData.medicalNotes}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Any allergies, medical conditions, or special instructions..."
        />
      </div>
      <div className="flex justify-end space-x-3">
        <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {editingStudent ? 'Update Student' : 'Add Student'}
        </button>
      </div>
    </form>
  </div>
);

// --- START: SECURITY IMPROVEMENT ---
// Define props to accept the adminSecret, which can be null if not logged in
interface StudentsProps {
  adminSecret: string | null;
  isAdmin: boolean;
}

export const Students: React.FC<StudentsProps> = ({ adminSecret, isAdmin  }) => {
// --- END: SECURITY IMPROVEMENT ---
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    nickname: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    grade: '',
    parentName: '',
    parentPhone: '',
    medicalNotes: '',
  });

  const [formErrors, setFormErrors] = useState({
    nickname: '',
    firstName: '',
    lastName: '',
    parentPhone: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setIsLoading(true);
    const fetchedStudents = await getStudents();
    setStudents(fetchedStudents);
    setIsLoading(false);
  };

  const filteredStudents = searchQuery
    ? students.filter(
        (student) =>
          student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : students;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    let error = '';
    if (name === 'nickname') {
      if (value.trim() === '') error = 'This field is required.';
      else if (value.length > 17) error = 'Nickname cannot be more than 17 characters.';
    } else if (name === 'firstName' || name === 'lastName') {
      if (value.trim() === '') error = 'This field is required.';
    } else if (name === 'parentPhone') {
      const phoneRegex = /^[0-9]*$/;
      if (value.trim() !== '' && !phoneRegex.test(value)) {
        error = "Please enter numbers only.";
      }
    }
    setFormErrors(prevErrors => ({ ...prevErrors, [name]: error }));
  };

  const resetForm = () => {
    setFormData({
      nickname: '',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      grade: '',
      parentName: '',
      parentPhone: '',
      medicalNotes: '',
    });
    setShowAddForm(false);
    setEditingStudent(null);
    setFormErrors({ nickname: '', firstName: '', lastName: '', parentPhone: '' });
  };

  // --- START: SECURITY IMPROVEMENT ---
  // This is the fully corrected handleSubmit function for the "kiosk" workflow.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(formErrors).some(error => error !== '')) {
      alert("Please fix the errors before submitting.");
      return;
    }
    
    // --- ADD THIS CHECK ---
    // Both roles need a token (secret) to add or edit.
    if (!adminSecret) {
        alert("An authentication error occurred. Please log out and log back in.");
        return;
    }
    // --- END OF ADDED CHECK ---

    try {
      if (editingStudent) {
        if (!isAdmin) {
          alert("You do not have permission to edit students.");
          return;
        }
        // Now TypeScript knows adminSecret is a string here
        await updateStudent(editingStudent.id, formData, adminSecret);
      } else {
        // Now TypeScript knows adminSecret is a string here
        await addStudent(formData, adminSecret);
      }
      await fetchStudents();
      resetForm();
    } catch (error) {
      alert("An error occurred. You may not have permission for this action.");
      console.error(error);
    }
};

  const handleEdit = (student: Student) => {
    // Editing requires being logged in
    if (!isAdmin) {
        alert("You must be an admin to edit students.");
        return;
    }
    setEditingStudent(student);
    setFormData({
      nickname: student.nickname ?? '',
      firstName: student.firstName ?? '',
      lastName: student.lastName ?? '',
      dateOfBirth: student.dateOfBirth ?? '',
      grade: student.grade ?? '',
      parentName: student.parentName ?? '',
      parentPhone: student.parentPhone ?? '',
      medicalNotes: student.medicalNotes ?? '',
    });
    setFormErrors({ nickname: '', firstName: '', lastName: '', parentPhone: '' });
    setShowAddForm(true);
  };

  const handleDelete = async (studentId: string, studentName: string) => {
    if (!isAdmin) {
      alert("You must be an admin to delete students.");
      return;
    }

    if (window.confirm(`Are you sure you want to remove ${studentName}? This action cannot be undone.`)) {
      // --- ADD THIS CHECK ---
      if (!adminSecret) {
        alert("Authentication error. Please log out and log back in.");
        return;
      }
      // --- END OF ADDED CHECK ---
      
      try {
        // Now TypeScript knows adminSecret is a string here
        await deleteStudent(studentId, adminSecret);
        await fetchStudents();
      } catch (error) {
        alert("An error occurred while deleting the student. You may not have permission.");
        console.error(error);
      }
    }
};
  // --- END: SECURITY IMPROVEMENT ---

  if (isLoading) {
    return <div className="p-6 text-center">Loading students...</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="font-bold text-gray-900 mb-2 text-[clamp(1.25rem,4vw,1.875rem)]">Student Management</h2>
          <p className="text-[10px] text-gray-400 mt-1">V1.0.2.0</p>
        </div>
        {/* The "Add Student" button is now ALWAYS visible */}
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* The form is shown if showAddForm is true (no admin check needed here) */}
      {showAddForm && (
        <StudentForm
          formData={formData}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          editingStudent={editingStudent}
          formErrors={formErrors}
          handleInputChange={handleInputChange}
        />
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => {
          const age = calculateAge(student.dateOfBirth);
          const category = getCategory(student.grade || '');
          return (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 rounded-full p-2">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-base sm:text-lg text-gray-900">
                        {student.firstName} {student.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{category} • {student.grade}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    Age {age} ({format(new Date(student.dateOfBirth), 'MMM d, yyyy')})
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {student.parentName}
                  </div>
                  <div className="text-gray-600">{student.parentPhone}</div>
                  {student.medicalNotes && (
                    <div className="flex items-start text-red-600 mt-3">
                      <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{student.medicalNotes}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons are only shown if an admin is logged in */}
              {isAdmin && (
                <div className="border-t border-gray-200 mt-4 pt-4 flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(student)}
                    className="text-gray-500 hover:text-blue-600 p-2 rounded-full transition-colors"
                    title="Edit Student"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(student.id, `${student.firstName} ${student.lastName}`)}
                    className="text-gray-500 hover:text-red-600 p-2 rounded-full transition-colors"
                    title="Remove Student"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg mb-2">
            {searchQuery ? 'No students found' : 'No students registered yet'}
          </p>
          <p className="text-gray-400">
            {searchQuery ? 'Try a different search term' : 'Add your first student to get started'}
          </p>
        </div>
      )}
    </div>
  );
};
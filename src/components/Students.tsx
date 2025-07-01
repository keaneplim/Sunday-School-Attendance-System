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
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      {editingStudent ? 'Edit Student' : 'Add New Student'}
    </h3>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          {/* 1. Update the label */}
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
            name="parentPhone"  // The name should be "parentPhone"
            required
            value={formData.parentPhone} // The value should be formData.parentPhone
            onChange={handleInputChange}
            // The className should check for formErrors.parentPhone
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent ${formErrors.parentPhone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
          />
          {/* The error message should check for formErrors.parentPhone */}
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

// This is the main component, updated to work with the backend.
export const Students: React.FC = () => {
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
    parentName: '',
    parentPhone: '',
    medicalNotes: '',
  });

  // Fetch students from the backend when the component first loads

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


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      parentName: '',
      parentPhone: '',
      medicalNotes: '',
    });
    setShowAddForm(false);
    setEditingStudent(null);
    setFormErrors({ nickname: '', firstName: '', lastName: '', parentPhone: '' }); 

  };

  // This function is now async to work with the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.values(formErrors).some(error => error !== '')) {
      alert("Please fix the errors before submitting.");
      return;
  }

    if (editingStudent) {
      await updateStudent(editingStudent.id, formData);
    } else {
      await addStudent(formData);
    }

    await fetchStudents(); // Re-fetch students to show the changes
    resetForm();
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nickname: student.nickname ?? '',
      firstName: student.firstName ?? '',
      lastName: student.lastName ?? '',
      dateOfBirth: student.dateOfBirth ?? '',
      parentName: student.parentName ?? '',
      parentPhone: student.parentPhone ?? '',
      medicalNotes: student.medicalNotes ?? '',
    });
    setFormErrors({ nickname: '', firstName: '', lastName: '', parentPhone: '' });
    setShowAddForm(true);
  };

  // New function to handle deleting a student
  const handleDelete = async (studentId: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to remove ${studentName}? This action cannot be undone.`)) {
      await deleteStudent(studentId);
      await fetchStudents(); // Re-fetch students to update the list
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading students...</div>;
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="font-bold text-gray-900 mb-2 text-[clamp(1.25rem,4vw,1.875rem)]">Student Management</h2>
          
        </div>
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Student</span>
        </button>
      </div>

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
          const category = getCategory(age);
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
                      <p className="text-sm text-gray-600">{category}</p>
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

              {/* Action buttons are now at the bottom */}
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
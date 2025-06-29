import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, User, Phone, Calendar, AlertTriangle, Trash2 } from 'lucide-react';
import { getStudents, addStudent, updateStudent, deleteStudent, calculateAge, getCategory } from '../utils/database';
import { Student } from '../types';
import { format } from 'date-fns';

// This StudentForm component remains unchanged and should be at the top of the file.
const StudentForm = ({
  formData,
  setFormData,
  handleSubmit,
  resetForm,
  editingStudent,
}: {
  formData: any;
  setFormData: any;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  editingStudent: Student | null;
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">
      {editingStudent ? 'Edit Student' : 'Add New Student'}
    </h3>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
          <input
            type="text"
            required
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
          <input
            type="text"
            required
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
        <input
          type="date"
          required
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent/Guardian Name *</label>
          <input
            type="text"
            required
            value={formData.parentName}
            onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Parent Phone Number *</label>
          <input
            type="tel"
            required
            value={formData.parentPhone}
            onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Medical/Allergy Notes</label>
        <textarea
          value={formData.medicalNotes}
          onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
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
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    parentName: '',
    parentPhone: '',
    medicalNotes: '',
  });

  // Fetch students from the backend when the component first loads
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

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      parentName: '',
      parentPhone: '',
      medicalNotes: '',
    });
    setShowAddForm(false);
    setEditingStudent(null);
  };

  // This function is now async to work with the backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      medicalNotes: student.medicalNotes || '',
    });
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
          <p className="text-sm sm:text-base text-gray-600">{students.length} students registered</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Student</span>
        </button>
      </div>

      {showAddForm && (
        <StudentForm
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          editingStudent={editingStudent}
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
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SortAsc } from 'lucide-react';
import StudentCard from './StudentCard';
import { supabase } from '../../lib/supabase';

const CardsView = ({ students, onStudentsChange, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filteredStudents, setFilteredStudents] = useState(students);

  const majors = ['Computer Science', 'Information Technology', 'Cybersecurity', 'DSBA'];

  useEffect(() => {
    let filtered = students;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(student => {
        const searchLower = searchTerm.toLowerCase();
        return (
          student.full_name.toLowerCase().includes(searchLower) ||
          student.email.toLowerCase().includes(searchLower) ||
          student.major.toLowerCase().includes(searchLower) ||
          (student.about_me && student.about_me.toLowerCase().includes(searchLower)) ||
          (student.hobbies && student.hobbies.some(hobby => 
            hobby.toLowerCase().includes(searchLower)
          )) ||
          (student.professor_notes && student.professor_notes.some(note => 
            note.notes.toLowerCase().includes(searchLower)
          ))
        );
      });
    }

    // Major filter
    if (selectedMajor) {
      filtered = filtered.filter(student => student.major === selectedMajor);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'major':
          return a.major.localeCompare(b.major);
        case 'email':
          return a.email.localeCompare(b.email);
        case 'recent':
          return new Date(b.created_at) - new Date(a.created_at);
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedMajor, sortBy]);

  const handleAddNote = async (studentId, noteText) => {
    const { error } = await supabase
      .from('professor_notes')
      .insert([{
        student_id: studentId,
        professor_id: user.id,
        notes: noteText
      }]);

    if (error) throw error;

    // Refresh students data
    onStudentsChange();
  };

  const handleDeleteStudent = async (studentId) => {
    console.log(`Deleting student with ID: ${studentId}`);
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', studentId);

    if (error) throw error;

    // Refresh students data
    onStudentsChange();
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-apple-lg shadow-apple p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-apple-400" />
            <input
              type="text"
              placeholder="Search students by name, email, major, hobbies, about, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Major Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-apple-400" />
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="pl-10 pr-8 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[200px]"
            >
              <option value="">All Majors</option>
              {majors.map(major => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <SortAsc className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-apple-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-8 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[150px]"
            >
              <option value="name">Sort by Name</option>
              <option value="major">Sort by Major</option>
              <option value="email">Sort by Email</option>
              <option value="recent">Most Recent</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-apple-600">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Student Cards Grid - Fixed Height */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-[420px]"
          >
            <StudentCard
              student={student}
              onAddNote={handleAddNote}
              onDeleteStudent={handleDeleteStudent}
              onStudentsChange={onStudentsChange}
            />
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <div className="text-apple-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-apple-900 mb-2">No students found</h3>
          <p className="text-apple-600">
            {searchTerm || selectedMajor 
              ? 'Try adjusting your search or filter criteria'
              : 'Students will appear here once they create their profiles'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default CardsView;
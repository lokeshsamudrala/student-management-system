import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, SortAsc, X } from 'lucide-react';
import StudentCard from './StudentCard';
import { supabase } from '../../lib/supabase';

const CardsView = ({ students, onStudentsChange, user }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filteredStudents, setFilteredStudents] = useState(students);

  const majors = ['Computer Science', 'Information Technology', 'Cybersecurity', 'DSBA'];

  useEffect(() => {
    let filtered = [...students]; // Create a copy to avoid mutating original array

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
          (student.favorite_movies && student.favorite_movies.some(movie =>
            movie.title.toLowerCase().includes(searchLower)
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

    // Sort - Fixed sorting logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.full_name.localeCompare(b.full_name);
        case 'major':
          // First sort by major, then by name within same major
          const majorCompare = a.major.localeCompare(b.major);
          if (majorCompare === 0) {
            return a.full_name.localeCompare(b.full_name);
          }
          return majorCompare;
        case 'email':
          return a.email.localeCompare(b.email);
        case 'recent':
          // Sort by creation date, most recent first
          const dateA = new Date(a.created_at);
          const dateB = new Date(b.created_at);
          return dateB - dateA; // Most recent first
        default:
          return 0;
      }
    });

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedMajor, sortBy]);

  const handleAddNote = async (studentId, noteText) => {
    try {
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
    } catch (error) {
      console.error('Error adding note:', error);
      throw error;
    }
  };

  const handleDeleteStudent = async (studentId) => {
    try {
      console.log(`Deleting student with ID: ${studentId}`);
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;

      // Refresh students data
      onStudentsChange();
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  };

  // Reset filters function
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedMajor('');
    setSortBy('name');
  };

  // Get sort display name
  const getSortDisplayName = (sortValue) => {
    switch (sortValue) {
      case 'name':
        return 'Name';
      case 'major':
        return 'Major';
      case 'email':
        return 'Email';
      case 'recent':
        return 'Most Recent';
      default:
        return sortValue;
    }
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
              placeholder="Search students by name, email, major, hobbies, movies, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-apple-400 hover:text-apple-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
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

          {/* Reset Filters Button */}
          {(searchTerm || selectedMajor || sortBy !== 'name') && (
            <button
              onClick={resetFilters}
              className="px-4 py-3 bg-apple-100 text-apple-700 rounded-xl hover:bg-apple-200 transition-colors whitespace-nowrap flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Reset
            </button>
          )}
        </div>

        {/* Results Count and Active Filters */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm text-apple-600">
            Showing <span className="font-medium">{filteredStudents.length}</span> of{' '}
            <span className="font-medium">{students.length}</span> students
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || selectedMajor || sortBy !== 'name') && (
            <div className="flex flex-wrap gap-2 text-xs">
              {searchTerm && (
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  Search: "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm('')}
                    className="ml-1 hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {selectedMajor && (
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  Major: {selectedMajor}
                  <button
                    onClick={() => setSelectedMajor('')}
                    className="ml-1 hover:text-green-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {sortBy !== 'name' && (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  Sort: {getSortDisplayName(sortBy)}
                  <button
                    onClick={() => setSortBy('name')}
                    className="ml-1 hover:text-purple-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }} // Reduced delay for better performance
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
          <p className="text-apple-600 mb-4">
            {searchTerm || selectedMajor 
              ? 'Try adjusting your search or filter criteria'
              : 'Students will appear here once they create their profiles'
            }
          </p>
          {(searchTerm || selectedMajor || sortBy !== 'name') && (
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CardsView;
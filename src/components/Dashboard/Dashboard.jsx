import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, MapPin, Users, BookOpen } from 'lucide-react';
import CardsView from './CardsView';
import RoomLayout from './RoomLayout';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const Dashboard = ({ user }) => {
  const [activeView, setActiveView] = useState('cards');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byMajor: {}
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      
      // Fetch students with their notes
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      // Fetch professor notes for each student
      const { data: notesData, error: notesError } = await supabase
        .from('professor_notes')
        .select('*')
        .eq('professor_id', user.id);

      if (notesError) throw notesError;

      // Combine students with their notes
      const studentsWithNotes = studentsData.map(student => ({
        ...student,
        professor_notes: notesData.filter(note => note.student_id === student.id)
      }));

      setStudents(studentsWithNotes);

      // Calculate stats
      const majorCounts = studentsWithNotes.reduce((acc, student) => {
        acc[student.major] = (acc[student.major] || 0) + 1;
        return acc;
      }, {});

      setStats({
        total: studentsWithNotes.length,
        byMajor: majorCounts
      });

    } catch (error) {
      toast.error('Failed to fetch students');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user.id]);

  const handleStudentsChange = () => {
    fetchStudents();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-apple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-apple-600">Loading students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-apple-50">
      {/* Header with Stats */}
      <div className="bg-white shadow-apple border-b border-apple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-apple-900 font-sf">
                Instructor Dashboard
              </h1>
              <p className="text-apple-600 mt-1">
                Manage and organize your students
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex bg-apple-100 rounded-apple p-1">
              <button
                onClick={() => setActiveView('cards')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === 'cards'
                    ? 'bg-white text-primary-600 shadow-apple'
                    : 'text-apple-600 hover:text-apple-800'
                }`}
              >
                <LayoutGrid className="h-4 w-4 mr-2" />
                Cards View
              </button>
              <button
                onClick={() => setActiveView('layout')}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeView === 'layout'
                    ? 'bg-white text-primary-600 shadow-apple'
                    : 'text-apple-600 hover:text-apple-800'
                }`}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Room Layout
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-apple-lg p-6 text-white"
            >
              <div className="flex items-center">
                <Users className="h-8 w-8 mr-3" />
                <div>
                  <p className="text-primary-100 text-sm">Total Students</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </motion.div>

            {Object.entries(stats.byMajor).map(([major, count], index) => (
              <motion.div
                key={major}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index + 1) * 0.1 }}
                className="bg-white rounded-apple-lg p-6 shadow-apple"
              >
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 mr-3 text-apple-400" />
                  <div>
                    <p className="text-apple-600 text-sm truncate">{major}</p>
                    <p className="text-2xl font-bold text-apple-900">{count}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'cards' ? (
          <CardsView
            students={students}
            onStudentsChange={handleStudentsChange}
            user={user}
          />
        ) : (
          <div className="bg-white rounded-apple-lg shadow-apple overflow-hidden">
            <RoomLayout students={students} user={user} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
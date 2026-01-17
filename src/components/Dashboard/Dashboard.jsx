import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { LayoutGrid, MapPin, Users, BookOpen, Film, Tv, TrendingUp, Star } from 'lucide-react';
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

  // Enhanced: Memoize movie stats calculation with poster and rating data
  const movieStats = useMemo(() => {
    const movieCounts = new Map();
    const tvCounts = new Map();
    let totalMovies = 0;
    let totalTV = 0;

    // Use for...of for better performance with large arrays
    for (const student of students) {
      if (student.favorite_movies && Array.isArray(student.favorite_movies)) {
        for (const movie of student.favorite_movies) {
          // Use title + year as unique key to differentiate same titles from different years
          const uniqueKey = `${movie.title}||${movie.year || 'unknown'}`;
          const movieData = {
            title: movie.title,
            poster: movie.poster,
            rating: movie.rating,
            year: movie.year,
            type: movie.type
          };

          if (movie.type === 'movie') {
            if (movieCounts.has(uniqueKey)) {
              movieCounts.get(uniqueKey).count++;
            } else {
              movieCounts.set(uniqueKey, { ...movieData, count: 1 });
            }
            totalMovies++;
          } else if (movie.type === 'tv') {
            if (tvCounts.has(uniqueKey)) {
              tvCounts.get(uniqueKey).count++;
            } else {
              tvCounts.set(uniqueKey, { ...movieData, count: 1 });
            }
            totalTV++;
          }
        }
      }
    }

    // Convert Maps to sorted arrays efficiently
    const topMovies = Array.from(movieCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topTVShows = Array.from(tvCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      topMovies,
      topTVShows,
      totalMovieSelections: totalMovies,
      totalTVSelections: totalTV
    };
  }, [students]); // Only recalculate when students array changes

  // Optimized: Memoize basic stats calculation
  const basicStats = useMemo(() => {
    const majorCounts = new Map();
    
    for (const student of students) {
      const major = student.major;
      majorCounts.set(major, (majorCounts.get(major) || 0) + 1);
    }

    return {
      total: students.length,
      byMajor: Object.fromEntries(majorCounts)
    };
  }, [students]);

  // Optimized: Use callback to prevent unnecessary re-renders
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      
      // Optimized: Use select with specific fields only
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, full_name, email, major, pronoun, profile_picture_url, hobbies, favorite_movies, about_me, created_at')
        .order('created_at', { ascending: false });

      if (studentsError) throw studentsError;

      // Optimized: Fetch notes in a single query with join-like operation
      const { data: notesData, error: notesError } = await supabase
        .from('professor_notes')
        .select('id, student_id, notes, created_at')
        .eq('professor_id', user.id);

      if (notesError) throw notesError;

      // Optimized: Use Map for O(1) lookup instead of filter for each student
      const notesMap = new Map();
      for (const note of notesData) {
        if (!notesMap.has(note.student_id)) {
          notesMap.set(note.student_id, []);
        }
        notesMap.get(note.student_id).push(note);
      }

      // Optimized: Combine data efficiently
      const studentsWithNotes = studentsData.map(student => ({
        ...student,
        professor_notes: notesMap.get(student.id) || []
      }));

      setStudents(studentsWithNotes);

    } catch (error) {
      toast.error('Failed to fetch students');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  // Update stats when basicStats changes
  useEffect(() => {
    setStats(basicStats);
  }, [basicStats]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleStudentsChange = useCallback(() => {
    fetchStudents();
  }, [fetchStudents]);

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

          {/* Optimized Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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

            {Object.entries(stats.byMajor).slice(0, 4).map(([major, count], index) => (
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
                    <p className="text-apple-600 text-sm truncate" title={major}>
                      {major.length > 15 ? `${major.substring(0, 15)}...` : major}
                    </p>
                    <p className="text-2xl font-bold text-apple-900">{count}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Enhanced Movie/TV Show Stats with posters and ratings */}
          {(movieStats.topMovies.length > 0 || movieStats.topTVShows.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Movies - Enhanced Component */}
              <EnhancedMovieStatsCard 
                title="Top Movies in Class"
                icon={Film}
                iconColor="text-red-500"
                barColor="bg-red-500"
                items={movieStats.topMovies}
                totalSelections={movieStats.totalMovieSelections}
                type="movie"
              />

              {/* Top TV Shows - Enhanced Component */}
              <EnhancedMovieStatsCard 
                title="Top TV Shows in Class"
                icon={Tv}
                iconColor="text-blue-500" 
                barColor="bg-blue-500"
                items={movieStats.topTVShows}
                totalSelections={movieStats.totalTVSelections}
                type="tv"
              />
            </div>
          )}

          {/* Entertainment Summary */}
          {(movieStats.totalMovieSelections > 0 || movieStats.totalTVSelections > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-apple-lg p-6 text-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold">Class Entertainment Insights</h3>
                    <p className="text-purple-100 text-sm">
                      Your students have shared {movieStats.totalMovieSelections + movieStats.totalTVSelections} entertainment preferences
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    {movieStats.topMovies.length + movieStats.topTVShows.length}
                  </div>
                  <div className="text-purple-100 text-sm">
                    Unique titles
                  </div>
                </div>
              </div>
            </motion.div>
          )}
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

// Enhanced: Movie stats component with posters and ratings
const EnhancedMovieStatsCard = React.memo(({ title, icon: Icon, iconColor, barColor, items, totalSelections, type }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: type === 'movie' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-apple-lg shadow-apple p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Icon className={`h-6 w-6 ${iconColor} mr-2`} />
          <h3 className="text-lg font-semibold text-apple-900">{title}</h3>
        </div>
        <div className="text-sm text-apple-500">
          {totalSelections} total selections
        </div>
      </div>
      
      {items.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {items.map((item, index) => (
            <div key={`${item.title}-${item.year}-${index}`} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-apple-50 transition-colors">
              {/* Ranking Badge */}
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                index === 0 ? 'bg-yellow-500' : 
                index === 1 ? 'bg-gray-400' :
                index === 2 ? 'bg-amber-600' : 'bg-apple-400'
              }`}>
                {index + 1}
              </div>

              {/* Movie/Show Poster */}
              <div className="w-12 h-16 bg-apple-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {item.poster ? (
                  <img 
                    src={item.poster}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full ${item.poster ? 'hidden' : 'flex'} items-center justify-center`}>
                  <Icon className={`h-6 w-6 ${iconColor.replace('text-', 'text-opacity-50 text-')}`} />
                </div>
              </div>

              {/* Movie Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-apple-900 truncate text-sm" title={item.title}>
                      {item.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {item.year && (
                        <span className="text-xs text-apple-500">{item.year}</span>
                      )}
                      {item.rating && (
                        <>
                          <span className="text-apple-300">•</span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                            <span className="text-xs text-apple-600">{item.rating}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats and Progress Bar */}
              <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                <span className="text-sm text-apple-600 font-medium">
                  {item.count} student{item.count > 1 ? 's' : ''}
                </span>
                <div className="w-20 bg-apple-100 rounded-full h-2">
                  <div 
                    className={`${barColor} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max((item.count / items[0].count) * 100, 15)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Icon className={`h-12 w-12 ${iconColor.replace('text-', 'text-opacity-30 text-')} mx-auto mb-2`} />
          <p className="text-apple-500">No {type} selections yet</p>
          <p className="text-apple-400 text-sm">Students will see their favorites here once they add them</p>
        </div>
      )}
    </motion.div>
  );
});

EnhancedMovieStatsCard.displayName = 'EnhancedMovieStatsCard';

export default Dashboard;
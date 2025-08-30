import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, User, Mail, GraduationCap, Heart, MessageSquare, X, Check, Film } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const StudentCard = ({ student, onAddNote, onDeleteStudent, onStudentsChange, canEdit = true }) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');
  const [isUpdatingNote, setIsUpdatingNote] = useState(false);
  const [showEnlargedImage, setShowEnlargedImage] = useState(false);

  const handleAddNote = async () => {
    if (!note.trim()) return;
    
    setIsAddingNote(true);
    try {
      await onAddNote(student.id, note);
      setNote('');
      setShowNoteInput(false);
      toast.success('Note added successfully');
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleEditNote = (noteObj) => {
    setEditingNoteId(noteObj.id);
    setEditNoteText(noteObj.notes);
  };

  const handleUpdateNote = async () => {
    if (!editNoteText.trim()) return;
    
    setIsUpdatingNote(true);
    try {
      const { error } = await supabase
        .from('professor_notes')
        .update({ notes: editNoteText })
        .eq('id', editingNoteId);

      if (error) throw error;

      setEditingNoteId(null);
      setEditNoteText('');
      onStudentsChange();
      toast.success('Note updated successfully');
    } catch (error) {
      console.error('Error updating note:', error);
      toast.error('Failed to update note');
    } finally {
      setIsUpdatingNote(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    
    try {
      const { error } = await supabase
        .from('professor_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;

      onStudentsChange();
      toast.success('Note deleted successfully');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const cancelEdit = () => {
    setEditingNoteId(null);
    setEditNoteText('');
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this student profile?')) {
      try {
        await onDeleteStudent(student.id);
        toast.success('Student profile deleted');
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="bg-white rounded-apple-lg shadow-apple hover:shadow-apple-lg transition-all duration-300 overflow-hidden h-full flex flex-col"
    >
      {/* Header with Profile Picture */}
      <div className="relative h-32 bg-gradient-to-br from-primary-500 to-primary-600 flex-shrink-0">
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div 
            className="w-16 h-16 rounded-full border-4 border-white shadow-apple overflow-hidden bg-white cursor-pointer transition-transform duration-200 hover:scale-110"
            onMouseEnter={() => student.profile_picture_url && setShowEnlargedImage(true)}
            onMouseLeave={() => setShowEnlargedImage(false)}
          >
            {student.profile_picture_url ? (
              <img
                src={student.profile_picture_url}
                alt={student.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-apple-100 flex items-center justify-center">
                <User className="h-8 w-8 text-apple-400" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="pt-10 px-6 pb-4 flex-1 flex flex-col min-h-0">
        {/* Name and Pronoun */}
        <div className="text-center mb-4 flex-shrink-0">
          <h3 className="text-lg font-semibold text-apple-900 font-sf">
            {student.full_name}
          </h3>
          <p className="text-sm text-apple-500">{student.pronoun}</p>
        </div>

        {/* Details - Better Scrollable */}
        <div className="space-y-3 flex-1 overflow-y-auto min-h-0 pr-2 scrollbar-thin scrollbar-thumb-apple-300 scrollbar-track-apple-100">
          <div className="flex items-center text-sm text-apple-600">
            <Mail className="h-4 w-4 mr-2 text-apple-400" />
            <span className="truncate">{student.email}</span>
          </div>
          
          <div className="flex items-center text-sm text-apple-600">
            <GraduationCap className="h-4 w-4 mr-2 text-apple-400" />
            <span>{student.major}</span>
          </div>

          {/* Hobbies - Show More */}
          {student.hobbies && student.hobbies.length > 0 && (
            <div>
              <div className="flex items-center text-sm text-apple-600 mb-2">
                <Heart className="h-4 w-4 mr-2 text-apple-400" />
                <span className="font-medium">Hobbies</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {student.hobbies.map((hobby, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-apple-100 text-apple-700 text-xs rounded-full"
                  >
                    {hobby}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Favorite Movies - Show More */}
          {student.favorite_movies && student.favorite_movies.length > 0 && (
            <div>
              <div className="flex items-center text-sm text-apple-600 mb-2">
                <Film className="h-4 w-4 mr-2 text-apple-400" />
                <span className="font-medium">Movies/Shows</span>
              </div>
              <div className="space-y-2">
                {student.favorite_movies.map((movie, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-6 h-8 bg-apple-100 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
                      {movie.poster ? (
                        <img 
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Film className="h-3 w-3 text-apple-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-apple-700 truncate">{movie.title}</p>
                      <p className="text-xs text-apple-500 truncate">
                        {movie.year} • {movie.type === 'movie' ? 'Movie' : 'TV'}
                        {movie.rating && ` • ⭐ ${movie.rating}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Me - Full Text */}
          {student.about_me && (
            <div>
              <div className="flex items-center text-sm text-apple-600 mb-2">
                <User className="h-4 w-4 mr-2 text-apple-400" />
                <span className="font-medium">About Me</span>
              </div>
              <p className="text-sm text-apple-600 leading-relaxed">
                {student.about_me}
              </p>
            </div>
          )}

          {/* Professor Notes - Expandable */}
          {student.professor_notes && student.professor_notes.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Professor Notes</h4>
              <div className="space-y-2">
                {student.professor_notes.map((noteObj, index) => (
                  <div key={noteObj.id || index} className="group">
                    {editingNoteId === noteObj.id ? (
                      // Edit mode
                      <div className="space-y-2">
                        <textarea
                          value={editNoteText}
                          onChange={(e) => setEditNoteText(e.target.value)}
                          className="w-full px-3 py-2 border border-yellow-300 rounded text-sm text-yellow-700 bg-yellow-50 focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                          rows={3}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleUpdateNote();
                            }
                          }}
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleUpdateNote}
                            disabled={isUpdatingNote || !editNoteText.trim()}
                            className="flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            {isUpdatingNote ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display mode
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-yellow-700 flex-1 pr-2 leading-relaxed">
                          {noteObj.notes}
                        </p>
                        {canEdit && (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditNote(noteObj)}
                              className="p-1 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded"
                              title="Edit note"
                            >
                              <Edit3 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(noteObj.id)}
                              className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                              title="Delete note"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions - Fixed at bottom with better layout */}
        {canEdit && (
          <div className="mt-4 pt-3 border-t border-apple-100 flex-shrink-0">
            {!showNoteInput ? (
              <div className="flex items-center justify-between w-full">
                <button
                  onClick={() => setShowNoteInput(true)}
                  className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Add Note
                </button>
                
                <button
                  onClick={handleDelete}
                  className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </button>
              </div>
            ) : (
              <div className="w-full space-y-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full px-3 py-2 border border-apple-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNote();
                    }
                  }}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleAddNote}
                      disabled={isAddingNote || !note.trim()}
                      className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {isAddingNote ? 'Adding...' : 'Add'}
                    </button>
                    <button
                      onClick={() => {
                        setShowNoteInput(false);
                        setNote('');
                      }}
                      className="px-4 py-2 bg-apple-200 text-apple-700 text-sm rounded-lg hover:bg-apple-300"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <button
                    onClick={handleDelete}
                    className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enlarged Profile Picture Overlay */}
      {showEnlargedImage && student.profile_picture_url && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.3 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative pointer-events-auto"
            onMouseEnter={() => setShowEnlargedImage(true)}
            onMouseLeave={() => setShowEnlargedImage(false)}
          >
            {/* Enlarged image container */}
            <div className="relative w-56 h-56 rounded-full border-4 border-white shadow-apple-xl overflow-hidden bg-white">
              <img
                src={student.profile_picture_url}
                alt={student.full_name}
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default StudentCard;
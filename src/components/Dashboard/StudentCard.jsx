import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, User, Mail, GraduationCap, Heart, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentCard = ({ student, onAddNote, onDeleteStudent, canEdit = true }) => {
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

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
      className="bg-white rounded-apple-lg shadow-apple hover:shadow-apple-lg transition-all duration-300 overflow-hidden"
    >
      {/* Header with Profile Picture */}
      <div className="relative h-32 bg-gradient-to-br from-primary-500 to-primary-600">
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 rounded-full border-4 border-white shadow-apple overflow-hidden bg-white">
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

      {/* Content */}
      <div className="pt-10 px-6 pb-6">
        {/* Name and Pronoun */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-apple-900 font-sf">
            {student.full_name}
          </h3>
          <p className="text-sm text-apple-500">{student.pronoun}</p>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center text-sm text-apple-600">
            <Mail className="h-4 w-4 mr-2 text-apple-400" />
            <span className="truncate">{student.email}</span>
          </div>
          
          <div className="flex items-center text-sm text-apple-600">
            <GraduationCap className="h-4 w-4 mr-2 text-apple-400" />
            <span>{student.major}</span>
          </div>

          {/* Hobbies */}
          {student.hobbies && student.hobbies.length > 0 && (
            <div>
              <div className="flex items-center text-sm text-apple-600 mb-2">
                <Heart className="h-4 w-4 mr-2 text-apple-400" />
                <span className="font-medium">Hobbies</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {student.hobbies.slice(0, 3).map((hobby, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-apple-100 text-apple-700 text-xs rounded-full"
                  >
                    {hobby}
                  </span>
                ))}
                {student.hobbies.length > 3 && (
                  <span className="px-2 py-1 bg-apple-100 text-apple-700 text-xs rounded-full">
                    +{student.hobbies.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* About Me */}
          {student.about_me && (
            <div>
              <p className="text-sm text-apple-600 line-clamp-3">
                {student.about_me}
              </p>
            </div>
          )}

          {/* Professor Notes */}
          {student.professor_notes && student.professor_notes.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-yellow-800 mb-1">Notes</h4>
              {student.professor_notes.map((noteObj, index) => (
                <p key={index} className="text-sm text-yellow-700">
                  {noteObj.notes}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        {canEdit && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-apple-100">
            {!showNoteInput ? (
              <button
                onClick={() => setShowNoteInput(true)}
                className="flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Add Note
              </button>
            ) : (
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note..."
                  className="flex-1 px-3 py-1 border border-apple-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddNote();
                    }
                  }}
                />
                <button
                  onClick={handleAddNote}
                  disabled={isAddingNote || !note.trim()}
                  className="px-3 py-1 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {isAddingNote ? '...' : 'Add'}
                </button>
                <button
                  onClick={() => {
                    setShowNoteInput(false);
                    setNote('');
                  }}
                  className="px-3 py-1 bg-apple-200 text-apple-700 text-sm rounded-lg hover:bg-apple-300"
                >
                  Cancel
                </button>
              </div>
            )}
            
            <button
              onClick={handleDelete}
              className="flex items-center text-sm text-red-600 hover:text-red-700 font-medium ml-4"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StudentCard;
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, X, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const EditProfile = ({ studentId, onClose, onUpdate }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hobbies, setHobbies] = useState([]);
  const [hobbyInput, setHobbyInput] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    fetchStudent();
  }, [studentId]);

  const fetchStudent = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (error) throw error;

      setStudent(data);
      setHobbies(data.hobbies || []);
      setValue('aboutMe', data.about_me || '');
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load student data');
      onClose();
    }
  };

  const addHobby = (e) => {
    if (e.key === 'Enter' && hobbyInput.trim()) {
      e.preventDefault();
      if (!hobbies.includes(hobbyInput.trim())) {
        setHobbies([...hobbies, hobbyInput.trim()]);
      }
      setHobbyInput('');
    }
  };

  const removeHobby = (hobbyToRemove) => {
    setHobbies(hobbies.filter(hobby => hobby !== hobbyToRemove));
  };

  const onSubmit = async (data) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('students')
        .update({
          hobbies: hobbies,
          about_me: data.aboutMe,
          updated_at: new Date().toISOString()
        })
        .eq('id', studentId);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      onUpdate();
      onClose();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-apple-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-apple-lg shadow-apple-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white font-sf">Edit Profile</h2>
            <p className="text-primary-100 mt-1">{student.full_name}</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-primary-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Hobbies */}
          <div>
            <label className="block text-sm font-medium text-apple-700 mb-2">
              Hobbies & Interests
            </label>
            <input
              type="text"
              value={hobbyInput}
              onChange={(e) => setHobbyInput(e.target.value)}
              onKeyPress={addHobby}
              className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Type a hobby and press Enter"
            />
            <div className="flex flex-wrap gap-2 mt-3">
              {hobbies.map(hobby => (
                <span
                  key={hobby}
                  className="inline-flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm"
                >
                  {hobby}
                  <button
                    type="button"
                    onClick={() => removeHobby(hobby)}
                    className="ml-2 text-primary-600 hover:text-primary-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* About Me */}
          <div>
            <label className="block text-sm font-medium text-apple-700 mb-2">
              About Me
            </label>
            <textarea
              {...register('aboutMe')}
              rows={6}
              className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Tell us something about yourself..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-apple-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-apple-200 text-apple-700 rounded-xl font-medium hover:bg-apple-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-medium hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProfile;
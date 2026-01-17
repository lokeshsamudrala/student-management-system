import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Save, X, Plus, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import MovieSearch from '../MovieSearch/MovieSearch';

const EditProfile = ({ studentId, onClose, onUpdate }) => {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hobbies, setHobbies] = useState([]);
  const [hobbyInput, setHobbyInput] = useState('');
  const [favoriteMovies, setFavoriteMovies] = useState([]); // Add movie state
  const [profilePicture, setProfilePicture] = useState(null);
  const [currentProfilePictureUrl, setCurrentProfilePictureUrl] = useState('');
  const fileInputRef = useRef(null);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  const majors = [
    'Computer Science',
    'Information Technology',
    'Cybersecurity',
    'DSBA'
  ];

  const pronouns = [
    'He/Him',
    'She/Her',
    'They/Them',
    'Other'
  ];

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setFavoriteMovies(data.favorite_movies || []); // Set favorite movies
      setCurrentProfilePictureUrl(data.profile_picture_url || '');
      
      // Set form values
      setValue('fullName', data.full_name || '');
      setValue('pronoun', data.pronoun || '');
      setValue('email', data.email || '');
      setValue('major', data.major || '');
      setValue('aboutMe', data.about_me || '');
      
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load student data');
      onClose();
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfilePicture(file);
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

  const handleMoviesChange = (movies) => {
    setFavoriteMovies(movies);
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file);

    if (error) throw error;

    const { data: { publicUrl } } = await supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const onSubmit = async (data) => {
    // Validate hobbies
    if (hobbies.length === 0) {
      toast.error('At least one hobby is required');
      return;
    }

    // Validate movies (if you want to keep it mandatory)
    if (favoriteMovies.length === 0) {
      toast.error('Please select at least one favorite movie or TV show');
      return;
    }

    setIsUpdating(true);
    try {
      let profilePictureUrl = currentProfilePictureUrl;
      
      // Upload new profile picture if one was selected
      if (profilePicture) {
        profilePictureUrl = await uploadImage(profilePicture);
      }

      const updateData = {
        full_name: data.fullName,
        pronoun: data.pronoun,
        email: data.email,
        major: data.major,
        profile_picture_url: profilePictureUrl,
        hobbies: hobbies,
        favorite_movies: favoriteMovies, // Include favorite movies
        about_me: data.aboutMe,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('students')
        .update(updateData)
        .eq('id', studentId);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      onUpdate();
    } catch (error) {
      console.error('Update error:', error);
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
          <p className="text-apple-600 mt-2 text-center">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-apple-lg shadow-apple-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white font-sf">Edit Profile</h2>
            <p className="text-primary-100 mt-1">Update your information</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-primary-100 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
          {/* Profile Picture */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full bg-apple-100 border-4 border-white shadow-apple flex items-center justify-center overflow-hidden">
                {profilePicture ? (
                  <img
                    src={URL.createObjectURL(profilePicture)}
                    alt="New Profile"
                    className="w-full h-full object-cover"
                  />
                ) : currentProfilePictureUrl ? (
                  <img
                    src={currentProfilePictureUrl}
                    alt={student.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="h-12 w-12 text-apple-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-primary-600 text-white p-2 rounded-full shadow-apple hover:bg-primary-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
            <p className="text-sm text-apple-500 mt-2">
              {profilePicture ? 'New photo selected' : 'Click to change profile picture'}
            </p>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-apple-700 mb-2">
                Full Name *
              </label>
              <input
                {...register('fullName', { required: 'Full name is required' })}
                className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-apple-700 mb-2">
                Pronoun *
              </label>
              <select
                {...register('pronoun', { required: 'Pronoun is required' })}
                className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select pronoun</option>
                {pronouns.map(pronoun => (
                  <option key={pronoun} value={pronoun}>{pronoun}</option>
                ))}
              </select>
              {errors.pronoun && (
                <p className="text-red-500 text-sm mt-1">{errors.pronoun.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-apple-700 mb-2">
                UNCC Email Address *
              </label>
              <input
                {...register('email', { 
                  required: 'UNCC email is required',
                  pattern: {
                    value: /^[^\s@]+@(uncc\.edu|charlotte\.edu)$/i,
                    message: 'Email must end with @uncc.edu or @charlotte.edu'
                  }
                })}
                type="email"
                className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="your.email@uncc.edu"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
              <p className="text-xs text-apple-500 mt-1">
                Must be a UNCC email address (@uncc.edu or @charlotte.edu)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-apple-700 mb-2">
                Major/Field of Study *
              </label>
              <select
                {...register('major', { required: 'Major is required' })}
                className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select your major</option>
                {majors.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </select>
              {errors.major && (
                <p className="text-red-500 text-sm mt-1">{errors.major.message}</p>
              )}
            </div>
          </div>

          {/* Hobbies */}
          <div>
            <label className="block text-sm font-medium text-apple-700 mb-2">
              Hobbies & Interests *
            </label>
            <div className="relative">
              <input
                type="text"
                value={hobbyInput}
                onChange={(e) => setHobbyInput(e.target.value)}
                onKeyPress={addHobby}
                onBlur={() => {
                  if (hobbyInput.trim() && !hobbies.includes(hobbyInput.trim())) {
                    setHobbies([...hobbies, hobbyInput.trim()]);
                    setHobbyInput('');
                  }
                }}
                className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Type a hobby and press Enter"
              />
              {hobbyInput.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    if (hobbyInput.trim() && !hobbies.includes(hobbyInput.trim())) {
                      setHobbies([...hobbies, hobbyInput.trim()]);
                      setHobbyInput('');
                    }
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Add
                </button>
              )}
            </div>
            
            <p className="text-xs text-apple-500 mt-1">
              {hobbies.length === 0 
                ? "Add at least one hobby. Press Enter or click 'Add' after typing each hobby."
                : `${hobbies.length} ${hobbies.length === 1 ? 'hobby' : 'hobbies'} added.`
              }
            </p>

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

          {/* Favorite Movies/TV Shows - NEW SECTION */}
          <div>
            <label className="block text-sm font-medium text-apple-700 mb-2">
              Favorite Movies or TV Shows *
            </label>
            <MovieSearch
              selectedMovies={favoriteMovies}
              onMoviesChange={handleMoviesChange}
              maxSelections={3}
            />
            <p className="text-xs text-apple-500 mt-1">
              You can select up to 3 favorite movies or TV shows
            </p>
          </div>

          {/* About Me */}
          <div>
            <label className="block text-sm font-medium text-apple-700 mb-2">
              About Me *
            </label>
            <textarea
              {...register('aboutMe', { required: 'Tell us something about yourself' })}
              rows={6}
              className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              placeholder="Tell us something about yourself..."
            />
            {errors.aboutMe && (
              <p className="text-red-500 text-sm mt-1">{errors.aboutMe.message}</p>
            )}
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
import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Plus, X, CheckCircle, Edit3, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import EditProfile from './EditProfile';
import MovieSearch from '../MovieSearch/MovieSearch';

const ProfileForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [hobbies, setHobbies] = useState([]);
  const [hobbyInput, setHobbyInput] = useState('');
  const [favoriteMovies, setFavoriteMovies] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submittedStudentId, setSubmittedStudentId] = useState(null);
  const [submittedStudentData, setSubmittedStudentData] = useState(null);
  
  // Validation error states
  const [hasSubmissionAttempt, setHasSubmissionAttempt] = useState(false);
  const [profilePictureError, setProfilePictureError] = useState('');
  const [hobbiesError, setHobbiesError] = useState('');
  const [moviesError, setMoviesError] = useState('');
  
  const fileInputRef = useRef(null);
  
  const { register, formState: { errors }, reset, trigger } = useForm();

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

  // Validate custom fields
  const validateCustomFields = () => {
    let hasError = false;

    // Validate profile picture
    if (!profilePicture) {
      setProfilePictureError('Profile picture is required');
      hasError = true;
    }

    // Validate hobbies
    if (hobbies.length === 0) {
      setHobbiesError('At least one hobby is required');
      hasError = true;
    }

    // Validate movies
    if (favoriteMovies.length === 0) {
      setMoviesError('Please select at least one favorite movie or TV show');
      hasError = true;
    }

    return !hasError;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      setProfilePicture(file);
      setProfilePictureError(''); // Clear error when image is uploaded
    }
  };

  const addHobby = (e) => {
    if (e.key === 'Enter' && hobbyInput.trim()) {
      e.preventDefault();
      if (!hobbies.includes(hobbyInput.trim())) {
        setHobbies([...hobbies, hobbyInput.trim()]);
        setHobbiesError(''); // Clear error when hobby is added
      }
      setHobbyInput('');
    }
  };

  const removeHobby = (hobbyToRemove) => {
    const newHobbies = hobbies.filter(hobby => hobby !== hobbyToRemove);
    setHobbies(newHobbies);
    // Show error if removing last hobby after submission attempt
    if (newHobbies.length === 0 && hasSubmissionAttempt) {
      setHobbiesError('At least one hobby is required');
    }
  };

  const handleMoviesChange = (movies) => {
    setFavoriteMovies(movies);
    // Clear error when movies are selected
    if (movies.length > 0) {
      setMoviesError('');
    }
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file);

    if (error){
        throw error;
    }

    const { data: { publicUrl } } = await supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  // Handle form submission with custom validation
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Set submission attempt to true
    setHasSubmissionAttempt(true);
    
    // Validate custom fields first
    const customFieldsValid = validateCustomFields();
    
    // Trigger react-hook-form validation
    const formValid = await trigger();
    
    // If either validation fails, don't proceed
    if (!customFieldsValid || !formValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Get form data manually since we're not using handleSubmit
    const formElement = e.target;
    const formData = new FormData(formElement);
    const data = {
      fullName: formData.get('fullName'),
      pronoun: formData.get('pronoun'),
      email: formData.get('email'),
      major: formData.get('major'),
      aboutMe: formData.get('aboutMe')
    };

    // Proceed with submission
    await onSubmit(data);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let profilePictureUrl = null;
      
      if (profilePicture) {
        profilePictureUrl = await uploadImage(profilePicture);
      }

      const studentData = {
        email: data.email,
        full_name: data.fullName,
        pronoun: data.pronoun,
        major: data.major,
        profile_picture_url: profilePictureUrl,
        hobbies: hobbies,
        about_me: data.aboutMe || null,
        favorite_movies: favoriteMovies
      };

      const { data: insertedData, error } = await supabase
        .from('students')
        .insert([studentData])
        .select()
        .single();

      if (error) throw error;

      setSubmittedStudentId(insertedData.id);
      setSubmittedStudentData(insertedData);
      setIsSubmitted(true);
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    // Reset all form data and error states
    setIsSubmitted(false);
    setProfilePicture(null);
    setProfilePictureError('');
    setHobbies([]);
    setHobbyInput('');
    setHobbiesError('');
    setFavoriteMovies([]);
    setMoviesError('');
    setSubmittedStudentId(null);
    setSubmittedStudentData(null);
    setHasSubmissionAttempt(false);
    reset();
    window.scrollTo(0, 0);
  };

  const handleEditProfile = () => {
    setShowEditModal(true);
  };

  const handleUpdateComplete = async () => {
    // Refresh the submitted student data
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', submittedStudentId)
        .single();

      if (error) throw error;
      setSubmittedStudentData(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to refresh profile data');
    }
    setShowEditModal(false);
  };

  if (isSubmitted) {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-screen bg-gradient-to-br from-apple-50 to-primary-50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-apple-lg shadow-apple-lg overflow-hidden max-w-2xl w-full">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-center">
              <CheckCircle className="h-16 w-16 text-white mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-2">Profile Created Successfully!</h2>
              <p className="text-green-100">Your profile has been submitted and is now visible to your professor.</p>
            </div>

            {/* Profile Preview */}
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-apple">
                  {submittedStudentData?.profile_picture_url ? (
                    <img
                      src={submittedStudentData.profile_picture_url}
                      alt={submittedStudentData.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xl">
                        {submittedStudentData?.full_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-apple-900">{submittedStudentData?.full_name}</h3>
                <p className="text-apple-600">{submittedStudentData?.pronoun} • {submittedStudentData?.major}</p>
              </div>

              {/* Quick Preview */}
              <div className="bg-apple-50 rounded-apple p-4 mb-6">
                <h4 className="font-semibold text-apple-900 mb-2">Profile Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Email:</span> {submittedStudentData?.email}</p>
                  {submittedStudentData?.hobbies && submittedStudentData.hobbies.length > 0 && (
                    <div>
                      <span className="font-medium">Hobbies:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {submittedStudentData.hobbies.map((hobby, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full"
                          >
                            {hobby}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {submittedStudentData?.favorite_movies && submittedStudentData.favorite_movies.length > 0 && (
                    <div>
                      <span className="font-medium">Favorite Movies/Shows:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {submittedStudentData.favorite_movies.map((movie, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            {movie.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {submittedStudentData?.about_me && (
                    <p><span className="font-medium">About:</span> {submittedStudentData.about_me}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleEditProfile}
                  className="flex-1 flex items-center justify-center bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  <Edit3 className="h-5 w-5 mr-2" />
                  Edit My Profile
                </button>
                <button
                  onClick={handleCreateAnother}
                  className="flex-1 flex items-center justify-center bg-apple-200 text-apple-700 px-6 py-3 rounded-xl font-medium hover:bg-apple-300 transition-colors"
                >
                  <UserPlus className="h-5 w-5 mr-2" />
                  Create Another Profile
                </button>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-apple">
                <p className="text-sm text-blue-700 text-center">
                  <strong>What's next?</strong> Your professor can now see your profile in their dashboard. 
                  You can edit any part of your profile anytime using the "Edit My Profile" button.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Edit Profile Modal */}
        {showEditModal && (
          <EditProfile
            studentId={submittedStudentId}
            onClose={() => setShowEditModal(false)}
            onUpdate={handleUpdateComplete}
          />
        )}
      </>
    );
  }

  // Main form JSX
  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-50 to-primary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-apple-lg shadow-apple-lg overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white font-sf">Create Your Profile</h1>
            <p className="text-primary-100 mt-2">Share your details with your professor</p>
          </div>

          {/* Updated form with custom submit handler */}
          <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="relative inline-block">
                <div className={`w-32 h-32 rounded-full bg-apple-100 border-4 ${
                  profilePictureError ? 'border-red-300' : 'border-white'
                } shadow-apple flex items-center justify-center overflow-hidden`}>
                  {profilePicture ? (
                    <img
                      src={URL.createObjectURL(profilePicture)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-apple-400 mx-auto" />
                      {/* Only show "Required" text if there's an error */}
                      {profilePictureError && (
                        <span className="text-xs text-red-500 mt-1 block">Required</span>
                      )}
                    </div>
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
              <p className={`text-sm mt-2 ${
                profilePictureError ? 'text-red-500' : 'text-apple-500'
              }`}>
                {profilePictureError || (!profilePicture ? 'Click to upload profile picture *' : 'Click to change profile picture')}
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
                  name="fullName"
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
                  name="pronoun"
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
                      value: /^[^\s@]+@(charlotte\.edu)$/i,
                      message: 'Email must end with @charlotte.edu'
                    }
                  })}
                  name="email"
                  type="email"
                  className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your.email@charlotte.edu"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
                <p className="text-xs text-apple-500 mt-1">
                  Must be a UNCC email address (@charlotte.edu)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-apple-700 mb-2">
                  Major/Field of Study *
                </label>
                <select
                  {...register('major', { required: 'Major is required' })}
                  name="major"
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

            {/* Hobbies with proper validation */}
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
                    // Auto-add hobby when user clicks away
                    if (hobbyInput.trim() && !hobbies.includes(hobbyInput.trim())) {
                      setHobbies([...hobbies, hobbyInput.trim()]);
                      setHobbiesError(''); // Clear error when hobby is added
                      setHobbyInput('');
                    }
                  }}
                  className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Type a hobby and press Enter (e.g., 'Movies', 'Hiking')"
                />
                {hobbyInput.trim() && (
                  <button
                    type="button"
                    onClick={() => {
                      if (hobbyInput.trim() && !hobbies.includes(hobbyInput.trim())) {
                        setHobbies([...hobbies, hobbyInput.trim()]);
                        setHobbiesError(''); // Clear error when hobby is added
                        setHobbyInput('');
                      }
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Add
                  </button>
                )}
              </div>
              
              {/* Show error message for hobbies */}
              {hobbiesError && (
                <p className="text-red-500 text-sm mt-1">{hobbiesError}</p>
              )}
              
              {/* Show helper text only if no error */}
              {!hobbiesError && (
                <p className="text-xs text-apple-500 mt-1">
                  {hobbies.length === 0 
                    ? "Add at least one hobby. Press Enter or click 'Add' after typing each hobby."
                    : `${hobbies.length} ${hobbies.length === 1 ? 'hobby' : 'hobbies'} added. You can add more!`
                  }
                </p>
              )}

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

            {/* Movies with proper validation */}
            <div>
              <label className="block text-sm font-medium text-apple-700 mb-2">
                Favorite Movies or TV Shows *
              </label>
              <MovieSearch
                selectedMovies={favoriteMovies}
                onMoviesChange={handleMoviesChange}
                maxSelections={3}
              />
              
              {/* Show error message for movies */}
              {moviesError && (
                <p className="text-red-500 text-sm mt-1">{moviesError}</p>
              )}
            </div>

            {/* About Me */}
            <div>
              <label className="block text-sm font-medium text-apple-700 mb-2">
                About Me *
              </label>
              <textarea
                {...register('aboutMe', { required: 'Tell us something about yourself' })}
                name="aboutMe"
                rows={4}
                className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                placeholder="Tell us something about yourself..."
              />
              {errors.aboutMe && (
                <p className="text-red-500 text-sm mt-1">{errors.aboutMe.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-4 px-6 rounded-xl font-medium text-lg hover:from-primary-700 hover:to-primary-800 focus:ring-4 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfileForm;
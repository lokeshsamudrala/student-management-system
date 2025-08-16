import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Plus, X, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const ProfileForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePictureError, setProfilePictureError] = useState('');
  const [hobbies, setHobbies] = useState([]);
  const [hobbyInput, setHobbyInput] = useState('');
  const fileInputRef = useRef(null);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

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
      }
      setHobbyInput('');
    }
  };

  const removeHobby = (hobbyToRemove) => {
    setHobbies(hobbies.filter(hobby => hobby !== hobbyToRemove));
  };

  const uploadImage = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data, error } = await supabase.storage
      .from('profile-pictures')
      .upload(fileName, file);

    if (error){
        // console.error('Error uploading image:', error);
        throw error;
    } 
    
    const { data: { publicUrl } } = await supabase.storage
      .from('profile-pictures')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const onSubmit = async (data) => {
    // Validate profile picture before submission
    if (!profilePicture) {
      setProfilePictureError('Profile picture is required');
      toast.error('Please upload a profile picture');
      return;
    }

    setIsSubmitting(true);
    try {
      let profilePictureUrl = null;
      
      if (profilePicture) {
        // console.log('Uploading profile picture:', profilePicture);
        profilePictureUrl = await uploadImage(profilePicture);
      }
      console.log('Profile picture URL:', profilePictureUrl);
    // profilePictureUrl = 'https://example.com/default-profile-picture.png'; // Placeholder URL for testing
      const studentData = {
        email: data.email,
        full_name: data.fullName,
        pronoun: data.pronoun,
        major: data.major,
        profile_picture_url: profilePictureUrl,
        hobbies: hobbies,
        about_me: data.aboutMe || null
      };
      console.log('Submitting student data:', studentData);

      const { error } = await supabase
        .from('students')
        .insert([studentData]);

      if (error) throw error;

      setIsSubmitted(true);
      toast.success('Profile created successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to create profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-apple-50 to-primary-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-apple-lg shadow-apple-lg p-8 text-center max-w-md w-full">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-apple-900 mb-2">Profile Created!</h2>
          <p className="text-apple-600 mb-6">Your profile has been successfully submitted.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Create Another Profile
          </button>
        </div>
      </motion.div>
    );
  }

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

          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
            {/* Profile Picture - Now Mandatory */}
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
                      <span className="text-xs text-red-500 mt-1 block">Required</span>
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
                  Email Address *
                </label>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  type="email"
                  className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
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
              <input
                type="text"
                value={hobbyInput}
                onChange={(e) => setHobbyInput(e.target.value)}
                onKeyPress={addHobby}
                className="w-full px-4 py-3 border border-apple-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Type a hobby and press Enter"
              />
              {/* Hidden input for react-hook-form validation */}
              <input
                type="hidden"
                {...register('hobbies', { 
                  validate: () => hobbies.length > 0 || 'At least one hobby is required'
                })}
                value={hobbies.join(',')}
              />
              {errors.hobbies && (
                <p className="text-red-500 text-sm mt-1">{errors.hobbies.message}</p>
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

            {/* About Me */}
            <div>
              <label className="block text-sm font-medium text-apple-700 mb-2">
                About Me *
              </label>
              <textarea
                {...register('aboutMe', { required: 'Tell us something about yourself' })}
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
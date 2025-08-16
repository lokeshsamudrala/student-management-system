import React from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, BookOpen, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-apple-50 to-primary-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-apple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center h-16">
            <h1 className="text-2xl font-bold text-apple-900 font-sf">
              IT Eth, Pol, & Sec - Fall 2025
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full mb-8">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-apple-900 font-sf mb-6">
            Welcome to Your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-700">
              Class Portal
            </span>
          </h1>
          <p className="text-xl text-apple-600 max-w-3xl mx-auto leading-relaxed">
            Connect with your professor and classmates. Create your student profile or access the instructor dashboard to manage your classroom experience.
          </p>
        </motion.div>

        {/* Options Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Student Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group"
          >
            <Link
              to="/profile"
              className="block bg-white rounded-apple-lg shadow-apple hover:shadow-apple-lg transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/10"></div>
                <User className="h-20 w-20 text-white relative z-10" />
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center text-white">
                    <span className="text-lg font-semibold">For Students</span>
                    <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-apple-900 font-sf mb-4">
                  Create Profile
                </h3>
                {/* <p className="text-apple-600 mb-6 leading-relaxed">
                  Share your details with your professor. Create a comprehensive profile including your major, interests, and a bit about yourself to help build classroom connections.
                </p>
                <ul className="space-y-2 text-sm text-apple-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Upload profile picture
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Share your major and interests
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    Tell us about yourself
                  </li>
                </ul> */}
              </div>
            </Link>
          </motion.div>

          {/* Instructor Dashboard Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="group"
          >
            <Link
              to="/login"
              className="block bg-white rounded-apple-lg shadow-apple hover:shadow-apple-lg transition-all duration-300 overflow-hidden"
            >
              <div className="relative h-48 bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/10"></div>
                <GraduationCap className="h-20 w-20 text-white relative z-10" />
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center text-white">
                    <span className="text-lg font-semibold">For Instructors</span>
                    <ArrowRight className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold text-apple-900 font-sf mb-4">
                  Instructor Dashboard
                </h3>
                {/* <p className="text-apple-600 mb-6 leading-relaxed">
                  Access your comprehensive student management system. View student profiles, add notes, and organize your classroom with powerful visualization tools.
                </p>
                <ul className="space-y-2 text-sm text-apple-600">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    View all student profiles
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    Add and manage notes
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-primary-500 rounded-full mr-3"></div>
                    Room layout visualization
                  </li>
                </ul> */}
              </div>
            </Link>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-24 text-center"
        >
          <h2 className="text-3xl font-bold text-apple-900 font-sf mb-12">
            Built for Modern Classrooms
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-apple-900 mb-2">Student Profiles</h3>
              <p className="text-apple-600 text-sm">Comprehensive student information with photos, majors, and personal details</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-apple-900 mb-2">Class Management</h3>
              <p className="text-apple-600 text-sm">Powerful tools for organizing and tracking student information</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-apple-900 mb-2">Interactive Learning</h3>
              <p className="text-apple-600 text-sm">Foster connections and engagement in your classroom environment</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <div className="border-t border-apple-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-apple-600">
            <p className="text-sm">
              &copy; 2025 IT Ethics, Policy, & Security. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
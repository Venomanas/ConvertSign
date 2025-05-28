'use client'
import { useAuth } from '@/context/AuthContext'
import React from 'react'

interface userProfileProps{
   onClose: () => void;
}
const UserProfile: React.FC<userProfileProps>=({ onClose}) => {
    const { currentUser, signOut, userProfile } = useAuth();
    
    const handleSignOut = async() => {
        await signOut();
    } 
  return (
   <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-2xl font-bold text-gray-800">My Profile</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="border-t border-b py-4 my-4">
        <div className="flex items-center mb-4">
          <div className="h-12 w-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
            {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-4">
            <h3 className="font-medium text-lg">{userProfile?.displayName || 'User'}</h3>
            <p className="text-gray-600 text-sm">{currentUser?.email}</p>
          </div>
        </div>
        
        <div className="text-sm text-gray-600">
          <p>Account created: {userProfile ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}</p>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button 
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default UserProfile;
"use client"
import { useAuth } from '@/context/AuthContext';
import React, { useState } from 'react'

interface FormData{
    email:string;
    password:string;
    fullName: string;
    ConfirmPassword: string;
}

interface SignUpFormProps {
    onToggleForm:() => void;
    onAuthSuccess:() => void;
}

const SignUpForm:React.FC<SignUpFormProps>=({onToggleForm}) => {
    const { signUp} = useAuth();
    const [formData, setFormData] = useState<FormData>({
        fullName:'',
        password:'',
        ConfirmPassword:'',
        email:'',
    })
    const [error, setError] = useState<string>('');
    const[isLoading, setIsLoading]= useState<boolean>(false);

    const handleChange =(e: React.ChangeEvent<HTMLInputElement>):void =>{
        const {name , value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>):Promise<void> => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

      try {
          if(!formData.email || !formData.fullName || !formData.password){
              throw new Error('Please fill in all fields');
          }
  
          if(formData.password !== formData.ConfirmPassword){
              throw new Error ('Password do not match');
          }
  
          if(formData.password.length < 6){
              throw new Error('Password must be at least 6 character long')
          }
  
          //sign up the user 
          await signUp(formData.email, formData.fullName , formData.password);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'SignUp failed , please try again.';
        setError(errorMessage);
        throw err;
      }
      finally {
        setIsLoading(false);
      }
    }





  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Password must be at least 6 characters long
          </p>
        </div>
        
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.ConfirmPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md transition-colors ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>
      
      <div className="mt-6 text-center text-sm">
        <span className="text-gray-600">Already have an account?</span>{' '}
        <button
          onClick={onToggleForm}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};

export default SignUpForm
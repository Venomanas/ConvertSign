'use client'
import { useAuth } from '@/context/AuthContext'
import React, { useState } from 'react'

// defines Types 

interface FormData {
    email: string;
    password: string;
}

interface SignInFormProps {
    onToggleForm: () => void;
    onAuthSuccess: ()=> void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onToggleForm }) =>{
    const { signIn } = useAuth();
    const [formData, setFormData] = useState<FormData>({
        email: '',
        password: '',
    });
    const[error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void =>{
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });      
    };
    
    const handleSubmit = async(e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
          //validate inputs
          if (!formData.email || !formData.password) {
            throw new Error("please fill in all fields ");
          }

          // Sign in the user
          await signIn(formData.email, formData.password);
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : "Sign in failed. Please try again.";
          setError(errorMessage);
          throw err;
        } finally {
          setIsLoading(false);
        }  
    };

  return (
    <form onSubmit={handleSubmit} >
        <div>
            <input 
            type="email"
            name='email'
            value={formData.email}
            onChange={handleChange}
            placeholder='email'
            required
             />
        </div>
        <div>
            <input type="password" 
            name='password'
            value={formData.password}
            onChange={handleChange}
            placeholder='Password'
            required/>
        </div>
        {error && <div className='error'>{error}</div>}
    <button type='submit' disabled={isLoading}>
        {isLoading ? 'Signing In...':'Sign In'}
    </button>
    <button type='button' onClick={onToggleForm}>
        Switch to Sign Up
    </button>
    </form>
  )
}

export default SignInForm
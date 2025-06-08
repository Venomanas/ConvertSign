"use client";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";

// defines Types

interface FormData {
  email: string;
  password: string;
}

interface SignInFormProps {
  onToggleForm: () => void;
  onAuthSuccess: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onToggleForm }) => {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      //validate inputs
      if (!formData.email || !formData.password) {
        throw new Error("Please fill in all fields");
      }

      // Sign in the user
      await signIn(formData.email, formData.password);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Sign in failed. Please try again.";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="p-8 rounded-lg shadow-lg max-w-md w-full mx-auto"
      style={{ backgroundColor: "#FFDAB3" }}
    >
      <h2
        className="text-2xl font-bold mb-6 text-center"
        style={{ color: "#574964" }}
      >
        Welcome Back
      </h2>

      {error && (
        <div
          className="mb-4 p-3 text-sm rounded-md"
          style={{ backgroundColor: "#C8AAAA", color: "#574964" }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2"
            style={{ color: "#574964" }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: "#9F8383",
              color: "#574964",
              backgroundColor: "#FFDAB3",
            }}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-2"
            style={{ color: "#574964" }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
            style={{
              borderColor: "#9F8383",
              color: "#574964",
              backgroundColor: "#FFDAB3",
            }}
            placeholder="Enter your password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 rounded-md transition-colors mb-4"
          style={{
            backgroundColor: isLoading ? "#C8AAAA" : "#574964",
            color: isLoading ? "#9F8383" : "#FFDAB3",
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
          onMouseEnter={e => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = "#9F8383";
            }
          }}
          onMouseLeave={e => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = "#574964";
            }
          }}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="text-center text-sm">
        <span style={{ color: "#9F8383" }}>Don&apos;t have an account?</span>{" "}
        <button
          type="button"
          onClick={onToggleForm}
          className="font-medium transition-colors"
          style={{ color: "#574964" }}
          onMouseEnter={e => {
            e.currentTarget.style.color = "#9F8383";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = "#574964";
          }}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default SignInForm;

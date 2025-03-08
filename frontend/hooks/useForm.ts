"use client"
import { useState } from 'react';

export interface FormData {
  mood: string;
  activities: string;
  thoughts: string;
}

export const useForm = (userId: string) => {
  const initialFormData: FormData = {
    mood: '',
    activities: '',
    thoughts: '',
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update the handleInputChange function in your `useForm` hook
const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>  // Updated to include HTMLSelectElement
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...formData , userId}),
      });

      if (response.ok) {
        setFormData(initialFormData);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Something went wrong.');
      }
    } catch {
        setError('An error occurred while submitting your data.');
    } finally {
      setLoading(false);
    }

    return false;
  };

  return { formData, handleInputChange, handleSubmit, loading, error };
};

import { useState } from 'react';
import { useAuthContext } from './useAuthContext';
import axios from 'axios';

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  const login = async (emailOrUsername, password) => {
    setIsLoading(true);
    setError(null);

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const body = JSON.stringify({ emailOrUsername, password });

    try {
      const response = await axios.post(
        '/routes/api/actions/login',
        body,
        config
      );

      const json = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setError(json.error);
      }

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(json));

        //update the auth context
        dispatch({
          type: 'LOGIN',
          payload: json,
        });
        setIsLoading(false);
      }
    } catch (err) {
      console.log(err);
    }
  };
  return { login, isLoading, error };
};

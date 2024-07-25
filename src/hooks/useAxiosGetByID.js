// useAxiosGet.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from './useAuthContext';

const useAxiosGetById = () => {
  const { user } = useAuthContext();
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendRequest = async (url, resourceId) => {
    try {
      setIsLoading(true);

      const response = await axios.get(`${url}/${resourceId}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      });
      setResponse(response.data.data); // Adjust this based on your response structure
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { response, isLoading, error, sendRequest };
};

export default useAxiosGetById;

// useAxiosPut.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthContext } from './useAuthContext';

const useAxiosPut = () => {
  const { user } = useAuthContext();
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const updateResource = async (url, data) => {
    try {
      setIsLoading(true);

      const res = await axios.put(url, data, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      });

      setResponse(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return updateResource;
  }, [user.token]);

  return { response, error, isLoading, updateResource };
};

export default useAxiosPut;

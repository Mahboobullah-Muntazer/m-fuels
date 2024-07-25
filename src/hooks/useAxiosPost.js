import { useState } from 'react';
import axios from 'axios';

const useAxiosPost = () => {
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const sendRequest = async (url, data, config = {}) => {
    try {
      setIsLoading(true);

      const res = await axios.post(url, data, config);
      setResponse(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { response, error, isLoading, sendRequest };
};

export default useAxiosPost;

// useAxiosDelete.js
import { useState } from 'react';
import axios from 'axios';
import { useAuthContext } from './useAuthContext';

const useAxiosDeleteWithTwoIds = () => {
  const { user } = useAuthContext();
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const deleteResource = async (url, resourceId1, resourceId2) => {
    try {
      setIsLoading(true);

      // Make the DELETE request to the specified API endpoint with the necessary headers
      const res = await axios.delete(`${url}/${resourceId1}/${resourceId2}`, {
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': user.token,
        },
      });

      // Set the response data
      setResponse(res.data);

      // Optionally, you can handle the successful deletion in some way, e.g., update UI, show a notification, etc.
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { response, error, isLoading, deleteResource };
};

export default useAxiosDeleteWithTwoIds;

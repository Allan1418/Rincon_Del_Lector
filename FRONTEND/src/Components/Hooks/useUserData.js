import { useState, useEffect } from 'react';
import { getUserData } from '../../services/ProfileService';

export const useUserData = () => {
  const [profileData, setProfileData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('Authorization');
    if (token) {
      getUserData(token)
        .then(data => {
          setProfileData(data);
          setIsLoading(false);
        })
        .catch(err => {
          setError(err);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  return { profileData, isLoading, error };
};
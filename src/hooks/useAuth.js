// hooks/useAuth.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../Api/Api';  
import useAuthStore from '../store/Store';
import { encryptPayload } from '../utils/encrypt';  

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);

  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      try {
        const payload = {
          userName: credentials.userName,
          password: credentials.password,
          captcha: "is",
        };

        const encryptedMessage = encryptPayload(payload);

        const response = await api.post('/umt/login', {
          dataObject: encryptedMessage,
        });

        return response.data;
      } catch (error) {
        console.error('Login error:', error);
        throw error; 
      }
    },
    onSuccess: (data) => {
      if (data?.outcome) {
        setToken(data.data);
        queryClient.invalidateQueries(['user']);
        navigate('/');
      } else {
        console.log(data.data);
      }
    },
    onError: (error) => {
      console.error('Mutation failed:', error);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        const token = useAuthStore.getState().token;

        await api.post('/umt/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`,  
          },
        });

        useAuthStore.getState().clearAuth();  
        queryClient.clear();  

        navigate('/login');
      } catch (error) {
        console.error('Logout error:', error);
        throw error;  
      }
    },
    onSuccess: () => {
      console.log('Successfully logged out.');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
    },
  });

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isLoading,
    isLoggingOut: logoutMutation.isLoading,
  };
};

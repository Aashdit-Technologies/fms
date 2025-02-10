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
        toast.error(error.message || 'Login failed.');
        throw error; 
      }
    },
    onSuccess: (data) => {
      if (data?.outcome) {
        setToken(data.data);
        queryClient.invalidateQueries(['user']);
        toast.success(data.message || 'Login successful!');
        navigate('/');
      } else {
        toast.error(data.data || 'Login failed.');
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Login failed.');
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
        toast.error('Logout error:', error);
        throw error;  
      }
    },
    onSuccess: () => {
      toast.success('Successfully logged out.');
    },
    onError: (error) => {
      toast.error(error.message || 'Logout failed.');
    },
  });

  return {
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isLoading,
    isLoggingOut: logoutMutation.isLoading,
  };
};

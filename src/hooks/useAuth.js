
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from "react-toastify";
import { useNavigate } from 'react-router-dom';
import api from '../Api/Api';  
import useAuthStore from '../store/Store';
import { encryptPayload } from '../utils/encrypt';  
import { useEffect, useState } from 'react';

export const useAuth = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const [captcha, setCaptcha] = useState("");
  const setShowCaptchaField = useAuthStore((state) => state.setShowCaptchaField);

  const generateCaptcha = useMutation({
    mutationFn: async (credentials) => {
    try {

      if(!credentials.userName){
        toast.error("Please enter username.");
        return false;
      }else if (!credentials.password){
        toast.error("Please enter password.");
        return false;
      }

      const payload = { size:5,
        userName:credentials.userName
      };
      
      const encryptedMessage = encryptPayload(payload);

      const response = await api.post('allow/captcha', 
        { dataObject: encryptedMessage },
        { responseType: 'arraybuffer' } 
      );
     
      const base64 = btoa(
        new Uint8Array(response.data).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      
      setCaptcha(`data:image/png;base64,${base64}`);
      setShowCaptchaField(true);
      return true;
    } catch (error) {
      console.error("Error fetching Captcha data:", error);
      toast.error("Failed to generate captcha. Please try again.", {
        autoClose: 1000,
      });
      return false;
    }
  }
  });



  const loginMutation = useMutation({
    mutationFn: async (credentials) => {
      try {
        const payload = {
          userName: credentials.userName,
          password: credentials.password,
          captcha: credentials.userCaptcha,
          byPassCaptcha: true,
        };
  
        const encryptedMessage = encryptPayload(payload);
        
        const response = await api.post('/umt/login', {
          dataObject: encryptedMessage,
        });
  
        if (!response.data.outcome) {
          await generateCaptcha.mutateAsync({ 
          userName: credentials.userName, 
          password: credentials.password 
          });
          }
  
        return response.data;
      } catch (error) {
        await generateCaptcha.mutateAsync({ 
          userName: credentials.userName, 
          password: credentials.password 
          });
        const errorMessage = error.response?.data?.message || error.message || "Login failed.";
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    },
  
    onSuccess: (data) => {
      if (data?.outcome) {
        setToken(data.data);
        queryClient.invalidateQueries(['user']);
       
        navigate('/');
      } else {
        
        toast.error(data.message || 'Login failed.');
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
      toast.success('Logout successful!');
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
    captcha, 
    generateCaptcha:generateCaptcha.mutate
  };
};

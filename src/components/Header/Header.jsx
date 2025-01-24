import React, { useCallback, useState } from "react";
import "./Header.css";
import logo from "../../assets/cg-govt.png";
import { IoMdLogOut } from "react-icons/io";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Select, MenuItem, FormControl, InputLabel, CircularProgress } from "@mui/material";

const Header = ({ collapsed }) => {
  const token = useAuthStore((state) => state.token) || sessionStorage.getItem("token");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const prefetchRoles = useCallback(async () => {
    if (!token) return;
    await queryClient.prefetchQuery({
      queryKey: ['roles'],
      queryFn: fetchRoles,
      staleTime: 5 * 60 * 1000
    });
  }, [token, queryClient]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('get-roles', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.data?.outcome) {
        throw new Error(response.data?.message || 'Failed to fetch roles');
      }
      return response.data.data;
    } catch (error) {
      console.error('Roles fetch error:', error);
      // toast.error('Failed to fetch roles. Please try again later.');
      throw error;
    }
  };

  const { data: rolesData, isLoading: isLoadingRoles } = useQuery({
    queryKey: ['roles'],
    queryFn: fetchRoles,
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    onSuccess: (data) => {
      data?.forEach(role => {
        queryClient.setQueryData(
          ['role', role.employeeDeptMapId],
          role
        );
      });
    }
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({ employeeDeptMapId, employeeId }) => {
      const payload = { employeeDeptMapId, employeeId };
      const encryptedPayload = encryptPayload(payload);
      
      const response = await api.post('change-role', 
        { dataObject: encryptedPayload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Cache-Control': 'no-cache'
          }
        }
      );

      if (!response.data?.outcome) {
        throw new Error(response.data?.message || 'Role change failed');
      }
      return response.data;
    },
    onMutate: async ({ employeeDeptMapId }) => {
      await queryClient.cancelQueries(['roles']);
      await queryClient.cancelQueries(['menu']);
      
      const previousRoles = queryClient.getQueryData(['roles']);
      if (previousRoles) {
        queryClient.setQueryData(['roles'], old => 
          old?.map(role => ({
            ...role,
            isCurrent: role.employeeDeptMapId === employeeDeptMapId
          }))
        );
      }
      
      return { previousRoles };
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['menu']);
      toast.success('Role changed successfully', {
        autoClose: 1000,
      });
    },
    onError: (error, variables, context) => {
      if (context?.previousRoles) {
        queryClient.setQueryData(['roles'], context.previousRoles);
      }
      toast.error(error.message || 'Failed to change role');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['roles']);
      queryClient.invalidateQueries(['menu']);
    }
  });

  const handleRoleChange = async (event) => {
    try {
      const selectedRoleId = event.target.value;
      if (!selectedRoleId) return;

      const selectedRole = rolesData?.find(
        role => role.employeeDeptMapId === parseInt(selectedRoleId)
      );

      await changeRoleMutation.mutateAsync({
        employeeDeptMapId: parseInt(selectedRoleId),
        employeeId: selectedRole?.employeeId
      });
    } catch (error) {
      console.error('Role change error:', error);
    }
  };
  
  const handleLogout = () => {
    try {
      clearAuth();
      sessionStorage.removeItem('token');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  React.useEffect(() => {
    prefetchRoles();
  }, [prefetchRoles]);

  return (
    <div className={`header-sec ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="container-fluid">
        <div className="row align-items-center justify-content-end">
          <div className="col-md-4">
            <div className="left-header">
              <div className="logo-sec">
                <img src={logo} alt="Logo" />
              </div>
              <div className="logo-text">
                <h2>FILE MANAGEMENT SYSTEM</h2>
                <p>Government of Chhattisgarh</p>
              </div>
            </div>
          </div>
          <div className="col-md-8">
            <div className="header-right-sec d-flex align-items-center justify-content-end">
              <div className="header-right-sec-1">
                <FormControl variant="outlined" size="small" className="ms-3">
                  <InputLabel id="role-select-label">Role</InputLabel>
                  {rolesData && rolesData.length > 0 && <Select
                    labelId="role-select-label"
                    value={rolesData?.find(role => role.isCurrent)?.employeeDeptMapId || ''}
                    onChange={handleRoleChange}
                    disabled={isLoadingRoles || !token || changeRoleMutation.isLoading}
                    label="Role"
                  >
                    {isLoadingRoles ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} /> Loading...
                      </MenuItem>
                    ) : (
                      rolesData?.map((role) => (
                        <MenuItem key={role.employeeDeptMapId} value={role.employeeDeptMapId}>
                          {`${role.designationName} - ${role.departmentName} (${role.companyShortName})`}
                        </MenuItem>
                      ))
                    )}
                  </Select>}
                </FormControl>
              </div>
              <div className="header-right-sec-2 ms-3">
                <button
                  onClick={handleLogout}
                  className="logout-btn btn btn-dark"
                  style={{padding:"10px 22px"}}
                >
                  <IoMdLogOut className="icon-logout" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;

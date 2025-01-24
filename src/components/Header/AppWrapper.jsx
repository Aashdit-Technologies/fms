import React from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import api from "../../Api/Api";
import Header from "./Header";
import { toast } from "react-toastify";

const queryClient = new QueryClient();

const fetchRoles = async (token) => {
  const response = await api.get('/get-roles', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.data?.outcome) {
    throw new Error(response.data?.message || "Failed to fetch roles");
  }
  return response.data.data;
};

const AppWrapper = () => {
  const token = sessionStorage.getItem("token");

  const { data: rolesData, isLoading, error } = useQuery(
    ["roles"],
    () => fetchRoles(token),
    {
      enabled: !!token, 
      staleTime: 5 * 60 * 1000,
      cacheTime: 30 * 60 * 1000,
      onError: (error) => {
        console.error("Roles fetch error:", error);
        toast.error(error.message || "Failed to fetch roles.");
      },
    }
  );

  return (
    <QueryClientProvider client={queryClient}>
      <Header rolesData={rolesData} isLoadingRoles={isLoading} />
    </QueryClientProvider>
  );
};

export default AppWrapper;

import React, { useState } from 'react';
import { encryptPayload } from '../../utils/encrypt';
import './Hierarchy.css';
import api from '../../Api/Api';
import useAuthStore from '../../store/Store';
import { useQuery } from '@tanstack/react-query';

const Hierarchy = () => {
  const token = useAuthStore((state) => state.token) || sessionStorage.getItem("token");
  const [selectedOrganization, setSelectedOrganization] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['organizationList'],
    queryFn: async () => {
      try {
        const response = await api.get('/system/create-structure', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('API Response:', response.data); // Debug log
        
        // Extract organizationList from correct path
        return response.data?.data?.organizationList || [];
      } catch (error) {
        console.error('API Error:', error);
        throw error;
      }
    }
  });

  const organizationList = data || [];

  const handleOrganizationSelect = async (event) => {
    const selectedId = event.target.value;
    const selectedOrg = organizationList.find((org) => org.entityId === parseInt(selectedId));
    if (!selectedOrg) return;

    setSelectedOrganization(selectedOrg);

    const payload = {
      organizationName: selectedOrg.organizationName,
      combineTwo: selectedOrg.combineTwo
    };

    try {
      const response = await api.get('/system/create-structure', {
        params: { dataObject: encryptPayload(payload) },
        headers: {
          Authorization: `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      console.log('API response:', response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) return <div>Loading organizations...</div>;
  if (error) return <div>Error loading organizations</div>;
  if (!organizationList.length) return <div>No organizations found</div>;

  return (
    <div className="hierarchy-container">
      <h2>Organization Selector</h2>

      <div className="toolbar">
        <select 
          onChange={handleOrganizationSelect}
          value={selectedOrganization?.entityId || ''}
        >
          <option value="">Select Organization</option>
          {organizationList.map((org) => (
            <option key={org.entityId} value={org.entityId}>
              {org.organizationName || 'Unnamed Organization'}
            </option>
          ))}
        </select>
      </div>

      {selectedOrganization && (
        <div className="selected-info">
          <h3>Selected Organization Details</h3>
          <p><strong>Name:</strong> {selectedOrganization.organizationName}</p>
          <p><strong>Combine Two:</strong> {selectedOrganization.combineTwo}</p>
          <pre>{JSON.stringify(selectedOrganization, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Hierarchy;

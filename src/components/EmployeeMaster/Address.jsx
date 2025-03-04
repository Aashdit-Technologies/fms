import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
} from "@mui/material";
import useFormStore from "../EmployeeMaster/store";
import api from "../../Api/Api";
import useAuthStore from "../../store/Store";
import { encryptPayload } from "../../utils/encrypt";
import { toast } from "react-toastify";
import { PageLoader } from "../pageload/PageLoader";
import { useQuery } from "@tanstack/react-query";

const fetchAddressDropdownData = async () => {
  const endpoints = [
    "common/get-country-list",
    "common/get-state-list",
    "common/get-district-list",
    "common/get-city-list",
  ];

  const requests = endpoints.map((endpoint) =>
    api.get(endpoint)
      .then((res) => ({ success: true, data: res.data.data || [] }))
      .catch((error) => {
        console.error(`Error fetching ${endpoint}:`, error);
        return { success: false, data: [] };
      })
  );

  const responses = await Promise.allSettled(requests);

  return responses.map((res) => (res.status === "fulfilled" && res.value.success ? res.value.data : []));
};


const AddressForm = () => {
  const { updateFormData, setActiveTab, formData, activeTab } = useFormStore();
  const [isLoading, setIsLoading] = useState(false);
  const [presentAddress, setPresentAddress] = useState({
    countryId: "",
    stateId: "",
    districtId: "",
    cityId: "",
    pincode: "",
    isPermanent: "",
    addressType:"PRESENT",
  });

  const [isSameAddress, setIsSameAddress] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState({ ...presentAddress });
    const token = useAuthStore.getState().token;

    const { data} = useQuery({
      queryKey: ["dropdownData"],
      queryFn: fetchAddressDropdownData,
      staleTime: 5 * 60 * 1000, 
    });

    const [country = [], state = [], district = [], city = []] = data ?? [[], [], [], []];

console.log("state",state)
console.log("state",state)

  const handleChange = (event, section) => {
    debugger
    const { name, value } = event.target;
  
    if (section === "present") {
      setPresentAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
  
   
      if (isSameAddress) {
        setPermanentAddress((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    } else if (section === "permanent") {
      setPermanentAddress((prev) => ({
        ...prev,
        [name]: value,
      }));
    }   
  };
  

  const handleCheckboxChange = (event) => {
    debugger
    const isChecked = event.target.checked;
    setIsSameAddress(isChecked);
  
    if (isChecked) {
    
      setPermanentAddress({
        countryId: "",
        stateId: "",
        districtId: "",
        cityId: "",
        pincode: "",
        isPermanent: true,
        addressType:"PERMANENT",
      });
    } else {
     
      setPermanentAddress({ ...presentAddress, isPermanent: true });
    }
  };
  

  const handleBack = () => {
    updateFormData("employmentDetails", rows);
    setActiveTab(2);
  };

  const handleSaveAndNext = async () => {
    const storedEmployeeId = useFormStore.getState().employeeId;
 
    setIsLoading(true);
  
    try {
      const addressDetails = [
        {
          addressId:  null,
          countryId: presentAddress.countryId ?? null,
          stateId: presentAddress.stateId ?? null,
          districtId: presentAddress.districtId ?? null,
          cityId: presentAddress.cityId ?? null,
          pincode: presentAddress.pincode ?? null,
          isPermanent: isSameAddress ? true : false, 
          addressType: "PRESENT", 
        },
      ];
  
      
      if (!isSameAddress) {
        addressDetails.push({
          addressId:  null,
          countryId: permanentAddress.countryId ?? null,
          stateId: permanentAddress.stateId ?? null,
          districtId: permanentAddress.districtId ?? null,
          cityId: permanentAddress.cityId ?? null,
          pincode: permanentAddress.pincode ?? null,
          isPermanent: false, 
          addressType: "PERMANENT",
        });
      }
  
      const payload = {
        employeeId: storedEmployeeId ?? null,
        addressDetails,
      };
  
      const encryptedPayload = encryptPayload(payload);
  
      const response = await api.post(
        "governance/save-or-update-employee-address",
        { dataObject: encryptedPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      if (response.data?.outcome) {
        const { employeeCode, employeeId } = response.data.data;
  
        useFormStore.getState().setEmployeeCode(employeeCode);
        useFormStore.getState().setEmployeeId(employeeId);
  
        updateFormData("address", payload.addressDetails);
  
        toast.success("Address details saved successfully!", { position: "top-right", autoClose: 3000 });
  
        setActiveTab("EDUCATION");
      } else {
        toast.error(response.data?.message || "Failed to save address details.");
      }
    } catch (error) {
      console.error("Error saving address details:", error);
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // useEffect(() => {
 
  
  //   if (activeTab === "ADDRESS") {
  //     debugger
  //     const storedData = formData?.address?.addressDetails || [];
  //     const addressType = formData?.address?.addressType || "";

  
  //     if (storedData.length > 0) {
  //       if(addressType == 'PERMANENT'){
  //         const permanentAddr = storedData.find(addr => addr.addressType === 'PERMANENT') || {};

  //         setPermanentAddress({
  //           addressId:  null,
  //           countryId: permanentAddr?.countryId ?? "",
  //           stateId: permanentAddr?.stateId ?? "",
  //           districtId: permanentAddr?.districtId ?? "",
  //           cityId: permanentAddr?.cityId ?? "",
  //           pincode: permanentAddr?.pinCode ?? "",
  //           isPermanent: permanentAddr?.IsPermanent ?? true,
  //         });
  //         setIsSameAddress(addressType === "PERMANENT");
  //     }else if(addressType == 'PRESENT'){
  //       const presentAddr = storedData.find(addr => addr.addressType === 'PRESENT') || {};
  //       const permanentAddr = storedData.find(addr => addr.addressType === 'PERMANENT') || {};
        
  //       setPermanentAddress({
  //         addressId:  null,
  //         countryId: permanentAddr?.countryId ?? "",
  //         stateId: permanentAddr?.stateId ?? "",
  //         districtId: permanentAddr?.districtId ?? "",
  //         cityId: permanentAddr?.cityId ?? "",
  //         pincode: permanentAddr?.pinCode ?? "",
  //         isPermanent: permanentAddr?.IsPermanent ?? true,
  //       });

  //       setPresentAddress({
  //         addressId:  null,
  //         countryId: presentAddr?.countryId ?? "",
  //         stateId: presentAddr?.stateId ?? "",
  //         districtId: presentAddr?.districtId ?? "",
  //         cityId: presentAddr?.cityId ?? "",
  //         pincode: presentAddr?.pinCode ?? "",
  //         isPermanent: presentAddr?.IsPermanent ?? false,
  //       });

  //       setIsSameAddress(addressType === "PERMANENT");
  //     }

        
  //     } else {
      
  //       setPresentAddress({
  //         countryId: "",
  //         stateId: "",
  //         districtId: "",
  //         cityId: "",
  //         pincode: "",
  //         isPermanent: false,
  //       });
  //       setPermanentAddress({
  //         countryId: "",
  //         stateId: "",
  //         districtId: "",
  //         cityId: "",
  //         pincode: "",
  //         isPermanent: false,
  //       });
  //       setIsSameAddress(false);
  //     }
  //   }
  // }, [activeTab, formData]);
  
  useEffect(() => {
    if (activeTab === "ADDRESS") {
      const storedData = formData?.address?.addressDetails || [];
      const addressType = formData?.address?.addressType || "";
  
      console.log("storedData:", storedData); // Debugging
      console.log("addressType:", addressType); // Debugging
  
      if (storedData.length > 0) {
        const permanentAddr = storedData.find(addr => addr.addressType === 'PERMANENT') || {};
        const presentAddr = storedData.find(addr => addr.addressType === 'PRESENT') || {};
  
        console.log("permanentAddr:", permanentAddr); // Debugging
        console.log("presentAddr:", presentAddr); // Debugging
  
        // Always set Permanent Address
        setPermanentAddress({
          addressId: permanentAddr?.addressId ?? null,
          countryId: permanentAddr?.countryId ?? "",
          stateId: permanentAddr?.stateId ?? "",
          districtId: permanentAddr?.districtId ?? "",
          cityId: permanentAddr?.cityId ?? "",
          pincode: permanentAddr?.pinCode ?? "",
          isPermanent: permanentAddr?.IsPermanent ?? true,
        });
  
        // Always set Present Address (if presentAddr exists)
        setPresentAddress({
          addressId: presentAddr?.addressId ?? null,
          countryId: presentAddr?.countryId ?? "",
          stateId: presentAddr?.stateId ?? "",
          districtId: presentAddr?.districtId ?? "",
          cityId: presentAddr?.cityId ?? "",
          pincode: presentAddr?.pinCode ?? "",
          isPermanent: presentAddr?.IsPermanent ?? false,
        });
  
        // Set isSameAddress based on addressType
        setIsSameAddress(addressType === "PERMANENT");
      } else {
        // If no stored data, reset addresses
        setPresentAddress({
          addressId: null,
          countryId: "",
          stateId: "",
          districtId: "",
          cityId: "",
          pincode: "",
          isPermanent: false,
        });
        setPermanentAddress({
          addressId: null,
          countryId: "",
          stateId: "",
          districtId: "",
          cityId: "",
          pincode: "",
          isPermanent: false,
        });
        setIsSameAddress(false);
      }
    }
  }, [activeTab, formData]);

  return (
    <>
     {isLoading && <PageLoader/>}
    <Box >
        <Typography variant="h6" sx={{ color: "red", mb: 1 ,fontSize:"16px"}}>
        Present Address
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={3}>
          <TextField select 
          fullWidth 
          label="Country" 
          name="countryId" 
          value={presentAddress.countryId || ""} 
          onChange={(e) => handleChange(e, "present")}
          InputProps={{ sx: { height: '50px' }}}
          >
          {country.map(({ countryId, countryName }) => (
         <MenuItem key={countryId} value={countryId}>{countryName}</MenuItem>
))}
          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField select fullWidth
           label="State"
            name="stateId"
             value={presentAddress.stateId || ""} 
             onChange={(e) => handleChange(e, "present")}
             InputProps={{ sx: { height: '50px' }}}
             >
            {state.map(({ stateId, stateName }) => (
              <MenuItem key={stateId} value={stateId}>{stateName}</MenuItem>
            ))}

          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField select fullWidth
           label="District"
            name="districtId"
             value={presentAddress.districtId || ""}
              onChange={(e) => handleChange(e, "present")}
              InputProps={{ sx: { height: '50px' }}}
              >
            {district.map(({ districtId, districtName }) => (
            <MenuItem key={districtId} value={districtId}>{districtName}</MenuItem>
          ))}

          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField select fullWidth 
          label="City" 
          name="cityId" 
          value={presentAddress.cityId || ""}
           onChange={(e) => handleChange(e, "present")}
           InputProps={{ sx: { height: '50px' }}}
           >
           {city.map(({ cityId, cityName }) => (
          <MenuItem key={cityId} value={cityId}>{cityName}</MenuItem>
        ))}

          </TextField>
        </Grid>
        <Grid item xs={3}>
          <TextField fullWidth 
          label="Pin"
           name="pincode" 
           value={presentAddress.pincode || ""} 
           onChange={(e) => handleChange(e, "present")} 
           InputProps={{ sx: { height: '50px' }}}
           />
        </Grid>
        
      </Grid>

      <FormControlLabel
  control={<Checkbox checked={isSameAddress} onChange={handleCheckboxChange} color="primary" />}
  label="Permanent address is same as present address?"
  sx={{ mb: 2, fontSize: "14px" }}
/>

{permanentAddress && !isSameAddress && (
        <>
          <Typography variant="h6" sx={{ color: "red", mb: 1 ,fontSize:"16px"}}>
            Permanent Address
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={3}>
              <TextField select fullWidth
               label="Country" 
               name="countryId" 
               value={permanentAddress.countryId || ""} 
               onChange={(e) => handleChange(e, "permanent")}
               InputProps={{ sx: { height: '50px' }}}
               >
                 {country.map(({ countryId, countryName }) => (
              <MenuItem key={countryId} value={countryId}>{countryName}</MenuItem>
              ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField select fullWidth
               label="State"
                name="stateId"
                 value={permanentAddress.stateId || ""} 
                 onChange={(e) => handleChange(e, "permanent")}
                 InputProps={{ sx: { height: '50px' }}}
                 >
                {state.map(({ stateId, stateName }) => (
                <MenuItem key={stateId} value={stateId}>{stateName}</MenuItem>
              ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField select fullWidth
               label="District" 
               name="districtId" 
               value={permanentAddress.districtId || ""}
                onChange={(e) => handleChange(e, "permanent")}
                InputProps={{ sx: { height: '50px' }}}
                >
               {district.map(({ districtId, districtName }) => (
              <MenuItem key={districtId} value={districtId}>{districtName}</MenuItem>
            ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField select fullWidth
               label="City" 
               name="cityId"
                value={permanentAddress.cityId || ""}
                 onChange={(e) => handleChange(e, "permanent")}
                 InputProps={{ sx: { height: '50px' }}}
                 >
                     {city.map(({ cityId, cityName }) => (
                     <MenuItem key={cityId} value={cityId}>{cityName}</MenuItem>
                    ))}
              </TextField>
            </Grid>
            <Grid item xs={3}>
              <TextField fullWidth
               label="Pin" 
               name="pincode" 
               value={permanentAddress.pincode || ""}
                onChange={(e) => handleChange(e, "permanent")} 
                InputProps={{ sx: { height: '50px' }}}
                />
            </Grid>
           
          </Grid>
        </>
      )}

      <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
                <Button variant="contained" color="secondary" onClick={handleBack}>
                  Back
                </Button>
                <Button variant="contained" color="primary" onClick={handleSaveAndNext}>
                  Save & Next
                </Button>
              </Box>
    </Box>
    </>
  );
};

export default AddressForm;




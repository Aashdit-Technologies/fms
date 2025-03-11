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
  FormControl,
  InputLabel,
  Select,
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
    "common/get-state-list-by-country-id", 
    "common/get-district-list-by-state-id", 
    "common/get-city-list-by-district-id", 
  ];

  
  const countryResponse = await api
    .get(endpoints[0])
    .then((res) => {
      console.log("Country response:", res.data);
      const data = res.data.data || res.data;
      return { success: true, data };
    })
    .catch((error) => {
      console.error(`Error fetching ${endpoints[0]}:`, error);
      return { success: false, data: [] };
    });

  if (!countryResponse.success || !countryResponse.data.length) {
    return [[], [], [], []]; 
  }

  const countryId = countryResponse.data[0].countryId;
  console.log("Selected countryId:", countryId);

 
  const encryptedStatePayload = encryptPayload({ countryId });
  console.log("Encrypted payload for state:", encryptedStatePayload);

  const stateResponse = await api
    .post(
      endpoints[1],
      { dataObject: encryptedStatePayload }, 
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      console.log("State response:", res.data);
      const data = res.data.data || res.data;
      return { success: true, data };
    })
    .catch((error) => {
      console.error(`Error fetching ${endpoints[1]}:`, error);
      return { success: false, data: [] };
    });

  if (!stateResponse.success || !stateResponse.data.length) {
    return [countryResponse.data, [], [], []]; 
  }

  const stateId = stateResponse.data[0].stateId; 
  console.log("Selected stateId:", stateId);

  
  const encryptedDistrictPayload = encryptPayload({ stateId });
  console.log("Encrypted payload for district:", encryptedDistrictPayload);

  const districtResponse = await api
    .post(
      endpoints[2],
      { dataObject: encryptedDistrictPayload }, 
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      console.log("District response:", res.data);
      const data = res.data.data || res.data;
      return { success: true, data };
    })
    .catch((error) => {
      console.error(`Error fetching ${endpoints[2]}:`, error);
      return { success: false, data: [] };
    });

  if (!districtResponse.success || !districtResponse.data.length) {
    return [countryResponse.data, stateResponse.data, [], []]; 
  }

  const districtId = districtResponse.data[0].districtId; 
  console.log("Selected districtId:", districtId);


  const encryptedCityPayload = encryptPayload({ districtId });
  console.log("Encrypted payload for city:", encryptedCityPayload);

  const cityResponse = await api
    .post(
      endpoints[3],
      { dataObject: encryptedCityPayload },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      console.log("City response:", res.data);
      const data = res.data.data || res.data;
      return { success: true, data };
    })
    .catch((error) => {
      console.error(`Error fetching ${endpoints[3]}:`, error);
      return { success: false, data: [] };
    });

  return [
    countryResponse.data,
    stateResponse.data,
    districtResponse.data,
    cityResponse.data,
  ];
};


const AddressForm = ({handleTabChange}) => {
  const { updateFormData, setActiveTab, formData, activeTab } = useFormStore();
  const [isLoading, setIsLoading] = useState(false);
  const [presentAddress, setPresentAddress] = useState({
    countryId: "",
    stateId: "",
    districtId: "",
    cityId: "",
    pincode: "",
    isPermanent: "",
    addressType: "PRESENT",
  });

  const [isSameAddress, setIsSameAddress] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState({
    ...presentAddress,
  });
  const token = useAuthStore.getState().token;
 const [errors, setErrors] = useState({});
 
const { data } = useQuery({
  queryKey: ["dropdownaddressData"],
  queryFn: fetchAddressDropdownData,
  staleTime: 5 * 60 * 1000,
});

const [country = [], state = [], district = [], city = []] = data ?? [[], [], [], []];



  const handleChange = (event, section) => {
  
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
        addressType: "PERMANENT",
      });
    } else {
      setPermanentAddress({ ...presentAddress, isPermanent: true });
    }
  };
  const [openDropdown, setOpenDropdown] = useState({
    country: false,
    state: false,
    district: false,
    city: false,
  });
  const handleBack = () => {
    if (typeof handleTabChange !== "function") {
      console.error("handleTabChange is not a function! Received:", handleTabChange);
      return;
    }
    handleTabChange(null, "FAMILY_DETAILS");
  };

  const handleSaveAndNext = async () => {
    const storedEmployeeId = useFormStore.getState().employeeId;

 
 const { newErrors: presentErrors, isValid: isPresentValid } = validateAddressFields(
  presentAddress,
  "present"
);


let permanentErrors = {};
let isPermanentValid = true;
if (permanentAddress && !isSameAddress) {
  const { newErrors, isValid } = validateAddressFields(
    permanentAddress,
    "permanent"
  );
  permanentErrors = newErrors;
  isPermanentValid = isValid;
}


const allErrors = { ...presentErrors, ...permanentErrors };
setErrors(allErrors);


if (!isPresentValid || !isPermanentValid) {
  console.log("Form has errors. Please fix them.");
  return; 
}

    setIsLoading(true);

    try {
      const addressDetails = [
        {
          addressId: null,
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
          addressId: null,
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

        toast.success(response.data.message);

        setActiveTab("EDUCATION");
      } else {
        toast.error(
          response.data?.message || "Failed to save address details."
        );
      }
    } catch (error) {
      console.error("Error saving address details:", error);
      toast.error("An error occurred while saving. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "ADDRESS") {
      const storedData = formData?.address?.addressDetails || [];
      const addressType = formData?.address?.addressType || "";

      if (storedData.length > 0) {
        const permanentAddr =
          storedData.find((addr) => addr.addressType === "PERMANENT") || {};
        const presentAddr =
          storedData.find((addr) => addr.addressType === "PRESENT") || {};

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




  const validateAddressFields = (address, type) => {
    const newErrors = {};
    let isValid = true;
  
    
    if (!address.countryId) {
      newErrors[`${type}CountryId`] = "Country is required.";
      isValid = false;
    }
  
   
    if (!address.stateId) {
      newErrors[`${type}StateId`] = "State is required.";
      isValid = false;
    }
  
   
    if (!address.districtId) {
      newErrors[`${type}DistrictId`] = "District is required.";
      isValid = false;
    }
  
  
    if (!address.cityId) {
      newErrors[`${type}CityId`] = "City is required.";
      isValid = false;
    }
  
   
    if (!address.pincode) {
      newErrors[`${type}Pincode`] = "Pincode is required.";
      isValid = false;
    } 
  
    return { newErrors, isValid };
  };
  return (
    <>
      {isLoading && <PageLoader />}
      <Box>
        <Typography variant="h6" sx={{ color: "red", mb: 1, fontSize: "16px" }}>
          Present Address
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>

       
      <Grid item xs={3}>
     <TextField
       select
       fullWidth
       label={
      <>
        Country <span style={{ color: "red" }}>*</span>
      </>
    }
    name="countryId"
    value={presentAddress.countryId || ""}
    onChange={(e) => {
      const countryId = e.target.value;
      setPresentAddress((prev) => ({
        ...prev,
        countryId,
        stateId: "",
        districtId: "",
        cityId: "",
      }));
      setErrors((prevErrors) => ({ ...prevErrors, presentCountryId: "" }));
    }}
    displayEmpty
    sx={{
      height: "50px",
      
      "& .MuiSelect-select": { paddingLeft: "10px" }, 
    }}

    InputProps={{ sx: { height: "50px" } }}
    error={!!errors.presentCountryId}
    helperText={errors.presentCountryId}
  >
     <MenuItem value="">
              <em>--Select Country--</em>
            </MenuItem>
            {country.map(({ countryId, countryName }) => (
              <MenuItem key={countryId} value={countryId}>
                {countryName}
              </MenuItem>
            ))}
  </TextField>
     </Grid>
      <Grid item xs={3}>
        <TextField
          select
          fullWidth
          label={
            <>
              State <span style={{ color: "red" }}>*</span>
            </>
          }
          name="stateId"
          value={presentAddress.stateId || ""}
          onChange={(e) => {
            const stateId = e.target.value;
            setPresentAddress((prev) => ({
              ...prev,
              stateId,
              districtId: "",
              cityId: "",
            }));
            setErrors((prevErrors) => ({ ...prevErrors, presentStateId: "" }));
          }}
          disabled={!presentAddress.countryId}
          MenuProps={{ autoFocus: false }}
          InputProps={{ sx: { height: "50px" } }}
          error={!!errors.presentStateId}
          helperText={errors.presentStateId}
        
        >
          <MenuItem value="">--Select State--</MenuItem>
          {state.map(({ stateId, stateName }) => (
            <MenuItem key={stateId} value={stateId}>
              {stateName}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

      <Grid item xs={3}>
        <TextField
          select
          fullWidth
          label={
            <>
              District <span style={{ color: "red" }}>*</span>
            </>
          }
          name="districtId"
          value={presentAddress.districtId || ""}
          onChange={(e) => {
            const districtId = e.target.value;
            setPresentAddress((prev) => ({
              ...prev,
              districtId,
              cityId: "",
            }));
            setErrors((prevErrors) => ({ ...prevErrors, presentDistrictId: "" }));
          }}
          disabled={!presentAddress.stateId}
          MenuProps={{ autoFocus: false }}
          InputProps={{ sx: { height: "50px" } }}
          error={!!errors.presentDistrictId}
          helperText={errors.presentDistrictId}
        
        >
          <MenuItem value="">--Select District--</MenuItem>
          {district.map(({ districtId, districtName }) => (
            <MenuItem key={districtId} value={districtId}>
              {districtName}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

     
        <Grid item xs={3}>
          <TextField
            select
            fullWidth
            label={
              <>
                City <span style={{ color: "red" }}>*</span>
              </>
            }
            name="cityId"
            value={presentAddress.cityId || ""}
            onChange={(e) => {
              setPresentAddress((prev) => ({
                ...prev,
                cityId: e.target.value,
              }));
              setErrors((prevErrors) => ({ ...prevErrors, presentCityId: "" }));
            }}
            disabled={!presentAddress.districtId}
            MenuProps={{ autoFocus: false }}
            InputProps={{ sx: { height: "50px" } }}
            error={!!errors.presentCityId}
            helperText={errors.presentCityId}
          
          >
            <MenuItem value="">--Select City--</MenuItem>
            {city.map(({ cityId, cityName }) => (
              <MenuItem key={cityId} value={cityId}>
                {cityName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>



          <Grid item xs={3}>
            <TextField
              fullWidth
            
              label={
                <>
                Pin <span style={{color:"red"}}>*</span>
                </>
              }
              name="pincode"
              value={presentAddress.pincode || ""}
              
              onChange={(e) => {
                const value = e.target.value;
                
                if (/^\d*$/.test(value)) {
                  handleChange(e, "present");
                  setErrors((prevErrors) => ({ ...prevErrors, presentPincode: "" }));
                }
              }}
              onKeyDown={(e) => {
                
                if (!/\d/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
                  e.preventDefault();
                }
              }}
           
              InputProps={{ sx: { height: "50px" } }}
              inputProps={{  maxLength: 6}}
              error={!!errors.presentPincode}
              helperText={errors.presentPincode}
            />
          </Grid>
        </Grid>

        <FormControlLabel
          control={
            <Checkbox
              checked={isSameAddress}
              onChange={handleCheckboxChange}
              color="primary"
            />
          }
          label="Permanent address is same as present address?"
          sx={{ mb: 2, fontSize: "14px" }}
        />

        {permanentAddress && !isSameAddress && (
          <>
            <Typography
              variant="h6"
              sx={{ color: "red", mb: 1, fontSize: "16px" }}
            >
              Permanent Address
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>

              <Grid item xs={3}>
              <TextField
                select
                fullWidth
                label={
                <>
                  Country <span style={{ color: "red" }}>*</span>
                </>
              }
              name="countryId"
              value={permanentAddress.countryId || ""}
              onChange={(e) => {
                const countryId = e.target.value;
                setPermanentAddress((prev) => ({
                  ...prev,
                  countryId,
                  stateId: "",
                  districtId: "",
                  cityId: "",
                }));
                setErrors((prevErrors) => ({ ...prevErrors, permanentCountryId: "" }));
              }}
              displayEmpty
              sx={{
                height: "50px",
                
                "& .MuiSelect-select": { paddingLeft: "10px" }, 
              }}

              InputProps={{ sx: { height: "50px" } }}
              error={!!errors.permanentCountryId}
              helperText={errors.permanentCountryId}
            >
              <MenuItem value="">
                        <em>--Select Country--</em>
                      </MenuItem>
                      {country.map(({ countryId, countryName }) => (
                        <MenuItem key={countryId} value={countryId}>
                          {countryName}
                        </MenuItem>
                      ))}
            </TextField>
              </Grid>

        
              <Grid item xs={3}>
                <TextField
                  select
                  fullWidth
                  label={
                    <>
                      State <span style={{ color: "red" }}>*</span>
                    </>
                  }
                  name="stateId"
                  value={permanentAddress.stateId || ""}
                  onChange={(e) => {
                    const stateId = e.target.value;
                    setPermanentAddress((prev) => ({
                      ...prev,
                      stateId,
                      districtId: "",
                      cityId: "",
                    }));
                    setErrors((prevErrors) => ({ ...prevErrors, permanentStateId: "" }));
                  }}
                  disabled={!permanentAddress.countryId}
                  MenuProps={{ autoFocus: false }}
                  InputProps={{ sx: { height: "50px" } }}
                error={!!errors.permanentStateId}
                  helperText={errors.permanentStateId}
                
                >
                  <MenuItem value="">--Select State--</MenuItem>
                  {state.map(({ stateId, stateName }) => (
                    <MenuItem key={stateId} value={stateId}>
                      {stateName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>


              <Grid item xs={3}>
                    <TextField
                      select
                      fullWidth
                      label={
                        <>
                          District <span style={{ color: "red" }}>*</span>
                        </>
                      }
                      name="districtId"
                      value={permanentAddress.districtId || ""}
                      onChange={(e) => {
                        const districtId = e.target.value;
                        setPermanentAddress((prev) => ({
                          ...prev,
                          districtId,
                          cityId: "",
                        }));
                        setErrors((prevErrors) => ({ ...prevErrors, permanentDistrictId: "" }));
                      }}
                      disabled={!permanentAddress.stateId}
                      MenuProps={{ autoFocus: false }}
                      InputProps={{ sx: { height: "50px" } }}
                      error={!!errors.permanentDistrictId}
                      helperText={errors.permanentDistrictId}
                    
                    >
                      <MenuItem value="">--Select District--</MenuItem>
                      {district.map(({ districtId, districtName }) => (
                        <MenuItem key={districtId} value={districtId}>
                          {districtName}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>


            <Grid item xs={3}>
              <TextField
                select
                fullWidth
                label={
                  <>
                    City <span style={{ color: "red" }}>*</span>
                  </>
                }
                name="cityId"
                value={permanentAddress.cityId || ""}
                onChange={(e) => {
                  setPermanentAddress((prev) => ({
                    ...prev,
                    cityId: e.target.value,
                  }));
                  setErrors((prevErrors) => ({ ...prevErrors, permanentCityId: "" }));
                }}
                disabled={!permanentAddress.districtId}
                MenuProps={{ autoFocus: false }}
                InputProps={{ sx: { height: "50px" } }}
                error={!!errors.permanentCityId}
                helperText={errors.permanentCityId}
              
              >
                <MenuItem value="">--Select City--</MenuItem>
                {city.map(({ cityId, cityName }) => (
                  <MenuItem key={cityId} value={cityId}>
                    {cityName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>


              <Grid item xs={3}>
                <TextField
                 fullWidth
                 label={
                  <>
                  Pin <span style={{color:"red"}}>*</span>
                  </>
                }
                  name="pincode"
                  value={permanentAddress.pincode || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    
                    if (/^\d*$/.test(value)) {
                      handleChange(e, "permanent");
                      setErrors((prevErrors) => ({ ...prevErrors, permanentPincode: "" }));
                    }
                  }}
                  onKeyDown={(e) => {
                    
                    if (!/\d/.test(e.key) && e.key !== "Backspace" && e.key !== "Delete" && e.key !== "Tab") {
                      e.preventDefault();
                    }
                  }}
                  inputProps={{  maxLength: 6}}
                  InputProps={{ sx: { height: "50px" } }}
                  error={!!errors.permanentPincode}
                  helperText={errors.permanentPincode}
                />
              </Grid>
            </Grid>
          </>
        )}

        <Box sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}>
          <Button variant="contained" color="secondary" onClick={handleBack}>
            Back
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveAndNext}
          >
            {formData?.address?.addressDetails && formData?.address?.addressDetails.length > 0 ? "Update & Next" : "Save & Next"}
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default AddressForm;

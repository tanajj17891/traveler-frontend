import api from "./axios"; // does all the backends calls


export type CreateProfileRequest = { // This function expects an object shaped like a profile.
  cognitoSub: string;
  email: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dateOfBirth?: string;
  state?: string;
  city?: string;
  travelStyle?: string[];
  preferences?: string[];
};

export const createProfile = async (
  profileData: CreateProfileRequest,
  token: string
) => {
  const response = await api.post("/profile", profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getProfile = async (cognitoSub: string, token: string) => {
  const response = await api.get(`/profile/${cognitoSub}`, { //gets access token from backend 
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

 export const updateProfile = async (
  cognitoSub: string,
  profileData: Partial<CreateProfileRequest>,
  token: string
) => {
  const response = await api.put(`/profile/${cognitoSub}`, profileData,{
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

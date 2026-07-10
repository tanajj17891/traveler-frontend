import api from "./axios";


  export type Destination = {
  name: string;
  latitude: number;
  longitude: number;
  arrivalDate: string;
  leavingDate: string;
};


export type Budget = {
  currency: string;
  total: number;
  flights: number;
  accommodation: number;
  food: number;
  activities: number;
  misc: number;
};

export type CreateTripRequest = {
  profileId: string;
  tripName: string;
  destination: Destination[];
  travelers: string[];
  budget: Budget;
  notes: string[];
  status: "PLANNING" | "UPCOMING" | "IN_PROGRESS" | "COMPLETED";
};
export type Trip = CreateTripRequest & {
  tripId: string;
  createdAt: string;
  updatedAt: string;
};

export const createTrip = async (
  tripData: CreateTripRequest,
  token: string
) => {
  const response = await api.post("/trips", tripData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getTrip = async (
  tripId: string,
  token: string
) => {
  const response = await api.get(`/trips/by-id/${tripId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const updateTrip = async (
  tripId: string,
  tripData: Partial<CreateTripRequest>,
  token: string
) => {
  const response = await api.put(`/trips/${tripId}`, tripData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const deleteTrip = async (
  tripId: string,
  token: string
) => {
  const response = await api.delete(`/trips/${tripId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getTripsByProfileId = async ( // will get all trips planned by one user not just one, callls thr backend 
  profileId: string,
  token: string
): Promise<Trip[]> => {
  const response = await api.get(`/trips/by-profile/${profileId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
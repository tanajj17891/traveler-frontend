import api from "./axios";

export type CreateTravelerRequest = {
  tripId: string;
  profileId: string;
  email: string;
};

export type TravelerResponse = CreateTravelerRequest & {
  travelerId: string;
  createdAt: string;
  updatedAt: string;
};

export const createTraveler = async (
  travelerData: CreateTravelerRequest,
  token: string,
): Promise<TravelerResponse> => {
  const response = await api.post(
    "/travelers",
    travelerData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getTravelersByTripId = async (
  tripId: string,
  token: string,
): Promise<TravelerResponse[]> => {
  const response = await api.get(
    `/travelers/by-trip/${tripId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const deleteTraveler = async (
  travelerId: string,
  token: string,
): Promise<{ message: string }> => {
  const response = await api.delete(
    `/travelers/${travelerId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
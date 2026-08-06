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
  const response = await api.post("/travelers", travelerData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
import api from "./axios";

export type Destination = {
  name: string;
  latitude: number;
  longitude: number;
  arrivalDate: string;
  leaveDate: string;
};

export type CreateDestinationRequest = Destination & {
  tripId: string;
};

export type UpdateDestinationRequest = {
  name?: string;
  latitude?: number;
  longitude?: number;
  arrivalDate?: string;
  leaveDate?: string;
};

export type DestinationResponse = CreateDestinationRequest & {
  destinationId: string;
  createdAt: string;
  updatedAt: string;
};

export const createDestination = async (
  destinationData: CreateDestinationRequest,
  token: string,
): Promise<DestinationResponse> => {
  const response = await api.post(
    "/destinations",
    destinationData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getDestinationsByTripId = async (
  tripId: string,
  token: string,
): Promise<DestinationResponse[]> => {
  const response = await api.get(
    `/destinations/by-trip/${tripId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const updateDestination = async (
  destinationId: string,
  destinationData: UpdateDestinationRequest,
  token: string,
): Promise<DestinationResponse> => {
  const response = await api.put(
    `/destinations/${destinationId}`,
    destinationData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const deleteDestination = async (
  destinationId: string,
  token: string,
): Promise<{ message: string }> => {
  const response = await api.delete(
    `/destinations/${destinationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
import api from "./axios";

export type LocationSuggestion = {
  placeId: string;
  name: string;
};

export type PlaceDetails = {
  id: string;
  displayName?: {
    text?: string;
  };
  formattedAddress?: string;
  location?: {
    latitude?: number;
    longitude?: number;
  };
};

export const getLocationSuggestions = async (
  place: string,
  token: string,
): Promise<LocationSuggestion[]> => {
  const response = await api.get("/location/autocomplete", {
    params: {
      place,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getPlaceDetails = async (
  placeId: string,
  token: string,
): Promise<PlaceDetails> => {
  const response = await api.get("/location/place", {
    params: {
      placeid: placeId,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  
  return Array.isArray(response.data)
    ? response.data[0]
    : response.data;
};
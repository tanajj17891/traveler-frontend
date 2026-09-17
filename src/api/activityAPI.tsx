import api from "./axios";

export type ActivityType =
  | "FLIGHT"
  | "HOTEL_CHECK_IN"
  | "HOTEL_CHECK_OUT"
  | "FOOD_AND_DRINK"
  | "ACTIVITY"
  | "OTHER";

export type CreateActivityRequest = {
  destinationId: string;
  day: number;
  startTime: string;
  activityType: ActivityType;
  description: string;
  notes?: string;
};

export type UpdateActivityRequest = {
  day?: number;
  startTime?: string;
  activityType?: ActivityType;
  description?: string;
  notes?: string;
};

export type ActivityResponse = {
  activityId: string;
  destinationId: string;
  day: number;
  startTime: string;
  activityType: ActivityType;
  description: string;
  notes?: string | null;
};

export const createActivity = async (
  activityData: CreateActivityRequest,
  token: string,
): Promise<ActivityResponse> => {
  const response = await api.post(
    "/activities",
    activityData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getActivity = async (
  activityId: string,
  token: string,
): Promise<ActivityResponse> => {
  const response = await api.get(
    `/activities/${activityId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getActivitiesByDestinationId = async (
  destinationId: string,
  token: string,
): Promise<ActivityResponse[]> => {
  const response = await api.get(
    `/activities/by-destination/${destinationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const getActivitiesByDestinationAndDay = async (
  destinationId: string,
  day: number,
  token: string,
): Promise<ActivityResponse[]> => {
  const response = await api.get(
    `/activities/by-destination/${destinationId}/day/${day}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const updateActivity = async (
  activityId: string,
  activityData: UpdateActivityRequest,
  token: string,
): Promise<ActivityResponse> => {
  const response = await api.put(
    `/activities/${activityId}`,
    activityData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const deleteActivity = async (
  activityId: string,
  token: string,
): Promise<{ message: string }> => {
  const response = await api.delete(
    `/activities/${activityId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
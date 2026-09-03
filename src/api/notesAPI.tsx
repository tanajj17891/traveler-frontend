import api from "./axios";

export type CreateNotesRequest = {
  tripId: string;
  profileId: string;
  text: string;
};

export type UpdateNotesRequest = {
  text?: string;
};

export type NotesResponse = CreateNotesRequest & {
  noteId: string;
  createdAt: string;
  updatedAt: string;
};

export const createNotes = async (
  noteData: CreateNotesRequest,
  token: string,
): Promise<NotesResponse> => {
  const response = await api.post("/notes", noteData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};

export const getNoteByTripAndProfile = async (
  tripId: string,
  profileId: string,
  token: string,
): Promise<NotesResponse> => {
  const response = await api.get(
    `/notes/by-trip/${tripId}/profile/${profileId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};

export const updateNotes = async (
  noteId: string,
  noteData: UpdateNotesRequest,
  token: string,
): Promise<NotesResponse> => {
  const response = await api.put(
    `/notes/${noteId}`,
    noteData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data;
};
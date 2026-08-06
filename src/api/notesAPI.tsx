import api from "./axios";

export type CreateNotesRequest = {
  tripId: string;
  profileId: string;
  text: string;
  
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
  console.log("NOTES PAYLOAD SENT:", noteData);
  const response = await api.post("/notes", noteData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
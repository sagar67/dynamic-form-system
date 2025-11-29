import axios from "axios";
import type { FormSchema, Submission } from "./types";

const api = axios.create({ baseURL: "http://localhost:3001/api" });

export const fetchSchema = async () => {
  const { data } = await api.get<FormSchema>("/form-schema");
  return data;
};

export const submitForm = async (formData: Record<string, any>) => {
  const { data } = await api.post("/submissions", formData);
  return data;
};

type SubmissionsResponse = {
  data: Submission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export const fetchSubmissions = async (
  page: number,
  limit: number,
  sortOrder: "asc" | "desc"
) => {
  const { data } = await api.get<SubmissionsResponse>("/submissions", {
    params: { page, limit, sortOrder },
  });
  return data;
};

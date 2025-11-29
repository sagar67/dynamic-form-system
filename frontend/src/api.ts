import axios from "axios";
import type { FormSchema, Submission } from "./types";

// Logic to switch between Vercel (Production) and Localhost
// When deployed on Vercel, we use the relative path "/api" so vercel.json can handle the routing.
const BASE_URL = import.meta.env.PROD ? "/api" : "http://localhost:3001/api";

const api = axios.create({ baseURL: BASE_URL });

export const fetchSchema = async () => {
  const { data } = await api.get<FormSchema>("/form-schema");
  return data;
};

// FIX: Changed 'any' to 'unknown' for stricter type safety
export const submitForm = async (formData: Record<string, unknown>) => {
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

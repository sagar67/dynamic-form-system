// frontend/src/types.ts

export type FieldType =
  | "text"
  | "number"
  | "select"
  | "multi-select"
  | "date"
  | "textarea"
  | "switch";

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  regex?: string;
  min?: number;
  max?: number;
  minDate?: string;
  maxDate?: string;
  required?: boolean;
  minSelected?: number;
  maxSelected?: number;
}

export interface FormField {
  id: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: ValidationRules;
}

// This is the specific one missing in your error
export interface FormSchema {
  title: string;
  description: string;
  fields: FormField[];
}

// Represents the data payload for a single submission
export type SubmissionData = Record<
  string,
  string | number | boolean | string[]
>;

export interface Submission {
  id: string;
  data: SubmissionData;
  createdAt: string;
}

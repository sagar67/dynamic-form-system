import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

// SHADCN
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ChevronsUpDown, Loader2, Check } from "lucide-react";

import { fetchSchema, submitForm } from "../api";
import type { FormField, FormSchema } from "../types";

import DatePickerField from "./DatePicker";

const cn = (...classes: any[]) => classes.filter(Boolean).join(" ");

const buildZodSchema = (schema: FormSchema) => {
  const shape: Record<string, any> = {};

  schema.fields.forEach((field) => {
    const validation = field.validation || {};
    let v: any;

    switch (field.type) {
      case "text":
      case "textarea":
      case "select": {
        let base = z.string();
        if (field.required) base = base.min(1, "Required");
        if (typeof validation.minLength === "number")
          base = base.min(
            validation.minLength,
            `Min ${validation.minLength} chars`
          );
        if (typeof validation.maxLength === "number")
          base = base.max(
            validation.maxLength,
            `Max ${validation.maxLength} chars`
          );
        if (validation.regex)
          base = base.regex(new RegExp(validation.regex), "Invalid format");
        v = base;
        break;
      }

      case "number": {
        let num = z.number({ message: "Must be a number" });

        if (typeof validation.min === "number")
          num = num.min(validation.min, `Min ${validation.min}`);

        if (typeof validation.max === "number")
          num = num.max(validation.max, `Max ${validation.max}`);

        // SIMPLEST: Validate string first, then coerce
        v = z
          .string()
          .min(field.required ? 1 : 0, field.required ? "Required" : "")
          .transform((val) => {
            const parsed = Number(val);
            if (isNaN(parsed))
              throw new Error(field.required ? "Required" : "Must be a number");
            return parsed;
          })
          .pipe(num);
        break;
      }

      case "multi-select": {
        let arr = z.array(z.string());
        if (field.required) arr = arr.min(1, "Required");
        if (typeof validation.minSelected === "number")
          arr = arr.min(
            validation.minSelected,
            `Select at least ${validation.minSelected}`
          );
        if (typeof validation.maxSelected === "number")
          arr = arr.max(
            validation.maxSelected,
            `Select at most ${validation.maxSelected}`
          );
        v = arr;
        break;
      }

      case "date": {
        let date = z.string();
        if (field.required) date = date.min(1, "Required");
        const minDate = validation.minDate;
        if (minDate) {
          date = date.refine(
            (d) => new Date(d) >= new Date(minDate),
            `Date must be on or after ${minDate}`
          );
        }
        v = date;
        break;
      }

      case "switch":
        v = z.any().optional(); // Skip client validation for switches
        break;

      default:
        v = z.any();
    }

    shape[field.id] = v;
  });

  return z.object(shape);
};

export default function DynamicForm() {
  const queryClient = useQueryClient();
  const {
    data: schema,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["schema"],
    queryFn: fetchSchema,
  });
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogTimeoutId, setDialogTimeoutId] = useState<NodeJS.Timeout | null>(
    null
  );

  // Build schema conditionally, but BEFORE rendering decisions
  const zodSchema = schema ? buildZodSchema(schema) : null;

  // Always call useForm so hook order is stable
  const form = useForm({
    defaultValues: schema
      ? schema.fields.reduce(
          (acc, f) => ({
            ...acc,
            [f.id]: f.type === "multi-select" ? [] : "",
          }),
          {} as Record<string, any>
        )
      : {},

    // Only attach validators when we actually have a schema
    validators:
      schema && zodSchema
        ? {
            onSubmit: zodSchema,
          }
        : {},

    onSubmit: async ({ value, formApi }) => {
      try {
        // Convert switch fields from string to boolean
        const transformedValue = { ...value };
        transformedValue.remote = Boolean(value.remote);

        await submitForm(transformedValue);
        queryClient.invalidateQueries({ queryKey: ["submissions"] });
        formApi.reset();

        // Show dialog and set auto-close timer
        setShowSuccessDialog(true);
        const timeoutId = setTimeout(() => {
          setShowSuccessDialog(false);
        }, 3000);
        setDialogTimeoutId(timeoutId);
      } catch (err: any) {
        const details = err?.response?.data?.details;
        if (details && typeof details === "object") {
          Object.entries(details).forEach(([id, errors]) => {
            formApi.setFieldMeta(id, (prev) => ({
              ...prev,
              errors: errors as string[],
            }));
          });
        }
      }
    },
  });

  // Cleanup timeout on component unmount
  useEffect(() => {
    return () => {
      if (dialogTimeoutId) {
        clearTimeout(dialogTimeoutId);
      }
    };
  }, [dialogTimeoutId]);
  /* ---------------------------------------------------
     LOADING / ERROR STATES (after hooks)
  --------------------------------------------------- */
  if (isLoading) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error || !schema) {
    return (
      <div className="text-red-600 p-10 text-center">Failed to load schema</div>
    );
  }

  /* ---------------------------------------------------
     RENDER FORM
  --------------------------------------------------- */
  return (
    <Card className="w-full shadow">
      <CardHeader>
        <CardTitle>{schema.title}</CardTitle>
        <CardDescription>{schema.description}</CardDescription>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="grid gap-6"
        >
          {schema.fields.map((field) => (
            <form.Field key={field.id} name={field.id}>
              {(api) => {
                const rawError = api.state.meta.errors?.[0];
                const error =
                  typeof rawError === "string"
                    ? rawError
                    : rawError?.message ?? ""; // handle Zod-style object

                const hasError = !!error;

                return (
                  <div className="grid gap-2">
                    <Label
                      htmlFor={field.id}
                      className={hasError ? "text-red-600" : ""}
                    >
                      {field.label} {field.required && "*"}
                    </Label>

                    {renderField(field, api, hasError, error)}

                    {hasError && (
                      <p className="text-sm text-red-600">{error}</p>
                    )}
                  </div>
                );
              }}
            </form.Field>
          ))}

          <Button type="submit" className="w-full font-bold cursor-pointer">
            Submit
          </Button>
        </form>
      </CardContent>

      {/* Success Dialog Modal */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent
          onEscapeKeyDown={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => e.preventDefault()}
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription>
              Your submission has been recorded. This window will close
              automatically.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                if (dialogTimeoutId) clearTimeout(dialogTimeoutId);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function renderField(
  field: FormField,
  api: any,
  hasError: boolean,
  error: string
) {
  const value = api.state.value ?? (field.type === "multi-select" ? [] : "");
  const errorClass = hasError ? "border-red-500 focus:ring-red-500" : "";

  switch (field.type) {
    case "textarea":
      return (
        <Textarea
          id={field.id}
          value={value}
          onBlur={api.handleBlur}
          onChange={(e) => api.handleChange(e.target.value)}
          className={errorClass}
        />
      );

    case "select":
      return (
        <div className="relative group">
          <select
            id={field.id}
            value={value}
            onBlur={api.handleBlur}
            onChange={(e) => api.handleChange(e.target.value)}
            className={cn(
              "w-full h-9 border rounded px-3 appearance-none",
              errorClass
            )}
          >
            <option value="">Select</option>
            {field.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          <ChevronsUpDown className="absolute right-3 top-3 w-4 h-4" />
        </div>
      );

    case "switch":
      return (
        <Switch
          id={field.id}
          checked={!!value}
          onCheckedChange={(checked) => api.handleChange(checked)}
        />
      );

    case "multi-select":
      return (
        <div
          className={cn("border p-3 rounded flex flex-wrap gap-2", errorClass)}
        >
          {field.options?.map((opt) => {
            const selected = Array.isArray(value) && value.includes(opt.value);

            return (
              <label
                key={opt.value}
                className={cn(
                  "cursor-pointer px-2 py-1 rounded border text-xs flex items-center gap-1",
                  selected ? "bg-primary text-white" : "bg-secondary"
                )}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  className="hidden"
                  onChange={(e) => {
                    let arr = Array.isArray(value) ? [...value] : [];
                    if (e.target.checked) arr.push(opt.value);
                    else arr = arr.filter((v) => v !== opt.value);
                    api.handleChange(arr);
                  }}
                />
                {selected && <Check className="w-3 h-3" />}
                {opt.label}
              </label>
            );
          })}
        </div>
      );

    case "date":
      return (
        <DatePickerField
          field={field}
          api={api}
          hasError={hasError}
          error={error}
        />
      );

    default:
      return (
        <Input
          id={field.id}
          value={value}
          onBlur={api.handleBlur}
          onChange={(e) => api.handleChange(e.target.value)}
          className={errorClass}
        />
      );
  }
}

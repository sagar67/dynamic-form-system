import { FormField } from "@/types";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "./ui/calendar";

function toLocalISODate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function DatePickerField({
  field,
  api,
  hasError,
}: {
  field: FormField;
  api: any;
  hasError: boolean;
  error: string;
}) {
  const [open, setOpen] = useState(false); // ✅ Now valid hook
  const value = api.state.value ?? "";

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            id={field.id}
            className={cn(
              "w-full justify-start font-normal h-9 cursor-pointer",
              hasError ? "border-red-500 focus:ring-red-500" : ""
            )}
          >
            {value ? new Date(value).toLocaleDateString() : `Pick a date`}
            <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0">
          <Calendar
            key={value || "empty"}
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              api.handleChange(date ? toLocalISODate(date) : "");
              api.handleBlur();
              setOpen(false); // ✅ Closes properly
            }}
            captionLayout="dropdown"
            className="w-full!"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

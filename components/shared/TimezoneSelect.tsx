"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// List of common timezones with city/country names
export const timezones = [
  "(UTC-12:00) Baker Island",
  "(UTC-11:00) American Samoa",
  "(UTC-10:00) Hawaii",
  "(UTC-09:00) Alaska",
  "(UTC-08:00) Pacific Time (US & Canada)",
  "(UTC-07:00) Mountain Time (US & Canada)",
  "(UTC-06:00) Central Time (US & Canada), Mexico City",
  "(UTC-05:00) Eastern Time (US & Canada), Bogota",
  "(UTC-04:00) Atlantic Time (Canada), Caracas",
  "(UTC-03:00) Buenos Aires, Sao Paulo",
  "(UTC-02:00) Mid-Atlantic",
  "(UTC-01:00) Azores, Cape Verde Islands",
  "(UTC+00:00) London, Dublin, Lisbon",
  "(UTC+01:00) Berlin, Paris, Rome, Madrid",
  "(UTC+02:00) Athens, Istanbul, Cairo",
  "(UTC+03:00) Moscow, Riyadh, Nairobi",
  "(UTC+04:00) Dubai, Baku",
  "(UTC+05:00) Karachi, Tashkent",
  "(UTC+05:30) Mumbai, New Delhi, Colombo",
  "(UTC+06:00) Dhaka, Almaty",
  "(UTC+07:00) Bangkok, Jakarta, Hanoi",
  "(UTC+08:00) Beijing, Singapore, Hong Kong, Kuala Lumpur",
  "(UTC+09:00) Tokyo, Seoul",
  "(UTC+10:00) Sydney, Melbourne, Brisbane",
  "(UTC+11:00) Vladivostok, Solomon Islands",
  "(UTC+12:00) Auckland, Wellington, Fiji",
  "(UTC+13:00) Samoa, Tonga",
  "(UTC+14:00) Kiritimati Island",
];

interface TimezoneSelectProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  onBlur?: () => void;
}

export function TimezoneSelect({
  value,
  onChange,
  required = false,
  error,
  onBlur,
}: TimezoneSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="timezone" className="block text-sm font-medium mb-1">
        Timezone {required && <span className="text-red-500">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={(value) => {
          onChange(value);
        }}
        onOpenChange={(open) => {
          if (!open && onBlur) {
            onBlur();
          }
        }}
      >
        <SelectTrigger
          id="timezone"
          className={error ? "border-red-500" : ""}
        >
          <SelectValue placeholder="Select your timezone" />
        </SelectTrigger>
        <SelectContent>
          {timezones.map((timezone) => (
            <SelectItem key={timezone} value={timezone}>
              {timezone}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}

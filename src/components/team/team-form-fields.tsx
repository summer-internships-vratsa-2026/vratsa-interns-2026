"use client";

import { useTranslations } from "next-intl";

import { Label } from "@/components/ui/label";
import type { Group } from "@/db/schema/groups";
import {
  SCHOOL_CLASS_VALUES,
  SCHOOL_VALUES,
  type SchoolValue,
} from "@/lib/teams/constants";
import { cn } from "@/lib/utils";

const selectClassName =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

const SCHOOL_CLASS_LABEL_KEYS: Record<(typeof SCHOOL_CLASS_VALUES)[number], "10" | "11"> = {
  "10 клас": "10",
  "11 клас": "11",
};

type SchoolClassFieldProps = {
  defaultValue?: string;
};

export function SchoolClassField({ defaultValue }: SchoolClassFieldProps) {
  const t = useTranslations("Team");

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{t("schoolClass")}</legend>
      <div className="flex flex-wrap gap-4">
        {SCHOOL_CLASS_VALUES.map((value) => (
          <label key={value} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="schoolClass"
              value={value}
              defaultChecked={defaultValue === value || (!defaultValue && value === "10 клас")}
              required
              className="size-4 accent-brand-accent"
            />
            {t(`schoolClassOptions.${SCHOOL_CLASS_LABEL_KEYS[value]}`)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

type SchoolFieldProps = {
  defaultValue?: SchoolValue;
};

export function SchoolField({ defaultValue = "PPMG" }: SchoolFieldProps) {
  const t = useTranslations("Team");

  return (
    <div className="space-y-2">
      <Label htmlFor="school">{t("school")}</Label>
      <select
        id="school"
        name="school"
        className={selectClassName}
        defaultValue={defaultValue}
        required
      >
        {SCHOOL_VALUES.map((value) => (
          <option key={value} value={value}>
            {t(`schoolOptions.${value}`)}
          </option>
        ))}
      </select>
    </div>
  );
}

type GroupFieldProps = {
  groups: Group[];
  defaultValue?: string;
  className?: string;
};

export function GroupField({ groups, defaultValue, className }: GroupFieldProps) {
  const t = useTranslations("Team");

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="groupId">{t("group")}</Label>
      <select id="groupId" name="groupId" className={selectClassName} defaultValue={defaultValue} required>
        {!defaultValue ? <option value="">{t("selectGroup")}</option> : null}
        {groups.map((group) => (
          <option key={group.id} value={group.id}>
            {group.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export const INTERNSHIP_GROUP_NAMES = [
  "Лесто продукт",
  "Седелин Димитров",
  "Калин Красимиров",
] as const;

export const LEGACY_GROUP_NAMES = ["Group 1", "Group 2", "Group 3"] as const;

export const SCHOOL_CLASS_VALUES = ["10 клас", "11 клас"] as const;

export type SchoolClassValue = (typeof SCHOOL_CLASS_VALUES)[number];

export const SCHOOL_VALUES = ["PPMG", "PTG"] as const;

export type SchoolValue = (typeof SCHOOL_VALUES)[number];

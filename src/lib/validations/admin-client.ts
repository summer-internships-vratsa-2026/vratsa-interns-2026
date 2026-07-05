import { z } from "zod";

export const createClientSchema = z.object({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
  organizationName: z
    .union([z.string().trim().max(255), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
});

export const updateClientOrganizationSchema = z.object({
  clientId: z.uuid(),
  organizationName: z
    .union([z.string().trim().max(255), z.literal("")])
    .transform((value) => (value === "" ? null : value)),
});

export type AdminClientActionState = {
  error?: string;
  success?: string;
};

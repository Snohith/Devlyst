import { z } from "zod";
import {
  EDITOR_LANGUAGES,
  EXECUTABLE_LANGUAGES,
  MAX_FILE_NAME_LENGTH,
  MAX_SOURCE_BYTES,
  MAX_STDIN_BYTES,
  ROOM_CODE_PATTERN,
} from "../constants/languages.js";

const languageValues = EDITOR_LANGUAGES.map((language) => language.value);
const executableLanguages = EXECUTABLE_LANGUAGES;

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Display name is required")
  .max(40, "Display name must be 40 characters or fewer");

export const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  language: z.enum(languageValues).optional(),
});

export const updateProjectSchema = z
  .object({
    name: z.string().trim().min(1).max(80).optional(),
    language: z.enum(languageValues).optional(),
  })
  .refine((value) => value.name !== undefined || value.language !== undefined, {
    message: "Provide a name or language to update",
  });

export const roomCodeSchema = z.object({
  roomCode: z.string().regex(ROOM_CODE_PATTERN, "Room code must be 5 digits"),
});

export const projectIdSchema = z.object({
  projectId: z.string().uuid("Project id must be a UUID"),
});

export const fileParamsSchema = z.object({
  projectId: z.string().uuid(),
  fileId: z.string().uuid(),
});

const fileNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(MAX_FILE_NAME_LENGTH)
  .regex(/^[^/\\]+$/, "File name cannot contain a path");

export const createFileSchema = z.object({
  name: fileNameSchema,
  language: z.enum(languageValues).optional(),
  content: z.string().max(MAX_SOURCE_BYTES).optional(),
});

export const updateFileSchema = z
  .object({
    name: fileNameSchema.optional(),
    language: z.enum(languageValues).optional(),
    content: z.string().max(MAX_SOURCE_BYTES).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Provide at least one field to update",
  });

export const executionSchema = z.object({
  language: z.enum(executableLanguages, {
    error: "This language cannot be executed",
  }),
  code: z.string().min(1, "Code is required").max(MAX_SOURCE_BYTES),
  stdin: z.string().max(MAX_STDIN_BYTES).optional(),
  projectId: z.string().uuid().optional(),
  fileId: z.string().uuid().optional(),
});

export const syncUserSchema = z.object({
  displayName: displayNameSchema.optional(),
});

export const listProjectsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

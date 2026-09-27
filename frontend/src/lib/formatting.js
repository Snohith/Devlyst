import { EDITOR_LANGUAGES } from "@shared/constants/languages.js";

export function formatLanguageLabel(value) {
  const match = EDITOR_LANGUAGES.find((lang) => lang.value === value);
  if (match) return match.label;
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

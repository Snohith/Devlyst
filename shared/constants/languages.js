export const EDITOR_LANGUAGES = [
  { value: "javascript", label: "JavaScript", extension: "js" },
  { value: "typescript", label: "TypeScript", extension: "ts" },
  { value: "python", label: "Python", extension: "py" },
  { value: "java", label: "Java", extension: "java" },
  { value: "c", label: "C", extension: "c" },
  { value: "cpp", label: "C++", extension: "cpp" },
  { value: "csharp", label: "C#", extension: "cs" },
  { value: "go", label: "Go", extension: "go" },
  { value: "rust", label: "Rust", extension: "rs" },
  { value: "php", label: "PHP", extension: "php" },
  { value: "ruby", label: "Ruby", extension: "rb" },
  { value: "sql", label: "SQL", extension: "sql" },
  { value: "html", label: "HTML", extension: "html" },
  { value: "css", label: "CSS", extension: "css" },
];

export const EXTENSION_TO_LANGUAGE = Object.fromEntries(
  EDITOR_LANGUAGES.map((language) => [language.extension, language.value]),
);

// Piston runtimes that the public emkc.org instance currently accepts.
// Languages without an entry can still be edited, but not executed.
export const PISTON_RUNTIMES = {
  javascript: { language: "javascript", version: "18.15.0" },
  typescript: { language: "typescript", version: "5.0.3" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  c: { language: "c", version: "10.2.0" },
  cpp: { language: "c++", version: "10.2.0" },
  go: { language: "go", version: "1.16.2" },
  rust: { language: "rust", version: "1.68.2" },
  php: { language: "php", version: "8.2.3" },
};

export const ROOM_CODE_PATTERN = /^\d{5}$/;
export const MAX_SOURCE_BYTES = 100_000;
export const MAX_STDIN_BYTES = 10_000;
export const MAX_FILE_NAME_LENGTH = 120;
export const DEFAULT_FILE_NAME = "main.js";
export const DEFAULT_FILE_CONTENT =
  "// Welcome to Devlyst!\n// Start coding collaboratively...\n\nconsole.log('Hello World');\n";

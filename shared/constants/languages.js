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

// Judge0 Community Edition runtimes used for code execution.
// The ids are the official language ids of https://ce.judge0.com/languages.
// Languages without an entry can still be edited, but not executed.
export const JUDGE0_LANGUAGES = {
  javascript: { id: 93, name: "JavaScript (Node.js 18.15.0)" },
  typescript: { id: 94, name: "TypeScript (5.0.3)" },
  python: { id: 92, name: "Python (3.11.2)" },
  java: { id: 91, name: "Java (JDK 17.0.6)" },
  c: { id: 103, name: "C (GCC 14.1.0)" },
  cpp: { id: 105, name: "C++ (GCC 14.1.0)" },
  csharp: { id: 51, name: "C# (Mono 6.6.0.161)" },
  go: { id: 107, name: "Go (1.23.5)" },
  rust: { id: 108, name: "Rust (1.85.0)" },
  php: { id: 98, name: "PHP (8.3.11)" },
  ruby: { id: 72, name: "Ruby (2.7.0)" },
  sql: { id: 82, name: "SQL (SQLite 3.27.2)" },
};

// Java entry point must stay `Main` because Judge0 compiles the file as Main.java.
export const EXECUTABLE_LANGUAGES = Object.keys(JUDGE0_LANGUAGES);

export const ROOM_CODE_PATTERN = /^\d{5}$/;
export const MAX_SOURCE_BYTES = 100_000;
export const MAX_STDIN_BYTES = 10_000;
export const MAX_FILE_NAME_LENGTH = 120;
export const DEFAULT_FILE_NAME = "main.js";
export const DEFAULT_FILE_CONTENT =
  "// Welcome to Devlyst!\n// Start coding collaboratively...\n\nconsole.log('Hello World');\n";

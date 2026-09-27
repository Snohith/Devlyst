import prettier from "prettier/standalone";
import type { Plugin } from "prettier";
import * as parserBabel from "prettier/plugins/babel";
import * as parserEstree from "prettier/plugins/estree";
import * as parserHtml from "prettier/plugins/html";
import * as parserPostcss from "prettier/plugins/postcss";
import * as parserMarkdown from "prettier/plugins/markdown";
import * as parserYaml from "prettier/plugins/yaml";

export type SupportedLanguage =
    | "javascript"
    | "typescript"
    | "json"
    | "html"
    | "css"
    | "markdown"
    | "yaml";

type ParserConfig = { parser: string; plugins: Plugin[] };

// Prettier needs estree at runtime to print JavaScript, but the package
// ships empty type declarations, so it needs a cast here.
const estreePlugin = parserEstree as unknown as Plugin;

const PARSERS: Record<string, ParserConfig> = {
    javascript: { parser: "babel", plugins: [parserBabel, estreePlugin] },
    typescript: { parser: "typescript", plugins: [parserBabel, estreePlugin] },
    json: { parser: "json", plugins: [parserBabel, estreePlugin] },
    html: { parser: "html", plugins: [parserHtml] },
    css: { parser: "css", plugins: [parserPostcss] },
    markdown: { parser: "markdown", plugins: [parserMarkdown] },
    yaml: { parser: "yaml", plugins: [parserYaml] }
};

export async function formatCode(code: string, language: string): Promise<string> {
    const config = PARSERS[language];

    // Only a handful of languages ship a Prettier parser; the rest are left alone.
    if (!config) {
        console.warn(`No formatter available for ${language}.`);
        return code;
    }

    try {
        return await prettier.format(code, {
            parser: config.parser,
            plugins: config.plugins,
            singleQuote: false,
            tabWidth: 4,
            printWidth: 100,
        });
    } catch (error) {
        console.error("Formatting failed:", error);
        return code;
    }
}

import prettier from "prettier/standalone";
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

const PARSERS: Record<string, any> = {
    javascript: { parser: "babel", plugins: [parserBabel, parserEstree] },
    typescript: { parser: "typescript", plugins: [parserBabel, parserEstree] },
    json: { parser: "json", plugins: [parserBabel, parserEstree] },
    html: { parser: "html", plugins: [parserHtml] },
    css: { parser: "css", plugins: [parserPostcss] },
    markdown: { parser: "markdown", plugins: [parserMarkdown] },
    yaml: { parser: "yaml", plugins: [parserYaml] }
};

export async function formatCode(code: string, language: string): Promise<string> {
    const config = PARSERS[language];

    if (!config) {
        console.warn(`[Formatter] Language '${language}' not supported for formatting.`);
        return code;
    }

    try {
        const formatted = await prettier.format(code, {
            parser: config.parser,
            plugins: config.plugins,
            singleQuote: false,
            tabWidth: 4,
            printWidth: 100,
        });
        return formatted;
    } catch (error) {
        console.error("[Formatter] Failed to format code:", error);
        return code; // Return original code on error
    }
}

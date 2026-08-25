import js from "@eslint/js";
import eslintPluginPrettier from "eslint-plugin-prettier/recommended";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import fs from "fs";
import path from "path";

// Custom plugin defining rules from AGENTS.md
const agentsRulesPlugin = {
  meta: {
    name: "eslint-plugin-agents-rules",
    version: "1.0.0",
  },
  rules: {
    "max-file-lines": {
      meta: {
        type: "problem",
        docs: { description: "Each code file should be under 200 lines." },
      },
      create(context) {
        const filePath = context.filename || context.getFilename();
        const normalizedPath = filePath.replace(/\\/g, "/");
        if (normalizedPath.includes("src/components/ui/")) return {};

        return {
          Program(node) {
            const lineCount = context.sourceCode.lines.length;
            if (lineCount > 200) {
              context.report({
                node,
                message: `File này có ${lineCount} dòng. Theo quy tắc trong AGENTS.md, mỗi file code nên dưới 200 dòng để dễ bảo trì.`,
              });
            }
          },
        };
      },
    },
    "no-tailwind-arbitrary": {
      meta: {
        type: "problem",
        docs: { description: "Do not use Tailwind arbitrary values in JSX." },
      },
      create(context) {
        const filePath = context.filename || context.getFilename();
        const normalizedPath = filePath.replace(/\\/g, "/");
        if (normalizedPath.includes("src/components/ui/")) return {};

        // Only match specific CSS property arbitrary values, avoiding arbitrary variants like data-[active=true]
        const arbitraryRegex =
          /(?:\b|:)(?:w|h|bg|text|grid|shadow|p|m|gap|top|left|right|bottom|inset|tracking|leading|border|rounded|radius|stroke|backdrop-blur)-\[[^\]]+\]/;

        function checkValue(value, node) {
          if (arbitraryRegex.test(value)) {
            context.report({
              node,
              message:
                "Do not use Tailwind arbitrary values (e.g., w-[...], shadow-[...]) in JSX. Define tokens or classes in src/styles.css first.",
            });
          }
        }
        return {
          'JSXAttribute[name.name="className"] Literal'(node) {
            if (typeof node.value === "string") {
              checkValue(node.value, node);
            }
          },
          'JSXAttribute[name.name="className"] TemplateElement'(node) {
            checkValue(node.value.raw, node);
          },
        };
      },
    },
    "spacing-grid-8px": {
      meta: {
        type: "problem",
        docs: { description: "Spacing must follow the 8px grid." },
      },
      create(context) {
        const filePath = context.filename || context.getFilename();
        const normalizedPath = filePath.replace(/\\/g, "/");
        if (normalizedPath.includes("src/components/ui/")) return {};

        // Catch odd spacing that is not a multiple of 8px (excluding fractions like 1/2, 1/3, 1/4, 2/3, 3/4, etc., and allowing 4px (index 1))
        const invalidSpacingRegex =
          /\b-?(?:(?:p|m)(?:x|y|t|b|l|r)?|(?:gap|space|inset)(?:-[xy])?|w|h|top|bottom|left|right|size)-(?:0\.5|1\.5|2\.5|3(?!\d|\/)|3\.5|5(?!\d|\/)|7|9|11|13|15|px)\b/;

        function checkValue(value, node) {
          const match = value.match(invalidSpacingRegex);
          if (match) {
            context.report({
              node,
              message: `Class "${match[0]}" violates the 8px grid. Spacing (padding/margin/gap/size/inset/icon size) must be a multiple of 8px. Avoid odd classes like py-3, gap-3, p-5, size-9, h-11.`,
            });
          }
        }
        return {
          'JSXAttribute[name.name="className"] Literal'(node) {
            if (typeof node.value === "string") {
              checkValue(node.value, node);
            }
          },
          'JSXAttribute[name.name="className"] TemplateElement'(node) {
            checkValue(node.value.raw, node);
          },
        };
      },
    },
    "no-motion-in-pages": {
      meta: {
        type: "problem",
        docs: {
          description: "Do not directly import gsap or framer-motion in page/layout files.",
        },
      },
      create(context) {
        const filePath = context.filename || context.getFilename();
        const isPageOrLayout = /src\/app\/.*(page|layout)\.tsx?$/.test(filePath);
        if (!isPageOrLayout) return {};

        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (/^(gsap|@gsap\/react|framer-motion)$/.test(source)) {
              context.report({
                node,
                message: `Do not directly import "${source}" in page/layout files. Group them in components/animations/, hooks/, or custom helpers.`,
              });
            }
          },
        };
      },
    },
    "prefer-alias-import": {
      meta: {
        type: "problem",
        docs: { description: "Prefer alias import @/* over long relative imports." },
      },
      create(context) {
        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (source.startsWith("../../")) {
              context.report({
                node,
                message: `Relative import "${source}" is too long. Use @/* alias instead.`,
              });
            }
          },
        };
      },
    },
    "no-invalid-css-import": {
      meta: {
        type: "problem",
        docs: { description: "styles.css must only be imported from layout.tsx." },
      },
      create(context) {
        const filePath = context.filename || context.getFilename();
        const isRootLayout = /src\/app\/layout\.tsx?$/.test(filePath);
        if (isRootLayout) return {};

        return {
          ImportDeclaration(node) {
            const source = node.source.value;
            if (source.endsWith("styles.css")) {
              context.report({
                node,
                message:
                  "Global CSS (src/styles.css) is only allowed to be imported from src/app/layout.tsx.",
              });
            }
          },
        };
      },
    },
    "admin-component-pascal-case": {
      meta: {
        type: "problem",
        docs: { description: "Component names in src/components/admin/ must be in PascalCase." },
      },
      create(context) {
        const filePath = context.filename || context.getFilename();
        const normalizedPath = filePath.replace(/\\/g, "/");
        if (normalizedPath.includes("src/components/admin/")) {
          const fileName = normalizedPath.split("/").pop();
          if (fileName && fileName !== "index.ts" && fileName !== "index.tsx") {
            const baseName = fileName.replace(/\.[^/.]+$/, "");
            const isPascal = /^[A-Z][a-zA-Z0-9]+$/.test(baseName);
            if (!isPascal) {
              return {
                Program(node) {
                  context.report({
                    node,
                    message: `Component filename "${fileName}" in src/components/admin/ must be in PascalCase (e.g., AdminShell.tsx).`,
                  });
                },
              };
            }
          }
        }
        return {};
      },
    },
    "max-directory-files": {
      meta: {
        type: "problem",
        docs: { description: "Each directory should not contain more than 7 files." },
      },
      create(context) {
        const filePath = context.filename || context.getFilename();
        const dirPath = path.dirname(filePath);
        const normalizedDir = dirPath.replace(/\\/g, "/");

        // Ignore components/ui directory
        if (normalizedDir.includes("src/components/ui")) return {};
        // Only scan in src/
        if (!normalizedDir.includes("/src/")) return {};

        try {
          const files = fs.readdirSync(dirPath);
          const fileCount = files.filter((f) => {
            const fullPath = path.join(dirPath, f);
            return fs.statSync(fullPath).isFile();
          }).length;

          if (fileCount > 7) {
            return {
              Program(node) {
                context.report({
                  node,
                  message: `This directory contains ${fileCount} files. AGENTS.md rules require that when a directory has more than 7 files, it should be divided into subdirectories by domain/component type.`,
                });
              },
            };
          }
        } catch (e) {
          // Ignore file read errors
        }
        return {};
      },
    },

    "prefer-tailwind-utilities": {
      meta: {
        type: "problem",
        docs: {
          description:
            "Prefer using Tailwind v4 mapped utility class names instead of variable bracket syntax.",
        },
        fixable: "code",
      },
      create(context) {
        const filePath = context.filename || context.getFilename();
        const normalizedPath = filePath.replace(/\\/g, "/");
        if (normalizedPath.includes("src/components/ui/")) return {};

        const variableBracketsRegex = /\b([a-zA-Z0-9_-]+)-\(--([a-zA-Z0-9_-]+)\)/g;

        function checkValue(value, node, isLiteral) {
          let match;
          // Reset regex state
          variableBracketsRegex.lastIndex = 0;
          while ((match = variableBracketsRegex.exec(value)) !== null) {
            const fullClass = match[0];
            const prop = match[1];
            const variableName = match[2];

            let recommendation = "";
            if (prop === "rounded" && variableName.startsWith("radius-")) {
              recommendation = `rounded-${variableName.replace("radius-", "")}`;
            } else if (variableName.startsWith(`${prop}-`)) {
              recommendation = variableName;
            } else {
              recommendation = `${prop}-${variableName.replace(/^(size-|radius-|color-|font-|grid-)/, "")}`;
            }

            context.report({
              node,
              message: `The class ${fullClass} can be written as ${recommendation}. Do not use variables syntax in JSX; use Tailwind v4 mapped utility class names instead.`,
              fix(fixer) {
                const valStr = isLiteral ? node.value : node.value.raw;
                const localIndex = valStr.indexOf(fullClass);
                if (localIndex !== -1) {
                  const startPos = node.range[0] + 1 + localIndex;
                  const endPos = startPos + fullClass.length;
                  return fixer.replaceTextRange([startPos, endPos], recommendation);
                }
                return null;
              },
            });
          }
        }

        return {
          'JSXAttribute[name.name="className"] Literal'(node) {
            if (typeof node.value === "string") {
              checkValue(node.value, node, true);
            }
          },
          'JSXAttribute[name.name="className"] TemplateElement'(node) {
            checkValue(node.value.raw, node, false);
          },
        };
      },
    },
  },
};

export default tseslint.config(
  { ignores: [".next", "next-env.d.ts"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "agents-rules": agentsRulesPlugin,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",

      // Enable all custom rules from AGENTS.md
      "agents-rules/max-file-lines": "error",
      "agents-rules/no-tailwind-arbitrary": "error",
      "agents-rules/spacing-grid-8px": "error",
      "agents-rules/no-motion-in-pages": "error",
      "agents-rules/prefer-alias-import": "error",
      "agents-rules/no-invalid-css-import": "error",
      "agents-rules/admin-component-pascal-case": "error",
      "agents-rules/max-directory-files": "warn",

      "agents-rules/prefer-tailwind-utilities": "error",
    },
  },
  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/app/**/layout.tsx", "src/app/**/page.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  eslintPluginPrettier,
);

const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
    {
        ignores: ["dist/**"]
    },
    js.configs.recommended,
    {
        files: ["**/*.js"],
        languageOptions:{
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node
            }
        }
    },
    {
        files: ["tests/**/*.js"],
        languageOptions: {
            globals: {
                ...globals.jest
            }
        }
    },
    {
        rules: {
            "curly": ["error", "all"],
            "dot-notation": "error",
            "eqeqeq": "error",
            "no-empty-function": "error",
            "no-eval": "error",
            "no-var": "error",
            "prefer-const": "error",
            "semi": "error"
        }
    }
];
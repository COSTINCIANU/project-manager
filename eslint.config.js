// =====================================================
// eslint.config.js — Configuration ESLint + React
// Vérifie la qualité du code React/Vite
// =====================================================
import js from "@eslint/js";
import reactHooksPlugin from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: {
      "react-hooks": reactHooksPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Browser globals
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        fetch: "readonly",
        console: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        setInterval: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        FileReader: "readonly",
        Blob: "readonly",
        Promise: "readonly",
        JSON: "readonly",
        Math: "readonly",
        Date: "readonly",
        Array: "readonly",
        Object: "readonly",
        parseInt: "readonly",
        parseFloat: "readonly",
        isNaN: "readonly",
        confirm: "readonly",
        alert: "readonly",
        navigator: "readonly",
        Notification: "readonly",
        EventSource: "readonly",
        AbortController: "readonly",
        WebSocket: "readonly",
        crypto: "readonly",
        performance: "readonly",
        location: "readonly",
        history: "readonly",
        screen: "readonly",
        Image: "readonly",
        atob: "readonly",
        btoa: "readonly",
        structuredClone: "readonly",
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-undef": "error",
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js"],
  },
];

// src/config/env.js
export const env = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  RAPIDAPI_KEY: import.meta.env.VITE_RAPIDAPI_KEY,
  JUDGE0_HOST: import.meta.env.VITE_JUDGE0_HOST || 'judge0-ce.p.rapidapi.com'
};
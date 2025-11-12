// src/services/judge0_v2.js
import axios from 'axios';
import { env } from '../config/env';

const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const RAPIDAPI_KEY = env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = env.JUDGE0_HOST;

const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  php: 68,
  ruby: 72,
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const executeCode = async (code, language) => {
  if (!RAPIDAPI_KEY) {
    return {
      status: "error",
      message: "⚠️ Judge0 API key not configured. Add VITE_RAPIDAPI_KEY in .env file.",
      output: null
    };
  }

  const languageId = languageMap[language];
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      // ✅ Step 1: Submit the code
      const submission = await axios.post(
        `${JUDGE0_API_URL}/submissions?base64_encoded=true`,
        {
          source_code: btoa(unescape(encodeURIComponent(code))),
          language_id: languageId,
          stdin: '',
        },
        {
          headers: {
            'X-RapidAPI-Key': RAPIDAPI_KEY,
            'X-RapidAPI-Host': RAPIDAPI_HOST,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      // ✅ Step 2: Get the token for polling
      const token = submission.data?.token;
      if (!token) throw new Error("No submission token received.");

      // ✅ Step 3: Poll until execution finishes
      let result;
      const start = Date.now();
      while (true) {
        const response = await axios.get(
          `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`,
          {
            headers: {
              'X-RapidAPI-Key': RAPIDAPI_KEY,
              'X-RapidAPI-Host': RAPIDAPI_HOST,
            },
          }
        );

        result = response.data;

        if (result.status?.id >= 3) break; // status 1–2 = processing

        // Timeout warning after 10 seconds
        if (Date.now() - start > 10000) {
          console.warn("⏳ Execution taking longer than expected...");
        }

        await sleep(1000);
      }

      // ✅ Step 4: Decode output
      const decode = (val) => val ? decodeURIComponent(escape(atob(val))) : "";

      let output = "";
      let status = "success";
      let message = "✅ Code executed successfully";

      if (result.stdout) {
        output = decode(result.stdout);
      } else if (result.stderr) {
        status = "runtime_error";
        message = "❌ Runtime Error";
        output = decode(result.stderr);
      } else if (result.compile_output) {
        status = "compile_error";
        message = "❌ Compilation Error";
        output = decode(result.compile_output);
      } else {
        message = `ℹ️ Status: ${result.status?.description || "Unknown"}`;
      }

      return { status, message, output };

    } catch (error) {
      attempt++;
      console.warn(`⚠️ Attempt ${attempt} failed: ${error.message}`);

      if (attempt >= maxRetries) {
        return {
          status: "error",
          message: "🚫 Failed to execute code after multiple retries.",
          output: error.message
        };
      }

      // Wait 2s before retrying
      await sleep(2000);
    }
  }
};

// src/services/openai.js
import axios from 'axios';
import { env } from '../config/env';

const OPENAI_API_KEY = env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Get AI Completion
 */
export const getAICompletion = async (code, language) => {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file');
  }

  // 🧩 Step 2: Python হলে randomness কমানো
  const temperature = language.toLowerCase() === 'python' ? 0.3 : 0.7;

  // 🧩 Step 4: Retry Logic (২ বার চেষ্টা করবে)
  const maxRetries = 2;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const response = await axios.post(
        OPENAI_BASE_URL,
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are an expert ${language} programmer. Provide concise code completions only.`
            },
            {
              role: 'user',
              content: `Complete this ${language} code:\n\n${code}`
            }
          ],
          max_tokens: 150,
          temperature,
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000, // ⏱️ timeout বাড়ানো হয়েছে
        }
      );

      const content = response.data.choices?.[0]?.message?.content?.trim();

      // 🧩 Step 1: যদি রেসপন্স না থাকে
      if (!content) {
        return "No completion found";
      }

      // 🧩 Step 5: কোড ব্লক অংশ extract করা (```...``` এর মধ্যে)
      const codeBlockMatch = content.match(/```[a-zA-Z]*\n?([\s\S]*?)```/);
      return codeBlockMatch ? codeBlockMatch[1].trim() : content;

    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed: ${error.message}`);
      attempt++;

      if (attempt >= maxRetries) {
        throw new Error('Failed to get AI completion after multiple retries: ' + error.message);
      }
    }
  }
};
/**
 * Get AI Suggestion with hint levels
 * hintLevel: "basic" | "intermediate" | "advanced"
 */
export const getAISuggestion = async (code, language, hintLevel = 'basic') => {
  const hintPrompts = {
    basic: "Give a simple next-line suggestion with minimum explanation.",
    intermediate: "Suggest improvements and a few alternative approaches.",
    advanced: "Analyze this code deeply and suggest optimized or advanced refactoring ideas."
  };

  const systemPrompt = `You are a senior ${language} developer. ${hintPrompts[hintLevel]}`;

  try {
    const response = await axios.post(
      OPENAI_BASE_URL,
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this ${language} code:\n${code}` },
        ],
        max_tokens: 200,
        temperature: 0.6,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content = response.data.choices?.[0]?.message?.content?.trim();
    const codeBlockMatch = content?.match(/```[a-zA-Z]*\n?([\s\S]*?)```/);
    return codeBlockMatch ? codeBlockMatch[1].trim() : content || "No suggestion found";
  } catch (err) {
    console.error("AI Suggestion Error:", err.message);
    return "Failed to get AI suggestion";
  }
};

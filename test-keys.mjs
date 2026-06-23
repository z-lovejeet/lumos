import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const geminiMatch = envContent.match(/GEMINI_API_KEY=(.*)/);
const groqMatch = envContent.match(/GROQ_API_KEY=(.*)/);

const geminiKey = geminiMatch ? geminiMatch[1].trim() : '';
const groqKey = groqMatch ? groqMatch[1].trim() : '';

async function testGemini() {
  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('Testing Gemini 2.5 Flash...');
    const result = await model.generateContent("Say hello");
    console.log('Gemini SUCCESS: ' + result.response.text().trim());
  } catch (e) {
    console.error('Gemini FAILED: ' + e.message);
  }
}

async function testGroq() {
  try {
    const groq = new Groq({ apiKey: groqKey });
    console.log('Testing Groq Llama 3.1 8b...');
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say hello' }],
      model: 'llama-3.1-8b-instant',
      max_tokens: 10,
    });
    console.log('Groq SUCCESS: ' + chatCompletion.choices[0]?.message?.content.trim());
  } catch (e) {
    console.error('Groq FAILED: ' + e.message);
  }
}

async function run() {
  await testGemini();
  await testGroq();
}
run();

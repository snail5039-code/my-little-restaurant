'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatMessage } from '@/lib/stores/chatbot';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const systemPrompt = `You are a helpful assistant for "My Little Restaurant" app, where users save and track favorite restaurants.

App features:
- Save restaurants and track visits
- Rate restaurants (1-5 stars) and add notes
- Browse restaurants by category (Korean, Chinese, Japanese, Western, Cafe, Street Food, Pizza, Chicken, Spicy, Pasta)
- View restaurants on a map
- See government-certified excellent restaurants
- Get AI recommendations
- Share experiences in community forum

How to respond:
- Be friendly and encouraging
- Give practical advice about restaurants
- Explain app features step-by-step when asked
- Ask about categories, location, and preferences when recommending
- Respect food culture

Do NOT:
- Share actual restaurant data outside the user's personal list
- Advertise or spam
- Look up information outside the app`;

export async function sendChatbotMessage(
  previousMessages: ChatMessage[],
  userMessage: string,
  clickCount: number = 0,
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set');
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: systemPrompt,
    });

    // 이전 메시지들을 history 형식으로 변환
    const history = previousMessages.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Add context based on click count
    let contextSuffix = '';
    if (clickCount > 0) {
      if (clickCount < 3) {
        contextSuffix = '\n[User clicked character 1-2 times - stay friendly and helpful]';
      } else if (clickCount < 5) {
        contextSuffix = '\n[User clicked character 3-4 times - you can be playful!]';
      } else {
        contextSuffix = '\n[User clicked character 5+ times - be funny and witty! You can be a bit dramatic, like "Okay okay, enough poking!" but stay helpful]';
      }
    }

    // startChat으로 대화 세션 시작
    const chat = model.startChat({
      history: history.length > 0 ? history : undefined,
    });

    // 메시지 전송 (context suffix 포함)
    const fullMessage = userMessage + contextSuffix;
    const result = await chat.sendMessage(fullMessage);
    const responseText = result.response.text();

    return responseText;
  } catch (error) {
    console.error('Chatbot error details:', error instanceof Error ? error.message : error);
    throw error;
  }
}

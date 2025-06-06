import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const { prompt } = req.body;
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const answer = completion.choices[0].message.content;
    res.status(200).json({ text: answer });
  } catch (error) {
    console.error('GPT API Error:', error);
    res.status(500).json({ text: 'Error contacting GPT API.' });
  }
}
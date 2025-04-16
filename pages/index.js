import { useState } from 'react';

const quizData = [
  {
    question: 'Which ion is primarily responsible for the depolarization phase of the action potential?',
    options: ['K⁺', 'Na⁺', 'Cl⁻', 'Ca²⁺'],
    answer: 'Na⁺'
  },
  {
    question: 'Which structure in the nephron is responsible for filtration?',
    options: ['Loop of Henle', 'Distal tubule', 'Glomerulus', 'Collecting duct'],
    answer: 'Glomerulus'
  },
  {
    question: 'What is the normal cardiac output in a healthy adult?',
    options: ['2-3 L/min', '4-5 L/min', '5-6 L/min', '7-8 L/min'],
    answer: '5-6 L/min'
  }
];

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I\'m your Physiology Bot. Ask me anything about muscles, neurons, kidneys, or cardiovascular system.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [quizIndex, setQuizIndex] = useState(-1);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'user', text: input };
    setMessages([...messages, userMessage]);
    setLoading(true);

    if (input.toLowerCase().includes('quiz')) {
      setQuizIndex(0);
      setMessages(prev => [...prev, { sender: 'bot', text: `Quiz Time!\n${quizData[0].question}\nOptions: ${quizData[0].options.join(', ')}` }]);
      setInput('');
      setLoading(false);
      return;
    }

    if (quizIndex >= 0) {
      const currentQuestion = quizData[quizIndex];
      const correct = input.trim().toLowerCase() === currentQuestion.answer.toLowerCase();
      const responseText = correct ? '✅ Correct!' : `❌ Incorrect. The correct answer is: ${currentQuestion.answer}`;
      const nextIndex = quizIndex + 1;

      if (nextIndex < quizData.length) {
        setMessages(prev => [...prev, { sender: 'bot', text: responseText }, { sender: 'bot', text: `${quizData[nextIndex].question}\nOptions: ${quizData[nextIndex].options.join(', ')}` }]);
        setQuizIndex(nextIndex);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: responseText }, { sender: 'bot', text: '🎉 Quiz complete! Great job!' }]);
        setQuizIndex(-1);
      }

      setInput('');
      setLoading(false);
      return;
    }

    const ruleBasedResponses = {
      'action potential': 'An action potential is a rapid change in membrane potential that travels along the neuron.',
      'cardiac output': 'Cardiac output = Stroke Volume x Heart Rate. It\'s the amount of blood pumped per minute.',
      'nephron': 'The nephron is the basic functional unit of the kidney, responsible for filtering blood and forming urine.'
    };

    const matchedKeyword = Object.keys(ruleBasedResponses).find(keyword =>
      input.toLowerCase().includes(keyword)
    );

    if (matchedKeyword) {
      setMessages(prev => [...prev, { sender: 'bot', text: ruleBasedResponses[matchedKeyword] }]);
      setInput('');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/gpt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.text }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Oops, something went wrong!' }]);
    }

    setInput('');
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1>🧠 Physiology Chatbot</h1>
      <div style={{ border: '1px solid #ccc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <p style={{
              display: 'inline-block',
              backgroundColor: msg.sender === 'user' ? '#daf0ff' : '#eee',
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              marginBottom: '0.5rem'
            }}>{msg.text}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask a question or type 'quiz'..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button onClick={sendMessage} disabled={loading}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </div>
    </div>
  );
}
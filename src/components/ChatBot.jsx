import { useState, useRef, useEffect } from 'react';
import { FiMessageCircle, FiX, FiSend, FiStar } from 'react-icons/fi';
import { aiChat } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ChatBot.css';

const STARTER_PROMPTS = [
  'What size should I order?',
  'How do returns work?',
  'Track my last order',
];

const ChatBot = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the StyleHub assistant. Ask me about sizing, orders, returns, or styling tips." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const sessionId = useRef(`session_${Date.now()}`);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;

    if (!user) {
      setMessages((m) => [
        ...m,
        { role: 'user', content: text },
        { role: 'assistant', content: 'Sign in first so I can look up your orders and give you personalised help.' },
      ]);
      setInput('');
      return;
    }

    setMessages((m) => [...m, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await aiChat({ message: text, sessionId: sessionId.current });
      setMessages((m) => [...m, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', content: "I'm having trouble responding right now — please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      <button className="chatbot-fab" onClick={() => setOpen((v) => !v)} aria-label="Open chat assistant">
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <FiStar size={16} />
            <span>StyleHub Assistant</span>
          </div>

          <div className="chatbot-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chatbot-bubble ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="chatbot-bubble assistant chatbot-typing">
                <span /><span /><span />
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div className="chatbot-starters">
              {STARTER_PROMPTS.map((p) => (
                <button key={p} onClick={() => sendMessage(p)}>{p}</button>
              ))}
            </div>
          )}

          <form className="chatbot-input-row" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Ask anything…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button type="submit" aria-label="Send" disabled={loading}>
              <FiSend size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;

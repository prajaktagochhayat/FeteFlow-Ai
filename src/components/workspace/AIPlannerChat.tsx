import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  RefreshCw,
  User,
  Bot,
  Copy,
  Check,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { EventPlan } from '../../types';
import { ApiService } from '../../services/api';
import { formatCurrency } from '../../utils/formatCurrency';

interface AIPlannerChatProps {
  event: EventPlan;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  provider?: string;
  timestamp: string;
}

const QUICK_PROMPTS = [
  'How should we structure the arrival experience for our guests?',
  'Suggest 3 budget-conscious floral alternatives for centerpieces.',
  'What are the top 3 timing risks for our celebration date?',
  'Draft a 2-minute welcoming toast outline for the hosts.',
  'Generate an executive summary of our celebration plan.',
];

export const AIPlannerChat: React.FC<AIPlannerChatProps> = ({ event }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init_1',
      role: 'assistant',
      content: `Hello! I am your FêteFlow AI Creative Partner for **"${event.name}"**. I have full context on your target date (${event.date}), ${event.guestCount} guests, your ${formatCurrency(event.budget.totalBudget, event.budget.currency)} budget, and your aesthetic direction ("${event.eventConcept.title}"). How can I assist your planning today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Check if user asked for executive summary specifically
      if (textToSend.toLowerCase().includes('executive summary')) {
        const summaryResult = await ApiService.getExecutiveSummary(event.id || 'evt_default');
        const botMsg: ChatMessage = {
          id: 'bot_' + Date.now(),
          role: 'assistant',
          content: `### Executive Celebration Summary\n\n${summaryResult.summary}\n\n**Top Upcoming Priorities:**\n${summaryResult.topPriorities.map(p => `* ${p}`).join('\n')}\n\n**Key Planning Risks:**\n${summaryResult.primaryRisks.map(r => `* ${r}`).join('\n')}`,
          provider: summaryResult.provider,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const historyForApi = messages.map(m => ({ role: m.role, content: m.content }));
        const result = await ApiService.chat(event.id || 'evt_default', textToSend.trim(), historyForApi);
        const botMsg: ChatMessage = {
          id: 'bot_' + Date.now(),
          role: 'assistant',
          content: result.response,
          provider: result.provider,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'err_' + Date.now(),
        role: 'assistant',
        content: `I encountered an issue communicating with the AI service: ${err.message}. Please retry or check your settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex h-[78vh] flex-col rounded-3xl border border-brand-border bg-brand-surface shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-brand-border px-6 py-4 bg-brand-surface/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-deep to-brand-primary text-white shadow-md shadow-brand-primary/20">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-base font-bold text-brand-text">FêteFlow Conversational Planner</h2>
              <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[9px] font-bold text-brand-deep">
                Context-Aware
              </span>
            </div>
            <p className="text-xs text-brand-text-secondary truncate max-w-md">
              Focusing on: {event.name} ({event.eventType})
            </p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map(m => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm ${
                  isUser
                    ? 'bg-brand-coral text-white'
                    : 'bg-brand-soft text-brand-deep border border-brand-primary/20'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-brand-primary" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-brand-primary text-white rounded-tr-none'
                    : 'border border-brand-border bg-brand-elevated/40 text-brand-text rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.content}</div>

                <div
                  className={`mt-2 flex items-center justify-between gap-2 text-[10px] ${
                    isUser ? 'text-white/70' : 'text-brand-text-secondary'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <div className="flex items-center gap-2">
                      {m.provider && (
                        <span className="rounded px-1.5 py-0.2 bg-brand-soft font-semibold text-brand-deep text-[9px]">
                          {m.provider === 'gemini' ? 'Gemini AI' : 'Deterministic'}
                        </span>
                      )}
                      <button
                        onClick={() => copyMessage(m.content, m.id)}
                        className="opacity-0 group-hover:opacity-100 hover:text-brand-primary transition-opacity"
                        title="Copy text"
                      >
                        {copiedId === m.id ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-brand-deep">
              <Sparkles className="h-4 w-4 animate-spin text-brand-primary" />
            </div>
            <div className="rounded-2xl rounded-tl-none border border-brand-border bg-brand-elevated/40 p-4 text-xs text-brand-text-secondary">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Synthesizing creative recommendation...</span>
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="border-t border-brand-border/60 bg-brand-surface px-4 py-2 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-brand-text-secondary uppercase shrink-0">Prompts:</span>
          {QUICK_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              disabled={loading}
              className="rounded-full border border-brand-border bg-brand-elevated/50 px-3 py-1 text-[11px] text-brand-text whitespace-nowrap hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <div className="border-t border-brand-border p-4 bg-brand-surface">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask FêteFlow anything about ${event.name}...`}
            className="flex-1 rounded-2xl border border-brand-border bg-brand-elevated px-4 py-3 text-xs sm:text-sm text-brand-text placeholder-brand-text-secondary focus:border-brand-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-md shadow-brand-primary/20 hover:bg-brand-primary-hover disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

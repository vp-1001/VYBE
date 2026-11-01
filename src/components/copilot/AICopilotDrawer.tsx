import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Check,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useEvent } from '../../context/EventContext';
import { AIChangeProposal } from '../../types/event';

interface AICopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  proposal?: AIChangeProposal | null;
}

export const AICopilotDrawer: React.FC<AICopilotDrawerProps> = ({ isOpen, onClose }) => {
  const { activeEvent, applyProposal, rejectProposal, pendingProposals, addProposal } = useEvent();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `Hello! I am your VYBE AI Copilot. I have full context on "${activeEvent?.title || 'your event'}" including its budget, tasks, and run-of-show. How can I assist you right now?`,
      timestamp: 'Just now',
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Make event more premium without exceeding budget',
    'We now expect 40 additional guests',
    'What tasks should we prioritize this week?',
    'Create an emergency backup plan for rain',
    'Photographer is delayed by 30 mins',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || !activeEvent) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          currentEvent: activeEvent,
        }),
      });

      const data = await response.json();
      if (data.success) {
        let attachedProposal: AIChangeProposal | null = null;
        if (data.proposal) {
          const prop: AIChangeProposal = {
            ...data.proposal,
            status: 'pending',
          };
          attachedProposal = prop;
          addProposal(prop);
        }

        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || "I've reviewed your event parameters.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          proposal: attachedProposal,
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error(data.error || 'Copilot request failed');
      }
    } catch (err: any) {
      console.error('Copilot send error:', err);
      const errorReply: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: 'I could not process this request right now. Please verify your connection or try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-[var(--bg-card)] border-l border-[var(--border-main)] shadow-2xl flex flex-col justify-between transition-transform duration-300">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-main)] flex items-center justify-between bg-[var(--bg-card-subtle)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-400 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-display text-[var(--text-main)]">
              VYBE AI Copilot
            </h3>
            <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Event Context Synced
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-main)]"
          aria-label="Close Copilot"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-2 border-b border-[var(--border-main)] bg-[var(--bg-card)] flex items-center gap-1.5 overflow-x-auto text-[11px]">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 rounded-full bg-[var(--bg-card-subtle)] hover:bg-violet-100 dark:hover:bg-violet-950/40 text-[var(--text-muted)] hover:text-violet-600 border border-[var(--border-main)] whitespace-nowrap shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-violet-600 text-white rounded-br-xs'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-main)] border border-[var(--border-main)] rounded-bl-xs'
              }`}
            >
              <p>{msg.text}</p>

              {/* Actionable Proposal Card */}
              {msg.proposal && (
                <div className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-violet-200 dark:border-violet-800 space-y-2 text-xs text-[var(--text-main)] shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-violet-600">
                      Actionable Proposal
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                        msg.proposal.status === 'applied'
                          ? 'bg-emerald-100 text-emerald-700'
                          : msg.proposal.status === 'rejected'
                          ? 'bg-neutral-100 text-neutral-600'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {msg.proposal.status}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs">{msg.proposal.title}</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">{msg.proposal.description}</p>
                  <div className="text-[10px] p-2 rounded bg-[var(--bg-card-subtle)] font-medium text-violet-700 dark:text-violet-300">
                    <strong>Impact:</strong> {msg.proposal.impactSummary}
                  </div>

                  {msg.proposal.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-[var(--border-main)]">
                      <button
                        onClick={() => rejectProposal(msg.proposal!.id)}
                        className="flex-1 py-1 rounded bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] text-[11px] font-semibold"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => applyProposal(msg.proposal!.id)}
                        className="flex-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center justify-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Apply Changes</span>
                      </button>
                    </div>
                  )}

                  {msg.proposal.status === 'applied' && (
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 pt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Changes applied to live event model!</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <span className="text-[9px] text-[var(--text-muted)] mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <Sparkles className="w-3.5 h-3.5 text-violet-600 animate-spin" />
            <span>Analyzing event data & formulating proposal...</span>
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="p-3 border-t border-[var(--border-main)] bg-[var(--bg-card-subtle)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask Copilot to rebalance, reschedule, or advise..."
            className="flex-1 p-2.5 text-xs rounded-xl bg-[var(--bg-card)] border border-[var(--border-main)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-violet-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="p-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white shadow-sm transition-all shrink-0"
            aria-label="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

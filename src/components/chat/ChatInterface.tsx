'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Copy, Check } from 'lucide-react';
import { ChatMessage, Profile } from '@/types/astro';

interface ChatInterfaceProps {
  profile: Profile;
  initialMessages?: ChatMessage[];
  onSendMessage?: (message: string) => Promise<void>;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  profile,
  initialMessages = [],
  onSendMessage,
  className = '',
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const suggestedQuestions = [
    "What's favorable this week?",
    "When is my next career peak period?",
    "What does my Rahu transit mean?",
    "Best dates for important decisions this month?",
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    // Mock streaming response - replace with actual SSE implementation
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      sources: [],
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    // Simulate streaming
    const mockResponse = `Based on your chart, I can see that you're currently in the Jupiter-Saturn dasha period. This is generally a favorable time for career growth and financial stability. However, Mars is transiting your 10th house, which suggests you should be cautious about workplace conflicts.`;

    for (let i = 0; i < mockResponse.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 20));
      setMessages((prev) => {
        const updated = [...prev];
        const lastMessage = updated[updated.length - 1];
        if (lastMessage.role === 'assistant') {
          lastMessage.content = mockResponse.substring(0, i + 1);
        }
        return updated;
      });
    }

    // Add mock sources
    setMessages((prev) => {
      const updated = [...prev];
      const lastMessage = updated[updated.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.sources = [
          {
            reportId: '1',
            reportType: 'career',
            chunkId: '1',
            page: 4,
          },
          {
            reportId: '2',
            reportType: 'transit_saturn',
            chunkId: '2',
            page: 8,
          },
        ];
      }
      return updated;
    });

    setIsStreaming(false);

    if (onSendMessage) {
      await onSendMessage(input.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (messageId: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className={`flex flex-col h-full bg-[#0a0a1a] rounded-lg border border-[#1e2d4a] ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-[#1e2d4a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#7c3aed] flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              {profile.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="text-[#e2e8f0] font-semibold">
              Chatting about: {profile.name}
            </h3>
            <p className="text-[#64748b] text-xs">
              AI-powered chart analysis
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onCopy={handleCopy}
              isCopied={copiedId === message.id}
            />
          ))}
        </AnimatePresence>

        {isStreaming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-[#64748b]"
          >
            <div className="flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>●</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>●</span>
            </div>
            <span className="text-sm">Analyzing chart...</span>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {messages.length === 0 && (
        <div className="px-4 pb-4">
          <p className="text-[#64748b] text-sm mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="px-3 py-2 bg-[#0f1729] border border-[#1e2d4a] rounded-lg text-[#e2e8f0] text-sm hover:border-[#7c3aed] transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-[#1e2d4a]">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about your chart..."
            disabled={isStreaming}
            className="flex-1 bg-[#0f1729] border border-[#1e2d4a] text-[#e2e8f0] px-4 py-3 rounded-lg resize-none focus:outline-none focus:border-[#7c3aed] disabled:opacity-50"
            rows={2}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="px-4 py-3 bg-[#7c3aed] text-white rounded-lg hover:bg-[#6d28d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const MessageBubble: React.FC<{
  message: ChatMessage;
  onCopy: (id: string, content: string) => void;
  isCopied: boolean;
}> = ({ message, onCopy, isCopied }) => {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[80%] ${isUser ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-lg p-4 ${
            isUser
              ? 'bg-[#7c3aed] text-white'
              : 'bg-[#0f1729] text-[#e2e8f0] border border-[#1e2d4a]'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          {/* Sources */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#1e2d4a] flex flex-wrap gap-2">
              {message.sources.map((source, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-[#0a0a1a] rounded text-xs text-[#c9a227] border border-[#1e2d4a]"
                >
                  [{source.reportType.replace('_', ' ')}, p.{source.page}]
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Copy button for assistant messages */}
        {!isUser && (
          <button
            onClick={() => onCopy(message.id, message.content)}
            className="mt-2 text-[#64748b] hover:text-[#e2e8f0] text-xs flex items-center gap-1 transition-colors"
          >
            {isCopied ? (
              <>
                <Check size={14} />
                Copied
              </>
            ) : (
              <>
                <Copy size={14} />
                Copy
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

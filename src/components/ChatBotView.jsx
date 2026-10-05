import React, { useState, useEffect, useRef } from 'react';
import { API_URL } from '../config.js';

export default function ChatBotView({ user, onOpenShare, showToast }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const heroSuggestions = [
    {
      icon: '🗺️',
      title: 'Plan a 3-Day Itinerary',
      desc: 'Optimized for transit, scenic spots & budget',
      prompt: 'Plan a scenic 3-day itinerary with best sights, transit options and timing tips',
    },
    {
      icon: '💰',
      title: 'Budget & Cost Breakdown',
      desc: 'Realistic costs for 2 adults under ₹5,000',
      prompt: 'Give me a smart 2-day budget plan for 2 adults under ₹5,000 including food & transit',
    },
    {
      icon: '⛅',
      title: 'Weather & Sunset Views',
      desc: 'Live forecast, temperatures & golden hour',
      prompt: 'What is today\'s weather forecast, humidity and best sunset viewpoints?',
    },
    {
      icon: '🍜',
      title: 'Hidden Cafes & Local Food',
      desc: 'Authentic dining, breakfast spots & cafes',
      prompt: 'Recommend top local cafes, authentic regional meals, and evening waterfront dining',
    },
  ];

  // Load chat sessions from MongoDB Atlas for the user
  const loadSessions = async () => {
    try {
      const uid = user?.id || user?._id || user?.email || 'guest';
      const res = await fetch(`${API_URL}/api/chat/history?userId=${uid}`);
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    setInput('');
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          sessionId,
          userId: user?.id || user?._id || user?.email || 'guest',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Error communicating with AI assistant');

      if (data.sessionId) setSessionId(data.sessionId);

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      loadSessions(); // refresh history list
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSelectSession = (s) => {
    setSessionId(s._id);
    setMessages(s.messages || []);
    if (window.innerWidth < 768) {
      setShowHistory(false);
    }
  };

  const handleDeleteSession = async (e, idToDelete) => {
    e.stopPropagation();
    try {
      const res = await fetch(`${API_URL}/api/chat/${idToDelete}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete chat');

      setSessions((prev) => prev.filter((s) => s._id !== idToDelete));
      if (sessionId === idToDelete) {
        setSessionId(null);
        setMessages([]);
      }
      showToast('Chat conversation deleted', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleClearAllHistory = async () => {
    if (!window.confirm('Delete all your saved chat conversations from cloud?')) return;
    try {
      const uid = user?.id || user?._id || user?.email || 'guest';
      const res = await fetch(`${API_URL}/api/chat?userId=${uid}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to clear chats');

      setSessions([]);
      setSessionId(null);
      setMessages([]);
      showToast('All chat history cleared', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShareCurrentChat = async () => {
    if (messages.length === 0) {
      showToast('Send a message first before sharing the conversation', 'info');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/chat/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          messages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create share link');

      onOpenShare({
        type: 'chat',
        title: messages[0]?.text?.slice(0, 40) || 'PocketRoute AI Conversation',
        subtitle: `${messages.length} messages • Shared conversation`,
        shareUrl: `http://localhost:3000/#/share/chat/${data.shareCode}`,
      });
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleStartNewChat = () => {
    setMessages([]);
    setSessionId(null);
    if (window.innerWidth < 768) setShowHistory(false);
    showToast('Started a fresh conversation', 'info');
  };

  // Helper to format text with bold, bullet points, and clean paragraphs
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formattedLine = line;
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(line.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="chat-strong">{match[1]}</strong>);
        lastIndex = match.index + match[0].length;
      }
      if (lastIndex < line.length) {
        parts.push(line.substring(lastIndex));
      }

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="chat-bullet-line">
            <span className="bullet-bullet">▸</span>
            <span>{parts.length > 0 ? parts : line.replace(/^[•-]\s*/, '')}</span>
          </div>
        );
      }

      if (!line.trim()) {
        return <div key={idx} style={{ height: '8px' }} />;
      }

      return (
        <p key={idx} className="chat-paragraph">
          {parts.length > 0 ? parts : line}
        </p>
      );
    });
  };

  return (
    <div className="chatbot-screen-wrapper">
      {/* 2-Column Split: History Sidebar & Active Conversation Pane */}
      <div className="chatbot-panes-layout">

        {/* History Sidebar Panel */}
        <div className={`chatbot-history-panel ${showHistory ? 'open' : ''}`}>
          <div className="history-panel-header">
            <div className="history-header-title">
              <span>💬 Chats</span>
              <span className="history-count-pill">{sessions.length}</span>
            </div>
            <button
              type="button"
              className="new-chat-pill-btn"
              onClick={handleStartNewChat}
              title="Start a new chat"
            >
              + New
            </button>
          </div>

          <div className="history-sessions-list">
            {sessions.length === 0 ? (
              <div className="history-empty-state">
                <span style={{ fontSize: '24px' }}>💬</span>
                <p>No saved chats yet.</p>
                <span className="m" style={{ fontSize: '11px' }}>Chats you start will appear here</span>
              </div>
            ) : (
              sessions.map((s) => (
                <div
                  key={s._id}
                  className={`history-session-item ${sessionId === s._id ? 'active' : ''}`}
                  onClick={() => handleSelectSession(s)}
                >
                  <span className="hsi-icon">🗨️</span>
                  <div className="hsi-body">
                    <div className="hsi-title">{s.title || 'Conversation'}</div>
                    <div className="hsi-meta">
                      {new Date(s.updatedAt || s.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>

                  {/* Delete Single Chat Button */}
                  <button
                    type="button"
                    className="hsi-delete-btn"
                    onClick={(e) => handleDeleteSession(e, s._id)}
                    title="Delete this chat"
                    aria-label="Delete chat"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {sessions.length > 1 && (
            <div className="history-panel-footer">
              <button
                type="button"
                className="clear-all-history-btn"
                onClick={handleClearAllHistory}
              >
                Clear all chats
              </button>
            </div>
          )}
        </div>

        {/* Backdrop for mobile history drawer */}
        {showHistory && (
          <div
            className="history-drawer-backdrop"
            onClick={() => setShowHistory(false)}
          />
        )}

        {/* Main Conversation Pane */}
        <div className="chatbot-conversation-pane">
          {/* Topbar */}
          <div className="chatbot-topbar">
            <div className="chatbot-topbar-left">
              {/* History Toggle Button */}
              <button
                type="button"
                className={`chatbot-toggle-history-btn ${showHistory ? 'active' : ''}`}
                onClick={() => setShowHistory(!showHistory)}
                title="Toggle Chat History list"
              >
                <span>💬</span>
                <span className="history-btn-label">History</span>
                {sessions.length > 0 && (
                  <span className="history-badge-dot">{sessions.length}</span>
                )}
              </button>

              <div className="ai-spark-icon hide-on-mobile">✨</div>
              <div className="chatbot-title-block">
                <div className="chatbot-title-row">
                  <span className="chatbot-title">PocketRoute AI</span>
                  <span className="chatbot-model-badge hide-on-mobile">Travel & Transit 2.0</span>
                </div>
                <div className="chatbot-subtitle hide-on-mobile">
                  {sessionId ? 'Active conversation • Saved in Cloud' : 'Dynamic travel, transit & budget intelligence'}
                </div>
              </div>
            </div>

            <div className="chatbot-topbar-actions">
              {messages.length > 0 && (
                <button
                  type="button"
                  className="chatbot-action-btn"
                  onClick={handleStartNewChat}
                  title="Start a fresh chat"
                >
                  <span>+</span> <span className="hide-on-mobile">New</span>
                </button>
              )}

              <button
                type="button"
                className="chatbot-share-btn"
                onClick={handleShareCurrentChat}
                title="Share this chat link like ChatGPT"
              >
                <span>🔗</span> <span className="hide-on-mobile">Share</span>
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="chatbot-content-area">
            {messages.length === 0 ? (
              <div className="chatbot-hero-view">
                <div className="hero-spark-avatar">✨</div>
                <h1 className="hero-main-title">Where would you like to explore?</h1>
                <p className="hero-sub-title">
                  PocketRoute AI crafts multi-stop itineraries, calculates transit costs, checks weather conditions, and uncovers secret local gems.
                </p>

                <div className="hero-cards-grid">
                  {heroSuggestions.map((card, i) => (
                    <div
                      key={i}
                      className="hero-suggestion-card"
                      onClick={() => handleSend(card.prompt)}
                    >
                      <div className="hero-card-icon">{card.icon}</div>
                      <div className="hero-card-body">
                        <div className="hero-card-title">{card.title}</div>
                        <div className="hero-card-desc">{card.desc}</div>
                      </div>
                      <span className="hero-card-arrow">→</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="chatbot-messages-container">
                {messages.map((m) => (
                  <div key={m.id} className={`chat-message-row ${m.sender === 'user' ? 'me' : 'ai'}`}>
                    {m.sender === 'assistant' && (
                      <div className="chat-ai-avatar">
                        <span>✨</span>
                      </div>
                    )}

                    <div className={`chat-bubble ${m.sender === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                      <div className="bubble-text">
                        {renderFormattedText(m.text)}
                      </div>

                      <div className="bubble-footer">
                        <span className="chat-timestamp">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {m.sender === 'assistant' && (
                          <button
                            type="button"
                            className="copy-bubble-btn"
                            onClick={() => handleCopy(m.text, m.id)}
                            title="Copy to clipboard"
                          >
                            {copiedId === m.id ? '✓ Copied' : '📋 Copy'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="chat-message-row ai">
                    <div className="chat-ai-avatar pulsing">
                      <span>✨</span>
                    </div>
                    <div className="chat-bubble ai-bubble loading-bubble">
                      <div className="typing-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <span className="loading-label">PocketRoute AI is calculating routes & budget...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Floating Capsule Dock */}
          <div className="chatbot-dock-outer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="chatbot-dock-capsule"
            >
              <input
                ref={inputRef}
                type="text"
                className="chatbot-dock-input"
                placeholder="Ask anything... e.g. 3-day itinerary under ₹5,000, sunset viewpoints, traffic tips"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
              />

              <button
                type="submit"
                className="chatbot-dock-send-btn"
                disabled={loading || !input.trim()}
                aria-label="Send query"
              >
                ↑
              </button>
            </form>

            <div className="chatbot-dock-footnote">
              PocketRoute AI delivers dynamic estimates for budgets, weather, and transit schedules.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

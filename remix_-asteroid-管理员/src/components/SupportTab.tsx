import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MessageSquare, Send, User, Mail, Clock,
  AlertCircle, RefreshCw, Search, MessageCircle
} from 'lucide-react';
import { CHAT_API } from '@/lib/config';

interface SupportTabProps {
  onShowNotification: (message: string, type: 'success' | 'info' | 'error') => void;
}

interface ChatSession {
  sessionToken: string;
  email: string | null;
  lastMessage: string;
  updatedAt: string;
}

interface ChatMessage {
  id: string;
  sessionToken: string;
  sender: 'user' | 'agent';
  text: string;
  email: string | null;
  createdAt: string;
}

const SESSIONS_POLL_MS = 5000;
const MESSAGES_POLL_MS = 2000;

export default function SupportTab({ onShowNotification }: SupportTabProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionToken, setSelectedSessionToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<string | null>(null);   // 当前会话引用，供异步回调校验
  const prevCountRef = useRef(0);                     // 上次消息数，控制自动滚动

  useEffect(() => { selectedRef.current = selectedSessionToken; }, [selectedSessionToken]);

  // 拉取会话列表；background=true 时不触发刷新转圈
  const fetchSessions = useCallback(async (background = false) => {
    if (!background) setLoadingSessions(true);
    try {
      const res = await fetch(`${CHAT_API}/sessions`, { credentials: 'include' });
      if (res.ok) setSessions(await res.json());
    } catch (err) {
      console.error('加载会话列表失败:', err);
    } finally {
      if (!background) setLoadingSessions(false);
    }
  }, []);

  // 拉取某会话消息；带 abort 信号 + 会话校验，避免切换时串话
  const fetchMessages = useCallback(
    async (token: string, background = false, signal?: AbortSignal) => {
      if (!background) setLoadingMessages(true);
      try {
        const res = await fetch(
          `${CHAT_API}/messages?sessionToken=${encodeURIComponent(token)}`,
          { credentials: 'include', signal }
        );
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          if (selectedRef.current === token) setMessages(data); // 仍是当前会话才更新
        }
      } catch (err) {
        if ((err as { name?: string })?.name !== 'AbortError') {
          console.error('加载消息失败:', err);
        }
      } finally {
        if (!background) setLoadingMessages(false);
      }
    },
    []
  );

  // 轮询会话列表（页面隐藏时暂停）
  useEffect(() => {
    fetchSessions();
    const id = setInterval(() => {
      if (!document.hidden) fetchSessions(true);
    }, SESSIONS_POLL_MS);
    return () => clearInterval(id);
  }, [fetchSessions]);

  // 轮询当前会话消息（切换会话即取消上一个请求与定时器）
  useEffect(() => {
    if (!selectedSessionToken) {
      setMessages([]);
      prevCountRef.current = 0;
      return;
    }
    const ctrl = new AbortController();
    fetchMessages(selectedSessionToken, false, ctrl.signal);
    const id = setInterval(() => {
      if (!document.hidden) fetchMessages(selectedSessionToken, true, ctrl.signal);
    }, MESSAGES_POLL_MS);
    return () => { ctrl.abort(); clearInterval(id); };
  }, [selectedSessionToken, fetchMessages]);

  // 仅当消息变多时才自动滚到底（避免每次轮询都强制滚动）
  useEffect(() => {
    if (messages.length > prevCountRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevCountRef.current = messages.length;
  }, [messages]);

  const handleSendReply = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const token = selectedSessionToken;
    const text = replyText.trim();
    if (!token || !text) return;

    setReplyText('');
    setSendingReply(true);
    try {
      const res = await fetch(`${CHAT_API}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionToken: token, sender: 'agent', text }),
      });
      if (res.ok) {
        const newMessage: ChatMessage = await res.json();
        // 乐观插入并按 id 去重（轮询返回同条时不会重复）
        if (selectedRef.current === token) {
          setMessages(prev =>
            prev.some(m => m.id === newMessage.id) ? prev : [...prev, newMessage]
          );
        }
        onShowNotification('回复发送成功！', 'success');
      } else {
        onShowNotification('回复发送失败，请检查连接！', 'error');
        setReplyText(text);
      }
    } catch (err) {
      console.error('发送回复异常:', err);
      onShowNotification('回复发送异常，请稍后重试！', 'error');
      setReplyText(text);
    } finally {
      setSendingReply(false);
    }
  }, [selectedSessionToken, replyText, onShowNotification]);

  const formatTimestamp = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }, []);

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sessions;
    return sessions.filter(s =>
      s.sessionToken.toLowerCase().includes(query) ||
      (s.email?.toLowerCase().includes(query) ?? false) ||
      s.lastMessage.toLowerCase().includes(query)
    );
  }, [sessions, searchQuery]);

  const activeSessionDetails = useMemo(
    () => sessions.find(s => s.sessionToken === selectedSessionToken),
    [sessions, selectedSessionToken]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-140px)] min-h-[500px]">

      {/* 1. 左侧会话列表 */}
      <div className="md:col-span-1 bg-white rounded-2xl border border-[#EAEAE8] flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#EAEAE8] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1a1c1c] flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-orange-500" />
              <span>对话列表 ({sessions.length})</span>
            </h3>
            <button
              onClick={() => fetchSessions()}
              className="p-1 rounded-md hover:bg-neutral-100 text-stone-500 transition-colors"
              title="刷新列表"
              disabled={loadingSessions}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSessions ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              aria-label="搜索会话"
              placeholder="搜索会话、邮箱..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-[#c4c7c7] rounded-lg text-xs outline-none focus:border-stone-400 focus:bg-white transition-all text-[#1a1c1c]"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#EAEAE8]">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-2 h-full">
              <AlertCircle className="w-8 h-8 text-stone-300" />
              <span>暂无匹配的在线客服对话</span>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.sessionToken}
                onClick={() => setSelectedSessionToken(session.sessionToken)}
                className={`p-4 cursor-pointer transition-all flex flex-col gap-1.5 hover:bg-[#F9F9F8] ${
                  selectedSessionToken === session.sessionToken
                    ? 'bg-neutral-50 border-l-4 border-orange-500'
                    : 'border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-stone-700 truncate max-w-[140px] font-mono">
                    {session.email || session.sessionToken.substring(0, 15)}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {formatTimestamp(session.updatedAt)}
                  </span>
                </div>

                <p className="text-xs text-stone-500 truncate max-w-full leading-relaxed">
                  {session.lastMessage}
                </p>

                {session.email && (
                  <div className="flex items-center gap-1.5 text-[10px] text-stone-400 mt-1">
                    <Mail className="w-3 h-3 text-stone-400" />
                    <span>{session.email}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. 右侧对话面板 */}
      <div className="md:col-span-2 bg-white rounded-2xl border border-[#EAEAE8] flex flex-col overflow-hidden shadow-sm h-full">
        {selectedSessionToken ? (
          <>
            {/* 头部 */}
            <div className="p-4 border-b border-[#EAEAE8] flex items-center justify-between bg-[#F9F9F8]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-800 font-mono">
                    会话: {selectedSessionToken.substring(0, 15)}...
                  </h4>
                  {activeSessionDetails?.email && (
                    <p className="text-[10px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3 text-stone-400" />
                      <span>{activeSessionDetails.email}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 消息区 */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-stone-50 flex flex-col gap-4">
              {loadingMessages && messages.length === 0 ? (
                <div className="flex items-center justify-center gap-2 h-full text-xs text-stone-400">
                  <RefreshCw className="w-4 h-4 animate-spin text-stone-500" />
                  <span>正在加载对话历史...</span>
                </div>
              ) : (
                messages.map((msg) => {
                  const isAgent = msg.sender === 'agent';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col max-w-[80%] ${
                        isAgent ? 'items-end ml-auto' : 'items-start mr-auto'
                      }`}
                    >
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed font-sans shadow-sm ${
                        isAgent
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-tr-none'
                          : 'bg-white text-stone-800 border border-[#EAEAE8] rounded-tl-none'
                      }`}>
                        {msg.text.split('\n').map((line, i) => <p key={i} className="my-0.5">{line}</p>)}
                      </div>
                      <span className="text-[9px] text-stone-400 mt-1 font-medium px-1">
                        {formatTimestamp(msg.createdAt)}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 回复输入 */}
            <form onSubmit={handleSendReply} className="p-4 border-t border-[#EAEAE8] bg-white flex gap-3 items-center">
              <input
                type="text"
                aria-label="回复内容"
                placeholder="在此输入您的回复，按回车或点击发送..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                disabled={sendingReply}
                className="flex-1 px-4 py-2.5 bg-stone-50 border border-[#c4c7c7] rounded-xl text-xs outline-none focus:border-orange-500 focus:bg-white transition-all text-[#1a1c1c]"
              />
              <button
                type="submit"
                disabled={sendingReply || !replyText.trim()}
                className="h-9 w-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-stone-50 text-stone-400 gap-3 h-full">
            <MessageSquare className="w-12 h-12 text-stone-300 stroke-[1.5]" />
            <h4 className="text-sm font-semibold text-stone-600">请选择一个对话</h4>
            <p className="text-xs text-stone-400 max-w-xs leading-relaxed">
              在左侧列表中点击任何在线客户的对话，即可查看其历史交互信息并直接建立人工解答通道。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

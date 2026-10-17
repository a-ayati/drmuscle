import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';

export const AICoachDrawer: React.FC = () => {
  const {
    isChatDrawerOpen,
    setIsChatDrawerOpen,
    chatMessages,
    sendChatMessage,
    applyActionProposal,
    isChatLoading,
    userProfile,
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isChatDrawerOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatDrawerOpen]);

  if (!isChatDrawerOpen) return null;

  const handleSend = () => {
    if (!inputMessage.trim() || isChatLoading) return;
    const msg = inputMessage;
    setInputMessage('');
    sendChatMessage(msg);
  };

  const sampleSuggestions = [
    'كيف استبدل وجبة الغداء بأكلة أرخص؟',
    'جهاز السحب مشغول، ما هو البديل؟',
    'عندي 20 دقيقة فقط اليوم للتمرين، كيف اختصر؟',
    'هل ميزانيتي كافية لتغطية احتياج البروتين؟',
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/90 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                كابتن على قدّك
              </h3>
              <p className="text-[11px] text-emerald-700 font-medium">
                مساعد التغذية والتمارين الذكي
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsChatDrawerOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            aria-label="إغلاق المحادثة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {chatMessages.map((msg) => {
            const isBot = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs sm:text-sm ${isBot ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs ${
                    isBot ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-900 text-white'
                  }`}
                >
                  {isBot ? 'كابتن' : 'أنا'}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 leading-relaxed ${
                    isBot
                      ? 'bg-slate-100 text-slate-800 rounded-tr-xs'
                      : 'bg-emerald-600 text-white rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Interactive Action Proposal Box */}
                  {msg.actionProposal && (
                    <div className="mt-3 p-3 rounded-xl bg-white text-slate-900 border border-emerald-300 shadow-xs space-y-2">
                      <div className="font-bold text-xs text-emerald-800">
                        {msg.actionProposal.title}
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {msg.actionProposal.description}
                      </p>
                      <button
                        onClick={() => applyActionProposal(msg.actionProposal)}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تطبيق هذا التعديل في خطتي فوراً</span>
                      </button>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1.5 ${
                      isBot ? 'text-slate-400' : 'text-emerald-100'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isChatLoading && (
            <div className="flex gap-3 text-xs items-center text-slate-500">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 flex items-center justify-center font-bold">
                كابتن
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-500 mr-2">جاري التفكير والتنسيق...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestions Pills */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <div className="text-[11px] text-slate-500 mb-1.5 font-medium">مقترحات شائعة:</div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {sampleSuggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setInputMessage(s);
                }}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] hover:border-emerald-500 hover:bg-emerald-50/50 whitespace-nowrap transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-3 sm:p-4 border-t border-slate-200/90 bg-white">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="اكتب سؤالك للكابتن عن الأكل أو التمارين..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 h-11 px-4 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-600 focus:outline-none transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!inputMessage.trim() || isChatLoading}
              className="w-11 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-xs shrink-0"
              aria-label="إرسال الرسالة"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 text-center">
            إرشادات توعوية ورياضية مدروسة. لا يغني عن الاستشارة الطبية عند الإصابات.
          </p>
        </div>
      </div>
    </div>
  );
};

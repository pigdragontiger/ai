import React from 'react';

const EMOJI_MAP: Record<string, string> = {
  "시장": "📊",
  "역량": "✨",
  "협상": "🤝",
  "리포트": "📝"
};

const getEmojiForMessage = (message: string): string => {
    const keyword = Object.keys(EMOJI_MAP).find(key => message.includes(key));
    return keyword ? EMOJI_MAP[keyword] : "🤔";
};


export const LoadingSpinner: React.FC<{ message?: string }> = ({ message = 'AI가 연봉 정보를 분석하고 있습니다...' }) => {
    const emoji = getEmojiForMessage(message);

    return (
        <div className="flex flex-col items-center justify-center py-20" key={message}>
            <div className="text-7xl mb-6 animate-pop-in animate-subtle-bob" style={{ animationDelay: '0.1s' }}>
                {emoji}
            </div>
            <p className="text-slate-600 font-semibold text-center animate-pop-in">
                {message}
            </p>
        </div>
    );
};
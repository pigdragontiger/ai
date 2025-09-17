import React from 'react';

export const Header: React.FC = () => (
  <header className="text-center py-10 sm:py-16 bg-white shadow-md">
    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-500">
      AI 연봉 산출 시뮬레이션 시스템
    </h1>
    <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
      지원자의 직무, 경력, 기술 스택에 맞는 시장 연봉을 AI가 분석해드립니다.
    </p>
  </header>
);
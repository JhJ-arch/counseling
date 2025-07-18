import React, { useState } from 'react';

interface TeacherSetupProps {
  onClassSet: (className: string) => void;
}

const TeacherSetup: React.FC<TeacherSetupProps> = ({ onClassSet }) => {
  const [className, setClassName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) {
      setError('학급 이름을 입력해주세요.');
      return;
    }
    onClassSet(className.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8 animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800">교사 설정</h1>
        <p className="text-slate-500 mt-2">상담을 시작할 학급을 설정해주세요.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="className" className="block text-lg font-medium text-slate-700 mb-2">
            우리 반 이름
          </label>
          <input
            type="text"
            id="className"
            value={className}
            onChange={(e) => {
                setClassName(e.target.value);
                setError('');
            }}
            className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="예: 3학년 2반"
            aria-describedby="error-message"
          />
        </div>
        {error && <p id="error-message" className="text-red-500 text-center text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-blue-300"
          disabled={!className.trim()}
        >
          학급 설정 완료
        </button>
      </form>
    </div>
  );
};

export default TeacherSetup;

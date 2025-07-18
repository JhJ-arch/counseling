import React, { useState } from 'react';
import { CounselorType } from '../types';
import { Users, UserCheck, MessageSquareQuote } from 'lucide-react';

interface StudentFormProps {
  onStartCounseling: (name: string, worry: string, counselor: CounselorType) => void;
  isLoading: boolean;
}

const StudentForm: React.FC<StudentFormProps> = ({ onStartCounseling, isLoading }) => {
  const [name, setName] = useState('');
  const [worry, setWorry] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (counselor: CounselorType) => {
    if (!name.trim() || !worry.trim()) {
      setError('이름과 고민 내용을 모두 입력해주세요.');
      return;
    }
    setError('');
    onStartCounseling(name, worry, counselor);
  };

  const CounselorButton = ({ type, icon }: { type: CounselorType; icon: React.ReactNode }) => (
    <button
      onClick={() => handleSubmit(type)}
      disabled={isLoading}
      className="flex-1 bg-white hover:bg-blue-50 text-blue-600 font-semibold py-4 px-4 border border-blue-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center space-y-2 text-center"
    >
      {icon}
      <span className="text-sm md:text-base">{type}</span>
    </button>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8 animate-fade-in-up">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800">괜찮아, 톡(Talk)!</h1>
        <p className="text-slate-500 mt-2">마음속 이야기를 편하게 털어놓으세요.</p>
      </div>
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-lg font-medium text-slate-700 mb-2">이름</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="이름을 입력하세요"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="worry" className="block text-lg font-medium text-slate-700 mb-2">어떤 고민이 있어?</label>
          <textarea
            id="worry"
            value={worry}
            onChange={(e) => setWorry(e.target.value)}
            rows={5}
            className="w-full px-4 py-3 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="고민 내용을 여기에 입력해주세요."
            disabled={isLoading}
          />
        </div>
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
      <div className="pt-4 space-y-4">
        <p className="text-center text-slate-600 font-medium">누구와 이야기하고 싶으세요?</p>
        <div className="flex flex-col md:flex-row gap-4">
            <CounselorButton type={CounselorType.HomeroomTeacher} icon={<Users className="w-8 h-8 text-blue-500"/>} />
            <CounselorButton type={CounselorType.SchoolCounselor} icon={<UserCheck className="w-8 h-8 text-green-500"/>} />
            <CounselorButton type={CounselorType.Chatbot} icon={<MessageSquareQuote className="w-8 h-8 text-purple-500"/>} />
        </div>
      </div>
    </div>
  );
};

export default StudentForm;

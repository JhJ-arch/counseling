import React, { useState } from 'react';
import { CounselingRequest } from '../types';
import { BookUser, ChevronDown, ChevronUp, Clock, User, Link as LinkIcon } from 'lucide-react';

const RequestCard: React.FC<{ request: CounselingRequest }> = ({ request }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-white rounded-xl shadow-md transition-shadow hover:shadow-lg overflow-hidden">
            <button onClick={() => setIsExpanded(!isExpanded)} className="w-full text-left p-6">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-full">
                                <User className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">{request.studentName}</h3>
                                <p className="text-sm text-slate-500">To: {request.counselorType}</p>
                            </div>
                        </div>
                        <p className="text-slate-600 mt-4 line-clamp-2">
                           <strong className="font-semibold">최초 고민:</strong> {request.initialWorry}
                        </p>
                    </div>
                    <div className="flex flex-col items-end ml-4">
                        <span className="text-sm text-slate-400 flex items-center gap-1.5"><Clock className="w-4 h-4" />{request.date}</span>
                        {isExpanded ? <ChevronUp className="w-6 h-6 mt-4 text-slate-500"/> : <ChevronDown className="w-6 h-6 mt-4 text-slate-500" />}
                    </div>
                </div>
            </button>
            {isExpanded && (
                 <div className="px-6 pb-6 pt-2 bg-slate-50/50 animate-fade-in">
                    <h4 className="font-semibold text-slate-700 mb-2">상담 요약</h4>
                    <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap p-4 bg-white border border-slate-200 rounded-lg">
                        {request.summary ? request.summary : "요약 내용이 없습니다."}
                    </div>
                </div>
            )}
        </div>
    );
};


const TeacherDashboard: React.FC<{ requests: CounselingRequest[], className: string }> = ({ requests, className }) => {
    const studentLink = `${window.location.origin}${window.location.pathname}?class=${encodeURIComponent(className)}`;

    const copyLink = () => {
        navigator.clipboard.writeText(studentLink)
            .then(() => alert('학생용 접속 링크가 복사되었습니다.'))
            .catch(err => console.error('Failed to copy link: ', err));
    };

    return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 animate-fade-in">
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800">{className} 학생 상담 목록</h1>
            <p className="text-slate-500 mt-2">학생들의 고민을 확인하고 지원해주세요.</p>
             <div className="mt-4 bg-slate-100 p-3 rounded-lg flex items-center justify-between max-w-lg mx-auto shadow-sm">
                <LinkIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
                <input type="text" readOnly value={studentLink} className="bg-transparent text-sm text-slate-700 w-full mx-3 focus:outline-none" aria-label="Student share link"/>
                <button onClick={copyLink} className="bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-md hover:bg-blue-600 transition-colors">복사</button>
            </div>
        </div>
        <div className="space-y-6">
            {requests.length > 0 ? (
                requests.map((req) => <RequestCard key={req.id} request={req} />)
            ) : (
                <div className="text-center py-16 px-6 bg-white rounded-2xl shadow-lg">
                    <BookUser className="w-16 h-16 mx-auto text-slate-400"/>
                    <h3 className="mt-4 text-xl font-semibold text-slate-700">접수된 상담이 없습니다.</h3>
                    <p className="mt-1 text-slate-500">학생이 공유된 링크로 접속하여 상담을 요청하면 여기에 표시됩니다.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default TeacherDashboard;

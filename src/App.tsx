import React, { useState, useCallback, useEffect } from 'react';
import { View, StudentFlow, CounselorType, CounselingRequest, ChatMessage } from './types';
import StudentForm from './components/StudentForm';
import ChatView from './components/ChatView';
import TeacherDashboard from './components/TeacherDashboard';
import { summarizeConversationForTeacher } from './services/geminiService';
import LoadingSpinner from './components/LoadingSpinner';
import { Users, User } from 'lucide-react';
import TeacherSetup from './components/TeacherSetup';

const CLASS_KEY = 'counselingApp_activeClass';
const REQUESTS_KEY = 'counselingApp_requests';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isStudentOnly, setIsStudentOnly] = useState(false);
  const [view, setView] = useState<View>(View.Teacher);
  const [activeClass, setActiveClass] = useState<string | null>(null);

  const [studentFlow, setStudentFlow] = useState<StudentFlow>(StudentFlow.Form);
  const [isLoading, setIsLoading] = useState(false);

  const [sessionData, setSessionData] = useState<{ name: string; worry: string; counselor: CounselorType } | null>(null);
  const [counselingRequests, setCounselingRequests] = useState<CounselingRequest[]>([]);

  useEffect(() => {
    // 1. Check URL first for student links.
    const params = new URLSearchParams(window.location.search);
    const classFromUrl = params.get('class');

    // 2. Load all requests from localStorage.
    const savedRequestsJSON = localStorage.getItem(REQUESTS_KEY);
    if (savedRequestsJSON) {
        setCounselingRequests(JSON.parse(savedRequestsJSON));
    }

    if (classFromUrl) {
        // This is a student session.
        const decodedClass = decodeURIComponent(classFromUrl);
        setIsStudentOnly(true);
        setView(View.Student);
        setActiveClass(decodedClass);
    } else {
        // This is a teacher session. Load their last active class.
        const savedClass = localStorage.getItem(CLASS_KEY);
        if (savedClass) {
            setActiveClass(savedClass);
        }
        setView(View.Teacher);
    }
    
    setIsInitialized(true);
  }, []);
  
  // Effect for real-time updates across tabs/windows
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === REQUESTS_KEY && event.newValue) {
            setCounselingRequests(JSON.parse(event.newValue));
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);


  // Save requests to localStorage whenever they change.
  useEffect(() => {
      if (isInitialized) {
        localStorage.setItem(REQUESTS_KEY, JSON.stringify(counselingRequests));
      }
  }, [counselingRequests, isInitialized]);
  
  // Save active class to localStorage for the teacher.
  useEffect(() => {
    if (isInitialized && !isStudentOnly && activeClass) {
        localStorage.setItem(CLASS_KEY, activeClass);
    }
  }, [activeClass, isInitialized, isStudentOnly]);


  const handleSetClass = (name: string) => {
    setActiveClass(name);
  };

  const handleStartCounseling = (name: string, worry: string, counselor: CounselorType) => {
    setSessionData({ name, worry, counselor });
    setStudentFlow(StudentFlow.Chat);
  };
  
  const handleFinishChat = useCallback(async (chatHistory: ChatMessage[]) => {
    if (!sessionData || !activeClass) return;
    
    setIsLoading(true);
    
    const summary = await summarizeConversationForTeacher(
        sessionData.name,
        sessionData.worry,
        chatHistory
    );

    const newRequest: CounselingRequest = {
        id: new Date().toISOString(),
        studentName: sessionData.name,
        initialWorry: sessionData.worry,
        counselorType: sessionData.counselor,
        summary: summary,
        date: new Date().toLocaleDateString('ko-KR'),
        className: activeClass,
    };
    
    setCounselingRequests(prev => [newRequest, ...prev]);
    
    setStudentFlow(StudentFlow.Confirmation);
    setIsLoading(false);

    setTimeout(() => {
      setStudentFlow(StudentFlow.Form);
      setSessionData(null);
    }, 4000);
  }, [sessionData, activeClass]);

  const renderStudentView = () => {
    switch (studentFlow) {
      case StudentFlow.Form:
        return <StudentForm onStartCounseling={handleStartCounseling} isLoading={isLoading} />;
      case StudentFlow.Chat:
        if (!sessionData) return <StudentForm onStartCounseling={handleStartCounseling} isLoading={isLoading} />;
        return (
          <ChatView
            studentName={sessionData.name}
            initialWorry={sessionData.worry}
            counselorType={sessionData.counselor}
            onFinish={(chatMessages) => {
              const filteredMessages = chatMessages.filter(m => m.content.trim() !== "");
              handleFinishChat(filteredMessages);
            }}
            isFinishing={isLoading}
          />
        );
       case StudentFlow.Confirmation:
        return (
            <div className="text-center p-8 bg-white rounded-2xl shadow-xl animate-fade-in">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">
                    고민을 이야기해줘서 고마워요!
                </h2>
                <p className="text-slate-600">
                    선생님께 잘 전달되었어요.
                    상담이 필요하면 언제든 찾아주세요 ^_^
                </p>
                <p className="text-slate-500 mt-6">잠시 후 처음 화면으로 돌아갑니다...</p>
            </div>
        );
      default:
        return <StudentForm onStartCounseling={handleStartCounseling} isLoading={isLoading} />;
    }
  };

  const renderTeacherView = () => {
    if (!activeClass) {
        return <TeacherSetup onClassSet={handleSetClass} />;
    }
    return <TeacherDashboard requests={counselingRequests.filter(r => r.className === activeClass)} className={activeClass} />;
  };
  
  if (!isInitialized) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <LoadingSpinner className="w-12 h-12 text-blue-500" />
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      <header className="p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-blue-600">괜찮아, 톡(Talk)!</h1>
            {!isStudentOnly && activeClass && (
              <div className="flex items-center gap-2 p-1 bg-white rounded-full shadow-sm border border-slate-200">
                   <button onClick={() => setView(View.Student)} className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${view === View.Student ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-blue-100'}`}>
                      <User className="w-4 h-4"/> 학생
                   </button>
                   <button onClick={() => setView(View.Teacher)} className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center gap-2 transition-colors ${view === View.Teacher ? 'bg-blue-500 text-white' : 'text-slate-600 hover:bg-blue-100'}`}>
                      <Users className="w-4 h-4"/> 교사
                   </button>
              </div>
            )}
        </div>
      </header>
      <main className="p-4 md:p-6 flex items-center justify-center" style={{minHeight: 'calc(100vh - 80px)'}}>
        {isLoading && studentFlow !== StudentFlow.Chat && (
          <div className="flex flex-col items-center gap-4">
            <LoadingSpinner className="w-12 h-12 text-blue-500"/>
            <p className="text-slate-600">처리 중입니다...</p>
          </div>
        )}
        {!isLoading && isInitialized && (
            <>
                {view === View.Student && renderStudentView()}
                {view === View.Teacher && renderTeacherView()}
            </>
        )}
      </main>
    </div>
  );
};

export default App;

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface CounselingRequest {
  id: string;
  studentName: string;
  initialWorry: string;
  counselorType: CounselorType;
  summary: string;
  date: string;
  className: string;
}

export enum View {
  Student,
  Teacher
}

export enum StudentFlow {
    Form,
    Chat,
    Confirmation
}

export enum CounselorType {
  HomeroomTeacher = '담임 선생님',
  SchoolCounselor = '상담 선생님',
  Chatbot = '여기에서만 이야기할래요',
}

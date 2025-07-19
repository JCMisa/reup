declare interface UserType {
  id: number;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  credits: number;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

declare interface ResumeType {
  id: string;
  companyName?: string;
  jobTitle?: string;
  imageUrl: string;
  resumePath: string;
  feedback: Feedback;
}

interface FeedbackType {
  overallScore: number;
  ATS: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
    }[];
  };
  toneAndStyle: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  content: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  structure: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
  skills: {
    score: number;
    tips: {
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }[];
  };
}

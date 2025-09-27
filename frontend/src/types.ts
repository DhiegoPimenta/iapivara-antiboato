export interface ApiResponse {
  engine: string;
  overall: 'red' | 'yellow' | 'green';
  confidence: number;
  reason: string;
  claim: string;
  sources: string[];
  evidence: Array<{
    source: string;
    title: string;
    url: string;
    score?: number;
  }>;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  apiResponse?: ApiResponse;
}

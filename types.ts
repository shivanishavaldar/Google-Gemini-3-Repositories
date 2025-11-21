export interface BioRxivPaper {
  doi: string;
  title: string;
  authors: string;
  author_corresponding: string;
  author_corresponding_institution: string;
  date: string; // YYYY-MM-DD
  date_published: string; // YYYY-MM-DD
  abstract: string;
  category: string;
  version: string;
  type: string;
  license: string;
  server: string;
}

export interface BioRxivResponse {
  messages: Array<{
    status: string;
    interval: string;
    cursor: number | string; // API returns string or number depending on context
    count: number;
    total: number;
  }>;
  collection: BioRxivPaper[];
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  papers: BioRxivPaper[];
}

// Helper type for the Gemini response if we structure it later, 
// currently we just use string for simple summary.
export interface SummaryState {
  [doi: string]: {
    loading: boolean;
    text?: string;
    error?: string;
  };
}
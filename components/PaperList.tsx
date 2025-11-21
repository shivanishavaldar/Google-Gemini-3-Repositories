import React, { useState } from 'react';
import { BioRxivPaper, SummaryState } from '../types';
import { summarizeAbstract } from '../services/geminiService';
import { SparklesIcon, ExternalLinkIcon, XIcon, LoaderIcon } from './Icons';

interface PaperListProps {
  date: Date;
  papers: BioRxivPaper[];
  onClose: () => void;
}

export const PaperList: React.FC<PaperListProps> = ({ date, papers, onClose }) => {
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [summaries, setSummaries] = useState<SummaryState>({});

  const handleSummarize = async (doi: string, abstract: string) => {
    if (summaries[doi]?.text) return; // Already summarized

    setSummaries(prev => ({ ...prev, [doi]: { loading: true } }));
    try {
      const text = await summarizeAbstract(abstract);
      setSummaries(prev => ({ ...prev, [doi]: { loading: false, text } }));
    } catch (err) {
      setSummaries(prev => ({ ...prev, [doi]: { loading: false, error: "Failed to summarize." } }));
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 shadow-xl w-full md:w-[500px] fixed right-0 top-0 z-50 overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h2>
          <p className="text-sm text-slate-500">{papers.length} Papers Published</p>
        </div>
        <button 
          onClick={onClose} 
          className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100/50">
        {papers.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p>No papers found for this date.</p>
          </div>
        ) : (
          papers.map((paper) => {
            const isExpanded = expandedPaper === paper.doi;
            const summary = summaries[paper.doi];

            return (
              <div 
                key={paper.doi} 
                className={`bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 ${isExpanded ? 'ring-2 ring-brand-500' : 'hover:border-brand-300'}`}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedPaper(isExpanded ? null : paper.doi)}
                >
                  <span className="inline-block px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 text-xs font-medium mb-2">
                    {paper.category}
                  </span>
                  <h3 className="font-semibold text-slate-800 leading-tight mb-2">
                    {paper.title}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">
                    {paper.authors}
                  </p>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="pt-3 space-y-3">
                      <div className="flex gap-2 flex-wrap">
                        <a 
                          href={`https://doi.org/${paper.doi}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-xs font-medium text-brand-600 hover:underline"
                        >
                          View on BioRxiv <ExternalLinkIcon className="w-3 h-3 ml-1" />
                        </a>
                        <span className="text-xs text-slate-400">Version: {paper.version}</span>
                      </div>

                      <div className="text-sm text-slate-700 leading-relaxed text-justify max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {paper.abstract}
                      </div>
                      
                      {/* AI Summary Section */}
                      <div className="mt-4 p-3 bg-brand-50 rounded-lg border border-brand-100">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-brand-800 uppercase tracking-wider flex items-center gap-1">
                            <SparklesIcon className="w-3 h-3" /> Gemini Summary
                          </h4>
                          {!summary?.text && !summary?.loading && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSummarize(paper.doi, paper.abstract);
                              }}
                              className="text-xs bg-white border border-brand-200 text-brand-600 px-2 py-1 rounded shadow-sm hover:bg-brand-500 hover:text-white transition-colors"
                            >
                              Generate
                            </button>
                          )}
                        </div>
                        
                        {summary?.loading && (
                          <div className="flex items-center gap-2 text-xs text-brand-600">
                             <LoaderIcon className="w-4 h-4 animate-spin" />
                             Thinking...
                          </div>
                        )}
                        
                        {summary?.text && (
                          <div className="text-sm text-brand-900 prose prose-sm prose-red">
                             <ul className="list-disc pl-4 space-y-1">
                                {summary.text.split('\n').map((line, idx) => {
                                    const cleanLine = line.replace(/^[-*•]\s*/, '').trim();
                                    if (!cleanLine) return null;
                                    return <li key={idx}>{cleanLine}</li>;
                                })}
                             </ul>
                          </div>
                        )}
                        
                        {summary?.error && (
                          <p className="text-xs text-red-500">{summary.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
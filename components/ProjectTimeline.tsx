import React, { useMemo } from 'react';
import { ProjectFeature } from '../types';
import { COLORS } from '../constants';
import { Calendar, CheckCircle, Clock, AlertCircle, ChevronRight, FileText, CheckSquare } from 'lucide-react';

interface ProjectTimelineProps {
  data: ProjectFeature[];
  selectedId: string | null;
  onSelectProject: (id: string) => void;
}

interface TimelineEvent {
  id: string;
  category: string;
  title: string;
  date: Date | null;
  originalText: string;
  statusType: 'approved' | 'submitted' | 'pending' | 'rejected' | 'draft' | 'not-applicable';
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ data, selectedId, onSelectProject }) => {
  const selectedProject = useMemo(
    () => data.find(p => p.id === selectedId) || data[0],
    [data, selectedId]
  );

  const events = useMemo(() => {
    if (!selectedProject) return [];

    const categories = [
      { key: 's3rStatus', title: 'S3R Submission', type: selectedProject.s3rCategory },
      { key: 'stlaXpStatus', title: 'STLA / XP Application', type: selectedProject.stlaCategory },
      { key: 'accessPermission', title: 'Access Permission', type: selectedProject.accessCategory },
      { key: 'engineeringPlan', title: 'Circulation of Eng. Plan to MR', type: selectedProject.engineeringPlanCategory },
      { key: 'tprpTwvp', title: 'TPRP (TWVP)', type: selectedProject.tprpTwvpCategory },
      { key: 'tprpMr', title: 'TPRP (MR)', type: selectedProject.tprpMrCategory },
      { key: 'hsspStatus', title: 'HSSP', type: selectedProject.hsspCategory },
    ];

    const parsedEvents: TimelineEvent[] = [];
    const dateRegex = /(\d{1,2}[\s-]*)?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*([\s-]*\d{1,2})?[\s,]+(\d{4})/i;

    categories.forEach(cat => {
      const text = (selectedProject as any)[cat.key] as string;
      if (!text || text === 'N/A') return;

      const match = text.match(dateRegex);
      let date: Date | null = null;
      if (match) {
        date = new Date(match[0]);
      }

      parsedEvents.push({
        id: cat.key,
        category: cat.key,
        title: cat.title,
        date: date,
        originalText: text,
        statusType: cat.type as any,
      });
    });

    return parsedEvents.sort((a, b) => {
      if (a.date && b.date) return a.date.getTime() - b.date.getTime();
      if (a.date) return -1;
      if (b.date) return 1;
      return 0;
    });
  }, [selectedProject]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'Date Pending';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'rejected': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'submitted': return <FileText className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (type: string) => {
    return COLORS[type] || '#9ca3af';
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">Feature Timeline</h2>
          <p className="text-sm text-gray-500">Milestones & Key Events</p>
        </div>

        <div className="relative min-w-[300px]">
          <select
            className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl appearance-none bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            value={selectedProject?.id || ''}
            onChange={(e) => onSelectProject(e.target.value)}
          >
            {data.map(p => (
              <option key={p.id} value={p.id}>
                {p.accepted ? '\u2713 ' : ''}{p.featureNo} - {p.location.substring(0, 40)}...
              </option>
            ))}
          </select>
          <ChevronRight className="absolute right-3 top-3 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-auto p-6 md:p-8 custom-scrollbar">
        {selectedProject ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-blue-900 text-base">{selectedProject.featureNo}</h3>
                  <p className="text-sm text-blue-700 mt-0.5">{selectedProject.location}</p>
                </div>
                {selectedProject.accepted && (
                  <div className="flex items-center gap-1.5 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-700">Accepted</span>
                    {selectedProject.acceptedDate && (
                      <span className="text-[10px] text-emerald-600">{selectedProject.acceptedDate}</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-200 to-transparent transform -translate-x-1/2"></div>

              <div className="space-y-12">
                {events.map((event, index) => {
                  const isLeft = index % 2 === 0;
                  const color = getStatusColor(event.statusType);

                  return (
                    <div key={index} className={`relative flex items-center ${isLeft ? 'md:flex-row-reverse' : ''}`}>
                      <div className="hidden md:block w-1/2 px-8 text-right">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${isLeft ? 'flex-row-reverse' : ''}`}
                          style={{ backgroundColor: `${color}15`, color: color }}
                        >
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.date)}
                        </div>
                      </div>

                      <div className="absolute left-8 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-10 h-10 rounded-xl bg-white border-2 shadow-sm z-10"
                        style={{ borderColor: `${color}40` }}>
                        {getStatusIcon(event.statusType)}
                      </div>

                      <div className="ml-16 md:ml-0 w-full md:w-1/2 px-4 md:px-8">
                        <div className="md:hidden mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.date)}
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative">
                          <div
                            className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l border-b border-gray-100 transform rotate-45 ${
                              isLeft ? 'right-[-7px] border-r-0 border-t-0' : 'left-[-7px] border-l border-b'
                            }`}
                          ></div>

                          <h4 className="font-bold text-gray-900 text-sm mb-1">{event.title}</h4>
                          <p className="text-gray-600 text-sm leading-relaxed">{event.originalText}</p>
                          {!event.date && (
                            <span className="inline-block mt-3 text-[10px] uppercase tracking-wider text-gray-400 font-semibold bg-gray-50 px-2 py-0.5 rounded-md">
                              Date Pending
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {events.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm font-medium">No timeline events found for this feature.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">Select a feature to view timeline</div>
        )}
      </div>
    </div>
  );
};

export default ProjectTimeline;

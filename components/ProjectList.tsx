import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ProjectFeature, StatusCategory } from '../types';
import StatusBadge from './StatusBadge';
import { Search, Filter, Download, MapPin, Edit2, X, Check } from 'lucide-react';

interface ProjectListProps {
  data: ProjectFeature[];
  selectedId: string | null;
  onSelectFeature: (id: string) => void;
  onUpdateFeature: (feature: ProjectFeature) => void;
  fullTable?: boolean;
}

const STATUS_OPTIONS: StatusCategory[] = ['approved', 'submitted', 'pending', 'rejected', 'draft', 'not-applicable'];

const ProjectList: React.FC<ProjectListProps> = ({ data, selectedId, onSelectFeature, onUpdateFeature, fullTable }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ProjectFeature | null>(null);
  const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

  const filteredData = data.filter(item => {
    const matchesSearch =
      item.featureNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || item.s3rCategory === filterStatus;
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (selectedId && rowRefs.current[selectedId] && !editingId) {
      rowRefs.current[selectedId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedId, editingId]);

  const handleEditClick = (e: React.MouseEvent, feature: ProjectFeature) => {
    e.stopPropagation();
    setEditingId(feature.id);
    setEditForm({ ...feature });
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (editForm) {
      onUpdateFeature(editForm);
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
    setEditForm(null);
  };

  const handleInputChange = (field: keyof ProjectFeature, value: string) => {
    if (editForm) {
      setEditForm({ ...editForm, [field]: value });
    }
  };

  const exportCSV = useCallback(() => {
    const headers = [
      'No.', 'Feature No.', 'Location', 'S3R Status', 'S3R Category',
      'STLA/XP', 'STLA Category', 'Access Permission', 'Access Category',
      'Engineering Plan', 'Eng Plan Category',
      'TPRP TWVP', 'TPRP TWVP Category', 'TPRP MR', 'TPRP MR Category',
      'HSSP', 'HSSP Category',
    ];
    const rows = filteredData.map(d => [
      d.no, d.featureNo, `"${d.location}"`, `"${d.s3rStatus}"`, d.s3rCategory,
      `"${d.stlaXpStatus}"`, d.stlaCategory, `"${d.accessPermission}"`, d.accessCategory,
      `"${d.engineeringPlan}"`, d.engineeringPlanCategory,
      `"${d.tprpTwvp}"`, d.tprpTwvpCategory, `"${d.tprpMr}"`, d.tprpMrCategory,
      `"${d.hsspStatus}"`, d.hsspCategory,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'LPMit_TOMS_Draft_Task_Orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, [filteredData]);

  const StatusCell: React.FC<{ category: StatusCategory; text: string }> = ({ category, text }) => (
    <div className="flex flex-col items-start gap-0.5">
      <StatusBadge status={category} />
      <span className="text-[11px] text-gray-500 leading-tight mt-0.5">{text}</span>
    </div>
  );

  const EditStatusCell: React.FC<{
    categoryField: keyof ProjectFeature;
    textField: keyof ProjectFeature;
  }> = ({ categoryField, textField }) => (
    <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
      <select
        className="w-full text-[10px] border border-gray-300 rounded px-1 py-0.5 focus:ring-emerald-500 focus:border-emerald-500"
        value={(editForm as any)?.[categoryField] || 'draft'}
        onChange={(e) => handleInputChange(categoryField, e.target.value)}
      >
        {STATUS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <input
        type="text"
        className="w-full text-[10px] border border-gray-300 rounded px-1 py-0.5"
        value={(editForm as any)?.[textField] || ''}
        onChange={(e) => handleInputChange(textField, e.target.value)}
      />
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col ${fullTable ? 'h-full' : 'h-full'}`}>
      {/* Header Controls */}
      <div className="p-3 border-b border-gray-100 flex flex-col sm:flex-row gap-3 justify-between items-center bg-white rounded-t-xl no-print">
        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition duration-150"
            placeholder="Search Feature No. or Location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
              <Filter className="h-3.5 w-3.5 text-gray-500" />
            </div>
            <select
              className="pl-8 pr-6 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All S3R Status</option>
              <option value="approved">Approved</option>
              <option value="submitted">Submitted</option>
              <option value="pending">Pending</option>
              <option value="rejected">Action Required</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto flex-1 custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-16 no-print">
                {/* Actions */}
              </th>
              <th className="px-2 py-2.5 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-10">No.</th>
              <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-28">Feature No.</th>
              <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider min-w-[200px]">Location</th>
              <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-48">S3R</th>
              <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-48">STLA / XP</th>
              <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-40">Access Permission</th>
              <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-36">Eng. Plan to MR</th>
              <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-36">
                <div>TPRP</div>
                <div className="font-normal text-gray-400 normal-case">(TWVP)</div>
              </th>
              <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-32">
                <div>TPRP</div>
                <div className="font-normal text-gray-400 normal-case">(MR)</div>
              </th>
              <th className="px-2 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider w-32">HSSP</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredData.map((row) => {
              const isEditing = editingId === row.id;

              return (
                <tr
                  key={row.id}
                  ref={(el) => { rowRefs.current[row.id] = el; }}
                  onClick={() => !isEditing && onSelectFeature(row.id)}
                  className={`transition-colors ${
                    isEditing ? 'bg-amber-50' :
                    selectedId === row.id ? 'bg-emerald-50 ring-1 ring-inset ring-emerald-200 cursor-pointer' : 'hover:bg-gray-50/70 cursor-pointer'
                  }`}
                >
                  {/* Actions */}
                  <td className="px-2 py-2 whitespace-nowrap no-print">
                    {isEditing ? (
                      <div className="flex gap-1">
                        <button onClick={handleSaveClick} className="p-1 rounded bg-emerald-100 text-emerald-600 hover:bg-emerald-200" title="Save">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleCancelClick} className="p-1 rounded bg-red-100 text-red-600 hover:bg-red-200" title="Cancel">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        {selectedId === row.id && <MapPin className="w-3.5 h-3.5 text-emerald-600" />}
                        <button
                          onClick={(e) => handleEditClick(e, row)}
                          className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors opacity-0 row-hover-btn"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* No. */}
                  <td className="px-2 py-2 text-center whitespace-nowrap text-xs text-gray-500 font-semibold">
                    {row.no}
                  </td>

                  {/* Feature No. */}
                  <td className="px-2 py-2 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        className="w-full text-xs border border-gray-300 rounded px-1 py-0.5 focus:ring-emerald-500 focus:border-emerald-500"
                        value={editForm?.featureNo || ''}
                        onChange={(e) => handleInputChange('featureNo', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-xs font-bold text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                        {row.featureNo}
                      </span>
                    )}
                  </td>

                  {/* Location */}
                  <td className="px-3 py-2 text-xs text-gray-700">
                    {isEditing ? (
                      <textarea
                        className="w-full text-xs border border-gray-300 rounded px-1 py-0.5"
                        rows={2}
                        value={editForm?.location || ''}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="line-clamp-2 leading-tight" title={row.location}>
                        {row.location}
                      </div>
                    )}
                  </td>

                  {/* S3R */}
                  <td className="px-2 py-2">
                    {isEditing ? (
                      <EditStatusCell categoryField="s3rCategory" textField="s3rStatus" />
                    ) : (
                      <StatusCell category={row.s3rCategory} text={row.s3rStatus} />
                    )}
                  </td>

                  {/* STLA/XP */}
                  <td className="px-2 py-2">
                    {isEditing ? (
                      <EditStatusCell categoryField="stlaCategory" textField="stlaXpStatus" />
                    ) : (
                      <StatusCell category={row.stlaCategory} text={row.stlaXpStatus} />
                    )}
                  </td>

                  {/* Access */}
                  <td className="px-2 py-2">
                    {isEditing ? (
                      <EditStatusCell categoryField="accessCategory" textField="accessPermission" />
                    ) : (
                      <StatusCell category={row.accessCategory} text={row.accessPermission} />
                    )}
                  </td>

                  {/* Eng Plan */}
                  <td className="px-2 py-2">
                    {isEditing ? (
                      <EditStatusCell categoryField="engineeringPlanCategory" textField="engineeringPlan" />
                    ) : (
                      <StatusCell category={row.engineeringPlanCategory} text={row.engineeringPlan} />
                    )}
                  </td>

                  {/* TPRP TWVP */}
                  <td className="px-2 py-2">
                    {isEditing ? (
                      <EditStatusCell categoryField="tprpTwvpCategory" textField="tprpTwvp" />
                    ) : (
                      <StatusCell category={row.tprpTwvpCategory} text={row.tprpTwvp} />
                    )}
                  </td>

                  {/* TPRP MR */}
                  <td className="px-2 py-2">
                    {isEditing ? (
                      <EditStatusCell categoryField="tprpMrCategory" textField="tprpMr" />
                    ) : (
                      <StatusCell category={row.tprpMrCategory} text={row.tprpMr} />
                    )}
                  </td>

                  {/* HSSP */}
                  <td className="px-2 py-2">
                    {isEditing ? (
                      <EditStatusCell categoryField="hsspCategory" textField="hsspStatus" />
                    ) : (
                      <StatusCell category={row.hsspCategory} text={row.hsspStatus} />
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredData.length === 0 && (
              <tr>
                <td colSpan={11} className="px-6 py-12 text-center text-gray-500">
                  No features found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-between items-center text-xs text-gray-500 no-print">
        <span>Showing {filteredData.length} of {data.length} features</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px]">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>Approved
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500 ml-2"></span>Submitted
            <span className="inline-block w-2 h-2 rounded-full bg-amber-500 ml-2"></span>Pending
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 ml-2"></span>Action Req
            <span className="inline-block w-2 h-2 rounded-full bg-stone-400 ml-2"></span>Draft
            <span className="inline-block w-2 h-2 rounded-full bg-gray-300 ml-2"></span>N/A
          </div>
        </div>
      </div>

      <style>{`
        tr:hover .row-hover-btn {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ProjectList;

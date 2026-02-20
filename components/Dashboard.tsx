import React, { useMemo } from 'react';
import { ProjectFeature } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts';
import { COLORS } from '../constants';
import { CheckCircle, Clock, AlertTriangle, FileText, Shield, TreePine } from 'lucide-react';

interface DashboardProps {
  data: ProjectFeature[];
  onFeatureSelect: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onFeatureSelect }) => {
  const total = data.length;

  const s3rStats = useMemo(() => {
    const counts: Record<string, number> = {};
    data.forEach(item => {
      counts[item.s3rCategory] = (counts[item.s3rCategory] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' '),
      value: counts[key],
      color: COLORS[key] || '#ccc',
    }));
  }, [data]);

  const approvalStats = useMemo(() => {
    const stats = [
      { name: 'S3R', approved: 0, submitted: 0, pending: 0, na: 0 },
      { name: 'STLA/XP', approved: 0, submitted: 0, pending: 0, na: 0 },
      { name: 'Access', approved: 0, submitted: 0, pending: 0, na: 0 },
      { name: 'Eng Plan', approved: 0, submitted: 0, pending: 0, na: 0 },
      { name: 'TPRP', approved: 0, submitted: 0, pending: 0, na: 0 },
      { name: 'HSSP', approved: 0, submitted: 0, pending: 0, na: 0 },
    ];

    data.forEach(item => {
      const cats = [
        item.s3rCategory,
        item.stlaCategory,
        item.accessCategory,
        item.engineeringPlanCategory,
        item.tprpTwvpCategory,
        item.hsspCategory,
      ];
      cats.forEach((cat, i) => {
        if (cat === 'approved') stats[i].approved++;
        else if (cat === 'submitted') stats[i].submitted++;
        else if (cat === 'not-applicable') stats[i].na++;
        else stats[i].pending++;
      });
    });

    return stats;
  }, [data]);

  const countByCategory = (field: keyof ProjectFeature, value: string) =>
    data.filter(d => (d as any)[field] === value).length;

  const s3rApproved = countByCategory('s3rCategory', 'approved');
  const stlaApproved = countByCategory('stlaCategory', 'approved');
  const accessObtained = data.filter(d => d.accessCategory === 'approved' || d.accessCategory === 'not-applicable').length;
  const actionItems = data.filter(d =>
    d.s3rCategory === 'rejected' ||
    d.accessCategory === 'pending' && d.accessPermission.toLowerCase().includes('seeking')
  ).length;

  const progressItems = useMemo(() => {
    const items = [
      { label: 'S3R Accepted/Approved', approved: countByCategory('s3rCategory', 'approved'), color: COLORS.approved },
      { label: 'STLA/XP Approved', approved: countByCategory('stlaCategory', 'approved'), color: '#3b82f6' },
      { label: 'Access Obtained', approved: data.filter(d => d.accessCategory === 'approved').length, color: '#8b5cf6' },
      { label: 'Eng Plan Cleared', approved: data.filter(d => d.engineeringPlanCategory === 'approved').length, color: '#06b6d4' },
      { label: 'TPRP TWVP Approved', approved: data.filter(d => d.tprpTwvpCategory === 'approved').length, color: '#f59e0b' },
      { label: 'HSSP Endorsed', approved: data.filter(d => d.hsspCategory === 'approved').length, color: '#ec4899' },
    ];
    return items;
  }, [data]);

  const attentionItems = useMemo(() =>
    data.filter(d =>
      d.s3rCategory === 'rejected' ||
      (d.accessCategory === 'pending' && d.accessPermission.toLowerCase().includes('seeking'))
    ).slice(0, 5),
  [data]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wide">Total Features</h3>
          </div>
          <p className="text-3xl font-bold text-gray-800">{total}</p>
          <p className="text-xs text-gray-400 mt-1">CE 47/2022 (GE)</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wide">S3R Approved</h3>
          </div>
          <p className="text-3xl font-bold text-emerald-600">{s3rApproved}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(s3rApproved / total) * 100}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 font-medium">{((s3rApproved / total) * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wide">STLA Approved</h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">{stlaApproved}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(stlaApproved / total) * 100}%` }}></div>
            </div>
            <span className="text-xs text-gray-500 font-medium">{((stlaApproved / total) * 100).toFixed(0)}%</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-gray-500 text-xs font-medium uppercase tracking-wide">Action Items</h3>
          </div>
          <p className="text-3xl font-bold text-amber-600">{actionItems}</p>
          <p className="text-xs text-amber-600 mt-1 font-medium">Requires follow-up</p>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-800 text-base font-semibold mb-5">Overall Approval Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
          {progressItems.map((item) => {
            const naCount = data.filter(d => {
              if (item.label.includes('S3R')) return d.s3rCategory === 'not-applicable';
              if (item.label.includes('STLA')) return d.stlaCategory === 'not-applicable';
              if (item.label.includes('Access')) return d.accessCategory === 'not-applicable';
              if (item.label.includes('Eng Plan')) return d.engineeringPlanCategory === 'not-applicable';
              if (item.label.includes('TPRP')) return d.tprpTwvpCategory === 'not-applicable';
              if (item.label.includes('HSSP')) return d.hsspCategory === 'not-applicable';
              return false;
            }).length;
            const applicable = total - naCount;
            const pct = applicable > 0 ? (item.approved / applicable) * 100 : 0;

            return (
              <div key={item.label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  <span className="text-sm font-bold" style={{ color: item.color }}>
                    {item.approved}/{applicable}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* S3R Distribution Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-gray-800 text-base font-semibold mb-4">S3R Status Distribution</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie
                data={s3rStats}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {s3rStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Approvals Stacked Bar */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-80">
          <h3 className="text-gray-800 text-base font-semibold mb-4">Approvals & Permits Progress</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={approvalStats} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ fill: '#f3f4f6' }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="approved" stackId="a" fill={COLORS.approved} name="Approved" radius={[0, 0, 2, 2]} />
              <Bar dataKey="submitted" stackId="a" fill={COLORS.submitted} name="Submitted" />
              <Bar dataKey="pending" stackId="a" fill={COLORS.pending} name="Pending" />
              <Bar dataKey="na" stackId="a" fill={COLORS['not-applicable']} name="N/A" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attention Items */}
      {attentionItems.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-amber-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-gray-800 text-base font-semibold">Features Requiring Attention</h3>
          </div>
          <div className="space-y-3">
            {attentionItems.map(item => (
              <div
                key={item.id}
                onClick={() => onFeatureSelect(item.id)}
                className="flex items-start gap-4 p-3 rounded-lg border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 cursor-pointer transition-colors"
              >
                <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded flex-shrink-0">
                  {item.featureNo}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium truncate">{item.location}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {item.s3rCategory === 'rejected' && (
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">S3R: {item.s3rStatus}</span>
                    )}
                    {item.accessCategory === 'pending' && item.accessPermission.toLowerCase().includes('seeking') && (
                      <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Access: {item.accessPermission}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

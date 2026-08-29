import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, AlertCircle, FileText, Activity } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [screenings, setScreenings] = useState([]);

  useEffect(() => {
    async function loadData() {
      const [statsData, screeningsData] = await Promise.all([
        api.getDashboardStats(),
        api.getRecentScreenings()
      ]);
      setStats(statsData);
      setScreenings(screeningsData);
    }
    loadData();
  }, []);

  const getRiskBadge = (level) => {
    switch(level) {
      case 'Low': return <Badge variant="success">Low</Badge>;
      case 'Medium': return <Badge variant="warning">Medium</Badge>;
      case 'High': return <Badge variant="danger">High</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  return (
    <PageContainer title="Screening Overview">
      <div className="mb-8">
        <p className="text-slate-400">Monitor identity verification activity and potential fraud risks.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Screenings" value={stats?.total || '-'} icon={<FileText className="text-slate-400" />} />
        <StatCard title="Low Risk" value={stats?.low || '-'} icon={<ShieldCheck className="text-emerald-500" />} />
        <StatCard title="Requires Review" value={stats?.review || '-'} icon={<AlertTriangle className="text-amber-500" />} />
        <StatCard title="High Risk" value={stats?.high || '-'} icon={<AlertCircle className="text-red-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Table */}
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle>Recent Screenings</CardTitle>
              <Button variant="secondary" size="sm" onClick={() => navigate('/history')}>View All</Button>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-400 bg-slate-900/50 uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Case ID</th>
                    <th className="px-6 py-4 font-medium">Person</th>
                    <th className="px-6 py-4 font-medium">Document</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Risk</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {screenings.map((s) => (
                    <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-300">{s.id}</td>
                      <td className="px-6 py-4 text-white">{s.personName}</td>
                      <td className="px-6 py-4 text-slate-400">{s.documentType}</td>
                      <td className="px-6 py-4 text-slate-400">{s.date}</td>
                      <td className="px-6 py-4">{getRiskBadge(s.riskLevel)}</td>
                      <td className="px-6 py-4 text-slate-300">{s.status}</td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/screening/${s.id}`)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {screenings.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500">Loading screenings...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column - Activity & Quick Action */}
        <div className="space-y-8">
          <Button 
            className="w-full h-14 text-lg shadow-lg shadow-navy-900/20"
            onClick={() => navigate('/screening/new')}
          >
            + Start New Screening
          </Button>

          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Low Risk</span>
                  <span className="text-slate-400">86%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '86%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Medium Risk</span>
                  <span className="text-slate-400">10%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">High Risk</span>
                  <span className="text-slate-400">4%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: '4%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-slate-400" />
                System Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-800 before:to-transparent">
                <ActivityItem time="09:42" text="Screening completed" sub="SCR-2026-08124" dot="bg-emerald-500" />
                <ActivityItem time="09:38" text="Additional question answered" sub="SCR-2026-08123" dot="bg-blue-500" />
                <ActivityItem time="09:31" text="Document tampering signal detected" sub="SCR-2026-08123" dot="bg-amber-500" />
                <ActivityItem time="09:22" text="New screening initiated" sub="SCR-2026-08122" dot="bg-slate-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-white">{value}</h3>
          </div>
          <div className="p-2 bg-slate-800/50 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActivityItem({ time, text, sub, dot }) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-900 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10">
        <span className={`w-2 h-2 rounded-full ${dot}`}></span>
      </div>
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-slate-800 bg-slate-900 shadow">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-medium text-slate-300">{text}</div>
          <time className="text-xs font-medium text-slate-500">{time}</time>
        </div>
        <div className="text-xs text-slate-400">{sub}</div>
      </div>
    </div>
  );
}

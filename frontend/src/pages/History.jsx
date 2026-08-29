import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, ShieldCheck, AlertTriangle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

export default function History() {
  const navigate = useNavigate();
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState('ALL');

  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await api.getScreeningHistory();
        setScreenings(data);
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, []);

  const getRiskBadge = (level) => {
    switch(level) {
      case 'Low': return <Badge variant="success">Low Risk</Badge>;
      case 'Medium': return <Badge variant="warning">Medium Risk</Badge>;
      case 'High': return <Badge variant="danger">High Risk</Badge>;
      default: return <Badge>Unknown</Badge>;
    }
  };

  const filtered = screenings.filter(s => {
    const matchesSearch = s.personName.toLowerCase().includes(search.toLowerCase()) || 
                          s.id.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = filterRisk === 'ALL' || s.riskLevel.toUpperCase() === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <PageContainer title="Screening Audit History">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <p className="text-slate-400">All historical document screening cases saved permanently in MongoDB.</p>
        <Button onClick={() => navigate('/screening/new')}>
          + New Screening
        </Button>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search by case ID or applicant name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-navy-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select 
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-navy-500"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MEDIUM">Medium Risk</option>
                <option value="HIGH">High Risk</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 bg-slate-900/50 uppercase border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium">Case ID</th>
                <th className="px-6 py-4 font-medium">Person Name</th>
                <th className="px-6 py-4 font-medium">Document Type</th>
                <th className="px-6 py-4 font-medium">Screening Date</th>
                <th className="px-6 py-4 font-medium">Score</th>
                <th className="px-6 py-4 font-medium">Risk Assessment</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-medium text-slate-300">{s.id}</td>
                  <td className="px-6 py-4 text-white font-medium">{s.personName}</td>
                  <td className="px-6 py-4 text-slate-400">{s.documentType}</td>
                  <td className="px-6 py-4 text-slate-400">{s.date}</td>
                  <td className="px-6 py-4 font-mono text-white font-bold">{s.riskScore}/100</td>
                  <td className="px-6 py-4">{getRiskBadge(s.riskLevel)}</td>
                  <td className="px-6 py-4 text-slate-300">{s.status}</td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => navigate(`/screening/${s.id}`)}>
                      View Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && !loading && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    No matching screening records found in database.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-slate-500">
                    Loading records from MongoDB Atlas...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </PageContainer>
  );
}

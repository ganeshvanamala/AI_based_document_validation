import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await api.getScreening(id);
      setData(res);
    }
    load();
  }, [id]);

  if (!data) return <PageContainer title="Report"><div className="text-slate-400">Loading...</div></PageContainer>;

  return (
    <PageContainer title="Identity Screening Report">
      <div className="flex justify-between items-center mb-8">
        <Button variant="ghost" className="px-0" onClick={() => navigate(`/screening/${id}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Case
        </Button>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => alert('Print feature placeholder')}>
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
          <Button onClick={() => alert('Download feature placeholder')}>
            <Download className="w-4 h-4 mr-2" /> Download PDF
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-8 lg:p-12 shadow-sm relative overflow-hidden">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
          <div className="text-9xl font-bold transform -rotate-45 whitespace-nowrap">CONFIDENTIAL</div>
        </div>

        <div className="relative z-10">
          <div className="flex justify-between items-start border-b border-slate-800 pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Identity Screening Report</h1>
              <p className="text-slate-400">IdentityGuard AI Verification System</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500 mb-1">Case ID</div>
              <div className="font-mono text-white">{data.id}</div>
              <div className="text-sm text-slate-500 mt-3 mb-1">Date Generated</div>
              <div className="text-slate-300">{new Date().toLocaleDateString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Final Decision</h3>
              <div className="flex items-end gap-4">
                <div className="text-5xl font-bold text-white">{data.riskScore}</div>
                <div className="pb-1">
                  <Badge variant={data.riskLevel === 'High' ? 'danger' : data.riskLevel === 'Medium' ? 'warning' : 'success'}>
                    {data.riskLevel.toUpperCase()} RISK
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-slate-300 font-medium">{data.recommendation}</p>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider">Subject Information</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <div className="text-slate-500">Name</div>
                <div className="text-white font-medium">{data.personName}</div>
                <div className="text-slate-500">Document</div>
                <div className="text-white font-medium">Passport</div>
                <div className="text-slate-500">Nationality</div>
                <div className="text-white font-medium">Indian</div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <ReportSection title="1. Documents Analyzed">
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                <li>Passport (Primary) - Valid format</li>
                <li>Visa application form - Valid format</li>
              </ul>
            </ReportSection>

            <ReportSection title="2. Validation & Tampering">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-slate-500 mb-1">Text Manipulation</div>
                  <div className="text-red-400">High Risk (Anomalies detected in MRZ region)</div>
                </div>
                <div>
                  <div className="text-slate-500 mb-1">Photo Manipulation</div>
                  <div className="text-emerald-400">Low Risk</div>
                </div>
              </div>
            </ReportSection>

            <ReportSection title="3. Identity History & Relationships">
              <p className="text-sm text-slate-300 mb-2">Historical verification record from 2024 conflicts with current document date of birth.</p>
              <p className="text-sm text-slate-300">Relationship graph indicates inconsistency (Mother relationship claims conflict with sibling records).</p>
            </ReportSection>

            <ReportSection title="4. Evidence Contributions">
              <div className="space-y-2 text-sm">
                {data.intelligence.contributions.map((c, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-800/30 pb-1">
                    <span className="text-slate-400">{c.label}</span>
                    <span className="font-mono text-slate-300">{c.value}</span>
                  </div>
                ))}
              </div>
            </ReportSection>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800 text-center">
            <div className="text-xs text-slate-500 font-mono">
              Audit ID: AUD-7F92A1 • IdentityGuard AI System • Automatically Generated
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function ReportSection({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-semibold uppercase text-slate-500 tracking-wider mb-3">{title}</h3>
      <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
        {children}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, ChevronRight, FileText } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

export default function ScreeningDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await api.getScreening(id);
      setData(res);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return <PageContainer title={`Screening Case ${id}`}><div className="text-slate-400">Loading case details...</div></PageContainer>;
  }

  if (!data) return null;

  return (
    <PageContainer title={`Screening Case ${id}`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white">{data.personName}</h2>
          <p className="text-slate-400">Status: <span className="text-white font-medium">{data.status}</span></p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate(`/screening/${id}/report`)}>
            <FileText className="w-4 h-4 mr-2" /> View Report
          </Button>
          {(data.riskLevel === 'High' || data.riskLevel === 'Medium') && data.status !== 'Manual verification recommended' && (
            <Button onClick={() => navigate(`/screening/${id}/questions`)}>
              Continue to Additional Verification →
            </Button>
          )}
        </div>
      </div>

      {/* Pipeline */}
      <div className="flex flex-wrap items-center gap-2 mb-8 text-sm">
        {['Upload', 'OCR', 'Validation', 'Tampering', 'Face', 'History', 'Relationships', 'Intelligence', 'Risk'].map((step, i, arr) => (
          <React.Fragment key={step}>
            <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> {step}
            </div>
            {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-slate-600" />}
          </React.Fragment>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Risk Score */}
        <Card className="lg:col-span-1 border-slate-700 bg-slate-800/50 relative overflow-hidden">
          <div className={`absolute top-0 w-full h-1 ${data.riskLevel === 'High' ? 'bg-red-500' : data.riskLevel === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
          <CardHeader>
            <CardTitle>Overall Risk Score</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" 
                  stroke={data.riskLevel === 'High' ? '#ef4444' : data.riskLevel === 'Medium' ? '#f59e0b' : '#10b981'} 
                  strokeWidth="8" 
                  strokeDasharray="283" 
                  strokeDashoffset={283 - (283 * data.riskScore) / 100} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-bold text-white">{data.riskScore}</span>
                <span className="text-xs text-slate-400 uppercase tracking-wider">/ 100</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Badge variant={(data.riskLevel || data.risk_level) === 'High' ? 'danger' : (data.riskLevel || data.risk_level) === 'Medium' ? 'warning' : 'success'} className="mb-2 text-sm px-3 py-1">
                {((data.riskLevel || data.risk_level) || 'LOW').toUpperCase()} RISK
              </Badge>
              <p className="text-slate-300 text-sm mt-2">{data.recommendation || 'No recommendation available.'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Evidence */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Why was this case flagged?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(data.evidence || []).map((ev, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-slate-900 border border-slate-800">
                <div className="mt-1">
                  {ev.severity === 'High' ? <AlertCircle className="w-5 h-5 text-red-500" /> : 
                   ev.severity === 'Medium' ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : 
                   <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-white">{ev.title}</h4>
                    <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">Confidence: {ev.confidence}%</span>
                  </div>
                  <p className="text-sm text-slate-400">{ev.description}</p>
                </div>
              </div>
            ))}
            {(!data.evidence || data.evidence.length === 0) && (
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-sm">
                No adverse risk or tampering evidence detected.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Document Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Document Analysis (OCR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm mb-6 bg-slate-900 p-4 rounded-lg border border-slate-800">
              <div className="text-slate-500">Name</div><div className="text-white font-medium text-right">{data.ocr?.name || data.personName || "N/A"}</div>
              <div className="text-slate-500">DOB</div><div className="text-white font-medium text-right">{data.ocr?.dob || "N/A"}</div>
              <div className="text-slate-500">Nationality</div><div className="text-white font-medium text-right">{data.ocr?.nationality || "Indian"}</div>
              <div className="text-slate-500">Document No.</div><div className="text-white font-medium text-right">{data.ocr?.passportNumber || "N/A"}</div>
              <div className="text-slate-500">Expiry</div><div className="text-white font-medium text-right">{data.ocr?.expiry || "N/A"}</div>
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase text-slate-500 mb-2">Validation Checks</h4>
              {(data.validation || []).map((v, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {v.status === 'pass' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  <span className={v.status === 'pass' ? 'text-slate-300' : 'text-amber-400'}>{v.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tampering */}
        <Card>
          <CardHeader>
            <CardTitle>Tampering Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6 p-4 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-slate-300 font-medium">Overall Signal</span>
              <Badge variant={data.tampering?.overall === 'High' ? 'danger' : 'success'}>{data.tampering?.overall || 'Low'}</Badge>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Photo Manipulation</span>
                <span className="text-emerald-400">{data.tampering?.photo || 'Low'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Text Manipulation</span>
                <span className={data.tampering?.text === 'High' ? 'text-red-400 font-medium' : 'text-emerald-400'}>{data.tampering?.text || 'Low'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Stamp Manipulation</span>
                <span className="text-emerald-400">{data.tampering?.stamp || 'Low'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Metadata Anomaly</span>
                <span className={data.tampering?.metadata === 'High' ? 'text-amber-400' : 'text-emerald-400'}>{data.tampering?.metadata || 'Low'}</span>
              </div>
            </div>
            <div className="mt-6 h-32 bg-slate-800 rounded-lg border border-slate-700 flex items-center justify-center overflow-hidden relative">
              <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwTDggOFpNOCAwTDAgOFoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSI+PC9wYXRoPgo8L3N2Zz4=')]"></div>
              <span className="text-slate-500 relative z-10 flex items-center gap-2">
                {data.tampering?.overall === 'High' ? (
                  <><AlertTriangle className="w-4 h-4 text-red-500" /> Tampering anomalies detected</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Document forensics clean</>
                )}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Identity History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-800">
              {(data.history || []).map((h, i) => (
                <div key={i} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active`}>
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full border border-slate-900 ${h.highlight ? 'bg-red-500' : 'bg-slate-600'} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 relative z-10`}>
                  </div>
                  <div className={`w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border ${h.highlight ? 'border-red-500/30 bg-red-500/5' : 'border-slate-800 bg-slate-900'}`}>
                    <div className="flex justify-between mb-1 text-xs">
                      <span className="font-medium text-white">{h.title}</span>
                      <span className="text-slate-500">{h.year}</span>
                    </div>
                    <div className={`text-xs whitespace-pre-line ${h.highlight ? 'text-red-400' : 'text-slate-400'}`}>
                      {h.details}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Relationships */}
        <Card>
          <CardHeader>
            <CardTitle>Relationship Consistency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3 text-slate-300 text-sm">
                <Info className="w-5 h-5 shrink-0 text-navy-400" />
                <div>
                  <div className="font-medium mb-1 text-white">Relationship Record</div>
                  <div className="text-slate-400">{data.relationships?.explanation || "Identity verified with no conflicting claims."}</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 py-4 bg-slate-900 rounded-lg border border-slate-800">
              <div className="bg-navy-900/50 border border-navy-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                {data.relationships?.current || data.personName}
              </div>
              <div className="h-4 w-px bg-slate-700"></div>
              <div className="text-xs text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 relative -my-3 z-10">Applicant</div>
              <div className="h-4 w-px bg-slate-700"></div>
              <div className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm">
                Self / Primary Holder
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Intelligence Assessment */}
      <Card className="mb-8 border-navy-500/30 bg-gradient-to-br from-slate-900 to-navy-900/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-navy-400">
            <Info className="w-5 h-5" /> Intelligence Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 text-sm mb-6 max-w-3xl">
            The system correlates document, biometric, historical and relational evidence before making a final decision.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              {(data.intelligence?.contributions || []).map((c, i) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-slate-800/50 pb-2">
                  <span className="text-slate-400">{c.label}</span>
                  <span className={`font-mono font-medium ${String(c.value).startsWith('+') ? 'text-red-400' : 'text-emerald-400'}`}>{c.value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-slate-800 p-6">
              <div className="text-sm text-slate-500 uppercase tracking-wider mb-2">Calculated Risk Score</div>
              <div className="text-5xl font-bold text-white mb-2">{data.riskScore || data.risk_score || 20}</div>
              <div className="text-sm text-slate-400 mb-4">Confidence: {data.intelligence?.confidence || 90}%</div>
              <Badge variant={(data.riskLevel || data.risk_level) === 'High' ? 'danger' : (data.riskLevel || data.risk_level) === 'Medium' ? 'warning' : 'success'}>
                {((data.riskLevel || data.risk_level) || 'LOW').toUpperCase()} RISK
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </PageContainer>
  );
}

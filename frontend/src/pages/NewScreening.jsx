import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { api } from '../services/api';

export default function NewScreening() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [demoLoaded, setDemoLoaded] = useState(false);
  const [files, setFiles] = useState({
    passport: null,
    visa: null,
    supporting: null
  });

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await api.createScreening({ files });
      navigate(`/screening/${res.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDemo = () => {
    setDemoLoaded(true);
    setFiles({
      passport: { name: 'arjun_passport.pdf', size: '2.4 MB', status: 'uploaded' },
      visa: { name: 'arjun_visa_app.pdf', size: '1.1 MB', status: 'uploaded' },
      supporting: null
    });
  };

  return (
    <PageContainer title="New Identity Screening">
      <div className="flex justify-between items-start mb-8">
        <p className="text-slate-400 max-w-2xl">Upload identity and travel documents to begin analysis. The system will automatically extract information and evaluate potential risks.</p>
        
        <Button variant="secondary" size="sm" onClick={loadDemo} className="flex gap-2">
          <FileText className="w-4 h-4" /> Load Demo Case
        </Button>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-800 -z-10"></div>
          {['Documents', 'Document Analysis', 'Identity Verification', 'Intelligence Analysis', 'Decision'].map((step, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2 bg-slate-950 px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${idx === 0 ? 'border-navy-500 bg-navy-500 text-white' : 'border-slate-800 bg-slate-900 text-slate-500'}`}>
                {idx + 1}
              </div>
              <span className={`text-xs font-medium ${idx === 0 ? 'text-navy-400' : 'text-slate-500'}`}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UploadCard 
                  title="Passport" 
                  desc="Upload passport image or PDF" 
                  file={files.passport}
                  required 
                />
                <UploadCard 
                  title="Visa" 
                  desc="Upload visa document" 
                  file={files.visa} 
                />
                <UploadCard 
                  title="Supporting Document" 
                  desc="Optional" 
                  file={files.supporting} 
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Person Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">You can leave these blank. The OCR engine will automatically extract this information.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <input type="text" defaultValue={demoLoaded ? "Arjun Rao" : ""} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-navy-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Date of Birth</label>
                  <input type="date" defaultValue={demoLoaded ? "2001-04-12" : ""} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-navy-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Nationality</label>
                  <input type="text" defaultValue={demoLoaded ? "Indian" : ""} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-navy-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Document Type</label>
                  <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-navy-500">
                    <option>Passport</option>
                    <option>National ID</option>
                    <option>Driver's License</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Presented Person</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">Upload or capture a photo of the person presenting the document.</p>
              
              <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-900/50 hover:bg-slate-800/50 transition-colors cursor-pointer group">
                {demoLoaded ? (
                  <div className="w-32 h-32 bg-slate-800 rounded-lg mb-4 overflow-hidden relative">
                    <ImageIcon className="w-8 h-8 text-slate-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute inset-0 bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:bg-slate-700 transition-colors">
                    <ImageIcon className="w-8 h-8 text-slate-400" />
                  </div>
                )}
                <Button variant="secondary" size="sm" className="mb-2">
                  Capture / Upload
                </Button>
                <p className="text-xs text-slate-500">Required for face verification</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleStart}
              disabled={loading || (!files.passport && !demoLoaded)}
            >
              {loading ? 'Processing...' : 'Start Screening →'}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function UploadCard({ title, desc, required, file }) {
  return (
    <div className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors
      ${file ? 'border-navy-500/50 bg-navy-500/5' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 cursor-pointer'}
    `}>
      {file ? (
        <>
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
          <h4 className="text-sm font-medium text-white mb-1">{file.name}</h4>
          <p className="text-xs text-slate-400">{file.size} • {file.status}</p>
        </>
      ) : (
        <>
          <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
            <UploadCloud className="w-6 h-6 text-slate-400" />
          </div>
          <h4 className="text-sm font-medium text-white mb-1">
            {title} {required && <span className="text-red-500">*</span>}
          </h4>
          <p className="text-xs text-slate-500">{desc}</p>
          <div className="mt-3 text-xs font-medium text-navy-400">Browse Files</div>
        </>
      )}
    </div>
  );
}

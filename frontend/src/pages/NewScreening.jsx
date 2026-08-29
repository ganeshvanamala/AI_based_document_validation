import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { api } from '../services/api';

export default function NewScreening() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
      console.error("Screening failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (type, file) => {
    setFiles(prev => ({ ...prev, [type]: file }));
  };

  return (
    <PageContainer title="New Identity Screening">
      <div className="flex justify-between items-start mb-8">
        <p className="text-slate-400 max-w-2xl">Upload identity and travel documents to begin analysis. The system will automatically extract information and evaluate potential risks.</p>
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
                  title="Passport / ID" 
                  desc="Upload passport or ID image" 
                  file={files.passport}
                  required 
                  onFileSelect={(file) => handleFileChange('passport', file)}
                />
                <UploadCard 
                  title="Visa" 
                  desc="Upload visa document" 
                  file={files.visa} 
                  onFileSelect={(file) => handleFileChange('visa', file)}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Person Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400 mb-4">You can leave these blank. The OCR engine will automatically extract this information from the uploaded image.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-50 pointer-events-none">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                  <input type="text" placeholder="Auto-extracted" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Date of Birth</label>
                  <input type="text" placeholder="Auto-extracted" className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleStart}
              disabled={loading || !files.passport}
            >
              {loading ? 'Processing AI...' : 'Start Screening →'}
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function UploadCard({ title, desc, required, file, onFileSelect }) {
  const fileInputRef = useRef(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*,.pdf"
      />
      <div 
        onClick={handleClick}
        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer
        ${file ? 'border-navy-500/50 bg-navy-500/5' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800/50'}
      `}>
        {file ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-3" />
            <h4 className="text-sm font-medium text-white mb-1 truncate w-full px-2">{file.name}</h4>
            <p className="text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready</p>
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
    </>
  );
}

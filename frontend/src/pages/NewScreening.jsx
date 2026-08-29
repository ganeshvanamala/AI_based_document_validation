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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <UploadCard 
                  title="Upload Document" 
                  desc="Upload image or PDF" 
                  file={files.passport}
                  required 
                  onFileSelect={(file) => handleFileChange('passport', file)}
                />
                
                <WebcamCapture 
                  file={files.face}
                  onCapture={(file) => handleFileChange('face', file)}
                />

                <div className="flex flex-col justify-center space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Document Type</label>
                    <select className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-navy-500">
                      <option>Auto-Detect (AI)</option>
                      <option>Aadhaar / National ID</option>
                      <option>Passport</option>
                      <option>Driving Licence</option>
                      <option>Visa</option>
                    </select>
                  </div>
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

function WebcamCapture({ file, onCapture }) {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraOn(true);
      }
    } catch (err) {
      console.error("Error accessing webcam", err);
      alert("Could not access webcam. Please ensure permissions are granted.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      setIsCameraOn(false);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);
      
      canvasRef.current.toBlob((blob) => {
        const capturedFile = new File([blob], "live_face.jpg", { type: "image/jpeg" });
        onCapture(capturedFile);
        stopCamera();
      }, 'image/jpeg', 0.9);
    }
  };

  if (file) {
    const objectUrl = URL.createObjectURL(file);
    return (
      <div className="border-2 border-navy-500/50 bg-navy-500/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
        <img src={objectUrl} alt="Captured Face" className="w-24 h-24 object-cover rounded-full border-2 border-emerald-500 mb-3" />
        <h4 className="text-sm font-medium text-white mb-1">Face Captured</h4>
        <Button variant="outline" className="mt-2 text-xs py-1 h-auto" onClick={() => onCapture(null)}>Retake</Button>
      </div>
    );
  }

  if (isCameraOn) {
    return (
      <div className="border-2 border-slate-700 bg-slate-900/50 rounded-xl p-2 flex flex-col items-center">
        <video ref={videoRef} autoPlay playsInline className="w-full h-32 object-cover rounded-lg bg-black mb-2" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2 w-full">
          <Button variant="secondary" className="flex-1 text-xs h-8" onClick={stopCamera}>Cancel</Button>
          <Button className="flex-1 text-xs h-8 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={takePhoto}>Capture</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={startCamera}
      className="border-2 border-dashed border-slate-700 bg-slate-900/50 hover:bg-slate-800/50 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer"
    >
      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
      </div>
      <h4 className="text-sm font-medium text-white mb-1">Live Face Photo</h4>
      <p className="text-xs text-slate-500">Take picture with camera</p>
      <div className="mt-3 text-xs font-medium text-navy-400">Open Camera</div>
    </div>
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

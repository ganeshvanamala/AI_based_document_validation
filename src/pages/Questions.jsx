import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { api } from '../services/api';

export default function Questions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState('');

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await api.submitQuestion(id, selected);
      navigate(`/screening/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Additional Verification Required">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-slate-400">Some evidence is inconsistent. Please resolve the following discrepancy.</p>
        </div>

        <Card className="mb-8 border-amber-500/30">
          <CardHeader className="bg-amber-500/5">
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <AlertTriangle className="w-5 h-5" /> Why are we asking?
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-slate-300 text-lg">Your current date of birth differs from a previously verified identity record.</p>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Has your date of birth been officially corrected or updated?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className={`p-4 border rounded-xl cursor-pointer transition-colors ${selected === 'yes' ? 'border-navy-500 bg-navy-500/10' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800'}`}
              onClick={() => setSelected('yes')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-200">Yes, it was updated</span>
                {selected === 'yes' && <CheckCircle2 className="w-5 h-5 text-navy-500" />}
              </div>
            </div>
            
            <div 
              className={`p-4 border rounded-xl cursor-pointer transition-colors ${selected === 'no' ? 'border-navy-500 bg-navy-500/10' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800'}`}
              onClick={() => setSelected('no')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-200">No, this is incorrect</span>
                {selected === 'no' && <CheckCircle2 className="w-5 h-5 text-navy-500" />}
              </div>
            </div>
            
            <div 
              className={`p-4 border rounded-xl cursor-pointer transition-colors ${selected === 'unsure' ? 'border-navy-500 bg-navy-500/10' : 'border-slate-700 bg-slate-900/50 hover:bg-slate-800'}`}
              onClick={() => setSelected('unsure')}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-slate-200">I'm not sure</span>
                {selected === 'unsure' && <CheckCircle2 className="w-5 h-5 text-navy-500" />}
              </div>
            </div>

            {selected === 'yes' && (
              <div className="pt-4 animate-in fade-in slide-in-from-top-4">
                <label className="block text-sm font-medium text-slate-400 mb-2">Supporting Evidence (Optional)</label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-900/50">
                  <span className="text-sm text-slate-500">Upload official correction certificate</span>
                  <Button variant="secondary" size="sm" className="mt-4">Browse Files</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
          <Button 
            className="flex-1" 
            onClick={handleSubmit} 
            disabled={!selected || loading}
          >
            {loading ? 'Submitting...' : 'Submit Response →'}
          </Button>
        </div>

        <div className="mt-12 space-y-4">
          <h3 className="text-sm font-medium text-slate-500 uppercase flex items-center gap-2">
            <Info className="w-4 h-4" /> Other detected inconsistencies
          </h3>
          <ul className="list-disc list-inside text-sm text-slate-400 space-y-2">
            <li>Relationship information conflict</li>
            <li>Possible document manipulation in text region</li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
}

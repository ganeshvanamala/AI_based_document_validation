import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, Calendar, MapPin, CheckCircle2, History } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

export default function IdentityProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await api.getIdentity(id);
      setData(res);
    }
    load();
  }, [id]);

  if (!data) return <PageContainer title="Identity Profile"><div className="text-slate-400">Loading...</div></PageContainer>;

  return (
    <PageContainer title="Identity Profile">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-8 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-4 border-4 border-slate-900 shadow-xl">
                <User className="w-12 h-12 text-slate-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-1">{data.name}</h2>
              <div className="flex items-center gap-1.5 text-slate-400 mb-4">
                <Badge variant="success" className="px-2">{data.status}</Badge>
              </div>
              <p className="text-sm text-slate-500">ID: {data.id}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-slate-400 w-24">Date of Birth</span>
                <span className="text-white font-medium">{data.dob}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-slate-500" />
                <span className="text-slate-400 w-24">Nationality</span>
                <span className="text-white font-medium">{data.nationality}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-slate-400" /> Verification History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-800">
                <div className="relative flex items-center group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-900 shrink-0 relative z-10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div className="ml-4 p-4 rounded-xl border border-slate-800 bg-slate-900 w-full shadow-sm">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium text-white">Initial Verification</h4>
                      <span className="text-xs text-slate-500">{data.verificationDate}</span>
                    </div>
                    <p className="text-sm text-slate-400">Identity successfully established via Passport.</p>
                  </div>
                </div>
                
                <div className="relative flex items-center group">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-800 bg-slate-900 shrink-0 relative z-10">
                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                  </div>
                  <div className="ml-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 w-full">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium text-slate-300">Profile Created</h4>
                      <span className="text-xs text-slate-500">2024-05-09</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 text-center text-slate-400 text-sm">
                Relationship graph loading placeholder...
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}

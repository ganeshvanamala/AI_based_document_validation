import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, ArrowRight, UserCheck, Calendar, Shield } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';

export default function IdentityList() {
  const navigate = useNavigate();
  const [identities, setIdentities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.getIdentities();
        setIdentities(data);
      } catch (err) {
        console.error("Failed to load identities:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = identities.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageContainer title="Verified Identity Registry">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <p className="text-slate-400">All registered and verified identity profiles stored in MongoDB Atlas.</p>
      </div>

      <Card className="mb-8">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by registered name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-navy-500"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <Card key={item.id} className="hover:border-slate-700 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-navy-400">
                  <UserCheck className="w-6 h-6" />
                </div>
                <Badge variant="success">Verified</Badge>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
              <p className="text-xs text-slate-500 font-mono mb-4">ID: {item.id}</p>

              <div className="space-y-2 text-sm text-slate-400 border-t border-slate-800/80 pt-4 mb-6">
                <div className="flex justify-between">
                  <span>Date of Birth</span>
                  <span className="text-white font-medium">{item.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span>Nationality</span>
                  <span className="text-white font-medium">{item.nationality}</span>
                </div>
                <div className="flex justify-between">
                  <span>Screenings Recorded</span>
                  <span className="text-white font-medium">{item.historyCount}</span>
                </div>
              </div>

              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={() => navigate(`/identity/${encodeURIComponent(item.name)}`)}
              >
                View Profile & History <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && !loading && (
          <div className="col-span-3 text-center py-12 text-slate-500">
            No identity records found matching your search.
          </div>
        )}

        {loading && (
          <div className="col-span-3 text-center py-12 text-slate-500">
            Loading verified identities from MongoDB...
          </div>
        )}
      </div>
    </PageContainer>
  );
}

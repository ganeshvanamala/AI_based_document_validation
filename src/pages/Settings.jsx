import React from 'react';
import PageContainer from '../components/layout/PageContainer';
import { Card, CardContent } from '../components/common/Card';

export default function Settings() {
  return (
    <PageContainer title="Settings">
      <Card>
        <CardContent className="p-12 text-center text-slate-400">
          Settings coming soon.
        </CardContent>
      </Card>
    </PageContainer>
  );
}

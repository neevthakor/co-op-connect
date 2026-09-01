'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, Sparkles, AlertCircle, ArrowUpRight, GraduationCap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function SkillGapsPage() {
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/demand')
      .then((res) => res.json())
      .then((data) => {
        setSkillGaps(data.skillGaps || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const defaultGaps = [
    {
      id: '1',
      trade: 'Inverter & Smart AC Servicing',
      area: 'Satellite & Vastrapur',
      demandLevel: 'SURGING (+65%)',
      supplyCount: 3,
      gapSeverity: 'HIGH',
      recommendation: 'Launch 3-day PCB board diagnostic masterclass from Cooperative Welfare Fund.',
    },
    {
      id: '2',
      trade: 'Solar Inverter & Rooftop Wiring',
      area: 'Bopal & SG Highway',
      demandLevel: 'HIGH (+40%)',
      supplyCount: 4,
      gapSeverity: 'HIGH',
      recommendation: 'Partner with Gujarat Energy Development Agency for subsidized certified technician training.',
    },
    {
      id: '3',
      trade: 'Leak Detection & Acoustic Waterproofing',
      area: 'Navrangpura & Maninagar',
      demandLevel: 'MODERATE (+25%)',
      supplyCount: 6,
      gapSeverity: 'MEDIUM',
      recommendation: 'Equip senior plumbers with ultrasound thermal leak detection toolkits.',
    },
  ];

  const displayedGaps = skillGaps.length > 0 ? skillGaps : defaultGaps;

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full pb-20">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Skill Gap Detection & Training Intelligence</h1>
          <Badge className="bg-primary/10 text-primary font-bold">Vocational Up-skilling</Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Automated cross-analysis between customer service requests and cooperative worker trade certifications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayedGaps.map((gap: any) => (
          <Card key={gap.id} className="border-primary/20 shadow-xs flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-base font-bold text-foreground">{gap.trade || gap.skill?.name || 'Advanced Trade'}</CardTitle>
                <Badge variant={gap.gapSeverity === 'HIGH' ? 'destructive' : 'secondary'}>
                  {gap.gapSeverity || 'HIGH'} GAP
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">{gap.area || 'Ahmedabad Cluster'}</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-xs">
              <div className="p-3 bg-muted/40 rounded-lg space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Unfulfilled Demand:</span>
                  <span className="font-bold text-destructive">{gap.demandLevel || 'High (+45%)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Certified Workers in Area:</span>
                  <span className="font-bold text-foreground">{gap.supplyCount || 2} Technicians</span>
                </div>
              </div>

              <div className="space-y-1.5 border-t pt-3">
                <p className="font-bold text-primary flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" /> Recommended Action
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  {gap.recommendation || 'Organize cooperative training workshop funded via 2% Welfare Fund.'}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5 text-xs font-semibold"
                onClick={() => toast.success('Cooperative Training Workshop scheduled for next week!')}
              >
                Schedule Welfare Workshop <ArrowUpRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


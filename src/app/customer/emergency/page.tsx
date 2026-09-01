'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { AlertTriangle, MapPin, Zap, Droplets, Wrench } from 'lucide-react';
import { toast } from 'sonner';

const emergencyCategories = [
  { id: 'electrical', name: 'Electrical Emergency', icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'water', name: 'Water Leakage', icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'plumbing', name: 'Plumbing Emergency', icon: Wrench, color: 'text-orange-500', bg: 'bg-orange-500/10' },
];

export default function EmergencyBookingPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBookEmergency = async () => {
    if (!selectedCategory || !address) {
      toast.error('Please select a category and provide an address.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/bookings/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: selectedCategory, address })
      });
      
      if (!res.ok) throw new Error('Failed to book emergency service');
      const data = await res.json();
      
      router.push(`/customer/bookings/${data.id}`);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8 max-w-xl mx-auto w-full">
      <header className="text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4 text-destructive">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-destructive mb-2">Emergency Service</h1>
        <p className="text-muted-foreground">We'll dispatch the nearest available qualified worker immediately.</p>
      </header>

      <div className="space-y-4 mt-4">
        <Label className="text-base">1. What's the emergency?</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {emergencyCategories.map(cat => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <Card 
                key={cat.id}
                className={`cursor-pointer transition-all border-2 ${isSelected ? 'border-destructive bg-destructive/5' : 'border-border hover:border-destructive/50'}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center h-full">
                  <div className={`p-3 rounded-full ${cat.bg} ${cat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="font-medium text-sm">{cat.name}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <Label className="text-base">2. Where do you need help?</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter your full address" 
            className="pl-10 h-12"
          />
        </div>
      </div>

      <Button 
        size="lg" 
        variant="destructive" 
        className="w-full h-14 text-lg font-bold mt-4"
        onClick={handleBookEmergency}
        disabled={loading || !selectedCategory || !address}
      >
        {loading ? 'FINDING WORKER...' : 'REQUEST EMERGENCY HELP'}
      </Button>
    </div>
  );
}

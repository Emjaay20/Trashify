'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Layers, ArrowLeft, Truck, Check, Plus, ShieldCheck } from 'lucide-react';
import { CollectorProfile } from '@/lib/types';

export default function AdminZonesPage() {
  const [collectors, setCollectors] = React.useState<CollectorProfile[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadCollectors() {
      try {
        const res = await fetch('/api/collectors');
        if (res.ok) {
          const data = await res.json();
          if (data.collectors) {
            setCollectors(data.collectors);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadCollectors();
  }, []);

  const ZONES = [
    { postcode: '900211', area: 'Wuse 2', lga: 'AMAC', description: 'Commercial & high-density residential (Banex, Adetokunbo Ademola)', assignedCollectors: ['col-musa'] },
    { postcode: '900271', area: 'Maitama', lga: 'AMAC', description: 'Diplomatic zone, high commercial compliance (Farmers Market, Aguiyi Ironsi)', assignedCollectors: ['col-musa'] },
    { postcode: '900001', area: 'Garki 1', lga: 'AMAC', description: 'Government secretariats, Area 11 administrative district', assignedCollectors: ['col-fatima'] },
    { postcode: '900231', area: 'Asokoro', lga: 'AMAC', description: 'Low-density residential, ECOWAS secretariat corridor', assignedCollectors: ['col-fatima'] },
    { postcode: '900108', area: 'Jabi', lga: 'AMAC', description: 'Commercial lake district and retail hub (Alex Ekwueme Way)', assignedCollectors: ['col-fatima'] },
    { postcode: '900104', area: 'Gwarinpa', lga: 'AMAC', description: 'Large planned residential estate (3rd Avenue hub)', assignedCollectors: [] },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] hover:text-[var(--ink)]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Operations Command</span>
        </Link>
      </div>

      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="forest">AMAC Waste Regulation</Badge>
          <span className="font-mono text-xs text-[var(--muted)]">Postcode Zone Allocation Engine</span>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[var(--ink)]">
          NIPOST Digital Postcode Franchise Zones
        </h1>
        <p className="text-xs text-[var(--muted)]">
          Licensed private collectors are legally mapped to specific 6-digit postcodes to eliminate territory disputes and ensure 100% municipal coverage.
        </p>
      </div>

      {/* Grid of Postcode Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ZONES.map((zone) => {
          const zoneCollectors = collectors.filter(c => c.assignedZones?.includes(zone.postcode));

          return (
            <Card key={zone.postcode} className="border border-[var(--line)]">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#173E2C]">
                        Postcode #{zone.postcode}
                      </span>
                      <Badge variant="sage" size="sm">{zone.lga}</Badge>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[var(--ink)] mt-1">
                      {zone.area}
                    </h3>
                  </div>

                  <span className="text-xs font-mono px-2 py-1 bg-[var(--surface-2)] rounded border border-[var(--line)] text-[var(--ink-2)]">
                    {zoneCollectors.length} Licensed Operator{zoneCollectors.length === 1 ? '' : 's'}
                  </span>
                </div>

                <p className="text-xs text-[var(--muted)] leading-relaxed">
                  {zone.description}
                </p>

                <div className="pt-2 border-t border-[var(--line)] space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted)] block">
                    Assigned Franchisees
                  </span>
                  {zoneCollectors.length > 0 ? (
                    <div className="space-y-2">
                      {zoneCollectors.map((col) => (
                        <div
                          key={col.id}
                          className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--surface-2)] text-xs font-mono"
                        >
                          <div className="flex items-center gap-2">
                            <Truck className="w-3.5 h-3.5 text-[#173E2C]" />
                            <span className="font-semibold text-[var(--ink)]">{col.name}</span>
                            <span className="text-[11px] text-[var(--muted)]">({col.licenseNumber})</span>
                          </div>
                          <Badge variant="forest" size="sm">{col.rating}★</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-lg border border-dashed border-[var(--line)] text-center text-xs font-mono text-[#7A5A12] bg-[#FEF6E0]/50">
                      Unassigned franchise zone. Currently open for AEPB collector tender.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

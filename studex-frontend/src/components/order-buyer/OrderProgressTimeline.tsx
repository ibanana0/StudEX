'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { OrderStatus } from '@/types/order';

export type StepState = 'completed' | 'current' | 'pending';

export interface ProgressStep {
  label: string;
  description: string;
  time?: string;
  state: StepState;
}

/**
 * Derive 4 canonical buyer-side progress steps from OrderStatus.
 * Steps are purely derived from status — no extra DB field needed.
 *
 * NOTE [BACKEND]: status must be updated by driver via API at each stage.
 * Buyer page should poll GET /orders/:id every ~5s (or use SSE) to get
 * live updates. The existing useOrderPolling hook is a good foundation.
 */
export function deriveProgressSteps(
  status: OrderStatus,
  timestamps: Partial<Record<OrderStatus, string>>,
  deliveryAddress: string,
): ProgressStep[] {
  const order: OrderStatus[] = [
    'MENCARI_DRIVER',
    'DIPROSES_DRIVER',
    'DALAM_PERJALANAN',
    'DRIVER_SAMPAI',
  ];
  const allFulfilled = status === 'PESANAN_TIBA' || status === 'COMPLETED';
  const currentIdx = allFulfilled ? order.length : order.indexOf(status);

  const defs: Array<{ label: string; description: string; mapTo: OrderStatus }> = [
    {
      label: 'Pesanan Dibuat',
      description: 'Sistem mencari teman yang sedia.',
      mapTo: 'MENCARI_DRIVER',
    },
    {
      label: 'Pesanan Diambil',
      description: 'Teman mengambil pesanan',
      mapTo: 'DIPROSES_DRIVER',
    },
    {
      label: 'Menuju Lokasi',
      description: `Teman sedang dalam perjalanan ke ${deliveryAddress}.`,
      mapTo: 'DALAM_PERJALANAN',
    },
    {
      label: 'Tiba di Tujuan',
      description: 'Pesanan siap diserahkan.',
      mapTo: 'DRIVER_SAMPAI',
    },
  ];

  return defs.map((def, i) => {
    const stepStatus = order[i];
    const stepIdx = order.indexOf(stepStatus);
    let state: StepState;
    if (stepIdx < currentIdx) state = 'completed';
    else if (stepIdx === currentIdx) state = 'current';
    else state = 'pending';

    return {
      label: def.label,
      description: def.description,
      time: timestamps[stepStatus],
      state,
    };
  });
}

interface OrderProgressTimelineProps {
  steps: ProgressStep[];
}

export default function OrderProgressTimeline({ steps }: OrderProgressTimelineProps) {
  const currentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentRef.current) return;
    // Periodic zoom in/out on the current step indicator
    const anim = gsap.to(currentRef.current, {
      scale: 1.4,
      duration: 0.7,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
    return () => { anim.kill(); };
  }, [steps]); // re-run when steps change (i.e. status advances)

  const currentIdx = steps.findIndex((s) => s.state === 'current');

  return (
    <div>
      <p className="text-sm font-bold font-bitter text-[#1B1B24] mb-2">Status Pesanan</p>
      <div className="border border-gray-200 rounded-2xl px-4 py-4 space-y-4">
        {steps.map((step, i) => {
          const isCompleted = step.state === 'completed';
          const isCurrent   = step.state === 'current';
          const isPending   = step.state === 'pending';

          return (
            <div key={i} className="flex items-start gap-3">
              {/* Step indicator */}
              <div className="shrink-0 mt-0.5">
                {isCompleted && (
                  <div className="w-6 h-6 rounded-full bg-primary/25 flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-primary/60" viewBox="0 0 14 14" fill="none">
                      <path d="M2.5 7l3 3 6-6" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                {isCurrent && (
                  <div
                    ref={i === currentIdx ? currentRef : undefined}
                    className="w-6 h-6 rounded-full border-2 border-primary flex items-center justify-center"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  </div>
                )}
                {isPending && (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200" />
                )}
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold font-bitter leading-tight ${
                  isCurrent ? 'text-primary' : isCompleted ? 'text-primary/50' : 'text-gray-400'
                }`}>
                  {step.label}
                </p>
                <p className={`text-sm mt-0.5 leading-relaxed ${
                  isCompleted ? 'text-gray-400' : isPending ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {step.description}
                </p>
              </div>

              {/* Timestamp */}
              {step.time && (
                <span className="text-xs text-gray-400 shrink-0 mt-0.5 pt-0.5">{step.time}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

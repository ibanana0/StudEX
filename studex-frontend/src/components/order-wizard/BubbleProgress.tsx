'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface BubbleProgressProps {
  currentStep: number;
  labels: string[];
  /** When true, renders inside a white rounded card with shadow (for floating over map) */
  floating?: boolean;
  /** Optional right-side title shown in the header row (e.g. "Detail Jastip") */
  title?: string;
}

export default function BubbleProgress({
  currentStep,
  labels,
  floating = false,
  title,
}: BubbleProgressProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const fillsRef = useRef<(HTMLDivElement | null)[]>([]);
  const bubblesRef = useRef<(HTMLDivElement | null)[]>([]);
  const labelsRefArr = useRef<(HTMLParagraphElement | null)[]>([]);
  const prevStepRef = useRef<number>(-1);

  // Mount-once: pop the wrapper in
  useLayoutEffect(() => {
    if (!wrapperRef.current) return;
    gsap.fromTo(
      wrapperRef.current,
      { scale: 0.95, opacity: 0, y: -8 },
      { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }
    );
  }, []);

  // Step changes: continuous left→right fill sweep + bubble settle
  useEffect(() => {
    const prev = prevStepRef.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Sweep fills left→right. If advancing, chain segments so the wave is continuous.
      fillsRef.current.forEach((fill, i) => {
        if (!fill) return;
        const filled = i <= currentStep;
        const wasFilled = i <= prev;

        if (filled && !wasFilled) {
          // Newly-filling segment — chain after previous in timeline for sweep effect
          tl.to(
            fill,
            { width: '100%', duration: 0.55, ease: 'expo.out' },
            i === Math.max(prev + 1, 0) ? 0 : '>-0.25'
          );
        } else if (!filled && wasFilled) {
          // Reversing back — drain in reverse order
          tl.to(
            fill,
            { width: '0%', duration: 0.4, ease: 'power3.inOut' },
            0
          );
        } else if (filled) {
          // Already filled, no work — ensure final state
          gsap.set(fill, { width: '100%' });
        } else {
          gsap.set(fill, { width: '0%' });
        }
      });

      // Bubbles: settle (scale-in with elastic) when their segment is filled,
      // shrink out when their segment empties. Timed to land just as fill arrives.
      bubblesRef.current.forEach((bubble, i) => {
        if (!bubble) return;
        const filled = i <= currentStep;
        const wasFilled = i <= prev;

        if (filled && !wasFilled) {
          tl.fromTo(
            bubble,
            { scale: 0 },
            { scale: 1, duration: 0.7, ease: 'elastic.out(1, 0.65)' },
            '>-0.25'
          );
        } else if (!filled && wasFilled) {
          tl.to(
            bubble,
            { scale: 0, duration: 0.3, ease: 'back.in(1.7)' },
            0
          );
        } else if (filled) {
          gsap.set(bubble, { scale: 1 });
        } else {
          gsap.set(bubble, { scale: 0 });
        }
      });

      // Active label bounce-in (only on actual step change, not initial mount)
      const activeLabel = labelsRefArr.current[currentStep];
      if (activeLabel && prev !== currentStep && prev !== -1) {
        tl.fromTo(
          activeLabel,
          { y: 6, opacity: 0.4, scale: 0.92 },
          { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' },
          '<'
        );
      }
    }, wrapperRef);

    prevStepRef.current = currentStep;
    return () => ctx.revert();
  }, [currentStep]);

  return (
    <div
      ref={wrapperRef}
      className={`transition-all duration-300 ease-out ${
        floating
          ? 'bg-white rounded-2xl shadow-lg px-4 pt-3 pb-2.5'
          : 'bg-transparent rounded-none shadow-none px-5 pt-3 pb-2'
      }`}
    >
      {/* Header row: step indicator + optional title */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-primary font-bitter">
          Langkah {currentStep + 1} dari {labels.length}
        </p>
        {title && (
          <p className="text-xs text-muted-foreground font-bitter">{title}</p>
        )}
      </div>

      {/* Segmented progress bar */}
      <div className="flex items-center gap-1.5">
        {labels.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 bg-muted rounded-full relative"
          >
            {/* Fill — rides full segment width; bubble lives at its right edge so it travels with the fill */}
            <div
              ref={(el) => { fillsRef.current[i] = el; }}
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ width: i <= currentStep ? '100%' : '0%' }}
            >
              {/* Wrapper handles the half-outside positioning; inner is what GSAP scales */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 pointer-events-none">
                <div
                  ref={(el) => { bubblesRef.current[i] = el; }}
                  className="w-3 h-3 rounded-full bg-primary shadow-[0_0_0_3px_rgba(99,102,241,0.22)]"
                  style={{ transform: i <= currentStep ? 'scale(1)' : 'scale(0)' }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Labels under segments */}
      <div className="flex items-center gap-1.5 mt-2">
        {labels.map((label, i) => (
          <p
            key={label}
            ref={(el) => { labelsRefArr.current[i] = el; }}
            className={`flex-1 text-[11px] text-center font-bitter transition-colors duration-300 ${
              i === currentStep
                ? 'text-primary font-semibold'
                : i < currentStep
                  ? 'text-primary/70'
                  : 'text-muted-foreground'
            }`}
          >
            {label}
          </p>
        ))}
      </div>
    </div>
  );
}

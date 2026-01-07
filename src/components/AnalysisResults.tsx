'use client';

import { useCallback, useState } from 'react';
import { toPng } from 'html-to-image';
import type { AnalysisResult } from '@/types';
import { UserHeader, Scoreboard, FeedbackSection } from '@/components/cards';
import { WeeklyBrief } from '@/components/brief';
import { EmptyState, Toast } from '@/components/ui';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

type Section = 'overview' | 'brief' | 'success' | 'friction';

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { user, userMetrics, themes, topCasts, bottomCasts, weeklyBrief } = result;
  const [toast, setToast] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('overview');

  const scrollToSection = useCallback((sectionId: Section) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Get top theme for scoreboard
  const topTheme = themes.length > 0
    ? themes.reduce((best, current) =>
        current.avgEngagement > best.avgEngagement ? current : best
      )
    : null;

  const handleShareImage = useCallback(async () => {
    const element = document.getElementById('weekly-brief-card');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#f2f5f3',
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `tune-report-${user.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      setToast('Failed to generate image');
    }
  }, [user.username]);

  const navItems: { id: Section; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'brief', label: 'Brief' },
    { id: 'success', label: 'Wins' },
    { id: 'friction', label: 'Improve' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-12">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-2">
        <button
          onClick={onReset}
          className="text-[9px] font-bold uppercase tracking-widest text-stone-400 hover:text-stone-600 flex items-center gap-1"
        >
          ← New Analysis
        </button>
        <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">
          {result.cached ? 'Cached' : 'Fresh'} • #{user.fid}
        </span>
      </div>

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-20 -mx-4 px-4 py-3 bg-[#f2f5f3]/95 backdrop-blur border-b border-stone-200/50">
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-full whitespace-nowrap transition-all ${
                activeSection === item.id
                  ? 'bg-[#1a1f2e] text-white'
                  : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Overview Section */}
      <section id="overview" className="scroll-mt-20 space-y-4">
        <UserHeader user={user} />
        <Scoreboard metrics={userMetrics} topTheme={topTheme} />
      </section>

      {/* Brief Section */}
      <section id="brief" className="scroll-mt-20">
        <WeeklyBrief
          brief={weeklyBrief}
          username={user.username}
          onShareImage={handleShareImage}
        />
      </section>

      {/* Success Section */}
      <section id="success" className="scroll-mt-20">
        {topCasts.length > 0 ? (
          <FeedbackSection
            title="Success Vectors"
            description="High-engagement patterns identified"
            analyses={topCasts}
            type="top"
          />
        ) : (
          <EmptyState
            title="No Top Posts Yet"
            description="Keep casting to unlock insights!"
          />
        )}
      </section>

      {/* Friction Section */}
      {bottomCasts.length > 0 && (
        <section id="friction" className="scroll-mt-20">
          <FeedbackSection
            title="Friction Points"
            description="Content that underperformed baseline"
            analyses={bottomCasts}
            type="bottom"
          />
        </section>
      )}

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

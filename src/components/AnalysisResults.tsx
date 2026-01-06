'use client';

import { useCallback, useState } from 'react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import type { AnalysisResult } from '@/types';
import { UserHeader, Scoreboard, FeedbackSection } from '@/components/cards';
import { WeeklyBrief } from '@/components/brief';
import { Button, Card, CardContent, EmptyState } from '@/components/ui';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

type Section = 'overview' | 'top' | 'improve' | 'brief';

export function AnalysisResults({ result, onReset }: AnalysisResultsProps) {
  const { user, userMetrics, themes, topCasts, bottomCasts, weeklyBrief } = result;
  const [activeSection, setActiveSection] = useState<Section>('overview');

  // Get top theme for scoreboard
  const topTheme = themes.length > 0
    ? themes.reduce((best, current) =>
        current.avgEngagement > best.avgEngagement ? current : best
      )
    : null;

  const scrollToSection = useCallback((sectionId: Section) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  const handleShareImage = useCallback(async () => {
    const element = document.getElementById('weekly-brief-card');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `tune-brief-${user.username}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
    }
  }, [user.username]);

  const navItems: { id: Section; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'top', label: 'Top Posts' },
    { id: 'improve', label: 'To Improve' },
    { id: 'brief', label: 'Action Plan' },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header with Refresh */}
      <motion.div variants={item} className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onReset}>
          ↻ Refresh
        </Button>
        {result.cached && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Cached • {new Date(result.generatedAt).toLocaleDateString()}
          </span>
        )}
      </motion.div>

      {/* User Header */}
      <motion.div variants={item}>
        <UserHeader user={user} />
      </motion.div>

      {/* Sticky Navigation */}
      <motion.nav variants={item} className="sticky top-0 z-20 bg-zinc-50/95 dark:bg-zinc-950/95 backdrop-blur -mx-4 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((navItem) => (
            <button
              key={navItem.id}
              onClick={() => scrollToSection(navItem.id)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                activeSection === navItem.id
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300'
                  : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
              }`}
            >
              {navItem.label}
            </button>
          ))}
        </div>
      </motion.nav>

      {/* Summary Card - Quick Action */}
      <motion.div variants={item}>
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
          <CardContent className="p-4">
            <p className="text-sm text-violet-800 dark:text-violet-200">
              <span className="font-semibold">This week&apos;s focus:</span> {weeklyBrief.experiment.title}
            </p>
            <button
              onClick={() => scrollToSection('brief')}
              className="mt-2 text-sm font-medium text-violet-600 dark:text-violet-400 hover:underline"
            >
              See action plan →
            </button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Overview Section */}
      <motion.section id="overview" className="scroll-mt-20" variants={item}>
        <Scoreboard metrics={userMetrics} topTheme={topTheme} />
      </motion.section>

      {/* Top Posts Section */}
      <motion.section id="top" className="scroll-mt-20" variants={item}>
        {topCasts.length > 0 ? (
          <FeedbackSection
            title="Top Performers"
            description="Your posts that sparked the most engagement"
            analyses={topCasts}
            type="top"
          />
        ) : (
          <EmptyState
            title="No Top Posts Yet"
            description="We need a bit more history to identify your best performing content. Keep casting!"
            icon={
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            }
          />
        )}
      </motion.section>

      {/* Bottom Posts Section */}
      {bottomCasts.length > 0 && (
        <motion.section id="improve" className="scroll-mt-20" variants={item}>
          <FeedbackSection
            title="To Improve"
            description="Posts that didn't hit their potential"
            analyses={bottomCasts}
            type="bottom"
          />
        </motion.section>
      )}

      {/* Weekly Brief Section */}
      <motion.section id="brief" className="scroll-mt-20" variants={item}>
        <WeeklyBrief
          brief={weeklyBrief}
          username={user.username}
          onShareImage={handleShareImage}
        />
      </motion.section>
    </motion.div>
  );
}

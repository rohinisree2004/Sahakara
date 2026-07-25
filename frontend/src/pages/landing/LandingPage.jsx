import React, { useState, useEffect } from 'react';
import LandingNavbar from '../../components/landing/LandingNavbar';
import HeroSection from '../../components/landing/HeroSection';
import FeaturesSection from '../../components/landing/FeaturesSection';
import BenefitsSection from '../../components/landing/BenefitsSection';
import InquiryModal from '../../components/landing/InquiryModal';
import LandingFooter from '../../components/landing/LandingFooter';
import { fetchLandingStats } from '../../services/api';

const LandingPage = () => {
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [stats, setStats] = useState({
    activeSocieties: 48,
    totalMembersServed: '125,000+',
    totalTransactionsProcessed: '₹ 450 Cr+',
    systemUptime: '99.98%',
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchLandingStats();
        if (res.data && res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.log('Using default landing stats:', err.message);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <LandingNavbar onOpenInquiry={() => setIsInquiryOpen(true)} />
      
      <main className="flex-grow">
        <HeroSection onOpenInquiry={() => setIsInquiryOpen(true)} stats={stats} />
        <FeaturesSection />
        <BenefitsSection />
      </main>

      <LandingFooter onOpenInquiry={() => setIsInquiryOpen(true)} />

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
      />
    </div>
  );
};

export default LandingPage;

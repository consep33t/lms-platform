import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export interface BadgeData {
  title: string;
  description: string;
  icon: React.ReactNode;
  xpReward: number;
}

export interface BadgeCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: BadgeData;
}

export const BadgeCelebrationModal: React.FC<BadgeCelebrationModalProps> = ({ isOpen, onClose, badge }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP(() => {
    if (isOpen && modalRef.current) {
      const tl = gsap.timeline();

      // Reset initial states
      gsap.set(modalRef.current, { autoAlpha: 0 });
      gsap.set(badgeRef.current, { scale: 0, rotation: -45 });
      gsap.set(pulseRef.current, { scale: 0.8, opacity: 0 });
      gsap.set(contentRef.current, { y: 30, opacity: 0 });
      
      const particles = particlesRef.current?.children;
      if (particles) {
        gsap.set(particles, {
          x: 0,
          y: 0,
          scale: 0,
          opacity: 1
        });
      }

      // 1. Fade in modal background
      tl.to(modalRef.current, {
        autoAlpha: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
      // 2. Elastic bounce on badge icon
      .to(badgeRef.current, {
        scale: 1,
        rotation: 0,
        duration: 1.2,
        ease: 'elastic.out(1, 0.5)'
      }, "-=0.1")
      // 3. Glowing radial pulse
      .to(pulseRef.current, {
        scale: 2,
        opacity: 0,
        duration: 1.5,
        ease: 'power2.out',
        repeat: -1,
      }, "-=0.8");

      // 4. Confetti particles burst
      if (particles && particles.length > 0) {
        tl.to(particles, {
          x: () => gsap.utils.random(-200, 200),
          y: () => gsap.utils.random(-200, 200),
          scale: () => gsap.utils.random(0.5, 1.5),
          rotation: () => gsap.utils.random(-180, 180),
          opacity: 0,
          duration: () => gsap.utils.random(1, 1.5),
          ease: 'power3.out',
          stagger: 0.02
        }, "-=1.2");
      }

      // 5. Fade in content (title, description, XP)
      tl.to(contentRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
      }, "-=1.0");
    }
  }, { dependencies: [isOpen] });

  const handleClose = contextSafe(() => {
    gsap.to(modalRef.current, {
      autoAlpha: 0,
      duration: 0.3,
      ease: 'power2.inOut',
      onComplete: onClose
    });
  });

  return (
    <div 
      ref={modalRef} 
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4 ${isOpen ? '' : 'hidden'}`}
      style={{ visibility: 'hidden' }}
    >
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl overflow-hidden">
        
        {/* Confetti Particles Container */}
        <div ref={particlesRef} className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: ['#f59e0b', '#3b82f6', '#ef4444', '#10b981', '#8b5cf6'][i % 5]
              }}
            />
          ))}
        </div>

        {/* Badge Area */}
        <div className="relative mb-6 mt-4">
          {/* Radial Pulse */}
          <div ref={pulseRef} className="absolute inset-0 bg-yellow-400 rounded-full opacity-0 blur-xl"></div>
          
          {/* Badge Icon */}
          <div ref={badgeRef} className="relative z-10 w-32 h-32 flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full shadow-lg border-4 border-yellow-400 text-6xl">
            {badge.icon}
          </div>
        </div>

        {/* Content Area */}
        <div ref={contentRef} className="flex flex-col items-center relative z-10">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-2">{badge.title}</h2>
          <p className="text-gray-600 mb-4">{badge.description}</p>
          
          <div className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold mb-8">
            <span>+{badge.xpReward} XP</span>
          </div>

          <button 
            onClick={handleClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-md"
          >
            Lanjutkan Belajar
          </button>
        </div>
      </div>
    </div>
  );
};

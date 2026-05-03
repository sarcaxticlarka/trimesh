'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import AuthForm from '../../../components/AuthForm';

export default function SignupPage() {
  const formRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.auth-reveal', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
      });
      gsap.from(visualRef.current, {
        scale: 1.1,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030303] p-6 sm:p-12 overflow-hidden relative">
      {/* Background Blobs */}
      <div className="absolute top-0 left-0 w-full h-full bg-hero-gradient opacity-20"></div>
      
      <div 
        ref={formRef} 
        className="w-full max-w-6xl glass-card rounded-[48px] overflow-hidden flex flex-col lg:flex-row relative z-10 border border-white/10 shadow-2xl min-h-[700px]"
      >
        {/* Left Side: Visual (Full Width/Height) */}
        <div className="lg:w-1/2 relative overflow-hidden group">
          <div ref={visualRef} className="absolute inset-0 w-full h-full">
             <img 
               src="/assets/materials.png" 
               alt="Signup Visual" 
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
          </div>
          <div className="absolute bottom-16 left-16 z-20">
             <h2 className="text-5xl font-bold text-white mb-4 tracking-tighter">Start your<br/>3D journey.</h2>
             <p className="text-zinc-300 text-lg max-w-sm font-medium">Join thousands of artists creating the future of digital art.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="lg:w-1/2 p-10 sm:p-20 flex flex-col justify-center bg-black/40">
          <div className="mb-12">
            <h1 className="text-5xl font-bold text-gradient mb-4 auth-reveal">Sign Up.</h1>
            <p className="text-zinc-400 auth-reveal text-lg">Join TriMesh today and start exploring.</p>
          </div>

          <div className="auth-reveal">
            <AuthForm mode="signup" />
          </div>

          <p className="mt-12 text-center text-zinc-500 auth-reveal">
            Already have an account?{' '}
            <Link href="/login" className="text-white font-bold hover:text-violet-400 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

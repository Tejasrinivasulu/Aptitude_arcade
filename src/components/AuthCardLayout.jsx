import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function AuthCardLayout({ mode, children }) {
  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div 
      className="flex min-h-screen flex-col overflow-hidden bg-auth-pattern font-sans selection:bg-orange-200 relative"
      onMouseMove={handleMouseMove}
    >
      {/* Spotlight Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.1) 20%, transparent 50%)`
        }}
      />
      
      <div className="relative z-10 flex flex-1 items-center justify-center p-4 md:p-8">
        <div
          className={`flex w-full overflow-hidden rounded-[28px] glass-card shadow-premium relative ${
            isRegister ? 'max-w-[880px] min-h-[600px]' : 'max-w-[800px] min-h-[580px]'
          }`}
        >
          <WelcomePanel isLogin={isLogin} />
          <div className="relative z-10 flex w-full lg:w-[58%] min-w-0 shrink-0 flex-col justify-center px-6 py-8 sm:px-10 sm:py-10 bg-white/50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomePanel({ isLogin }) {
  return (
    <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-gradient-to-br from-[#ff6a2b] to-[#ff8552] lg:flex lg:flex-col lg:items-center lg:justify-center lg:px-8">
      {/* Decorative Blur Orbs */}
      <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-white/20 blur-3xl animate-pulse-glow" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-black/10 blur-2xl" />

      <div className="relative z-10 text-center text-white">
        <div className="mb-8 flex flex-col items-center justify-center gap-3">
          <img 
            src="/arcade-logo.png" 
            alt="Aptitude Arcade Logo" 
            className="h-16 w-16 object-contain drop-shadow-xl" 
          />
          <span className="text-xl font-black tracking-tight drop-shadow-sm">Aptitude Arcade</span>
        </div>

        <h2 className="text-3xl font-black leading-tight drop-shadow-md">Hello, Welcome!</h2>
        <p className="mt-3 text-sm font-medium text-white/90">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
        </p>

        <Link
          to={isLogin ? '/signup' : '/login'}
          className="mt-8 inline-block rounded-2xl bg-white/20 px-8 py-3.5 text-sm font-bold tracking-wide text-white backdrop-blur-md transition-all hover:bg-white hover:text-[#ff6a2b] hover:shadow-xl hover:-translate-y-0.5 border border-white/40 hover:border-white"
        >
          {isLogin ? 'Create Account' : 'Sign In'}
        </Link>
      </div>
    </div>
  );
}

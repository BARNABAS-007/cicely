import { useState, useEffect } from 'react';
import { Menu, X, LogIn, MapPin, User, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navItems = [
    { label: 'Home', id: 'top' },
    { label: 'About', id: 'about' },
    { label: 'Menu', id: 'ordering' },
    { label: 'Reservations', id: 'reservation' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    /* Hidden on mobile (<768px), visible on md+ */
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-brand-dark/20 backdrop-blur-2xl border-b border-white/5 hidden md:block ${
        isScrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center h-12">
          {/* Logo Section with Breathing Space */}
          <div className="flex items-center gap-12 flex-1">
            <button
              onClick={() => scrollToSection('top')}
              className="group flex items-center gap-3 shrink-0"
            >
              <div className="w-11 h-11 bg-brand-gold rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-12 transition-all duration-500 shadow-gold-glow">
                <span className="text-brand-dark font-black text-2xl">C</span>
              </div>
              <span className="text-2xl font-black text-white tracking-widest uppercase group-hover:text-brand-gold transition-colors duration-500">
                Cicely
              </span>
            </button>

            {/* 📍 Location Selector (Official Website Feel) */}
            <button className="hidden lg:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full text-brand-cream/60 hover:text-brand-gold hover:border-brand-gold/40 transition-all duration-300 group shadow-lg">
              <MapPin className="w-4 h-4 text-brand-gold group-hover:animate-bounce" />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none mb-0.5 opacity-50">Dining At</p>
                <div className="flex items-center gap-1">
                   <p className="text-xs font-bold text-white tracking-wide">Cicely, MG Road</p>
                   <ChevronDown size={12} className="opacity-40" />
                </div>
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-8 justify-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="relative text-brand-cream/60 hover:text-brand-gold transition-colors font-bold text-[10px] tracking-[0.3em] uppercase py-2 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-brand-gold transition-all duration-500 group-hover:w-full rounded-full"></span>
              </button>
            ))}
          </nav>

          {/* Action Icons */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className={`flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 transition-all duration-500 ${showSearch ? 'w-64 border-brand-gold/40' : 'w-12'}`}>
              <button onClick={() => setShowSearch(!showSearch)} className="text-brand-cream/40 hover:text-brand-gold transition-colors">
                <Search size={18} />
              </button>
              {showSearch && (
                 <input 
                   autoFocus
                   type="text" 
                   placeholder="Search Signatures..." 
                   className="bg-transparent border-none outline-none text-xs text-white placeholder-brand-cream/20 w-full"
                 />
              )}
            </div>

            <button
               onClick={() => navigate('/login')}
               className="w-11 h-11 bg-white/5 hover:bg-brand-gold border border-white/10 hover:border-brand-gold text-brand-gold hover:text-brand-dark rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg group btn-soft-press"
            >
              <User size={20} className="group-hover:scale-110 transition-transform" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden text-brand-gold hover:text-brand-gold/80 transition-colors btn-soft-press"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Tablet Menu (md-xl range) */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 top-[76px] bg-brand-dark/95 backdrop-blur-3xl animate-in slide-in-from-top duration-500 border-t border-white/5">
          <nav className="container mx-auto px-8 py-12 flex flex-col items-center gap-10">
             {/* Location */}
            <div className="flex items-center gap-3 text-brand-gold mb-4 opacity-70">
               <MapPin size={18} />
               <span className="text-xs font-bold uppercase tracking-widest text-brand-cream">Vijayawada, India</span>
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-2xl font-black text-brand-cream hover:text-brand-gold transition-all duration-300 tracking-[0.2em] uppercase"
              >
                {item.label}
              </button>
            ))}
            <div className="w-12 h-0.5 bg-brand-gold/20 rounded-full"></div>
            <button
              onClick={() => {
                navigate('/login');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-4 bg-brand-gold text-brand-dark px-12 py-5 rounded-3xl transition-all duration-300 font-black tracking-[0.2em] uppercase shadow-gold-glow btn-soft-press"
            >
              <LogIn size={20} />
              Owner Portal
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}

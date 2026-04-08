import { useState } from 'react';
import { Home, Search, ClipboardList, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home;
  action: 'scroll' | 'navigate';
  target: string;
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, action: 'scroll', target: 'top' },
  { id: 'search', label: 'Search', icon: Search, action: 'scroll', target: 'ordering' },
  { id: 'orders', label: 'My Orders', icon: ClipboardList, action: 'scroll', target: 'reservation' },
  { id: 'profile', label: 'Profile', icon: User, action: 'navigate', target: '/login' },
];

export default function BottomNavigation() {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();

  const handleTap = (item: NavItem) => {
    setActiveTab(item.id);
    if (item.action === 'scroll') {
      if (item.target === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        document.getElementById(item.target)?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(item.target);
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[70] md:hidden glass-nav" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center justify-around h-[4.5rem] px-2 max-w-lg mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleTap(item)}
              whileTap={{ scale: 0.82 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              className="relative flex flex-col items-center justify-center gap-1 flex-1 py-2 group"
              aria-label={item.label}
            >
              {/* Active indicator dot */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-0.5 w-5 h-[3px] rounded-full"
                    style={{ background: 'linear-gradient(90deg, #D4AF37, #FFBF00)' }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              <motion.div
                animate={{
                  scale: isActive ? 1.15 : 1,
                  y: isActive ? -2 : 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-brand-gold' : 'text-white/30'
                  }`}
                />
              </motion.div>

              <span
                className={`text-[10px] font-bold tracking-wider uppercase transition-colors duration-300 ${
                  isActive ? 'text-brand-gold' : 'text-white/20'
                }`}
              >
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

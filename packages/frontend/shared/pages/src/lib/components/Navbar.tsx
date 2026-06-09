import { useState, useEffect } from 'react';
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { cn } from '@spark-nest-ed/frontend-shared-utils';
import {
  Button,
  useToast,
  ThemeToggle,
} from '@spark-nest-ed/frontend-shared-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@spark-nest-ed/frontend-core-auth';
import { ROUTES } from '@spark-nest-ed/frontend-core-constants';

const Navbar = () => {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Methods', href: '#methods' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  const handleRedirectDashboard = () => {
    try {
      navigate(ROUTES.DASHBOARD);
    } catch {
      toast({
        title: 'Navigation Error',
        description: 'Unable to navigate to the dashboard page.',
        variant: 'destructive',
      });
    }
  };

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.querySelector('#get-started');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'py-3 bg-background/95 dark:bg-gray-900/95 border-b border-border dark:border-gray-700 shadow-sm backdrop-blur-md'
          : 'py-4 bg-background/50 dark:bg-gray-900/50 backdrop-blur-sm'
      )}
    >
      <div className="container-padding max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a 
            href="/" 
            className="flex items-center space-x-2 group"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-xl font-bold text-white">
                E
              </span>
            </span>
            <span className="text-xl font-bold text-foreground dark:text-white">
              EnglishSelf
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-foreground/80 dark:text-gray-300 rounded-md transition-all hover:text-primary hover:bg-primary/5 dark:hover:bg-gray-800"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex md:items-center md:gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Button 
                onClick={handleRedirectDashboard} 
                size="default"
                className="gap-2"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Button>
            ) : (
              <Button 
                onClick={handleGetStarted}
                size="default"
                className="gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all"
                asChild
              >
                <a href="#get-started">
                  <LogIn className="h-4 w-4" />
                  Get Started
                </a>
              </Button>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground dark:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-background/98 dark:bg-gray-900/98 backdrop-blur-lg shadow-lg border-b border-border dark:border-gray-700 animate-slide-down">
          <div className="flex flex-col p-6 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-4 py-3 text-base font-medium text-foreground/80 dark:text-gray-300 rounded-lg transition-all hover:text-primary hover:bg-primary/5 dark:hover:bg-gray-800"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-border dark:border-gray-700">
              {isAuthenticated ? (
                <Button 
                  onClick={() => {
                    handleRedirectDashboard();
                    setIsMenuOpen(false);
                  }} 
                  size="default"
                  className="w-full gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              ) : (
                <Button 
                  onClick={handleGetStarted}
                  size="default"
                  className="w-full gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  asChild
                >
                  <a href="#get-started">
                    <LogIn className="h-4 w-4" />
                    Get Started
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

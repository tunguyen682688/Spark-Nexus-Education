// import { Link } from 'react-router-dom';
import { ReactNode } from 'react';

interface SafeLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: unknown;
}

/**
 * SafeLink component that uses regular anchor tag to avoid router context issues
 * Use this instead of Link when component might be rendered before router is ready
 */
export const SafeLink = ({ to, children, className, onClick, ...props }: SafeLinkProps) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) {
      onClick(e);
    }
    // Always use window.location to avoid router context issues
    e.preventDefault();
    window.location.href = to;
  };

  return (
    <a
      href={to}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
};


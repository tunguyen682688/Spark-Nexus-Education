import { Link, LinkProps, useNavigate } from 'react-router-dom';
import { forwardRef, MouseEvent } from 'react';

/**
 * SafeRouterLink - A Link component that gracefully handles missing router context
 * Falls back to <a> tag if used outside RouterProvider
 */
export const SafeRouterLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, onClick, children, ...props }, ref) => {
    let hasRouterContext = true;
    
    try {
      // Try to access router context - will throw if not available
      useNavigate();
    } catch {
      hasRouterContext = false;
    }

    // If we have router context, use Link for client-side navigation
    if (hasRouterContext) {
      return (
        <Link ref={ref} to={to} onClick={onClick} {...props}>
          {children}
        </Link>
      );
    }

    // Otherwise, fall back to regular anchor for full page navigation
    const href = typeof to === 'string' ? to : to.pathname || '/';
    
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e as unknown as MouseEvent<HTMLAnchorElement>);
      }
    };

    return (
      <a ref={ref} href={href} onClick={handleClick} {...props}>
        {children}
      </a>
    );
  }
);

SafeRouterLink.displayName = 'SafeRouterLink';

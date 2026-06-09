import { Link, LinkProps } from 'react-router-dom';

interface PrefetchLinkProps extends LinkProps {
  prefetch?: 'intent' | 'render' | 'none';
}

export const PrefetchLink = ({ prefetch = 'intent', ...props }: PrefetchLinkProps) => {
  return <Link data-prefetch={prefetch} {...props} />;
};

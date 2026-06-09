import { useState, useRef, useEffect } from 'react';
import { Search, X, Command } from 'lucide-react';
import { Input } from '@spark-nest-ed/frontend-shared-components';
import { cn } from '@spark-nest-ed/frontend-shared-utils';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear and blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        setQuery('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const clearSearch = () => {
    setQuery('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-md">
      <div
        className={cn(
          'relative flex items-center transition-all duration-200',
          focused && 'ring-2 ring-ring ring-offset-2 rounded-lg'
        )}
      >
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
        type="text"
        placeholder="Tìm kiếm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'w-full pl-10 pr-20 h-10 bg-background border-input',
            'focus-visible:ring-0 focus-visible:ring-offset-0',
            'placeholder:text-muted-foreground'
          )}
      />
        <div className="absolute right-2 flex items-center space-x-1">
          {query && (
            <button
              onClick={clearSearch}
              className="p-1 rounded-md hover:bg-accent transition-colors"
              aria-label="Clear search"
      >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <Command className="h-3 w-3" />
            <span>K</span>
          </kbd>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

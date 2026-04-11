import React from 'react';
import { useMemoryStore } from '@/hooks/useMemoryStore';
import { Search } from 'lucide-react';
import './SearchBar.css';

export const SearchBar: React.FC = () => {
  const { searchQuery, search } = useMemoryStore();
  const [localQuery, setLocalQuery] = React.useState(searchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    search(localQuery);
  };

  const handleClear = () => {
    setLocalQuery('');
    search('');
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <Search className="search-icon" size={18} />
        <input
          type="text"
          className="search-input"
          placeholder="搜索记忆... (Ctrl+K)"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
        />
        {localQuery && (
          <button type="button" className="clear-btn" onClick={handleClear}>
            ×
          </button>
        )}
      </div>
      <button type="submit" className="search-submit">
        搜索
      </button>
    </form>
  );
};

export default SearchBar;

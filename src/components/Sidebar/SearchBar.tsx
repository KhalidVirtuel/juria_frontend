
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import { useChatStore, Conversation, Folder } from '@/store/chatStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSelectConversation: (id: string) => void;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelectConversation, className }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    conversations: Conversation[];
    folders: Folder[];
  }>({ conversations: [], folders: [] });

  const { conversations, folders } = useChatStore();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when search is activated
  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchQuery = e.target.value.toLowerCase();
    setQuery(searchQuery);
    
    if (searchQuery.trim() === '') {
      setResults({ conversations: [], folders: [] });
      return;
    }
    
    // Search in conversations
    const matchedConversations = conversations.filter(conversation => 
      conversation.title.toLowerCase().includes(searchQuery)
    );
    
    // Search in folders
    const matchedFolders = folders.filter(folder => 
      folder.name.toLowerCase().includes(searchQuery)
    );
    
    setResults({
      conversations: matchedConversations,
      folders: matchedFolders
    });
  };

  const clearSearch = () => {
    setQuery('');
    setResults({ conversations: [], folders: [] });
    setIsSearching(false);
  };

  const handleSelectConversation = (id: string) => {
    onSelectConversation(id);
    clearSearch();
  };

  return (
    <div className={cn("px-2 py-1", className)}>
      {isSearching ? (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Rechercher..."
            value={query}
            onChange={handleSearch}
            className="w-full pl-9 h-9 liquid-glass-container text-sm text-foreground placeholder:text-foreground/50"
          />
          {query && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-1 top-1 h-7 w-7" 
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Results */}
          {(results.folders.length > 0 || results.conversations.length > 0) && (
            <div className="absolute w-full z-10 mt-1 liquid-glass-container border-0 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
              {/* Folders results */}
              {results.folders.length > 0 && (
                <div className="p-1">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Dossiers</p>
                  {results.folders.map(folder => (
                    <div 
                      key={folder.id}
                      className="px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-secondary flex items-center"
                      onClick={() => {
                        // Placeholder for folder selection logic
                        clearSearch();
                      }}
                    >
                      <div className="w-4 h-4 mr-2 text-jure">📁</div>
                      {folder.name}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Conversations results */}
              {results.conversations.length > 0 && (
                <div className="p-1">
                  <p className="px-2 py-1 text-xs font-medium text-muted-foreground">Conversations</p>
                  {results.conversations.map(conversation => (
                    <div 
                      key={conversation.id}
                      className="px-2 py-1.5 text-sm rounded-md cursor-pointer hover:bg-secondary flex items-center"
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div className="w-4 h-4 mr-2">💬</div>
                      {conversation.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <Button 
          variant="outline" 
          className="w-full justify-start text-foreground/70 text-sm h-9 liquid-glass-container"
          onClick={() => setIsSearching(true)}
        >
          <Search className="mr-2 h-4 w-4" />
          Rechercher...
        </Button>
      )}
    </div>
  );
};

export default SearchBar;

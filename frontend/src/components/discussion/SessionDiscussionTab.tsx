import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, CheckCircle, Search, Plus, X, ChevronDown, User, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Mock Data Types
type Author = {
  id: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
  avatarUrl?: string;
};

type Reply = {
  id: string;
  author: Author;
  content: string;
  createdAt: string;
  isAccepted: boolean;
  upvotes: number;
};

type Topic = {
  id: string;
  title: string;
  content: string; // Markdown body
  author: Author;
  createdAt: string;
  tags: string[];
  upvotes: number;
  replies: Reply[];
  status: 'unanswered' | 'resolved';
};

// Mock Data
const MOCK_TOPICS: Topic[] = [
  {
    id: 't1',
    title: 'How does the event loop handle promises?',
    content: 'I understand setTimeout goes to the macrotask queue, but what about Promise.resolve()?',
    author: { id: 'u1', name: 'Alice Johnson', role: 'student' },
    createdAt: '2 hours ago',
    tags: ['javascript', 'async'],
    upvotes: 12,
    status: 'resolved',
    replies: [
      {
        id: 'r1',
        author: { id: 'u2', name: 'Bob Smith', role: 'instructor' },
        content: 'Promises go to the microtask queue, which has higher priority than the macrotask queue.',
        createdAt: '1 hour ago',
        isAccepted: true,
        upvotes: 5,
      }
    ]
  },
  {
    id: 't2',
    title: 'Need help with React useEffect dependency array',
    content: 'My component keeps re-rendering infinitely when I add an object to the dependency array. Why?',
    author: { id: 'u3', name: 'Charlie Davis', role: 'student' },
    createdAt: '5 hours ago',
    tags: ['react', 'hooks'],
    upvotes: 8,
    status: 'unanswered',
    replies: [
      {
        id: 'r2',
        author: { id: 'u1', name: 'Alice Johnson', role: 'student' },
        content: 'Objects are compared by reference, not value. You might be recreating the object on every render.',
        createdAt: '4 hours ago',
        isAccepted: false,
        upvotes: 2,
      }
    ]
  }
];

export const SessionDiscussionTab: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unanswered' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);

  // New Topic Form State
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [newTopicTags, setNewTopicTags] = useState('');

  // Current User Mock
  const currentUser: Author = { id: 'u2', name: 'Bob Smith', role: 'instructor' };

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setTopics(MOCK_TOPICS);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleUpvoteTopic = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTopics(prev => prev.map(t => t.id === topicId ? { ...t, upvotes: t.upvotes + 1 } : t));
  };

  const handleAcceptReply = (topicId: string, replyId: string) => {
    if (currentUser.role !== 'instructor' && currentUser.role !== 'admin') return;
    
    setTopics(prev => prev.map(t => {
      if (t.id === topicId) {
        return {
          ...t,
          status: 'resolved',
          replies: t.replies.map(r => r.id === replyId ? { ...r, isAccepted: true } : { ...r, isAccepted: false })
        };
      }
      return t;
    }));
  };

  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicContent.trim()) return;

    const newTopic: Topic = {
      id: `t${Date.now()}`,
      title: newTopicTitle,
      content: newTopicContent,
      author: currentUser,
      createdAt: 'Just now',
      tags: newTopicTags.split(',').map(tag => tag.trim()).filter(Boolean),
      upvotes: 0,
      status: 'unanswered',
      replies: [],
    };

    setTopics([newTopic, ...topics]);
    setIsNewTopicModalOpen(false);
    setNewTopicTitle('');
    setNewTopicContent('');
    setNewTopicTags('');
  };

  const filteredTopics = topics.filter(topic => {
    if (filter === 'unanswered' && topic.status !== 'unanswered') return false;
    if (filter === 'resolved' && topic.status !== 'resolved') return false;
    if (searchQuery && !topic.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full w-full space-y-6 text-foreground bg-background">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Session Discussion</h2>
          <p className="text-sm text-muted-foreground">Ask questions, share insights, and discuss with peers.</p>
        </div>
        <Button onClick={() => setIsNewTopicModalOpen(true)} className="shrink-0 gap-2">
          <Plus className="w-4 h-4" />
          New Topic
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-muted/50 p-3 rounded-lg border">
        <div className="flex items-center gap-2">
          <Button 
            variant={filter === 'all' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={filter === 'unanswered' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setFilter('unanswered')}
          >
            Unanswered
          </Button>
          <Button 
            variant={filter === 'resolved' ? 'default' : 'ghost'} 
            size="sm" 
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </Button>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search discussions..."
            className="pl-8 bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Discussion List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="gap-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg border-dashed">
            <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No discussions found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search or filters.' : 'Be the first to start a discussion!'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsNewTopicModalOpen(true)} variant="outline">Start Discussion</Button>
            )}
          </div>
        ) : (
          filteredTopics.map(topic => {
            const isExpanded = expandedTopicId === topic.id;
            return (
              <Card 
                key={topic.id} 
                className={`transition-colors duration-200 ${isExpanded ? 'border-primary ring-1 ring-primary/20' : 'hover:border-primary/50 cursor-pointer'}`}
                onClick={() => !isExpanded && setExpandedTopicId(topic.id)}
              >
                <div className="p-5 flex gap-4">
                  {/* Upvote Column */}
                  <div className="flex flex-col items-center gap-1 min-w-[3rem]">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 rounded-full hover:text-primary hover:bg-primary/10"
                      onClick={(e) => handleUpvoteTopic(topic.id, e)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <span className="font-semibold text-sm">{topic.upvotes}</span>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-semibold truncate hover:text-primary hover:underline cursor-pointer" onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}>
                        {topic.title}
                      </h3>
                      {topic.status === 'resolved' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 shrink-0 gap-1">
                          <CheckCircle className="w-3 h-3" /> Resolved
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-1 font-medium text-foreground">
                        <User className="w-3 h-3" />
                        {topic.author.name}
                        {topic.author.role === 'instructor' && (
                          <Badge variant="outline" className="text-[10px] h-4 px-1 py-0 ml-1">Instructor</Badge>
                        )}
                      </div>
                      <span>•</span>
                      <span>{topic.createdAt}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {topic.replies.length} replies
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {topic.content}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {topic.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Expanded Thread */}
                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="prose prose-sm dark:prose-invert max-w-none mb-8">
                          {/* In a real app, use a markdown renderer here */}
                          <p>{topic.content}</p>
                        </div>

                        <h4 className="font-medium text-sm mb-4 border-b pb-2">Replies ({topic.replies.length})</h4>
                        
                        <div className="space-y-4">
                          {topic.replies.map(reply => (
                            <div key={reply.id} className={`flex gap-3 p-4 rounded-lg ${reply.isAccepted ? 'bg-green-50/50 dark:bg-green-950/20 border border-green-100 dark:border-green-900' : 'bg-muted/40'}`}>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-sm">{reply.author.name}</span>
                                    {reply.author.role === 'instructor' && (
                                      <Badge variant="default" className="text-[10px] h-4 px-1 py-0">Instructor</Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground">{reply.createdAt}</span>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    {reply.isAccepted && (
                                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 border-green-200 dark:border-green-800 gap-1">
                                        <CheckCircle className="w-3 h-3" /> Accepted Answer
                                      </Badge>
                                    )}
                                    {currentUser.role === 'instructor' && !reply.isAccepted && (
                                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleAcceptReply(topic.id, reply.id)}>
                                        Mark as Accepted
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-sm">{reply.content}</p>
                              </div>
                            </div>
                          ))}

                          {topic.replies.length === 0 && (
                            <p className="text-sm text-muted-foreground italic py-2">No replies yet. Be the first to answer!</p>
                          )}
                        </div>

                        {/* Reply Form */}
                        <div className="mt-6">
                          <textarea 
                            className="w-full min-h-[100px] p-3 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
                            placeholder="Write a reply..."
                          />
                          <div className="flex justify-end mt-2">
                            <Button size="sm">Post Reply</Button>
                          </div>
                        </div>

                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full mt-4 text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedTopicId(null);
                          }}
                        >
                          <ChevronDown className="w-4 h-4 mr-2 rotate-180" />
                          Collapse Thread
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* New Topic Modal */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-lg shadow-xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle>Create New Discussion</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setIsNewTopicModalOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <form onSubmit={handleCreateTopic}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input 
                    placeholder="E.g., How to implement generic types in TypeScript?" 
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Body (Markdown supported)</label>
                  <textarea 
                    className="w-full min-h-[150px] p-3 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y font-mono"
                    placeholder="Provide details about your question or discussion topic..."
                    value={newTopicContent}
                    onChange={(e) => setNewTopicContent(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags (comma separated)</label>
                  <Input 
                    placeholder="E.g., typescript, generics, frontend" 
                    value={newTopicTags}
                    onChange={(e) => setNewTopicTags(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsNewTopicModalOpen(false)}>Cancel</Button>
                <Button type="submit">Post Discussion</Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SessionDiscussionTab;

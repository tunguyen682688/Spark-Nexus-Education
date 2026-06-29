import { useState } from 'react';
import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, ChevronRight, Send } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../../constants';
import { useAddCommunityComment, useLikeCommunityPost } from '../../hooks';
import type { CommunityPost, GrammarBlock } from '../../types';
import { CommunityFeedQuiz } from './CommunityFeedQuiz';
import FormulaBuilder from '../../components/FormulaBuilder';
import MediaBlock from '../../components/MediaBlock';
import ExampleBlock from '../../components/ExampleBlock';

const T = GRAMMAR_UI_TEXT.communityFeed;

interface CommunityFeedProps {
  posts: CommunityPost[];
  isLoading: boolean;
  activeFilter: 'HOT' | 'RECENT';
  setActiveFilter: (filter: 'HOT' | 'RECENT') => void;
  onNavigateToCreatePost: () => void;
}

export function CommunityFeed({
  posts,
  isLoading,
  activeFilter,
  setActiveFilter,
  onNavigateToCreatePost,
}: CommunityFeedProps) {
  const navigate = useNavigate();
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState<Record<string, string>>({});

  const addCommentMutation = useAddCommunityComment();
  const likePostMutation = useLikeCommunityPost();

  const handleAddComment = (postId: string) => {
    const content = commentContent[postId];
    if (!content) return;

    addCommentMutation.mutate(
      { postId, content },
      {
        onSuccess: () => {
          setCommentContent((prev) => ({ ...prev, [postId]: '' }));
        },
      }
    );
  };

  const handleLikePost = (postId: string, e: MouseEvent) => {
    e.stopPropagation();
    likePostMutation.mutate(postId);
  };

  const toggleExpand = (postId: string, e: MouseEvent) => {
    e.stopPropagation();
    setExpandedPostId(prev => prev === postId ? null : postId);
  };

  const renderPostContent = (post: CommunityPost, isExpanded: boolean) => {
    try {
      if (post.content.trim().startsWith('[')) {
        const blocks = JSON.parse(post.content) as GrammarBlock[];
        if (Array.isArray(blocks)) {
          if (!isExpanded) {
            const firstTextBlock = blocks.find((b) => b.type === 'text' && !b.content?.startsWith('### '));
            const summary = firstTextBlock?.content
              ? firstTextBlock.content.slice(0, 150) + (firstTextBlock.content.length > 150 ? '...' : '')
              : T.fallbackSummary;

            return (
              <div className="space-y-2.5">
                <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{summary}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="bg-indigo-950/60 text-indigo-400 border border-indigo-900/60 text-[9px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 select-none">
                    <span role="img" aria-label="folder">
                      📂
                    </span>{' '}
                    {T.modularBadge.replace('{count}', String(blocks.length))}
                  </span>
                  <span className="text-[10px] text-slate-500 italic font-medium">
                    {T.expandHint}
                  </span>
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-6 mt-3 animate-in fade-in duration-300">
              {blocks.map((block: GrammarBlock, idx: number) => {
                const blockKey = `${post.id}-block-${block.id || idx}`;
                switch (block.type) {
                  case 'media':
                    return (
                      <div key={blockKey} className="space-y-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                          <span role="img" aria-label="video camera">
                            🎥
                          </span>{' '}
                          {T.mediaLabel}
                        </span>
                        <MediaBlock url={block.url || ''} provider={block.provider || 'youtube'} isEditable={false} />
                      </div>
                    );

                  case 'text': {
                    const isHeading = (block.content || '').startsWith('### ');
                    if (isHeading) {
                      const cleanText = (block.content || '').replace('### ', '');
                      return (
                        <h4
                          key={blockKey}
                          className="text-sm font-extrabold text-white border-l-3 border-indigo-500 pl-2.5 mt-4 mb-2 tracking-wide"
                        >
                          {cleanText}
                        </h4>
                      );
                    }
                    return (
                      <div key={blockKey} className="bg-slate-950/30 border border-slate-900/80 p-4 rounded-2xl">
                        <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                          {block.content || ''}
                        </p>
                      </div>
                    );
                  }

                  case 'formula':
                    return (
                      <div
                        key={blockKey}
                        className="bg-slate-950/30 border border-slate-900/80 border-l-3 border-l-indigo-500 p-4 rounded-2xl space-y-3"
                      >
                        <span className="text-[8px] font-extrabold text-slate-500 tracking-widest uppercase block">
                          {T.formulaLabel}
                        </span>
                        <FormulaBuilder elements={block.elements || []} note={block.note || ''} isEditable={false} />
                      </div>
                    );

                  case 'example':
                    return (
                      <div
                        key={blockKey}
                        className="bg-slate-950/30 border border-slate-900/80 p-4 rounded-2xl space-y-3"
                      >
                        <span className="text-[8px] font-extrabold text-slate-500 tracking-widest uppercase block">
                          {T.exampleLabel}
                        </span>
                        <ExampleBlock items={block.items || []} isEditable={false} />
                      </div>
                    );

                  case 'callout':
                    return (
                      <div
                        key={blockKey}
                        className="bg-indigo-950/10 border border-indigo-950 rounded-2xl p-4 border-l-3 border-l-indigo-500/70 space-y-1"
                      >
                        <span className="text-[9px] font-black text-indigo-400 tracking-wider uppercase block">
                          {block.title || T.calloutDefault}
                        </span>
                        <p className="text-xs text-slate-350 leading-relaxed whitespace-pre-wrap">
                          {block.content || ''}
                        </p>
                      </div>
                    );

                  case 'quiz':
                    return <CommunityFeedQuiz key={blockKey} postId={post.id} block={block} />;

                  default:
                    return null;
                }
              })}
            </div>
          );
        }
      }
    } catch {
      // fallback
    }

    return (
      <p className={`text-sm text-slate-450 leading-relaxed ${isExpanded ? '' : 'line-clamp-3'}`}>
        {post.content}
      </p>
    );
  };

  return (
    <section className="lg:col-span-9 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-900 pb-3">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveFilter('RECENT')}
            className={`text-sm font-bold pb-2 border-b-2 transition ${
              activeFilter === 'RECENT'
                ? 'border-indigo-500 text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {T.tabRecent}
          </button>
          <button
            onClick={() => setActiveFilter('HOT')}
            className={`text-sm font-bold pb-2 border-b-2 transition ${
              activeFilter === 'HOT'
                ? 'border-indigo-500 text-slate-100'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {T.tabHot}
          </button>
        </div>
        <span className="text-xs text-slate-500 font-medium">{T.postCount.replace('{count}', String(posts.length))}</span>
      </div>

      {isLoading ? (
        <div className="text-center py-16 space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500 mx-auto" />
          <p className="text-sm text-slate-500">{T.loading}</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-slate-900/25 border border-slate-900 rounded-2xl p-12 text-center space-y-4">
          <MessageSquare className="h-10 w-10 text-slate-600 mx-auto" />
          <div>
            <h3 className="text-base font-bold text-slate-300">{T.emptyTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">
              {T.emptyDesc}
            </p>
          </div>
          <Button
            onClick={onNavigateToCreatePost}
            className="bg-indigo-600 hover:bg-indigo-550 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            {T.btnCreatePost}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const isExpanded = expandedPostId === post.id;

            return (
              <article
                key={post.id}
                onClick={() => navigate(`/grammar/community/${post.id}`)}
                className="bg-slate-900/35 backdrop-blur-sm border border-slate-900 hover:border-slate-800 rounded-2xl p-6 transition cursor-pointer space-y-4 shadow-sm"
              >
                {/* Author & Tags */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author?.avatar}
                      alt={post.author?.name}
                      className="h-9 w-9 rounded-full bg-slate-800 border border-slate-800"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-200 hover:text-indigo-400 transition block">
                        {post.author?.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {post.author?.role} • {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    {post.tags.map((t: string) => (
                      <span
                        key={t}
                        className="bg-indigo-950/40 text-indigo-300 border border-indigo-955 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-200 hover:text-indigo-400 transition">
                    {post.title}
                  </h3>
                  {renderPostContent(post, isExpanded)}
                </div>

                {/* Interactive Quiz Feed Player (Legacy Support) */}
                {!post.content.trim().startsWith('[') && post.hasQuiz && post.quizData && (
                  <CommunityFeedQuiz postId={post.id} block={{ ...post.quizData, quizType: post.quizType, type: 'quiz' } as GrammarBlock} />
                )}

                {/* Stats & Actions */}
                <div className="flex items-center justify-between border-t border-slate-900/60 pt-4 text-xs text-slate-500">
                  <div className="flex items-center gap-5">
                    <button
                      onClick={(e) => handleLikePost(post.id, e)}
                      className="flex items-center gap-1.5 hover:text-indigo-400 transition"
                    >
                      <ThumbsUp className="h-4 w-4" /> {post.likesCount}
                    </button>
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" /> {post.comments?.length || 0} {T.discussionCount}
                    </span>
                  </div>

                  <button
                    onClick={(e) => toggleExpand(post.id, e)}
                    className="flex items-center gap-1 text-slate-400 font-semibold hover:text-slate-200 transition"
                  >
                    {isExpanded ? T.btnCollapse : T.btnExpand}{' '}
                    <ChevronRight
                      className={`h-4 w-4 transform transition ${isExpanded ? 'rotate-90' : ''}`}
                    />
                  </button>
                </div>

                {/* Expanded Q&A Comments Area */}
                {isExpanded && (
                  <div
                    className="border-t border-slate-900/80 pt-5 space-y-4 cursor-default"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <h4 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                      {T.discussionTitle.replace('{count}', String(post.comments?.length || 0))}
                    </h4>

                    {/* Comments List */}
                    <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                      {post.comments?.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-slate-950/60 border border-slate-900 rounded-xl p-3.5 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              src={comment.author?.avatar}
                              alt={comment.author?.name}
                              className="h-6 w-6 rounded-full bg-slate-800"
                            />
                            <div>
                              <span className="text-xs font-bold text-slate-350">
                                {comment.author?.name}
                              </span>
                              <span className="text-[9px] text-slate-500 ml-2">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{comment.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Comment Input */}
                    <div className="flex gap-2 items-center pt-2">
                      <input
                        type="text"
                        placeholder={T.placeholderComment}
                        value={commentContent[post.id] || ''}
                        onChange={(e) =>
                          setCommentContent((prev) => ({ ...prev, [post.id]: e.target.value }))
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        className="flex-1 bg-slate-950 border border-slate-850 focus:border-indigo-500/80 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 transition"
                      />
                      <Button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-indigo-600 hover:bg-indigo-550 text-white p-2.5 rounded-xl transition"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

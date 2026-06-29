import { useState } from 'react';
import {
  MessageSquare,
  Heart,
  Share2,
  ArrowLeft,
  MoreHorizontal,
  Flag,
} from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import {
  useGrammarCommunityPosts,
  useLikeCommunityPost,
  useAddCommunityComment,
} from '../hooks';
import type { CommunityPost } from '../types';
import { GRAMMAR_UI_TEXT } from '../constants';
import { CommunityComments } from '../components/community/CommunityComments';

interface GrammarCommunityPostDetailContainerProps {
  postId: string;
  onBack: () => void;
}

export function GrammarCommunityPostDetailContainer({
  postId,
  onBack,
}: GrammarCommunityPostDetailContainerProps) {
  const { data: posts, isLoading } = useGrammarCommunityPosts();
  const likeMutation = useLikeCommunityPost();
  const commentMutation = useAddCommunityComment();

  const [commentText, setCommentText] = useState('');

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500" />
      </div>
    );
  }

  // Find the post from real database posts list
  const post = posts?.find((p: CommunityPost) => p.id === postId);

  if (!post) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background text-muted-foreground gap-4">
        <p className="text-lg font-bold">{GRAMMAR_UI_TEXT.communityPostDetail.notFound}</p>
        <Button onClick={onBack} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold">
          {GRAMMAR_UI_TEXT.communityPostDetail.btnBack}
        </Button>
      </div>
    );
  }

  const handleLike = () => {
    likeMutation.mutate(post.id);
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    commentMutation.mutate({ postId: post.id, content: commentText });
    setCommentText('');
  };

  return (
    <div className="w-full max-w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-200">
            {GRAMMAR_UI_TEXT.communityPostDetail.title}
          </h1>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        {/* Author Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {post.author?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-bold text-slate-200 flex items-center gap-2">
                {post.author?.name}
              </div>
              <div className="text-xs text-slate-500">
                {new Date(post.createdAt).toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-500 hover:text-slate-300"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <h2 className="text-2xl font-black text-white mb-4">{post.title}</h2>
        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap mb-6 text-lg">
          {post.content}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {post.tags?.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-xs font-bold rounded-full border border-indigo-500/20"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleLike}
              className={`gap-2 ${
                likeMutation.isSuccess
                  ? 'text-pink-500'
                  : 'text-slate-400 hover:text-pink-400'
              }`}
            >
              <Heart
                className={`h-5 w-5 ${
                  likeMutation.isSuccess ? 'fill-current' : ''
                }`}
              />
              <span className="font-bold">
                {(post.likesCount || 0) + (likeMutation.isSuccess ? 1 : 0)}
              </span>
            </Button>
            <Button
              variant="ghost"
              className="gap-2 text-slate-400 hover:text-blue-400"
            >
              <MessageSquare className="h-5 w-5" />
              <span className="font-bold">{post.comments?.length || 0}</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-200"
            >
              <Share2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-rose-400"
            >
              <Flag className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommunityComments
        comments={post.comments || []}
        commentText={commentText}
        onCommentTextChange={setCommentText}
        onCommentSubmit={handleComment}
        isSubmitting={commentMutation.isPending}
      />
    </div>
  );
}

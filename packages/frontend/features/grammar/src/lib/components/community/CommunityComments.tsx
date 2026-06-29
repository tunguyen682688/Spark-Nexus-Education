import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle } from 'lucide-react';
import { Button } from '@spark-nest-ed/frontend-shared-components';
import { GRAMMAR_UI_TEXT } from '../../constants';
import type { CommunityPost } from '../../types';

type CommentType = NonNullable<CommunityPost['comments']>[number];

interface CommunityCommentsProps {
  comments: CommentType[];
  commentText: string;
  onCommentTextChange: (text: string) => void;
  onCommentSubmit: () => void;
  isSubmitting: boolean;
}

export const CommunityComments: FC<CommunityCommentsProps> = ({
  comments,
  commentText,
  onCommentTextChange,
  onCommentSubmit,
  isSubmitting,
}) => {
  return (
    <div className="space-y-6 pt-6">
      <h3 className="text-xl font-bold text-slate-200">
        {GRAMMAR_UI_TEXT.communityPostDetail.commentsTitle.replace(
          '{count}',
          String(comments.length)
        )}
      </h3>

      {/* Comment Input */}
      <div className="flex gap-4">
        <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
          <span role="img" aria-label="User avatar">
            👤
          </span>
        </div>
        <div className="flex-1 relative">
          <textarea
            value={commentText}
            onChange={(e) => onCommentTextChange(e.target.value)}
            placeholder={GRAMMAR_UI_TEXT.communityPostDetail.placeholderComment}
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 pr-12 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-24"
          />
          <Button
            size="icon"
            onClick={onCommentSubmit}
            disabled={!commentText.trim() || isSubmitting}
            className="absolute bottom-3 right-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-10 w-10 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Comment List */}
      <div className="space-y-4 pb-20">
        <AnimatePresence>
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4"
            >
              <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-300">
                {comment.author?.name?.charAt(0) || 'U'}
              </div>
              <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-300 flex items-center gap-1">
                    {comment.author?.name}
                    {comment.author?.name?.includes('GV') && (
                      <CheckCircle className="h-3 w-3 text-emerald-400" />
                    )}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(comment.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {comment.content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

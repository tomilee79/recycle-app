
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Comment, User } from '@/lib/types';
import { placeholderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Loader2, Send } from 'lucide-react';


interface CommentsProps {
  comments: Comment[];
  users: User[];
  currentUser: User;
  taskId: string;
  onSaveComment: (taskId: string, comment: Comment) => void;
  onSaveReply: (taskId: string, commentId: string, reply: Comment) => void;
}

interface CommentItemProps {
  comment: Comment;
  users: User[];
  currentUser: User;
  onReply: (commentId: string, text: string) => void;
}

const getAvatar = (userId: string, users: User[]) => {
    const user = users.find(u => u.id === userId);
    // For mock-up, we use a generic avatar for all users
    const avatarData = placeholderImages.find(p => p.id === 'user-avatar');
    return {
        name: user?.name || '익명',
        src: avatarData?.imageUrl,
        hint: avatarData?.imageHint,
    }
}

const findMentions = (text: string): string[] => {
    const regex = /@([\w\d_]+)/g;
    const matches = text.match(regex);
    return matches ? matches.map(m => m.substring(1)) : [];
}

const renderTextWithMentions = (text: string, users: User[]) => {
    const parts = text.split(/(@[\w\d_]+)/g);
    return parts.map((part, index) => {
        if (part.startsWith('@')) {
            const userName = part.substring(1);
            const user = users.find(u => u.name === userName);
            if (user) {
                return <strong key={index} className="text-primary font-medium">@{userName}</strong>
            }
        }
        return part;
    })
}


const CommentItem: React.FC<CommentItemProps> = ({ comment, users, currentUser, onReply }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const author = getAvatar(comment.authorId, users);

  const handleReplySubmit = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  }

  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={author.src} alt={author.name} data-ai-hint={author.hint} />
        <AvatarFallback>{author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="bg-muted p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="font-semibold text-sm">{author.name}</p>
            <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true, locale: ko })}</p>
          </div>
          <p className="text-sm mt-1">{renderTextWithMentions(comment.text, users)}</p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button variant="link" size="sm" className="text-xs" onClick={() => setIsReplying(!isReplying)}>
            {isReplying ? '취소' : '답글 달기'}
          </Button>
        </div>

        {isReplying && (
           <div className="mt-2 flex items-start gap-2">
                <Textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="답글을 입력하세요..." className="min-h-[60px]" />
                <Button size="sm" onClick={handleReplySubmit}>답글</Button>
           </div>
        )}
        
        {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
                {comment.replies.map(reply => {
                    const replyAuthor = getAvatar(reply.authorId, users);
                    return (
                        <div key={reply.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={replyAuthor.src} alt={replyAuthor.name} data-ai-hint={replyAuthor.hint} />
                                <AvatarFallback>{replyAuthor.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 bg-muted/50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                <p className="font-semibold text-sm">{replyAuthor.name}</p>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(reply.timestamp), { addSuffix: true, locale: ko })}</p>
                                </div>
                                <p className="text-sm mt-1">{renderTextWithMentions(reply.text, users)}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        )}
      </div>
    </div>
  )
}

export function Comments({ comments, users, currentUser, taskId, onSaveComment, onSaveReply }: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleReply = (commentId: string, text: string) => {
    const newReply: Comment = {
      id: `REPLY${Date.now()}`,
      authorId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
    }
    onSaveReply(taskId, commentId, newReply);
  }

  const handleSubmit = () => {
    if (newComment.trim()) {
      setIsLoading(true);
      const newCommentData: Comment = {
        id: `COMMENT${Date.now()}`,
        authorId: currentUser.id,
        text: newComment,
        timestamp: new Date().toISOString(),
        replies: [],
      };
      // Simulate API call
      setTimeout(() => {
        onSaveComment(taskId, newCommentData);
        setNewComment('');
        setIsLoading(false);
      }, 500);
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewComment(text);

    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPosition);
    const atMatch = textBeforeCursor.match(/@(\w*)$/);

    if (atMatch) {
      setMentionQuery(atMatch[1]);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const handleMentionSelect = (name: string) => {
    const text = newComment;
    const cursorPosition = textareaRef.current?.selectionStart || 0;
    const textBeforeCursor = text.substring(0, cursorPosition);
    
    const atMatch = textBeforeCursor.match(/@(\w*)$/);
    if(atMatch) {
        const atIndex = atMatch.index || 0;
        const newText = `${text.substring(0, atIndex)}@${name} ${text.substring(cursorPosition)}`;
        setNewComment(newText);
        setShowMentions(false);
        textareaRef.current?.focus();
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()) && u.id !== currentUser.id);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={newComment}
          onChange={handleTextareaChange}
          placeholder="댓글을 입력하여 소통하세요. '@'를 사용하여 동료를 멘션할 수 있습니다."
          className="min-h-[80px]"
        />
        {showMentions && filteredUsers.length > 0 && (
           <Card className="absolute z-10 mt-1 w-full max-w-xs shadow-lg">
                <ScrollArea className="h-48">
                    {filteredUsers.map(user => (
                        <div key={user.id} onClick={() => handleMentionSelect(user.name)} className="p-2 hover:bg-accent cursor-pointer text-sm">
                            {user.name}
                        </div>
                    ))}
                </ScrollArea>
           </Card>
        )}
      </div>
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isLoading || !newComment.trim()}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Send className="mr-2" />
          댓글 등록
        </Button>
      </div>
      <div className="space-y-4">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} users={users} currentUser={currentUser} onReply={handleReply} />
        ))}
        {comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">아직 댓글이 없습니다.</p>
        )}
      </div>
    </div>
  );
}

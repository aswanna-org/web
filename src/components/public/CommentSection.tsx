import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, Trash2, ShieldCheck, LogIn, AlertCircle, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export interface CommentUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
}

export interface CommentItem {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user: CommentUser;
}

interface CommentSectionProps {
  targetId: string;
  targetType: 'news' | 'blogs';
  title?: string;
  className?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function CommentSection({
  targetId,
  targetType,
  title,
  className = '',
}: CommentSectionProps) {
  const { i18n } = useTranslation();
  const isSinhala = i18n.language === 'si';
  const { user, token, isAuthenticated, openLoginModal } = useAuth();

  const [comments, setComments] = useState<CommentItem[]>([]);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments when targetId or targetType changes
  useEffect(() => {
    if (!targetId) return;

    let isMounted = true;
    setIsLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/${targetType}/${targetId}/comments`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load comments');
        }
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setComments(Array.isArray(data) ? data : []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error(err);
          setError(err.message);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetId, targetType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (!isAuthenticated || !token) {
      openLoginModal();
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/${targetType}/${targetId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to post comment');
      }

      const newComment = await res.json();
      setComments((prev) => [newComment, ...prev]);
      setContent('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error posting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const confirmMsg = isSinhala
      ? 'මෙම අදහස ඉවත් කිරීමට ඔබට විශ්වාසද?'
      : 'Are you sure you want to delete this comment?';
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/${targetType}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete comment');
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to delete comment');
    }
  };

  const formatCommentDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const formattedDate = date.toLocaleDateString(isSinhala ? 'si-LK' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      const formattedTime = date.toLocaleTimeString(isSinhala ? 'si-LK' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let relative = '';
      if (diffMins < 1) {
        relative = isSinhala ? 'දැන් සුළු මොහොතකට පෙර' : 'Just now';
      } else if (diffMins < 60) {
        relative = isSinhala ? `මිනිත්තු ${diffMins}කට පෙර` : `${diffMins}m ago`;
      } else if (diffHours < 24) {
        relative = isSinhala ? `පැය ${diffHours}කට පෙර` : `${diffHours}h ago`;
      } else if (diffDays < 7) {
        relative = isSinhala ? `දින ${diffDays}කට පෙර` : `${diffDays}d ago`;
      }

      return {
        date: formattedDate,
        time: formattedTime,
        relative,
      };
    } catch {
      return {
        date: dateString,
        time: '',
        relative: '',
      };
    }
  };

  return (
    <section className={`mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] flex items-center justify-center">
            <MessageSquare className="w-4 h-4" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">
            {title || (isSinhala ? 'අදහස් හා විමසුම්' : 'Comments & Discussion')}
          </h3>
          <span className="text-xs sm:text-sm font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
            {comments.length}
          </span>
        </div>
      </div>

      {/* Comment Input Box */}
      <div className="mb-8">
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3 bg-gray-50/80 p-3.5 sm:p-5 rounded-2xl border border-gray-200/80 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  {user?.name || user?.email}
                  {user?.role === 'ADMIN' && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-extrabold flex items-center gap-0.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" /> Admin
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-gray-400">
                  {isSinhala ? 'ඔබගේ නමින් අදහස් පළ වේ' : 'Posting publicly'}
                </span>
              </div>
            </div>

            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                isSinhala
                  ? 'මෙම ලිපිය පිළිබඳ ඔබේ අදහස හෝ ගැටලුව මෙහි සටහන් කරන්න...'
                  : 'Write a comment or ask a question about this article...'
              }
              className="w-full p-3 text-xs sm:text-sm rounded-xl border border-gray-200 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)]/30 focus:border-[var(--color-secondary)] transition-all resize-y min-h-[70px]"
              maxLength={1500}
            />

            {error && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400">
                {content.length}/1500
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="px-4 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? (isSinhala ? 'පළ වෙමින්...' : 'Posting...') : (isSinhala ? 'අදහස පළ කරන්න' : 'Post Comment')}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-50/60 to-amber-50/40 rounded-2xl border border-emerald-100/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-gray-800">
                {isSinhala ? 'අදහස් දැක්වීම සඳහා ලොග් වන්න' : 'Join the discussion'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                {isSinhala
                  ? 'මෙම ලිපියට අදහස් හෝ ප්‍රශ්න එක් කිරීමට කරුණාකර ඔබගේ ගිණුමට ලොග් වන්න.'
                  : 'Please log in to your account to post comments or ask questions.'}
              </p>
            </div>
            <button
              onClick={openLoginModal}
              className="px-4 py-2 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/90 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{isSinhala ? 'ලොගින් වන්න' : 'Log In to Comment'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-3.5 sm:space-y-4">
        {isLoading ? (
          <div className="py-8 text-center text-xs text-gray-400">
            {isSinhala ? 'අදහස් පූරණය වෙමින් පවතී...' : 'Loading comments...'}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-8 text-center bg-gray-50/50 rounded-2xl border border-gray-100">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              {isSinhala ? 'තවමත් කිසිදු අදහසක් පළ කර නොමැත. මුලින්ම අදහස් දක්වන්න!' : 'No comments yet. Be the first to share your thoughts!'}
            </p>
          </div>
        ) : (
          comments.map((item) => {
            const isOwner = user?.id === item.userId;
            const isAdmin = user?.role === 'ADMIN';
            const canDelete = isOwner || isAdmin;

            return (
              <div
                key={item.id}
                className="group p-3.5 sm:p-4 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-2xs transition-all flex flex-col gap-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    {item.user.avatar ? (
                      <img
                        src={item.user.avatar}
                        alt={item.user.name}
                        className="w-8 h-8 rounded-full object-cover border border-gray-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {item.user.name ? item.user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                    )}
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs sm:text-sm font-bold text-gray-900">
                          {item.user.name}
                        </span>
                        {item.user.role === 'ADMIN' && (
                          <span className="px-1.5 py-0.2 rounded text-[9.5px] bg-emerald-100 text-emerald-800 font-bold flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Admin
                          </span>
                        )}
                      </div>
                      {(() => {
                        const dt = formatCommentDate(item.createdAt);
                        return (
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-0.5 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-gray-600">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {dt.date}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-1 text-gray-400">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {dt.time}
                            </span>
                            {dt.relative && (
                              <>
                                <span className="text-gray-300">•</span>
                                <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded text-[10px] font-medium">
                                  {dt.relative}
                                </span>
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      title={isAdmin && !isOwner ? 'Delete as Administrator' : 'Delete your comment'}
                      className="opacity-70 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pl-10.5 pr-2 whitespace-pre-wrap break-words">
                  {item.content}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

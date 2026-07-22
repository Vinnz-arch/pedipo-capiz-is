import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  User, 
  ArrowLeft,
  MessageSquare,
  Send,
  Loader2
} from "lucide-react";
import { NewsService, type NewsArticleData } from "@/services/NewsService";
import { notify } from "@/util/notify";
import logo from "../assets/logo.jpg";

export const NewsDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [article, setArticle] = useState<NewsArticleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Comment states
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchArticleDetails = async () => {
      if (!slug) return;
      try {
        const res = await NewsService.get(slug);
        if (res.article) {
          setArticle(res.article);
        }
      } catch (error) {
        console.error("Failed to load article details:", error);
        notify.error("Error", "Failed to retrieve news article.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticleDetails();
  }, [slug]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article || !article.id) return;
    if (!commentName.trim() || !commentEmail.trim() || !commentText.trim()) {
      notify.warning("Validation Warning", "Please fill in all fields to submit your comment.");
      return;
    }

    setIsSubmittingComment(true);
    try {
      const res = await NewsService.addComment(article.id, {
        name: commentName.trim(),
        email: commentEmail.trim(),
        comment: commentText.trim()
      });
      if (res.comment) {
        // Prepend comment to the list
        setArticle(prev => prev ? {
          ...prev,
          comments: [res.comment, ...(prev.comments || [])]
        } : null);
        
        // Clear comment inputs
        setCommentText("");
        setCommentName("");
        setCommentEmail("");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "July 20, 2026";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const resolveNewsImage = (path?: string) => {
    if (!path) return "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80";
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }
    return `http://localhost:8000${path.startsWith("/") ? "" : "/"}${path}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-[#002B66] animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading Article Details...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <img src={logo} alt="PEDIPO Logo" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
            </div>
            <button onClick={() => navigate("/news")} className="text-xs font-bold text-[#002B66] hover:underline uppercase">Back to News</button>
          </div>
        </header>
        <main className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Article Not Found</h2>
          <p className="text-xs text-slate-500">The requested article could not be retrieved. It may have been deleted or archived.</p>
          <button onClick={() => navigate("/news")} className="px-4 py-2 bg-[#002B66] text-white text-xs font-bold rounded-xl uppercase">Browse News</button>
        </main>
        <footer className="bg-[#001D47] text-white py-6 text-center text-[10px] text-slate-500">
          <p>© 2026 PEDIPO Capiz IS. All Rights Reserved.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 antialiased flex flex-col justify-between">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="PEDIPO Logo" className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
            <div className="text-left">
              <h1 className="text-base font-extrabold text-[#002B66] leading-none uppercase tracking-wide">PEDIPO</h1>
              <span className="text-[8px] font-bold text-slate-400 block tracking-wider mt-0.5 uppercase">
                Provincial Economic Development & Investment Promotion Office
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate("/news")}
            className="flex items-center gap-1.5 text-xs font-bold text-[#002B66] hover:text-[#001D47] transition-colors uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to News List</span>
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-4xl mx-auto px-4 py-16 flex-1 w-full text-left space-y-8">
        {/* Title */}
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
            {article.title}
          </h2>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.published_at)}</span>
            </span>
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.author}</span>
            </span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="h-[300px] sm:h-[450px] bg-slate-100 rounded-3xl overflow-hidden border border-slate-200/50 shadow-xs">
          <img 
            src={resolveNewsImage(article.image_path)} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content Paragraphs */}
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-10 shadow-xs space-y-6 text-slate-700 text-sm sm:text-base leading-relaxed">
          {article.content.split("\n\n").map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {/* Comments Section */}
        <div className="space-y-8 border-t border-slate-200 pt-10">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#002B66]" />
            <h3 className="text-lg font-black text-slate-900 uppercase">Comments ({article.comments?.length || 0})</h3>
          </div>

          {/* Comment Form */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-xs">
            <form onSubmit={handlePostComment} className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Leave a Reply</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Full Name</label>
                  <input
                    type="text"
                    required
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    value={commentEmail}
                    onChange={(e) => setCommentEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase">Comment</label>
                <textarea
                  rows={4}
                  required
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#002B66]/20 focus:border-[#002B66] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingComment}
                className="px-4 py-2 bg-[#746006] hover:bg-[#8A7300] disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-all uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-sm hover:shadow"
              >
                {isSubmittingComment ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Comment</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-4">
            {(!article.comments || article.comments.length === 0) ? (
              <p className="text-xs text-slate-400 italic">No comments posted yet. Be the first to reply!</p>
            ) : (
              article.comments.map((comment) => (
                <div key={comment.id} className="flex gap-4 p-5 bg-white border border-slate-200/50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-[#002B66] font-bold text-sm flex items-center justify-center shrink-0 border border-blue-100">
                    {comment.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">{comment.name}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{comment.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#001D47] text-white py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[10px] text-slate-500 font-medium">
          <p>© 2026 PROVINCIAL ECONOMIC DEVELOPMENT & INVESTMENT PROMOTION OFFICE - CAPIZ. ALL RIGHTS RESERVED.</p>
        </div>
      </footer>
    </div>
  );
};

export default NewsDetail;

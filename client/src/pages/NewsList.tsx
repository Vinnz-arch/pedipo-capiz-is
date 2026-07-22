import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  User, 
  ChevronRight, 
  ArrowLeft,
  Loader2
} from "lucide-react";
import { NewsService, type NewsArticleData } from "@/services/NewsService";
import logo from "../assets/logo.jpg";

export const NewsList: React.FC = () => {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<NewsArticleData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await NewsService.getAll();
        if (res.articles) {
          setArticles(res.articles);
        }
      } catch (error) {
        console.error("Failed to load news articles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArticles();
  }, []);

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
          <p className="text-sm font-semibold text-slate-500">Loading Latest News...</p>
        </div>
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
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-xs font-bold text-[#002B66] hover:text-[#001D47] transition-colors uppercase tracking-wider cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full space-y-12">
        <div className="text-left space-y-2 border-b border-slate-200 pb-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">News & Updates</h2>
          <p className="text-sm text-slate-500 font-medium">
            Stay informed with the latest economic announcements, events, and student milestones in Capiz.
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-2xl shadow-xs">
            No news articles published at the moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {articles.map((article) => (
              <div 
                key={article.id} 
                className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                onClick={() => navigate(`/news/${article.slug}`)}
              >
                <div>
                  <div className="relative h-48 bg-slate-100 overflow-hidden">
                    <img 
                      src={resolveNewsImage(article.image_path)} 
                      alt={article.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(article.published_at)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        <span>{article.author}</span>
                      </span>
                    </div>
                    <h3 className="text-base font-extrabold text-slate-950 leading-snug group-hover:text-[#002B66] transition-colors text-left line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-3 text-left">
                      {article.summary}
                    </p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-2">
                  <div className="w-full py-2 bg-slate-50 hover:bg-[#002B66]/5 text-[#002B66] border border-slate-200 group-hover:border-[#002B66]/30 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1">
                    <span>Read Full Article</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default NewsList;

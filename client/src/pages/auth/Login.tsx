import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import Logo from "../../assets/logo.jpg";
import { PATHS } from "../../routes/paths";
import { Spinner } from "../../components/ui/spinner";
import { notify } from "../../util/notify";
import { AuthService } from "../../services/Authservices";
import ReCAPTCHA from "react-google-recaptcha";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaToken ) { // (!recaptchaToken && import.meta.env.MODE !== 'development') add this code after !recaptchaToken
      notify.warning("Verification Required", "Please complete the CAPTCHA to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await AuthService.login({
        email,
        password,
        recaptcha_token: recaptchaToken // || "debug" // use that code if want to use without captcha
      });

      notify.success("Welcome Back!", `Successfully signed in as ${data.user.name}`);
      navigate(PATHS.APP.DASHBOARD);
    } catch (err) {
      // Error notification is automatically handled by ApiHandler inside AuthService
      // Reset reCAPTCHA on error
      setRecaptchaToken(null);
      recaptchaRef.current?.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const onRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token);
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Logo and Brand Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center border-4 border-primary/10 overflow-hidden">
              <img src={Logo} alt="PEDIPO Logo" className="w-20 h-20 rounded-full" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">PEDIPO Capiz</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase tracking-wider text-xs">ECONOMIC DASHBOARD</p>
        </div>

        {/* Login Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-foreground">Welcome Back</h2>
              <p className="text-sm text-muted-foreground mt-1">Please enter your credentials to access the dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 bg-muted/50 border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* reCAPTCHA Widget */}
              <div className="flex justify-center py-2">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                  onChange={onRecaptchaChange}
                  theme="light"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <Spinner className="size-5 border-primary-foreground/30 border-t-primary-foreground" />
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="px-8 py-4 bg-muted/30 border-t border-border text-center">
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              Authorized Personnel Only. This system is monitored for security purposes.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-muted-foreground text-[10px] mt-8 uppercase tracking-widest">
          &copy; 2026 PEDIPO - CAPIZ
        </p>
      </div>
    </div>
  );
};

export default Login;

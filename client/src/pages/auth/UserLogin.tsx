import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";
import Logo from "../../assets/logo.jpg";
import { PATHS } from "../../routes/paths";
import { Spinner } from "../../components/ui/spinner";
import { notify } from "../../util/notify";
import { UserServices } from "../../services/UserServices";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ReCAPTCHA from "react-google-recaptcha";

const UserLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!recaptchaToken) {
      notify.warning("Verification Required", "Please complete the CAPTCHA to continue.");
      return;
    }

    setIsLoading(true);

    try {
      const data = await UserServices.login({
        email,
        password,
        recaptcha_token: recaptchaToken
      });
      notify.success("Welcome Back!", `Successfully signed in as ${data.user.fullname}`);
      navigate(PATHS.PORTAL.DASHBOARD);
    } catch (err) {
      // Error notification is automatically handled by ApiHandler
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
          <h1 className="text-3xl font-bold text-primary tracking-tight">User Portal</h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase tracking-wider text-xs">PEDIPO CAPIZ</p>
        </div>

        {/* Login Card using Shadcn */}
        <Card className="shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500 rounded-2xl border-border">
          <CardHeader className="p-8 pb-0">
            <CardTitle className="text-xl font-semibold text-foreground">Sign In</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Please enter your portal account details to access your data
            </CardDescription>
          </CardHeader>

          <CardContent className="p-8 pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground ml-1">Email Address</Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-10 h-12 rounded-xl bg-muted/50 focus-visible:ring-primary/20 transition-all border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-sm font-medium text-foreground">Password</Label>
                  <a href="#" className="text-xs font-semibold text-primary hover:underline">Forgot password?</a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors z-10" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-12 h-12 rounded-xl bg-muted/50 focus-visible:ring-primary/20 transition-all border-border"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 z-10"
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Spinner className="size-5 border-primary-foreground/30 border-t-primary-foreground" />
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    Login to Portal
                  </>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="px-8 py-4 bg-muted/30 border-t border-border text-center flex justify-center">
            <p className="text-[10px] text-muted-foreground leading-relaxed uppercase tracking-tighter">
              Authorized Access Only &copy; 2026 PEDIPO - CAPIZ
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default UserLogin;

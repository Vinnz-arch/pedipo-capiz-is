
import { 
  User, 
  LayoutDashboard, 
  FileText, 
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import ClientMainLayout from "@/components/client-portal/ClientMainLayout";
import { notify } from "../util/notify";

const UserDashboard = () => {
  const clientUser = JSON.parse(localStorage.getItem("client_user") || "{}");

  const handleDownloadReport = () => {
    notify.info("Preparing Report", "Your monthly economic summary is being generated.");
    setTimeout(() => {
      notify.success("Download Ready", "The report has been prepared for your review.");
    }, 2000);
  };

  return (
    <ClientMainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <section>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back, {clientUser.fullname?.split(' ')[0]}!</h2>
          <p className="text-muted-foreground mt-1">Here's what's happening with your economic profile today.</p>
        </section>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <User size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">User ID</p>
                  <h3 className="text-xl font-bold text-foreground mt-0.5">#{clientUser.id}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <LayoutDashboard size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Username</p>
                  <h3 className="text-xl font-bold text-foreground mt-0.5">@{clientUser.username}</h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center text-primary">
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold uppercase">
                    {clientUser.role}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account Status</p>
                  <h3 className="text-lg font-bold text-foreground mt-0.5 truncate">Verified</h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Info Card */}
        <Card className="border-border shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border">
            <CardTitle className="text-lg">Account Information</CardTitle>
            <CardDescription>Full details of your registered user profile</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Full Name</Label>
                  <p className="text-lg font-semibold text-foreground mt-1">{clientUser.fullname}</p>
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</Label>
                  <p className="text-lg font-semibold text-foreground mt-1">{clientUser.email}</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Registered Role</Label>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs py-1 px-3 border-primary/20 text-primary capitalize">
                      {clientUser.role}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last Sync</Label>
                  <p className="text-lg font-semibold text-foreground mt-1">Just now</p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-4 bg-accent rounded-xl border border-primary/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">View Latest Report</p>
                  <p className="text-xs text-muted-foreground">Download your monthly economic summary</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="bg-card" onClick={handleDownloadReport}>
                Download PDF
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </ClientMainLayout>
  );
};

export default UserDashboard;

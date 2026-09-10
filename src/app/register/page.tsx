import Link from "next/link";
import { Shield, UserPlus, Wrench, Building2, School } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function RegisterHubPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md shadow-primary/20">
              <span className="text-white font-bold text-sm">CC</span>
            </div>
            <span className="font-bold text-foreground text-xl tracking-tight">Co-opConnect</span>
          </Link>
          <h1 className="text-3xl font-black tracking-tight mb-2">Create an Account</h1>
          <p className="text-muted-foreground">Select how you want to join Co-opConnect</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/customer/register" className="block group">
            <Card className="h-full hover:border-primary transition-colors hover:bg-primary/5 cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <UserPlus className="w-6 h-6" />
                </div>
                <CardTitle>Personal Customer</CardTitle>
                <CardDescription>Book domestic services for your home</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/worker/register" className="block group">
            <Card className="h-full hover:border-primary transition-colors hover:bg-primary/5 cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  <Wrench className="w-6 h-6" />
                </div>
                <CardTitle>Cooperative Worker</CardTitle>
                <CardDescription>Join a cooperative and find reliable work</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/society/register" className="block group">
            <Card className="h-full hover:border-primary transition-colors hover:bg-primary/5 cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Building2 className="w-6 h-6" />
                </div>
                <CardTitle>Housing Society</CardTitle>
                <CardDescription>Register your society for bulk maintenance & services</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/institution/register" className="block group">
            <Card className="h-full hover:border-primary transition-colors hover:bg-primary/5 cursor-pointer">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-4 text-teal-500 group-hover:bg-teal-500 group-hover:text-white transition-colors">
                  <School className="w-6 h-6" />
                </div>
                <CardTitle>Institution / School</CardTitle>
                <CardDescription>Register your institution for dedicated maintenance contracts</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary hover:underline font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

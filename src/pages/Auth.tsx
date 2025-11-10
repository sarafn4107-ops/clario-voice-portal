// src/pages/Auth.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MicLogo } from "@/components/MicLogo";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const MIN_PASSWORD_LEN = 6;

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // ✅ Ensure there's a profile row for the current auth user
  const ensureProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();
    if (!data) {
      await supabase.from("profiles").insert({
        id: user.id,
        email: user.email,
        product_verified: false,
        onboarding_completed: false,
        credit_score: 0,
        streak: 0,
        league: "bronze",
      });
    }
  };

  // ✅ Route user to correct page after login
  const routeAfterLogin = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth", { replace: true });
      return;
    }
    const { data: p } = await supabase
      .from("profiles")
      .select("product_verified,onboarding_completed")
      .eq("id", user.id)
      .maybeSingle();

    if (!p || !p.product_verified) {
      navigate("/verification", { replace: true });
      return;
    }
    if (!p.onboarding_completed) {
      navigate("/profile-setup", { replace: true });
      return;
    }
    navigate("/profile", { replace: true });
  };

  // ✅ Check for active session
  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log("hasSession:", !!session, "uid:", session?.user?.id);
    })();
  }, []);

  // ✅ Redirect if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await ensureProfile();
        await routeAfterLogin();
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await ensureProfile();
        await routeAfterLogin();
      }
    });
    return () => subscription.unsubscribe();
  }, []); // eslint-disable-line

  // ✅ Sign in function
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    console.log("SIGN IN RESULT:", { data, error });
    if (error) {
      if (error.message?.toLowerCase().includes("email not confirmed")) {
        toast({
          title: "Email not confirmed",
          description: "Check your inbox for the verification link.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }
    await ensureProfile();
    await routeAfterLogin();
  };

  // ✅ Sign up function
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrim = email.trim();

    if (!isEmail(emailTrim)) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email like you@example.com.",
        variant: "destructive",
      });
      return;
    }
    if (password.length < MIN_PASSWORD_LEN) {
      toast({
        title: "Weak password",
        description: `Minimum ${MIN_PASSWORD_LEN} characters.`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: emailTrim,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);

    console.log("SIGN UP RESULT:", { data, error });
    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    if (data.session) {
      await ensureProfile();
      await routeAfterLogin();
      return;
    }

    const identities = (data.user as any)?.identities ?? [];
    if (Array.isArray(identities) && identities.length === 0) {
      toast({
        title: "Account exists",
        description: "This email is already registered. Please sign in instead.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Check your inbox",
      description: "We sent a verification link to finish sign up.",
    });
  };

  // ✅ Render UI
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <AnimatedBackground />
      <Card className="w-full max-w-md card-glow relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <MicLogo size={48} />
          </div>
          <CardTitle className="text-3xl font-bold gradient-text">
            Welcome to Clario
          </CardTitle>
          <CardDescription>Sign in to Clario Voice Studio</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            {/* --- Sign In Tab --- */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign In
                </Button>
              </form>
            </TabsContent>

            {/* --- Sign Up Tab --- */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={MIN_PASSWORD_LEN}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Sign Up
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

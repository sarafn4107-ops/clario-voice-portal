import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MicLogo } from "@/components/MicLogo";
import { Mic, Shield, Trophy, Zap, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function About() {
  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <MicLogo size={64} className="animate-float" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">Clario Voice Studio</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Next-generation AI voice development platform for speaking, singing, and expression
          </p>
        </motion.div>

        {/* What is Clario */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Mic className="text-primary" />
              What is Clario Voice Studio?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Clario Voice Studio is a cutting-edge AI-powered platform designed to help you develop and refine your voice.
              Whether you're training for professional speaking, improving singing skills, or enhancing everyday communication,
              Clario provides advanced speech analysis and adaptive AI feedback.
            </p>
            <p>
              Our platform uses sophisticated machine learning algorithms to analyze your voice across multiple dimensions:
              pronunciation accuracy, clarity, pitch control, breath management, articulation, and consistency.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="text-accent" />
                How It Helps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Weekly insights and improvement tracking</p>
              <p>• Real-time voice analysis and feedback</p>
              <p>• Personalized training recommendations</p>
              <p>• Goal setting and progress visualization</p>
              <p>• Engaging UI with gamification elements</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="text-secondary" />
                Data & Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Securely stored voice data for progress analytics</p>
              <p>• End-to-end encryption for all recordings</p>
              <p>• Anonymized aggregates to improve AI models</p>
              <p>• Complete control over your data</p>
              <p>• No sensitive information disclosure</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="text-primary" />
                Gamification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Credit-score-like performance metric</p>
              <p>• Daily streaks and consistency tracking</p>
              <p>• Achievement badges and milestones</p>
              <p>• League system (Bronze → Diamond)</p>
              <p>• Rewards for completing challenges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="text-accent" />
                The Team
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Built by:</p>
              <p>• Sanskar - Lead Developer & Creator</p>
              <p>• NIhit - UX Designer & Co-creator</p>
              <p>• Nimit - Marketing lead & Co-creator</p>
            </CardContent>
          </Card>
        </div>

        {/* Future Vision */}
        <Card className="card-glow border-primary">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">Future Vision: Clario Mic</CardTitle>
            <CardDescription>The next evolution in voice training</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We're transitioning Clario into a dedicated smart microphone called <span className="font-semibold text-foreground">"Clario Mic"</span>.
              This revolutionary device will feature:
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>On-device AI analysis for instant, low-latency feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Real-time feedback lights indicating pronunciation and clarity</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Seamless sync with the Clario Voice Studio app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Professional-grade audio quality for recordings</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Portable design for training anywhere, anytime</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div> {/* ← this was missing */}
    </AppLayout>
  );
}

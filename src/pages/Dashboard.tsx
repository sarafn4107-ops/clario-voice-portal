import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { TrendingUp, Award, Calendar, Target } from "lucide-react";

// Mock data for demonstration
const weeklyWPMData = [
  { day: "Mon", wpm: 120 },
  { day: "Tue", wpm: 130 },
  { day: "Wed", wpm: 125 },
  { day: "Thu", wpm: 140 },
  { day: "Fri", wpm: 145 },
  { day: "Sat", wpm: 150 },
  { day: "Sun", wpm: 155 },
];

const weeklyPerformanceData = [
  { day: "Mon", clarity: 75, pronunciation: 70 },
  { day: "Tue", clarity: 78, pronunciation: 72 },
  { day: "Wed", clarity: 80, pronunciation: 75 },
  { day: "Thu", clarity: 82, pronunciation: 78 },
  { day: "Fri", clarity: 85, pronunciation: 80 },
  { day: "Sat", clarity: 87, pronunciation: 82 },
  { day: "Sun", clarity: 90, pronunciation: 85 },
];

const radarData = [
  { metric: "Pronunciation", value: 85 },
  { metric: "Clarity", value: 90 },
  { metric: "Pitch Control", value: 75 },
  { metric: "Breath", value: 80 },
  { metric: "Articulation", value: 88 },
  { metric: "Consistency", value: 82 },
];

const dailyRingsData = [
  { name: "Pronunciation", current: 85, target: 90, color: "hsl(188 100% 50%)" },
  { name: "Clarity", current: 90, target: 95, color: "hsl(280 80% 60%)" },
  { name: "Consistency", current: 82, target: 85, color: "hsl(330 100% 60%)" },
];

function ProgressRing({ name, current, target, color }: { name: string; current: number; target: number; color: string }) {
  const percentage = (current / target) * 100;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <motion.div
      className="flex flex-col items-center gap-2"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative">
        <svg width="100" height="100" className="transform -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth="8"
            fill="none"
          />
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{current}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">Goal: {target}%</p>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-muted-foreground">Track your voice training progress</p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="text-primary" size={16} />
                Best Day
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Sunday</div>
              <p className="text-xs text-muted-foreground">155 WPM average</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="text-accent" size={16} />
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7 days</div>
              <p className="text-xs text-muted-foreground">Keep it up!</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="text-secondary" size={16} />
                League
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="text-sm">Bronze</Badge>
              <p className="text-xs text-muted-foreground mt-1">300 pts to Silver</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="text-primary" size={16} />
                Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3/5</div>
              <p className="text-xs text-muted-foreground">Active goals</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Words Per Minute</CardTitle>
              <CardDescription>Your speaking speed this week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyWPMData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))" 
                    }} 
                  />
                  <Line type="monotone" dataKey="wpm" stroke="hsl(188 100% 50%)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Clarity and Pronunciation trends</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))" 
                    }} 
                  />
                  <Legend />
                  <Line type="monotone" dataKey="clarity" stroke="hsl(280 80% 60%)" strokeWidth={3} name="Clarity %" />
                  <Line type="monotone" dataKey="pronunciation" stroke="hsl(330 100% 60%)" strokeWidth={3} name="Pronunciation %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Radar Chart */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Overall Performance</CardTitle>
            <CardDescription>Your voice training metrics overview</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="metric" stroke="hsl(var(--foreground))" />
                <PolarRadiusAxis stroke="hsl(var(--muted-foreground))" />
                <Radar name="Performance" dataKey="value" stroke="hsl(188 100% 50%)" fill="hsl(188 100% 50%)" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Progress Rings */}
        <Card className="card-glow">
          <CardHeader>
            <CardTitle>Daily Progress</CardTitle>
            <CardDescription>Your progress towards today's goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-around items-center py-4">
              {dailyRingsData.map((ring) => (
                <ProgressRing key={ring.name} {...ring} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Goal Setting */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Goals</CardTitle>
            <CardDescription>Set your training targets for this week</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Pronunciation Target: 90%</span>
                <span className="text-muted-foreground">Current: 85%</span>
              </div>
              <Progress value={94} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Clarity Target: 95%</span>
                <span className="text-muted-foreground">Current: 90%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Daily Practice: 30 minutes</span>
                <span className="text-muted-foreground">Today: 25 min</span>
              </div>
              <Progress value={83} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

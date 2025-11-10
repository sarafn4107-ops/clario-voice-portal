import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, Clock, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// ✅ Initial mock data
const initialGoals = [
  {
    id: 1,
    name: "Pronunciation Mastery",
    metric: "Pronunciation",
    current: 85,
    target: 90,
    deadline: "2025-11-15",
    challengeMode: true,
  },
  {
    id: 2,
    name: "Crystal Clear Speech",
    metric: "Clarity",
    current: 90,
    target: 95,
    deadline: "2025-11-20",
    challengeMode: false,
  },
  {
    id: 3,
    name: "Consistent Practice",
    metric: "Daily Minutes",
    current: 25,
    target: 30,
    deadline: "2025-11-10",
    challengeMode: true,
  },
];

export default function Goals() {
  const [goals, setGoals] = useState(initialGoals);
  const [showForm, setShowForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: "",
    metric: "",
    current: "",
    target: "",
    deadline: "",
    challengeMode: false,
  });
  const { toast } = useToast();

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // ✅ Add new goal handler
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, metric, current, target, deadline, challengeMode } = newGoal;

    if (!name || !metric || !deadline) {
      toast({ title: "Missing info", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }

    const currNum = Number(current);
    const targNum = Number(target);
    if (isNaN(currNum) || isNaN(targNum) || targNum <= currNum) {
      toast({ title: "Invalid values", description: "Target must be greater than current.", variant: "destructive" });
      return;
    }

    const newEntry = {
      id: goals.length + 1,
      name,
      metric,
      current: currNum,
      target: targNum,
      deadline,
      challengeMode,
    };

    setGoals([...goals, newEntry]);
    setShowForm(false);
    setNewGoal({
      name: "",
      metric: "",
      current: "",
      target: "",
      deadline: "",
      challengeMode: false,
    });
    toast({ title: "Goal added", description: `${name} has been added successfully.` });
  };

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Target Goals</h1>
            <p className="text-muted-foreground">Track and create your vocal improvement objectives</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2">
            <PlusCircle size={18} /> {showForm ? "Cancel" : "Add Goal"}
          </Button>
        </div>

        {/* Add Goal Form */}
        {showForm && (
          <Card className="p-6 border-accent/30 shadow-lg animate-in fade-in slide-in-from-top-4">
            <form onSubmit={handleAddGoal} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>Goal Name</Label>
                <Input
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  placeholder="e.g. Improve Clarity"
                  required
                />
              </div>
              <div>
                <Label>Metric</Label>
                <Input
                  value={newGoal.metric}
                  onChange={(e) => setNewGoal({ ...newGoal, metric: e.target.value })}
                  placeholder="e.g. Pronunciation"
                  required
                />
              </div>
              <div>
                <Label>Current</Label>
                <Input
                  type="number"
                  value={newGoal.current}
                  onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Target</Label>
                <Input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  required
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={newGoal.challengeMode}
                    onChange={(e) => setNewGoal({ ...newGoal, challengeMode: e.target.checked })}
                  />
                  Challenge Mode
                </label>
              </div>
              <div className="col-span-full flex justify-end">
                <Button type="submit" className="mt-2">Add</Button>
              </div>
            </form>
          </Card>
        )}

        {/* Goals Grid */}
        <div className="grid grid-cols-1 gap-6">
          {goals.map((goal) => {
            const progress = getProgressPercentage(goal.current, goal.target);
            const daysRemaining = getDaysRemaining(goal.deadline);
            const isCompleted = goal.current >= goal.target;

            return (
              <Card key={goal.id} className={`card-glow transition-all ${isCompleted ? "border-primary" : ""}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {isCompleted ? (
                        <CheckCircle2 className="text-primary mt-1" size={24} />
                      ) : (
                        <Target className="text-accent mt-1" size={24} />
                      )}
                      <div>
                        <CardTitle className="text-xl">{goal.name}</CardTitle>
                        <CardDescription>{goal.metric}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {goal.challengeMode && (
                        <Badge variant="secondary" className="text-xs">Challenge</Badge>
                      )}
                      {isCompleted && (
                        <Badge className="text-xs bg-primary">Completed</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-semibold">
                        {goal.current} / {goal.target}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3" />
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock size={16} />
                    <span>
                      {daysRemaining > 0
                        ? `${daysRemaining} days remaining`
                        : daysRemaining === 0
                        ? "Due today"
                        : `${Math.abs(daysRemaining)} days overdue`}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

// Mock history data
const sessions = [
  {
    id: 1,
    date: "2025-11-07",
    duration: 30,
    clarity: 90,
    pronunciation: 85,
  },
  {
    id: 2,
    date: "2025-11-06",
    duration: 25,
    clarity: 88,
    pronunciation: 83,
  },
  {
    id: 3,
    date: "2025-11-05",
    duration: 35,
    clarity: 87,
    pronunciation: 82,
  },
  {
    id: 4,
    date: "2025-11-04",
    duration: 20,
    clarity: 85,
    pronunciation: 80,
  },
  {
    id: 5,
    date: "2025-11-03",
    duration: 40,
    clarity: 82,
    pronunciation: 78,
  },
];

export default function History() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric", 
      year: "numeric" 
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-primary";
    if (score >= 80) return "text-secondary";
    if (score >= 70) return "text-accent";
    return "text-muted-foreground";
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Training History</h1>
          <p className="text-muted-foreground">Review your past training sessions</p>
        </div>

        <Card className="card-glow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="text-primary" size={20} />
              Session History
            </CardTitle>
            <CardDescription>All your voice training sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Clarity %</TableHead>
                  <TableHead>Pronunciation %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
  {sessions.map((session) => (
    <TableRow key={session.id} className="hover:bg-muted/50">
      <TableCell className="font-medium">
        {formatDate(session.date)}
      </TableCell>

      <TableCell>{session.duration} min</TableCell>

      <TableCell>
        <span className={`font-semibold ${getScoreColor(session.clarity)}`}>
          {session.clarity}%
        </span>
      </TableCell>

      <TableCell>
        <span className={`font-semibold ${getScoreColor(session.pronunciation)}`}>
          {session.pronunciation}%
        </span>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

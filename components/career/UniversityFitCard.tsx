import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
import { CurriculumMapResult } from "@/lib/career/curriculum-mapper";

interface UniversityFitCardProps {
  universityName: string;
  programName: string;
  mappingResults: CurriculumMapResult[];
}

export function UniversityFitCard({ universityName, programName, mappingResults }: UniversityFitCardProps) {
  const metCount = mappingResults.filter(r => r.isMet).length;
  const totalCount = mappingResults.length;
  const isFullyMet = metCount === totalCount;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{universityName}</CardTitle>
            <CardDescription>{programName}</CardDescription>
          </div>
          <Badge variant={isFullyMet ? "default" : "secondary"}>
            {metCount}/{totalCount} Requirements Met
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mappingResults.map((req, index) => (
            <div key={index} className="flex flex-col gap-2 p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="font-medium flex items-center gap-2">
                  {req.isMet ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  {req.category}
                </div>
                <div className="text-sm text-muted-foreground">
                  {req.completedCredits} / {req.requiredCredits} Credits
                </div>
              </div>
              
              {req.matchedSubjects.length > 0 ? (
                <div className="text-xs text-muted-foreground">
                  Matches: {req.matchedSubjects.join(', ')}
                </div>
              ) : (
                <div className="text-xs text-red-400">
                  No matching subjects found in your curriculum.
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

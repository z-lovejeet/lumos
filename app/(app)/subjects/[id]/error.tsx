'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container flex items-center justify-center min-h-[400px]">
      <Card className="border-destructive/50 bg-destructive/10 w-full max-w-lg mt-8">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Something went wrong
          </CardTitle>
          <CardDescription className="text-destructive/80">
            An unexpected error occurred while loading this subject.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm bg-background p-4 rounded-md overflow-auto text-muted-foreground border">
            <code>{error.message || 'Unknown error'}</code>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => reset()} className="w-full">
            Try Again
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

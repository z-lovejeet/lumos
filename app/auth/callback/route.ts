import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createClient } from '@/lib/supabase/server'
import prisma from '@/lib/prisma'
import defaultGradeScale from '@/data/default-grade-scale.json'
import defaultMarkingSchemes from '@/data/default-marking-schemes.json'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && user) {
      // Sync user to Prisma database and seed defaults if they don't exist
      const existingUser = await prisma.user.findUnique({
        where: { id: user.id }
      })

      if (!existingUser) {
        // Create user in our database
        await prisma.user.create({
          data: {
            id: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email?.split('@')[0],
          }
        })

        // Seed default Grade Scale
        await prisma.gradeScale.create({
          data: {
            userId: user.id,
            name: 'Standard 10-Point Scale',
            grades: defaultGradeScale,
            isActive: true,
          }
        })

        // Seed default Marking Schemes
        const schemes = defaultMarkingSchemes.map(scheme => ({
          userId: user.id,
          name: scheme.name,
          components: scheme.components,
          isDefault: scheme.isDefault,
        }))
        await prisma.markingScheme.createMany({
          data: schemes
        })
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalhost = process.env.NODE_ENV === 'development'
      if (isLocalhost) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`)
}

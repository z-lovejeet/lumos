This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
### 1. Database & Authentication Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Obtain your `DATABASE_URL` and `DIRECT_URL` from the database settings and add them to `.env.local`
3. Obtain your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` and add them to `.env.local`
4. Run migrations: `npx prisma db push` (Requires DIRECT_URL)
5. Seed database: `npm run db:seed`

### 2. Configure OAuth Providers (Google & GitHub)
You must enable Auth providers in your Supabase Dashboard:
1. Go to **Authentication > Providers** in Supabase.
2. Enable **Email** (turn off confirm email if testing locally).
3. Enable **Google** and provide your Google OAuth Client ID and Secret (from Google Cloud Console).
4. Enable **GitHub** and provide your GitHub OAuth Client ID and Secret (from GitHub Developer Settings).
5. Ensure the Callback URL (`Site URL`) in Supabase Authentication -> URL Configuration is set to your production or localhost URL.

### 3. Start Development Server file.
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

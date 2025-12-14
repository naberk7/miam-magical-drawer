# MIAM Magical Drawer 🎄

A festive Secret Santa / musical note exchange app built with Next.js and Supabase.

## 🚀 Deployment Instructions

### Step 1: Set up Supabase Database

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project or create a new one
3. Go to **SQL Editor** and run this query:

```sql
-- Create the drawer_data table
CREATE TABLE drawer_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  participants JSONB DEFAULT '[]'::jsonb,
  phase TEXT DEFAULT 'registration',
  deadline TIMESTAMPTZ,
  assignments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE drawer_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is a single-user app)
CREATE POLICY "Enable all access for drawer_data" ON drawer_data
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

4. Go to **Settings** → **API**
5. Copy your:
   - Project URL
   - `anon` `public` key

### Step 2: Push to GitHub

1. Create a new repository on GitHub (e.g., `miam-magical-drawer`)
2. In your project folder, run:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/miam-magical-drawer.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: **Next.js**
   - Root Directory: `./`
5. Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Your Supabase anon/public key
6. Click **Deploy**

That's it! Your app will be live at `https://your-project.vercel.app` 🎉

## 🔧 Local Development

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## 📋 Features

- ✅ Participant registration with floating names
- ✅ Admin panel (password: 776110)
- ✅ Countdown timer to deadline
- ✅ Automatic draw when deadline expires
- ✅ Manual draw option
- ✅ Confetti celebration
- ✅ Supabase backend for data persistence
- 📧 Email notifications (coming soon)

## 🎄 Admin Access

Password: `776110`

Admin can:
- Set/change/remove deadline
- View all participants
- Edit participant emails
- Delete participants
- Perform manual draw
- View assignments
- Reset for testing

## 🛠 Tech Stack

- Next.js 14
- React 18
- Tailwind CSS
- Supabase
- Lucide React Icons

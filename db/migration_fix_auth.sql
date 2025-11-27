-- Fix Users table to support Custom Telegram Auth (bypassing Supabase Auth for now)

-- 1. Drop the foreign key constraint to auth.users
alter table public.users drop constraint if exists users_id_fkey;

-- 2. Change ID column type to TEXT (to store Telegram ID as string)
-- We need to drop dependent foreign keys first
alter table public.predictions drop constraint if exists predictions_user_id_fkey;
alter table public.comments drop constraint if exists comments_user_id_fkey;
alter table public.likes drop constraint if exists likes_user_id_fkey;

-- Now alter the columns
alter table public.users alter column id type text;
alter table public.predictions alter column user_id type text;
alter table public.comments alter column user_id type text;
alter table public.likes alter column user_id type text;

-- Re-add foreign keys pointing to public.users
alter table public.predictions add constraint predictions_user_id_fkey foreign key (user_id) references public.users(id);
alter table public.comments add constraint comments_user_id_fkey foreign key (user_id) references public.users(id);
alter table public.likes add constraint likes_user_id_fkey foreign key (user_id) references public.users(id);

-- Update RLS policies to allow public access (since we manage auth in app)
-- Or better: Allow anyone to insert/update for now, we will secure via app logic
drop policy if exists "Users can insert their own profile." on users;
create policy "Enable insert for authenticated users via app" on users for insert with check (true);

drop policy if exists "Users can update own profile." on users;
create policy "Enable update for authenticated users via app" on users for update using (true);

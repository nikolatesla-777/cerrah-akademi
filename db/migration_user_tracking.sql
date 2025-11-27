-- Add tracking columns to users table
alter table public.users 
add column if not exists last_seen_at timestamp with time zone default timezone('utc'::text, now()),
add column if not exists login_count int default 0,
add column if not exists rank text default 'Çaylak';

-- Update RLS policies if needed (existing ones should cover updates if user matches auth.uid)
-- But since we might want Admin to update other users, we need a policy for that.

-- Policy for Admins to update any user (assuming we have a way to identify admins)
-- For now, let's allow users to update their own metadata, and we'll handle Admin checks in the app logic or via a specific admin role check.
-- A simple way for now:
create policy "Admins can update all users"
  on users for update
  using ( 
    exists (
      select 1 from users 
      where id = auth.uid() and role = 'Admin'
    )
  );

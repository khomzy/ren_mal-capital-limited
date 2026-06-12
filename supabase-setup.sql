-- Run this in your Supabase SQL Editor to create the storage bucket and table used by the loan form.
-- This creates one bucket per document category so images can go to their own storage location.

create extension if not exists pgcrypto;

create table if not exists public.loan_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text,
  phone text,
  email text,
  national_id text,
  address text,
  occupation text,
  employer text,
  monthly_income numeric,
  loan_amount numeric,
  repayment_period text,
  loan_purpose text,
  collateral text,
  collateral_value numeric,
  guarantor_name text,
  guarantor_phone text,
  guarantor_relationship text,
  business_name text,
  business_type text,
  years_in_business integer,
  employees integer,
  business_address text,
  owner_name text,
  monthly_revenue numeric,
  monthly_expenses numeric,
  guarantor_occupation text,
  form_type text,
  form_data jsonb default '{}'::jsonb,
  document_urls jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

alter table public.loan_applications
  add column if not exists business_name text,
  add column if not exists business_type text,
  add column if not exists years_in_business integer,
  add column if not exists employees integer,
  add column if not exists business_address text,
  add column if not exists owner_name text,
  add column if not exists monthly_revenue numeric,
  add column if not exists monthly_expenses numeric,
  add column if not exists guarantor_occupation text,
  add column if not exists form_type text,
  add column if not exists form_data jsonb default '{}'::jsonb;

alter table public.loan_applications enable row level security;

-- Drop existing policies first if they exist, then recreate them.
DROP POLICY IF EXISTS loan_applications_insert_policy ON public.loan_applications;
DROP POLICY IF EXISTS loan_applications_select_policy ON public.loan_applications;
DROP POLICY IF EXISTS loan_documents_insert_policy ON storage.objects;
DROP POLICY IF EXISTS loan_documents_select_policy ON storage.objects;

create policy loan_applications_insert_policy
  on public.loan_applications
  for insert
  to anon
  with check (true);

create policy loan_applications_select_policy
  on public.loan_applications
  for select
  to anon
  using (true);

-- Storage buckets are private for security. Files are accessed with signed URLs.
insert into storage.buckets (id, name, public)
values
  ('applicant-photos', 'applicant-photos', false),
  ('national-id-documents', 'national-id-documents', false),
  ('utility-documents', 'utility-documents', false),
  ('collateral-documents', 'collateral-documents', false),
  ('owner-photos', 'owner-photos', false),
  ('business-licences', 'business-licences', false)
on conflict (id) do nothing;

create policy loan_documents_insert_policy
  on storage.objects
  for insert
  to anon
  with check (bucket_id in ('applicant-photos','national-id-documents','utility-documents','collateral-documents','owner-photos','business-licences'));

create policy loan_documents_select_policy
  on storage.objects
  for select
  to anon
  using (bucket_id in ('applicant-photos','national-id-documents','utility-documents','collateral-documents','owner-photos','business-licences'));

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public can submit messages)
CREATE POLICY "Allow anon insert to contact_messages"
    ON public.contact_messages
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Allow anon and authenticated to read and modify
CREATE POLICY "Allow anon read of contact_messages"
    ON public.contact_messages
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow anon update of contact_messages"
    ON public.contact_messages
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow anon delete of contact_messages"
    ON public.contact_messages
    FOR DELETE
    TO anon, authenticated
    USING (true);

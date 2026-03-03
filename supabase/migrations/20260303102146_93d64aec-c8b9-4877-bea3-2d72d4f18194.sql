-- Drop the constraint first
ALTER TABLE public.tickets DROP CONSTRAINT tickets_status_check;

-- Update existing English-status rows to Portuguese
UPDATE public.tickets SET status = 'pendente' WHERE status = 'open';
UPDATE public.tickets SET status = 'em_tratamento' WHERE status = 'in_progress';
UPDATE public.tickets SET status = 'aguardar' WHERE status = 'waiting';
UPDATE public.tickets SET status = 'resolvido' WHERE status = 'resolved';
UPDATE public.tickets SET status = 'concluido' WHERE status = 'closed';

-- Add new constraint with Portuguese values
ALTER TABLE public.tickets ADD CONSTRAINT tickets_status_check CHECK (status = ANY (ARRAY['pendente', 'em_tratamento', 'aguardar', 'resolvido', 'concluido']));
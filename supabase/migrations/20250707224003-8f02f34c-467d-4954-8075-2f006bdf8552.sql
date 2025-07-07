-- Add missing DELETE RLS policy for vouchers table
CREATE POLICY "Users can delete their own vouchers" 
ON public.vouchers 
FOR DELETE 
USING (user_id = auth.uid());
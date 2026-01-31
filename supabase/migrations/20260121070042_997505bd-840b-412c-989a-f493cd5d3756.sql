-- Drop the deprecated questions_public view since we use the function now
DROP VIEW IF EXISTS public.questions_public;

-- Add explicit deny policies for non-admin modifications on user_roles
CREATE POLICY "Deny insert for non-admins"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny update for non-admins"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Deny delete for non-admins"
ON public.user_roles
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
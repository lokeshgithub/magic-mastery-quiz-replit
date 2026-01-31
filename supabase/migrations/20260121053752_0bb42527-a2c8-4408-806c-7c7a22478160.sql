-- Allow public insert on subjects (admin uploads)
CREATE POLICY "Allow public insert on subjects"
ON public.subjects
FOR INSERT
WITH CHECK (true);

-- Allow public insert on topics (admin uploads)
CREATE POLICY "Allow public insert on topics"
ON public.topics
FOR INSERT
WITH CHECK (true);

-- Allow public insert on questions (admin uploads)
CREATE POLICY "Allow public insert on questions"
ON public.questions
FOR INSERT
WITH CHECK (true);
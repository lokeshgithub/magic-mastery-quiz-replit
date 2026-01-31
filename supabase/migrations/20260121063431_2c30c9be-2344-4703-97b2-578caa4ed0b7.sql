-- Add length constraints on questions table for data integrity
ALTER TABLE public.questions 
ADD CONSTRAINT question_text_length CHECK (length(question) <= 2000);

ALTER TABLE public.questions 
ADD CONSTRAINT option_a_length CHECK (length(option_a) <= 500);

ALTER TABLE public.questions 
ADD CONSTRAINT option_b_length CHECK (length(option_b) <= 500);

ALTER TABLE public.questions 
ADD CONSTRAINT option_c_length CHECK (length(option_c) <= 500);

ALTER TABLE public.questions 
ADD CONSTRAINT option_d_length CHECK (length(option_d) <= 500);

ALTER TABLE public.questions 
ADD CONSTRAINT explanation_length CHECK (explanation IS NULL OR length(explanation) <= 5000);

-- Add length constraints on subjects table
ALTER TABLE public.subjects 
ADD CONSTRAINT subject_name_length CHECK (length(name) <= 100);

-- Add length constraints on topics table
ALTER TABLE public.topics 
ADD CONSTRAINT topic_name_length CHECK (length(name) <= 200);
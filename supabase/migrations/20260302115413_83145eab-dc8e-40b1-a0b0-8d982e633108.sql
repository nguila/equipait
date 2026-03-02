-- Add explicit authentication requirement for all sensitive tables
-- Note: These are PERMISSIVE policies that work alongside existing RESTRICTIVE ones.
-- Since existing policies are RESTRICTIVE and use auth.uid(), anon access is already blocked,
-- but these make it explicit.

-- tickets
CREATE POLICY "Require auth for tickets"
  ON tickets FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- documents
CREATE POLICY "Require auth for documents"
  ON documents FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- services
CREATE POLICY "Require auth for services"
  ON services FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- projects
CREATE POLICY "Require auth for projects"
  ON projects FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- attachments
CREATE POLICY "Require auth for attachments"
  ON attachments FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ticket_comments
CREATE POLICY "Require auth for ticket_comments"
  ON ticket_comments FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);
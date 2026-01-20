import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

export interface SMSTemplate {
  id?: string
  name: string
  message: string
  category: string
  created_at?: string
  updated_at?: string
}

// Get all custom templates from database
export async function getCustomTemplates(): Promise<SMSTemplate[]> {
  const { data, error } = await supabase
    .from('sms_message_templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Save a new template to database
export async function saveTemplate(template: Omit<SMSTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<SMSTemplate> {
  const { data, error } = await supabase
    .from('sms_message_templates')
    .insert(template)
    .select()
    .single()

  if (error) throw error
  return data
}

// Update an existing template
export async function updateTemplate(id: string, updates: Partial<SMSTemplate>): Promise<SMSTemplate> {
  const { data, error } = await supabase
    .from('sms_message_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// Delete a template
export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('sms_message_templates')
    .delete()
    .eq('id', id)

  if (error) throw error
}

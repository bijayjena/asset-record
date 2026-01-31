import { supabase } from '@/integrations/supabase/client';
import type { Gadget, Attachment, AISuggestion, GadgetCategory, GadgetCondition, AttachmentType } from '@/types/gadget';

// Gadgets CRUD
export const fetchGadgets = async (): Promise<Gadget[]> => {
  const { data, error } = await supabase
    .from('gadgets')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as Gadget[];
};

export const fetchGadgetById = async (id: string): Promise<Gadget | null> => {
  const { data, error } = await supabase
    .from('gadgets')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as Gadget;
};

export const searchGadgetImage = async (name: string, brand: string, category: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('search-gadget-image', {
      body: { name, brand, category }
    });
    
    if (error) {
      console.error('Error searching for gadget image:', error);
      return null;
    }
    
    return data?.imageUrl || null;
  } catch (err) {
    console.error('Failed to search gadget image:', err);
    return null;
  }
};

export const uploadGadgetImage = async (
  gadgetId: string,
  file: File,
  userId: string
): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `${userId}/gadget-images/${gadgetId}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('gadget-attachments')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  const { data: urlData } = supabase.storage
    .from('gadget-attachments')
    .getPublicUrl(filePath);
  
  return urlData.publicUrl;
};

export const deleteGadgetImage = async (imageUrl: string): Promise<void> => {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.indexOf('gadget-attachments');
    if (bucketIndex !== -1) {
      const filePath = pathParts.slice(bucketIndex + 1).join('/');
      await supabase.storage
        .from('gadget-attachments')
        .remove([filePath]);
    }
  } catch (err) {
    console.error('Failed to delete gadget image:', err);
  }
};

export const createGadget = async (gadget: Omit<Gadget, 'id' | 'created_at' | 'updated_at'>): Promise<Gadget> => {
  const { data, error } = await supabase
    .from('gadgets')
    .insert(gadget)
    .select()
    .single();
  
  if (error) throw error;
  return data as Gadget;
};

export const updateGadget = async (id: string, updates: Partial<Gadget>): Promise<Gadget> => {
  const { data, error } = await supabase
    .from('gadgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Gadget;
};

export const deleteGadget = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('gadgets')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Attachments
export const fetchAttachments = async (gadgetId: string): Promise<Attachment[]> => {
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('gadget_id', gadgetId)
    .order('uploaded_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as Attachment[];
};

export const uploadAttachment = async (
  gadgetId: string,
  file: File,
  type: AttachmentType,
  userId: string
): Promise<Attachment> => {
  // Upload file to storage
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
  const filePath = `${userId}/${gadgetId}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('gadget-attachments')
    .upload(filePath, file);
  
  if (uploadError) throw uploadError;
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('gadget-attachments')
    .getPublicUrl(filePath);
  
  // Create attachment record
  const { data, error } = await supabase
    .from('attachments')
    .insert({
      gadget_id: gadgetId,
      type,
      file_url: urlData.publicUrl,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Attachment;
};

export const deleteAttachment = async (attachment: Attachment, userId: string): Promise<void> => {
  // Extract file path from URL
  const url = new URL(attachment.file_url);
  const pathParts = url.pathname.split('/');
  const bucketIndex = pathParts.indexOf('gadget-attachments');
  if (bucketIndex !== -1) {
    const filePath = pathParts.slice(bucketIndex + 1).join('/');
    
    // Delete from storage
    await supabase.storage
      .from('gadget-attachments')
      .remove([filePath]);
  }
  
  // Delete record
  const { error } = await supabase
    .from('attachments')
    .delete()
    .eq('id', attachment.id);
  
  if (error) throw error;
};

// AI Suggestions
export const fetchAISuggestion = async (gadgetId: string): Promise<AISuggestion | null> => {
  const { data, error } = await supabase
    .from('ai_suggestions')
    .select('*')
    .eq('gadget_id', gadgetId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as unknown as AISuggestion;
};

export const saveAISuggestion = async (gadgetId: string, responseJson: object): Promise<AISuggestion> => {
  // Delete old suggestions for this gadget
  await supabase
    .from('ai_suggestions')
    .delete()
    .eq('gadget_id', gadgetId);
  
  // Insert new suggestion
  const { data, error } = await supabase
    .from('ai_suggestions')
    .insert({
      gadget_id: gadgetId,
      response_json: responseJson,
    } as any)
    .select()
    .single();
  
  if (error) throw error;
  return data as unknown as AISuggestion;
};

// Seed demo data for new users
export const seedDemoGadgets = async (userId: string): Promise<void> => {
  const demoGadgets = [
    {
      user_id: userId,
      name: 'iPhone 13',
      category: 'phone' as GadgetCategory,
      brand: 'Apple',
      model: 'A2482',
      purchase_date: '2022-09-15',
      price_paid: 799,
      vendor_name: 'Apple Store',
      warranty_expiry: '2024-09-15',
      condition: 'good' as GadgetCondition,
      notes: 'Primary phone, 128GB storage',
    },
    {
      user_id: userId,
      name: 'MacBook Pro 14"',
      category: 'laptop' as GadgetCategory,
      brand: 'Apple',
      model: 'M1 Pro',
      purchase_date: '2022-01-20',
      price_paid: 1999,
      vendor_name: 'Apple Store',
      warranty_expiry: '2025-01-20',
      condition: 'excellent' as GadgetCondition,
      notes: 'Work laptop, 16GB RAM, 512GB SSD',
    },
    {
      user_id: userId,
      name: 'AirPods Pro 2',
      category: 'headphones' as GadgetCategory,
      brand: 'Apple',
      model: 'MQD83AM/A',
      purchase_date: '2023-06-10',
      price_paid: 249,
      vendor_name: 'Best Buy',
      warranty_expiry: '2024-06-10',
      condition: 'excellent' as GadgetCondition,
      notes: 'Daily use for calls and music',
    },
  ];
  
  const { error } = await supabase
    .from('gadgets')
    .insert(demoGadgets);
  
  if (error) console.error('Error seeding demo gadgets:', error);
};

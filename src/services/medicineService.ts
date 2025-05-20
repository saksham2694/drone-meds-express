
import { supabase } from '@/integrations/supabase/client';
import { Medicine } from '@/types';

// Get all medicines from Supabase
export const getAllMedicines = async (): Promise<Medicine[]> => {
  const { data, error } = await supabase
    .from('medicines')
    .select('*');

  if (error) {
    console.error('Error fetching medicines:', error);
    throw error;
  }

  // Map the data from Supabase to our Medicine type
  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.image_url,
    category: item.category
  }));
};

// Get medicine by ID from Supabase
export const getMedicineById = async (id: string): Promise<Medicine | undefined> => {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching medicine:', error);
    return undefined;
  }

  if (!data) return undefined;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.image_url,
    category: data.category
  };
};

// Get medicines by category from Supabase
export const getMedicinesByCategory = async (category: string): Promise<Medicine[]> => {
  const { data, error } = await supabase
    .from('medicines')
    .select('*')
    .eq('category', category);

  if (error) {
    console.error('Error fetching medicines by category:', error);
    throw error;
  }

  return data.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.image_url,
    category: item.category
  }));
};

// Get all categories from Supabase
export const getAllCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('medicines')
    .select('category');

  if (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }

  // Extract unique categories
  return Array.from(new Set(data.map(item => item.category)));
};

// Admin functions
export const addMedicine = async (medicine: Omit<Medicine, 'id'>): Promise<Medicine> => {
  const { data, error } = await supabase
    .from('medicines')
    .insert({
      name: medicine.name,
      description: medicine.description,
      price: medicine.price,
      image_url: medicine.imageUrl,
      category: medicine.category
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding medicine:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.image_url,
    category: data.category
  };
};

export const updateMedicine = async (medicine: Medicine): Promise<Medicine> => {
  const { data, error } = await supabase
    .from('medicines')
    .update({
      name: medicine.name,
      description: medicine.description,
      price: medicine.price,
      image_url: medicine.imageUrl,
      category: medicine.category
    })
    .eq('id', medicine.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating medicine:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    price: data.price,
    imageUrl: data.image_url,
    category: data.category
  };
};

export const deleteMedicine = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('medicines')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting medicine:', error);
    throw error;
  }
};

// Check if user is admin
export const checkIsAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .eq('role', 'admin');

  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return data && data.length > 0;
};

// Make user an admin (first user only)
export const makeUserAdmin = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: 'admin'
      });

    return !error;
  } catch (error) {
    console.error('Error making user admin:', error);
    return false;
  }
};

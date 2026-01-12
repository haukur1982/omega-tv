import { supabase } from './supabase';
import { Database } from '@/types/supabase';

export type Testimonial = Database['public']['Tables']['testimonials']['Row'];

export async function getTestimonials() {
    const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function getAllTestimonials() {
    const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

export async function createTestimonial(testimonial: { name: string; email?: string; content: string }) {
    const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function approveTestimonial(id: string) {
    const { error } = await supabase
        .from('testimonials')
        .update({ is_approved: true })
        .eq('id', id);

    if (error) throw error;
    return true;
}

export async function deleteTestimonial(id: string) {
    const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

    if (error) throw error;
    return true;
}

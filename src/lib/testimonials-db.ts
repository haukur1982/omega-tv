import { supabase, supabaseAdmin } from './supabase';
import { Database } from '@/types/supabase';

export type Testimonial = Database['public']['Tables']['testimonials']['Row'];

/**
 * Get approved testimonials (public-facing)
 */
export async function getTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch testimonials:', error);
        return [];
    }
    return data || [];
}

/**
 * Submit a new testimonial (public — uses public client, RLS-safe)
 */
export async function createTestimonial(testimonial: { name: string; email?: string; content: string }): Promise<Testimonial | null> {
    const { data, error } = await supabase
        .from('testimonials')
        .insert(testimonial)
        .select()
        .single();

    if (error) {
        console.error('Failed to create testimonial:', error);
        return null;
    }
    return data;
}

// ===== ADMIN OPERATIONS (use supabaseAdmin to bypass RLS) =====

/**
 * Get ALL testimonials including unapproved (admin dashboard)
 */
export async function getAllTestimonials(): Promise<Testimonial[]> {
    const { data, error } = await supabaseAdmin
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch all testimonials:', error);
        return [];
    }
    return data || [];
}

/**
 * Approve a testimonial (admin action)
 */
export async function approveTestimonial(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('testimonials')
        .update({ is_approved: true })
        .eq('id', id);

    if (error) {
        console.error('Failed to approve testimonial:', error);
        return false;
    }
    return true;
}

/**
 * Delete a testimonial (admin action)
 */
export async function deleteTestimonial(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('testimonials')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Failed to delete testimonial:', error);
        return false;
    }
    return true;
}

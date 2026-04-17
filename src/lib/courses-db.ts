import { supabase, supabaseAdmin } from './supabase';
import { Database } from '@/types/supabase';

export type Course = Database['public']['Tables']['courses']['Row'];
export type CourseInsert = Database['public']['Tables']['courses']['Insert'];
export type CourseUpdate = Database['public']['Tables']['courses']['Update'];
export type CourseModule = Database['public']['Tables']['course_modules']['Row'];
export type CourseLesson = Database['public']['Tables']['course_lessons']['Row'];
export type UserLessonProgress = Database['public']['Tables']['user_lesson_progress']['Row'];

// ===== PUBLIC QUERIES =====

/**
 * Get all published courses (public-facing)
 */
export async function getAllCourses() {
    const { data, error } = await supabase
        .from('courses')
        .select(`
            *,
            course_modules ( count )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch courses:', error);
        return [];
    }
    return data || [];
}

/**
 * Get a single course by slug with full module/lesson tree (public-facing)
 */
export async function getCourseBySlug(slug: string) {
    const { data, error } = await supabase
        .from('courses')
        .select(`
            *,
            course_modules (
                *,
                course_lessons ( * )
            )
        `)
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Failed to fetch course:', error);
        return null;
    }

    // Sort modules and lessons by their order numbers
    if (data?.course_modules) {
        data.course_modules.sort((a: CourseModule, b: CourseModule) => a.module_number - b.module_number);
        data.course_modules.forEach((mod: CourseModule & { course_lessons?: CourseLesson[] }) => {
            if (mod.course_lessons) {
                mod.course_lessons.sort((a: CourseLesson, b: CourseLesson) => a.lesson_number - b.lesson_number);
            }
        });
    }

    return data;
}

// ===== USER PROGRESS =====

/**
 * Get completed lesson IDs for a user
 */
export async function getUserProgress(userId: string, courseId: string): Promise<string[]> {
    const { data, error } = await supabase
        .from('user_lesson_progress')
        .select('lesson_id')
        .eq('user_id', userId);

    if (error) {
        console.error('Failed to fetch user progress:', error);
        return [];
    }
    return data.map(p => p.lesson_id);
}

/**
 * Mark a lesson as complete for a user
 */
export async function markLessonComplete(userId: string, lessonId: string): Promise<UserLessonProgress | null> {
    const { data, error } = await supabase
        .from('user_lesson_progress')
        .insert({
            user_id: userId,
            lesson_id: lessonId,
            completed_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Failed to mark lesson complete:', error);
        return null;
    }
    return data;
}

// ===== ADMIN OPERATIONS (use supabaseAdmin to bypass RLS) =====

/**
 * Get ALL courses including drafts (admin dashboard)
 */
export async function getAllCoursesAdmin(): Promise<Course[]> {
    const { data, error } = await supabaseAdmin
        .from('courses')
        .select(`
            *,
            course_modules ( count )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Failed to fetch all courses:', error);
        return [];
    }
    return data || [];
}

/**
 * Create a new course (admin action)
 */
export async function createCourse(course: CourseInsert): Promise<Course | null> {
    const { data, error } = await supabaseAdmin
        .from('courses')
        .insert(course)
        .select()
        .single();

    if (error) {
        console.error('Failed to create course:', error);
        return null;
    }
    return data;
}

/**
 * Update a course (admin action)
 */
export async function updateCourse(id: string, updates: CourseUpdate): Promise<Course | null> {
    const { data, error } = await supabaseAdmin
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Failed to update course:', error);
        return null;
    }
    return data;
}

/**
 * Delete a course (admin action)
 */
export async function deleteCourse(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
        .from('courses')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Failed to delete course:', error);
        return false;
    }
    return true;
}

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    // Allows to automatically instantiate createClient with right options
    // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
    __InternalSupabase: {
        PostgrestVersion: "14.1"
    }
    public: {
        Tables: {
            episodes: {
                Row: {
                    bunny_video_id: string
                    created_at: string | null
                    description: string | null
                    duration: number | null
                    episode_number: number
                    id: string
                    published_at: string | null
                    season_id: string
                    series_id: string
                    thumbnail_custom: string | null
                    title: string
                }
                Insert: {
                    bunny_video_id: string
                    created_at?: string | null
                    description?: string | null
                    duration?: number | null
                    episode_number: number
                    id?: string
                    published_at?: string | null
                    season_id: string
                    series_id: string
                    thumbnail_custom?: string | null
                    title: string
                }
                Update: {
                    bunny_video_id?: string
                    created_at?: string | null
                    description?: string | null
                    duration?: number | null
                    episode_number?: number
                    id?: string
                    published_at?: string | null
                    season_id?: string
                    series_id?: string
                    thumbnail_custom?: string | null
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "episodes_season_id_fkey"
                        columns: ["season_id"]
                        isOneToOne: false
                        referencedRelation: "seasons"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "episodes_series_id_fkey"
                        columns: ["series_id"]
                        isOneToOne: false
                        referencedRelation: "series"
                        referencedColumns: ["id"]
                    },
                ]
            }
            seasons: {
                Row: {
                    created_at: string | null
                    id: string
                    published_at: string | null
                    season_number: number
                    series_id: string
                    title: string | null
                }
                Insert: {
                    created_at?: string | null
                    id?: string
                    published_at?: string | null
                    season_number: number
                    series_id: string
                    title?: string | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    published_at?: string | null
                    season_number?: number
                    series_id?: string
                    title?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "seasons_series_id_fkey"
                        columns: ["series_id"]
                        isOneToOne: false
                        referencedRelation: "series"
                        referencedColumns: ["id"]
                    },
                ]
            }
            series: {
                Row: {
                    created_at: string | null
                    description: string | null
                    host: string | null
                    id: string
                    poster_horizontal: string | null
                    poster_vertical: string | null
                    slug: string
                    status: string | null
                    title: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    host?: string | null
                    id?: string
                    poster_horizontal?: string | null
                    poster_vertical?: string | null
                    slug: string
                    status?: string | null
                    title: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    host?: string | null
                    id?: string
                    poster_horizontal?: string | null
                    poster_vertical?: string | null
                    slug?: string
                    status?: string | null
                    title?: string
                }
                Relationships: []
            }
            newsletters: {
                Row: {
                    id: string
                    title: string
                    author: string
                    content: string
                    published_at: string
                    is_published: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    author: string
                    content: string
                    published_at?: string
                    is_published?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    author?: string
                    content?: string
                    published_at?: string
                    is_published?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            subscribers: {
                Row: {
                    id: string
                    email: string
                    name: string | null
                    tags: string[] | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    email: string
                    name?: string | null
                    tags?: string[] | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string | null
                    tags?: string[] | null
                    created_at?: string
                }
                Relationships: []
            }
            prayers: {
                Row: {
                    id: string
                    name: string
                    email: string | null
                    topic: string
                    content: string
                    category_type: string
                    campaign_id: string | null
                    pray_count: number
                    is_approved: boolean
                    is_answered: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email?: string | null
                    topic: string
                    content: string
                    category_type?: string
                    campaign_id?: string | null
                    pray_count?: number
                    is_approved?: boolean
                    is_answered?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string | null
                    topic?: string
                    content?: string
                    category_type?: string
                    campaign_id?: string | null
                    pray_count?: number
                    is_approved?: boolean
                    is_answered?: boolean
                    created_at?: string
                }
                Relationships: []
            }
            prayer_campaigns: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    image_url: string | null
                    start_date: string
                    end_date: string
                    is_active: boolean
                    pray_count: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    image_url?: string | null
                    start_date: string
                    end_date: string
                    is_active?: boolean
                    pray_count?: number
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    image_url?: string | null
                    start_date?: string
                    end_date?: string
                    is_active?: boolean
                    pray_count?: number
                }
                Relationships: []
            }
            quotes: {
                Row: { [key: string]: Json | undefined }
                Insert: { [key: string]: Json | undefined }
                Update: { [key: string]: Json | undefined }
                Relationships: []
            }
            testimonials: {
                Row: {
                    id: string
                    name: string
                    email: string | null
                    content: string
                    is_approved: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    email?: string | null
                    content: string
                    is_approved?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    email?: string | null
                    content?: string
                    is_approved?: boolean
                    created_at?: string
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

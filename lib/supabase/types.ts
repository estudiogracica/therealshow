// Este archivo se puede regenerar automáticamente con:
// npx supabase gen types typescript --project-id TU-PROYECTO > lib/supabase/types.ts
//
// Por ahora definimos manualmente los tipos principales para tener
// autocompletado mientras avanzamos fase a fase.

export type PlayerRole = "admin" | "player";
export type MatchStatus = "pendiente" | "finalizado";
export type TeamColor = "color" | "blanco";

// Fila calculada por la vista player_ratings (Carta FUT)
export interface PlayerRatingRow {
  player_id: string;
  full_name: string;
  nickname: string | null;
  avatar_url: string | null;
  matches_played: number;
  wins: number;
  losses: number;
  draws: number;
  goals: number;
  assists: number;
  goal_contributions: number;
  goals_per_match: number;
  assists_per_match: number;
  ritmo: number;
  pase: number;
  tiro: number;
  defensa: number;
  fisico: number;
  vision: number;
  media_general: number;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          nickname: string | null;
          avatar_url: string | null;
          role: PlayerRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          nickname?: string | null;
          avatar_url?: string | null;
          role?: PlayerRole;
          created_at?: string;
        };
        Update: {
          full_name?: string;
          nickname?: string | null;
          avatar_url?: string | null;
          role?: PlayerRole;
        };
        Relationships: [];
      };
      seasons: {
        Row: {
          id: string;
          name: string;
          start_date: string | null;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          start_date?: string | null;
          end_date?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          match_date: string;
          match_time: string;
          location: string;
          status: MatchStatus;
          result_color: number | null;
          result_blanco: number | null;
          season_id: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_date: string;
          match_time: string;
          location: string;
          status?: MatchStatus;
          result_color?: number | null;
          result_blanco?: number | null;
          season_id: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          match_date?: string;
          match_time?: string;
          location?: string;
          status?: MatchStatus;
          result_color?: number | null;
          result_blanco?: number | null;
          season_id?: string;
        };
        Relationships: [];
      };
      match_players: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          team: TeamColor;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          team: TeamColor;
        };
        Update: {
          team?: TeamColor;
        };
        Relationships: [];
      };
      goals: {
        Row: {
          id: string;
          match_id: string;
          player_id: string;
          assist_player_id: string | null;
          team: TeamColor;
          minute: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          player_id: string;
          assist_player_id?: string | null;
          team: TeamColor;
          minute?: number | null;
          created_at?: string;
        };
        Update: {
          player_id?: string;
          assist_player_id?: string | null;
          team?: TeamColor;
          minute?: number | null;
        };
        Relationships: [];
      };
    };
    Views: {
      player_stats: {
        Row: Omit<PlayerRatingRow, "ritmo" | "pase" | "tiro" | "defensa" | "fisico" | "vision" | "media_general">;
        Relationships: [];
      };
      player_ratings: {
        Row: PlayerRatingRow;
        Relationships: [];
      };
      player_season_stats: {
        Row: Omit<PlayerRatingRow, "ritmo" | "pase" | "tiro" | "defensa" | "fisico" | "vision" | "media_general"> & {
          season_id: string;
        };
        Relationships: [];
      };
      player_season_ratings: {
        Row: PlayerRatingRow & { season_id: string };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

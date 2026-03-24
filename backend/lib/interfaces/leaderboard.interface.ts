export interface TriesHistogramEntry {
    attempts: number;
    count: number;
}
export interface StreakLeaderboardEntry {
    id: string;
    username: string;
    lifetime_streak: number | null;
    equipped_avatar_url: string | null;
}

export interface PointsLeaderboardEntry {
    id: string;
    username: string;
    lifetime_points: number | null;
    equipped_avatar_url: string | null;
}
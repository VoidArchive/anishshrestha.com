// Multiplayer utility functions for Bagchal Reforged

/**
 * Generate a unique ID using timestamp and random components
 */
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
}

/**
 * Generate a human-readable room code
 */
export function generateRoomCode(): string {
  const adjectives = [
    'BRAVE', 'SWIFT', 'CLEVER', 'MIGHTY', 'WILD', 'BOLD', 'FIERCE', 'SHARP',
    'QUICK', 'STRONG', 'WISE', 'AGILE', 'ROYAL', 'NOBLE', 'PROUD'
  ];
  
  const animals = [
    'TIGER', 'GOAT', 'EAGLE', 'WOLF', 'BEAR', 'LION', 'HAWK', 'FOX',
    'DEER', 'BULL', 'CROW', 'OWL', 'SNAKE', 'HORSE', 'DRAGON'
  ];
  
  const numbers = Math.floor(Math.random() * 999) + 1;
  
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const animal = animals[Math.floor(Math.random() * animals.length)];
  
  return `${adj}-${animal}-${numbers.toString().padStart(3, '0')}`;
}

/**
 * Validate room code format
 */
export function isValidRoomCode(roomCode: string): boolean {
  // Format: ADJECTIVE-ANIMAL-XXX (where XXX is 3 digits)
  const pattern = /^[A-Z]+-[A-Z]+-\d{3}$/;
  return pattern.test(roomCode);
}

/**
 * Generate player name if not provided
 */
export function generatePlayerName(prefix: string = 'Player'): string {
  const randomNum = Math.floor(Math.random() * 9999) + 1;
  return `${prefix}${randomNum.toString().padStart(4, '0')}`;
}

/**
 * Calculate time remaining for room expiration
 */
export function getTimeRemaining(expiresAt: number): {
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} {
  const total = expiresAt - Date.now();
  
  if (total <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
  
  const hours = Math.floor(total / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);
  
  return { hours, minutes, seconds, total };
}

/**
 * Format time remaining as a human-readable string
 */
export function formatTimeRemaining(expiresAt: number): string {
  const { hours, minutes, seconds, total } = getTimeRemaining(expiresAt);
  
  if (total <= 0) {
    return 'Expired';
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s remaining`;
  } else {
    return `${seconds}s remaining`;
  }
}

/**
 * Clean expired rooms from database (utility for cleanup jobs)
 */
export async function cleanupExpiredRooms(db: any): Promise<number> {
  const now = Date.now();
  
  const result = await db.prepare(`
    UPDATE game_rooms 
    SET status = 'ABANDONED', updated_at = ?
    WHERE expires_at < ? AND status IN ('WAITING', 'ACTIVE')
  `).bind(now, now).run();
  
  return result.changes || 0;
}

/**
 * Get room statistics
 */
export interface RoomStats {
  totalRooms: number;
  waitingRooms: number;
  activeRooms: number;
  completedRooms: number;
  abandonedRooms: number;
}

export async function getRoomStats(db: any): Promise<RoomStats> {
  const stats = await db.prepare(`
    SELECT 
      COUNT(*) as total_rooms,
      SUM(CASE WHEN status = 'WAITING' THEN 1 ELSE 0 END) as waiting_rooms,
      SUM(CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END) as active_rooms,
      SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END) as completed_rooms,
      SUM(CASE WHEN status = 'ABANDONED' THEN 1 ELSE 0 END) as abandoned_rooms
    FROM game_rooms
    WHERE created_at > ? -- Only count rooms from last 24 hours
  `).bind(Date.now() - (24 * 60 * 60 * 1000)).first();
  
  return {
    totalRooms: stats?.total_rooms || 0,
    waitingRooms: stats?.waiting_rooms || 0,
    activeRooms: stats?.active_rooms || 0,
    completedRooms: stats?.completed_rooms || 0,
    abandonedRooms: stats?.abandoned_rooms || 0
  };
} 
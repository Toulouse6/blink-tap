export type Side = 'left' | 'right';

export interface GameState {
  score: number;
  side: Side | null;
  gameOver: boolean;
  feedback: 'success' | 'tooSoon' | 'tooLate' | 'wrongKey' | '';
  responseTime: number | null;
}

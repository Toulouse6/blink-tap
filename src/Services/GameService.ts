import axios from 'axios';
import { Side } from '../Models/GameModel';
import { RefObject } from 'react';

const API_BASE = 'https://quicktap-backend-219181450324.us-central1.run.app/api';

const GameService = {

    async createUser(username: string): Promise<{ userId: string }> {
        const res = await axios.post(`${API_BASE}/user`, { username });
        return res.data;
    },

    clearTimeouts(ref: RefObject<{ [key: string]: NodeJS.Timeout | null }>) {
        Object.values(ref.current!).forEach(timeout => {
            if (timeout) clearTimeout(timeout);
        });
        ref.current = { display: null, timeout: null, nextRound: null };
    },

    async saveScore(userId: string, score: number): Promise<{ success: boolean }> {
        const res = await axios.post(`${API_BASE}/saveScore`, { userId, score });
        return res.data;
    },

    async sendScoreAndRedirect(
        userId: string,
        score: number,
        username: string,
        navigate: (path: string, options?: any) => void
    ): Promise<void> {
        try {
            const res = await GameService.saveScore(userId, score); // ✅ This now exists
            if (res.success) {
                await GameService.delay(2000);
                navigate('/gameover', { state: { score, username } });
            } else {
                console.error('Score not saved:', res);
            }
        } catch (err) {
            console.error('Error sending score:', err);
        }
    },

    async getLeaderboard() {
        const res = await axios.get(`${API_BASE}/leaderboard`);
        return res.data.leaderboards;
    },

    getRandomSide(): Side {
        return Math.random() < 0.5 ? 'left' : 'right';
    },

    getStoredUser(): { userId: string | null; username: string } {
        return {
            userId: localStorage.getItem('userId'),
            username: localStorage.getItem('username') || '',
        };
    },

    delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

export default GameService;

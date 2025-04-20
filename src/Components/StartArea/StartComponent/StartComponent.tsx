import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import './StartComponent.css';
import GameService from '../../../Services/GameService';

const StartComponent: React.FC = () => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleStart = async () => {
        if (!username.trim()) return;
        setLoading(true);

        try {
            const { userId } = await GameService.createUser(username);
            localStorage.setItem('userId', userId);
            localStorage.setItem('username', username);
            navigate('/game');
        } catch (err) {
            console.error('Error:', err);
            alert('Could not start game. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="start-page">
            <h1 className="start-title">Welcome to BlinkTap</h1>
            <Box className="start-container">
                <div className="input-wrapper">
                    <label className="start-label">Enter your name</label>
                    <TextField
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="start-input"
                        placeholder="Input"
                    />
                </div>
                <Button
                    variant="contained"
                    className="material-button"
                    onClick={handleStart}
                    disabled={loading || !username.trim()}
                >
                    <SendIcon sx={{ marginRight: 1 }} />
                    Start game
                </Button>
            </Box>
        </div>
    );
};

export default StartComponent;

import React, { useState } from 'react';
import { Button } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import LoadingBar from '../../SharedArea/LoadingComponent/LoadingComponent';
import SendIcon from '@mui/icons-material/Send';
import './GameOverComponent.css';
import GameHeader from '../../SharedArea/HeaderComponent/HeaderComponent';

const GameOverPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { score, username } = useLocation().state || {};

    const handleNavigate = (path: string) => {
        setLoading(true);
        setTimeout(() => {
            navigate(path);
            setLoading(false);
        }, 1000);
    };

    return (
        <div className="outer-wrapper">
            <div className="gameover-container">
                <LoadingBar loading={loading} />
                <GameHeader username={username} />
                {!loading && (
                    <>
                        <h1 className="gameover-title">GAME OVER!</h1>
                        <div className="score"><span>Score {score}</span></div>
                        <div className="gameover-buttons">
                            <Button variant="outlined" onClick={() => handleNavigate('/leaderboard')} className="highscore-button">
                                Highscore
                            </Button>
                            <Button variant="contained" onClick={() => handleNavigate('/game')} className="material-button">
                                <SendIcon sx={{ marginRight: 1 }} />Restart game
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default GameOverPage;

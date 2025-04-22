import React from 'react';
import './HeaderComponent.css';
import { GameHeaderProps } from '../../../Models/GameModel';

const storedUsername = localStorage.getItem('username') || 'Player Name';

const HeaderComponent: React.FC<GameHeaderProps> = ({
    username = storedUsername,
    score,
    showScore = true,
    reactionTime,
    feedback
}) => {

    const isCentered = !showScore || typeof score !== 'number';

    return (
        <div className={`game-header ${isCentered ? 'center-content' : ''}`}>
            {/* Username */}
            <span className="header-username">{username}</span>

            {/* Reaction Time on success */}
            {feedback === 'success' && reactionTime !== null && (
                <span className="header-reaction">⚡ {reactionTime}ms</span>
            )}
            {/* Score */}
            {showScore && typeof score === 'number' && (
                <span className="header-score">{score}</span>
            )}
        </div>
    );
};

export default HeaderComponent;

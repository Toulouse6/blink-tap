import React from 'react';
import './HeaderComponent.css';

interface GameHeaderProps {
    username?: string;
    score?: number;
    showScore?: boolean;
}

const HeaderComponent: React.FC<GameHeaderProps> = ({
    username = 'Player Name',
    score,
    showScore = true
}) => {
    const isCentered = !showScore || typeof score !== 'number';

    return (
        <div className={`game-header ${isCentered ? 'center-content' : ''}`}>
            <span className="header-username">{username}</span>
            {showScore && typeof score === 'number' && (
                <span className="header-score">Score {score}</span>
            )}
        </div>
    );
};

export default HeaderComponent;

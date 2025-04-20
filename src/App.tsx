import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartComponent from './Components/StartArea/StartComponent/StartComponent';
import GameComponent from './Components/GameArea/GameComponent/GameComponent';
import LeaderboardComponent from './Components/LeaderboardArea/LeaderboardComponent/LeaderboardComponent';
import GameOverComponent from './Components/GameArea/GameOverComponent/GameOverComponent';

const App: React.FC = () => {
    return (
        <Router basename="/blink-tap">
            <Routes>
                <Route path="/" element={<StartComponent />} />
                <Route path="/game" element={<GameComponent />} />
                <Route path="/gameover" element={<GameOverComponent />} />
                <Route path="/leaderboard" element={<LeaderboardComponent />} />
            </Routes>
        </Router>
    );
};

export default App;

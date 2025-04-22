import React, { useEffect, useRef, useState } from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './GameComponent.css';
import LoadingBar from '../../SharedArea/LoadingComponent/LoadingComponent';
import { Side } from '../../../Models/GameModel';
import GameService from '../../../Services/GameService';
import GameHeader from '../../SharedArea/HeaderComponent/HeaderComponent';
import leftImg from '../../../Assets/blue-target.png';
import rightImg from '../../../Assets/green-target.png';
import leftSuccessImg from '../../../Assets/blue-target-success.png';
import rightSuccessImg from '../../../Assets/green-target-success.png';

// Main Game Component
const GameComponent: React.FC = () => {
    // UI state
    const [score, setScore] = useState(0);
    const [side, setSide] = useState<Side | null>(null);
    const [showSuccessSide, setShowSuccessSide] = useState<Side | null>(null);
    const [feedback, setFeedback] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const [, setResponseTime] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Get stored username
    const { username } = GameService.getStoredUser();

    const navigate = useNavigate();

    // Refs
    const scoreRef = useRef(0);
    const sideRef = useRef<Side | null>(null);
    const isReadyRef = useRef(false);
    const isGameActiveRef = useRef(true);
    const targetDisplayedTimeRef = useRef<number>(0);
    const keypressRegisteredRef = useRef(false);

    // Timeout reference
    const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout | null }>({
        display: null,
        timeout: null,
        nextRound: null
    });

    // Clear Timeouts before starting a new round
    const clearAllTimeouts = () => {
        Object.values(timeoutRefs.current).forEach(timeout => {
            if (timeout) clearTimeout(timeout);
        });
        timeoutRefs.current = { display: null, timeout: null, nextRound: null };
    };

    // Send Score and navigate to Game Over
    const sendScoreAndRedirect = async (score: number) => {
        const { userId, username } = GameService.getStoredUser();
        if (!userId) {
            console.error('No userId found in localStorage');
            return;
        }

        // Set Loading
        setLoading(true);
        try {
            const res = await GameService.saveScore(userId, score);

            if (res.success) {
                // Leave fail note for 2 sec
                await GameService.delay(2000);
                // Redirect
                navigate('/gameover', {
                    state: { score, username },
                });
            } else {
                console.error('Score not saved:', res);
            }
        } catch (err) {
            console.error('Error sending score:', err);
        } finally {
            setLoading(false);
        }
    };

    // Next round set up
    const startNextRound = () => {

        clearAllTimeouts();
        setSide(null);
        setFeedback('');

        isReadyRef.current = false;
        keypressRegisteredRef.current = false;

        // Waiting mode
        if (!isGameActiveRef.current) return;
        const waitTime = Math.random() * 3000 + 2000;

        //   // Show shapes
        timeoutRefs.current.display = setTimeout(() => {

            // Random side
            const randomSide = GameService.getRandomSide();
            setSide(randomSide);
            sideRef.current = randomSide;

            // Display time (1 sec)
            targetDisplayedTimeRef.current = Date.now();
            isReadyRef.current = true;
            keypressRegisteredRef.current = false;

            timeoutRefs.current.timeout = setTimeout(() => {

                // Time is up
                if (isReadyRef.current && isGameActiveRef.current && !keypressRegisteredRef.current) {
                    isReadyRef.current = false;
                    setFeedback('tooLate');
                    setGameOver(true);
                    isGameActiveRef.current = false;
                    sendScoreAndRedirect(scoreRef.current);
                }
            }, 1000);
        }, waitTime);
    };


    // Handle keypresses event
    const handleKeyPress = (e: KeyboardEvent) => {
        const key = e.key.toLowerCase();
        const now = Date.now();
        const currentSide = sideRef.current;
        keypressRegisteredRef.current = true;

        if (!isGameActiveRef.current) return;

        // Too soon
        if (!isReadyRef.current) {
            isGameActiveRef.current = false;
            clearAllTimeouts();
            setFeedback((key === 'a' || key === 'd') ? 'tooSoon' : 'wrongKey');
            setGameOver(true);
            sendScoreAndRedirect(scoreRef.current);
            return;
        }

        // Wrong Side or Too late
        if (!isReadyRef.current || !currentSide) {
            isGameActiveRef.current = false;
            setFeedback('wrongKey');
            setGameOver(true);
            sendScoreAndRedirect(scoreRef.current);
            return;
        }

        // Calculate reaction time
        isReadyRef.current = false;
        keypressRegisteredRef.current = true;
        const reactionTime = now - targetDisplayedTimeRef.current;
        setResponseTime(reactionTime);

        // Successes
        if ((key === 'a' && currentSide === 'left') || (key === 'd' && currentSide === 'right')) {
            setShowSuccessSide(currentSide);
            setTimeout(() => setShowSuccessSide(null), 2000);

            setScore(prev => {
                const newScore = prev + 1;
                scoreRef.current = newScore;
                return newScore;
            });
            setFeedback('success');
            timeoutRefs.current.nextRound = setTimeout(() => startNextRound(), 2000);
        } else {
            // Wrong Key
            isGameActiveRef.current = false;
            setFeedback('wrongKey');
            setGameOver(true);
            sendScoreAndRedirect(scoreRef.current);
        }
    };


    // Set up listeners and start first round
    useEffect(() => {
        const handleKeyPressWrapper = (e: KeyboardEvent) => handleKeyPress(e);
        window.addEventListener('keydown', handleKeyPressWrapper);

        isGameActiveRef.current = true;
        startNextRound();

        return () => {
            window.removeEventListener('keydown', handleKeyPressWrapper);
            clearAllTimeouts();
            isGameActiveRef.current = false;
        };
    }, []);

    // Mobile Taps
    const handleTap = (clickedSide: 'left' | 'right') => {
        const now = Date.now();
        const currentSide = sideRef.current;
    
        if (!isGameActiveRef.current) return;
    
        // Too soon
        if (!isReadyRef.current) {
            keypressRegisteredRef.current = true;
            isGameActiveRef.current = false;
            clearAllTimeouts();
            setFeedback('tooSoon');
            setGameOver(true);
            sendScoreAndRedirect(scoreRef.current);
            return;
        }
    
        // Invalid state
        if (!currentSide) {
            keypressRegisteredRef.current = true;
            isGameActiveRef.current = false;
            setFeedback('wrongKey');
            setGameOver(true);
            sendScoreAndRedirect(scoreRef.current);
            return;
        }
    
        // Reaction time mobile
        isReadyRef.current = false;
        keypressRegisteredRef.current = true;
        const reactionTime = now - targetDisplayedTimeRef.current;
        setResponseTime(reactionTime);
    
        if ((clickedSide === 'left' && currentSide === 'left') || (clickedSide === 'right' && currentSide === 'right')) {
            setShowSuccessSide(currentSide);
            setTimeout(() => setShowSuccessSide(null), 2000);
    
            setScore(prev => {
                const newScore = prev + 1;
                scoreRef.current = newScore;
                return newScore;
            });
    
            setFeedback('success');
            timeoutRefs.current.nextRound = setTimeout(() => startNextRound(), 2000);
        } else {
            isGameActiveRef.current = false;
            setFeedback('wrongKey');
            setGameOver(true);
            sendScoreAndRedirect(scoreRef.current);
        }
    };
    
    // Return
    return (

        <div className="outer-wrapper">
            <div className="game-container">

                <LoadingBar loading={loading} />
                <GameHeader username={username} score={score} />

                {/* Feedback */}
                {feedback && (
                    <Snackbar
                        open={true}
                        autoHideDuration={feedback === 'success' ? 2000 : 4000}
                        onClose={() => {
                            if (!gameOver || feedback === 'success') {
                                setFeedback('');
                            }
                        }}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert
                            severity={
                                feedback === 'success'
                                    ? 'success'
                                    : feedback === 'tooSoon' || feedback === 'tooLate'
                                        ? 'warning'
                                        : 'error'
                            }
                        >
                            {
                                feedback === 'success' ? 'Nice!' :
                                    feedback === 'tooSoon' ? 'Too soon!' :
                                        feedback === 'tooLate' ? 'Too late!' :
                                            feedback === 'wrongKey' ? 'Wrong key!' : ''
                            }
                        </Alert>
                    </Snackbar>
                )}

                {!loading && (

                    <div className="game-box">
                        <div className="shape-zone">
                            {side === 'left' && !gameOver && (
                                <img
                                    src={showSuccessSide === 'left' ? leftSuccessImg : leftImg}
                                    alt="Left Shape"
                                    className="shape-image"
                                    onClick={() => handleTap('left')}
                                />
                            )}

                        </div>
                        <div className="shape-zone">
                            {side === 'right' && !gameOver && (
                                <img
                                    src={showSuccessSide === 'right' ? rightSuccessImg : rightImg}
                                    alt="Right Shape"
                                    className="shape-image"
                                    onClick={() => handleTap('right')}
                                />
                            )}

                        </div>
                    </div>

                )}
            </div>
        </div>
    );
};

export default GameComponent;


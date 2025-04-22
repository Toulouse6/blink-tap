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
    const [reactionTime, setReactionTime] = useState<number | null>(null);
    const [showSuccessSide, setShowSuccessSide] = useState<Side | null>(null);
    const [feedback, setFeedback] = useState('');
    const [gameOver, setGameOver] = useState(false);
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

    const onShapeClick = (side: 'left' | 'right') => (e: React.MouseEvent) => {
        e.stopPropagation();
        handleTap(side);
    };

    // Save score and navigate to Game Over
    const sendScoreAndRedirect = async (score: number) => {
        const { userId, username } = GameService.getStoredUser();
        if (!userId) return;

        setLoading(true);
        await GameService.sendScoreAndRedirect(userId, score, username, navigate);
        setLoading(false);
    };

    // Next round set up
    const startNextRound = () => {

        GameService.clearTimeouts(timeoutRefs);
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

        if (!isGameActiveRef.current) return;

        // Too soon
        if (!isReadyRef.current) {
            isGameActiveRef.current = false;
            GameService.clearTimeouts(timeoutRefs);
            setFeedback('tooSoon');
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

        keypressRegisteredRef.current = true;

        isReadyRef.current = false;
        const reactionTime = now - targetDisplayedTimeRef.current;
        setReactionTime(reactionTime);

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
            GameService.clearTimeouts(timeoutRefs);
            isGameActiveRef.current = false;
        };
    }, []);


    // Mobile Taps
    const handleTap = (clickedSide: 'left' | 'right') => {
        const now = Date.now();
        const currentSide = sideRef.current;

        if (!isGameActiveRef.current || !isReadyRef.current || !currentSide) return;

        // Valid tap received
        keypressRegisteredRef.current = true;
        isReadyRef.current = false;

        const reactionTime = now - targetDisplayedTimeRef.current;
        setReactionTime(reactionTime);

        setShowSuccessSide(currentSide);
        setTimeout(() => setShowSuccessSide(null), 2000);

        setScore(prev => {
            const newScore = prev + 1;
            scoreRef.current = newScore;
            return newScore;
        });

        setFeedback('success');
        timeoutRefs.current.nextRound = setTimeout(() => startNextRound(), 2000);
    };

    // Wrong side tapped
    const handleBackgroundTap = () => {
        if (!isGameActiveRef.current || !isReadyRef.current) return;

        keypressRegisteredRef.current = true;
        isReadyRef.current = false;
        isGameActiveRef.current = false;

        setFeedback('wrongKey');
        setGameOver(true);
        sendScoreAndRedirect(scoreRef.current);
    };

    // Return
    return (

        <div className="outer-wrapper">
            <div className="game-container">

                <LoadingBar loading={loading} />

                <GameHeader
                    username={username}
                    score={score}
                    reactionTime={reactionTime}
                    feedback={feedback}
                />

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
                        style={{ bottom: '10rem' }} 
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

                    <div className="game-box" onClick={handleBackgroundTap}>
                        <div className="shape-zone">
                            {side === 'left' && !gameOver && (
                                <img
                                    src={showSuccessSide === 'left' ? leftSuccessImg : leftImg}
                                    alt="Left Shape"
                                    className="shape-image"
                                    onClick={onShapeClick('left')}
                                />
                            )}
                        </div>
                        <div className="shape-zone">
                            {side === 'right' && !gameOver && (
                                <img
                                    src={showSuccessSide === 'right' ? rightSuccessImg : rightImg}
                                    alt="Right Shape"
                                    className="shape-image"
                                    onClick={onShapeClick('right')}

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


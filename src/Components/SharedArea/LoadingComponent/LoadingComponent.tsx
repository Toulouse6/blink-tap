import React from 'react';
import { LinearProgress } from '@mui/material';
import './LoadingComponent.css';

type Props = {
    loading: boolean;
};

const LoadingBar: React.FC<Props> = ({ loading }) =>
    loading ? (
        <div className="loading-bar">
            <LinearProgress color="secondary" />
        </div>
    ) : null;

export default LoadingBar;

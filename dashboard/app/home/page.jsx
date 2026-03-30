// Dashboard homepage showing high-level stats and overviews
import React from 'react';
import StatsBar from '../../components/StatsBar';

export default function DashboardHomePage() {
    return (
        <div>
            <h2 className="text-2xl mb-4">Overview</h2>
            <StatsBar />
        </div>
    );
}

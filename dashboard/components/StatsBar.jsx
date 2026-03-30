// Component displaying key metrics (e.g., total active alerts)
import React from 'react';

export default function StatsBar() {
    return (
        <div className="flex gap-4">
            <div className="bg-white p-4 rounded shadow flex-1">Total Alerts: 12</div>
            <div className="bg-white p-4 rounded shadow flex-1">High Risk Areas: 3</div>
        </div>
    );
}

// Large, accessible red button for triggering emergency alerts
import React from 'react';

export default function SOSButton() {
    return (
        <button className="bg-red-500 hover:bg-red-600 text-white w-48 h-48 rounded-full text-2xl font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg">
            SOS
        </button>
    );
}

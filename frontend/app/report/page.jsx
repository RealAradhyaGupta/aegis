// Page for users to submit a new safety report or complaint
import React from 'react';
import ReportForm from '../../components/ReportForm';

export default function ReportPage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">File a Report</h1>
            <ReportForm />
        </div>
    );
}

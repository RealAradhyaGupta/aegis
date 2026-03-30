// Page listing all complaints for authority review
import React from 'react';
import ComplaintTable from '../../components/ComplaintTable';

export default function ComplaintsPage() {
    return (
        <div>
            <h2 className="text-2xl mb-4">Recent Complaints</h2>
            <ComplaintTable />
        </div>
    );
}

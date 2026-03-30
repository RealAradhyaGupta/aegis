// Data table for reviewing and managing complaints
import React from 'react';

export default function ComplaintTable() {
    return (
        <table className="w-full bg-white rounded shadow text-left">
            <thead>
                <tr className="border-b"><th className="p-4">ID</th><th className="p-4">Status</th></tr>
            </thead>
            <tbody>
                <tr><td className="p-4">#102</td><td className="p-4 text-red-500">Pending</td></tr>
            </tbody>
        </table>
    );
}

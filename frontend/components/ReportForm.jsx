// Form component for incident reporting
import React from 'react';

export default function ReportForm() {
    return (
        <form className="flex flex-col gap-4">
            <textarea placeholder="Describe the incident..." className="p-2 border rounded" />
            <button type="submit" className="bg-navy-900 text-white p-2 rounded">Submit</button>
        </form>
    );
}

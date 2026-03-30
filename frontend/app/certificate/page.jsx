// Page displaying the user's secure certificate or trust score
import React from 'react';
import Certificate from '../../components/Certificate';

export default function CertificatePage() {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-4">Your Certificates</h1>
            <Certificate />
        </div>
    );
}

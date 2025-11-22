'use client';

import { useAuth } from '@clerk/nextjs';
import { ReactNode, useState } from 'react';
import SignInModal from './SignInModal';

interface AuthGateProps {
    children: ReactNode;
    fallback?: ReactNode;
    onAuthRequired?: () => void;
    modalTitle?: string;
    modalMessage?: string;
}

export default function AuthGate({
    children,
    fallback,
    onAuthRequired,
    modalTitle,
    modalMessage,
}: AuthGateProps) {
    const { isSignedIn, isLoaded } = useAuth();
    const [showModal, setShowModal] = useState(false);

    const handleClick = () => {
        if (!isLoaded) return;

        if (!isSignedIn) {
            setShowModal(true);
            onAuthRequired?.();
            return;
        }

        // User is authenticated, render children
    };

    if (!isLoaded) {
        return fallback || <div>Loading...</div>;
    }

    if (isSignedIn) {
        return <>{children}</>;
    }

    return (
        <>
            <div onClick={handleClick} className="cursor-pointer">
                {fallback || children}
            </div>
            <SignInModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={modalTitle}
                message={modalMessage}
            />
        </>
    );
}

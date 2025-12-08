"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#fff',
                    color: '#363636',
                },
                success: {
                    iconTheme: {
                        primary: 'var(--primary-teal)',
                        secondary: '#fff',
                    },
                },
            }}
        />
    );
}

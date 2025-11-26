"use client";

import { useEffect, useRef } from 'react';

export default function TelegramLogin({ botName = "samplebot", onAuth }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Check if script is already there to prevent duplicates
        if (containerRef.current.querySelector('script')) return;

        const script = document.createElement('script');
        script.src = "https://telegram.org/js/telegram-widget.js?22";
        script.setAttribute('data-telegram-login', botName);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '10');
        script.setAttribute('data-request-access', 'write');
        script.setAttribute('data-userpic', 'false');
        script.async = true;

        // Define the callback function globally
        window.onTelegramAuth = (user) => {
            if (onAuth) {
                onAuth(user);
            }
        };

        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        containerRef.current.appendChild(script);

        return () => {
            // Cleanup global function
            delete window.onTelegramAuth;
        };
    }, [botName, onAuth]);

    return <div ref={containerRef} className="telegram-login-container"></div>;
}

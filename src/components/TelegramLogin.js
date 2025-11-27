import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function TelegramLogin({ botName = "cerrahvip_bot", onAuth }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Check if script is already there
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
        window.onTelegramAuth = async (user) => {
            console.log('Telegram Auth Success:', user);

            // Sync with Supabase
            try {
                const { error } = await supabase
                    .from('users')
                    .upsert({
                        id: user.id.toString(), // Use Telegram ID as User ID
                        telegram_id: user.id,
                        username: user.username,
                        display_name: `${user.first_name} ${user.last_name || ''}`.trim(),
                        last_seen_at: new Date().toISOString(),
                        // login_count will be incremented via RPC or we fetch-then-update. 
                        // For simplicity, let's just update last_seen for now.
                    }, { onConflict: 'id' });

                if (error) {
                    console.error('Supabase Sync Error:', error);
                } else {
                    console.log('User synced to Supabase');
                }
            } catch (err) {
                console.error('Sync failed:', err);
            }

            if (onAuth) {
                onAuth(user);
            }
        };

        script.setAttribute('data-onauth', 'onTelegramAuth(user)');
        containerRef.current.appendChild(script);

        return () => {
            delete window.onTelegramAuth;
        };
    }, [botName, onAuth]);

    return <div ref={containerRef} className="telegram-login-container"></div>;
}

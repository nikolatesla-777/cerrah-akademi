import { supabase } from './supabase';

export const STORAGE_KEY = 'cerrah_predictions';

export const getPredictions = async () => {
    const { data, error } = await supabase
        .from('predictions')
        .select(`
            *,
            users (
                username,
                display_name
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching predictions:', error);
        return [];
    }

    // Flatten the structure for UI
    return data.map(p => ({
        ...p,
        username: p.users?.username,
        displayName: p.users?.display_name
    }));
};

export const savePrediction = async (prediction) => {
    // Ensure user exists or is anonymous (handle auth later properly)
    // For now, we assume the user is managed by the app logic, but Supabase needs a user_id.
    // Since we don't have full Auth integration yet, we might need a workaround or ensure the user is signed in via Supabase Auth.
    // However, the schema requires user_id to be auth.users.id.
    // If we are using custom auth (Telegram), we need to sync it.
    // FOR NOW: We will use a temporary workaround or assume the user is authenticated if we implement Supabase Auth.
    // BUT: The user just provided keys. They probably haven't set up Auth.
    // CRITICAL: The schema uses `references auth.users`. We need to sign in anonymously or use a service role (not safe for client).
    // BETTER: Let's modify the schema to allow text user_ids for now if we can't do full auth, OR implement anonymous auth.

    // Let's try to sign in anonymously first if no user.
    const { data: { session } } = await supabase.auth.getSession();
    let userId = session?.user?.id;

    if (!userId) {
        const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
        if (authError) {
            console.error('Auth error:', authError);
            return null;
        }
        userId = authData.user.id;
    }

    // Insert user profile if not exists
    const { error: userError } = await supabase
        .from('users')
        .upsert({
            id: userId,
            username: prediction.username,
            display_name: prediction.displayName
        }, { onConflict: 'id' });

    if (userError) console.error('User upsert error:', userError);

    const { data, error } = await supabase
        .from('predictions')
        .insert([{
            user_id: userId,
            items: prediction.items,
            total_odds: prediction.totalOdds,
            confidence: prediction.confidence,
            analysis: prediction.analysis,
            status: prediction.status || 'PENDING'
        }])
        .select()
        .single();

    if (error) {
        console.error('Error saving prediction:', error);
        return null;
    }

    window.dispatchEvent(new Event('prediction-updated'));
    return data;
};

export const updatePrediction = async (updatedPrediction) => {
    const { data, error } = await supabase
        .from('predictions')
        .update({
            status: updatedPrediction.status,
            // Add other fields if needed
        })
        .eq('id', updatedPrediction.id)
        .select();

    if (error) {
        console.error('Error updating prediction:', error);
        return null;
    }

    window.dispatchEvent(new Event('prediction-updated'));
    return data;
};

export const syncUser = async (user) => {
    if (!user) return;

    // Use telegram_id as the ID if available, otherwise fallback (though we should have one)
    const userId = user.id ? String(user.id) : user.telegram_id ? String(user.telegram_id) : null;

    if (!userId) return;

    const { error } = await supabase
        .from('users')
        .upsert({
            id: userId,
            username: user.username,
            display_name: user.first_name || user.username,
            last_seen_at: new Date().toISOString()
        }, { onConflict: 'id' });

    if (error) console.error('Error syncing user:', error);
};

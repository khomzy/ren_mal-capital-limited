(function () {
    const projectUrl = 'https://inorxdoginyirqlptbgo.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlub3J4ZG9naW55aXJxbHB0YmdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NjMwNDksImV4cCI6MjA5NzAzOTA0OX0.a_zedSMJXFmmVsituRU-x4BBuEqByY2N5hLirvApnK0';

    window.SUPABASE_PROJECT_URL = projectUrl;
    window.SUPABASE_ANON_KEY = anonKey;

    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.supabaseClient = window.supabase.createClient(projectUrl, anonKey);
    } else {
        console.error('Supabase library was not loaded before supabase-config.js');
    }
})();

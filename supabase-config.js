(function () {
    const projectUrl = 'https://hycgfmdyujfqfbinsuxx.supabase.co';
    const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5Y2dmbWR5dWpmcWZiaW5zdXh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0OTU3MDcsImV4cCI6MjA5ODA3MTcwN30.LDiuzmndSQahE861t2WPmHfTQJ8eIWAcTMNK6jlM1P8';

    window.SUPABASE_PROJECT_URL = projectUrl;
    window.SUPABASE_ANON_KEY = anonKey;

    if (window.supabase && typeof window.supabase.createClient === 'function') {
        window.supabaseClient = window.supabase.createClient(projectUrl, anonKey);
    } else {
        console.error('Supabase library was not loaded before supabase-config.js');
    }
})();

/// <reference types="vite/client" />

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.svg';
declare module '*.glb';
declare module '*.obj';

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
    readonly VITE_AI_SERVER_URL: string;
    readonly VITE_GDRIVE_URL: string;
    readonly VITE_APPSCRIPT_URL: string;
    readonly VITE_APPSCRIPT_DEPLOYMENT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}

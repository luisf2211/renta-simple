/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Keep the Supabase SDK out of the webpack bundle for server routes. This
    // avoids intermittent dev-mode chunk resolution errors
    // ("__webpack_modules__[moduleId] is not a function") from @supabase/*.
    serverComponentsExternalPackages: ["@supabase/supabase-js"],
  },
};

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  transpilePackages: ['@react-pdf/renderer'],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // 기본 1mb에서 5mb로 증가
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'datvqaemqzhgitxxfvar.supabase.co',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

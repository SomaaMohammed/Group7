/** @type {import('next').NextConfig} */
const nextConfig = {
    /* config options here */
    experimental: {
        viewTransition: true,
        serverActions: {
            bodySizeLimit: "26mb",
        },
    },
    reactCompiler: true,
};

export default nextConfig;

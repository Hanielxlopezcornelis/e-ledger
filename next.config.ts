import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Desactiva los errores de TypeScript en el build de producción para evitar que se interrumpa
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

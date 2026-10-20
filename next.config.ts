import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Entrada padrão da movimentação: transferir um bem.
      { source: "/movimentacao", destination: "/movimentacao/transferir", permanent: false },
    ];
  },
};

export default nextConfig;

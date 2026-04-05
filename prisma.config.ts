// prisma.config.ts
import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // aponta para a pasta que contém vários arquivos .prisma
  schema: path.join("backend", "prisma", "schema.prisma"),

  // migrations + seeds
  migrations: {
    path: "backend/prisma/migrations",
    // seed: "node prisma/seed/index.ts", // ajuste conforme seu seed
  },

  // URL do banco (use seu DIRECT_URL para operações que precisam conexão direta)
  datasource: {
    url: env("DIRECT_URL"), // use DATABASE_URL / DIRECT_URL conforme sua necessidade
    // shadowDatabaseUrl: env('SHADOW_DATABASE_URL'), // opcional para migrate
  },

  // se você usa tabelas "externas" (ex.: tabelas do supabase que não quer que migrate gerencie)
  experimental: {
    externalTables: true,
  },

  tables: {
    external: [
      // Ex.: 'auth.users' ou 'public.some_external_table' — mantenha o que não quer que migrate toque
      // 'auth.users',
    ],
  },
});

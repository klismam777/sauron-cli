export interface TechnologySignature {
  name: string;
  deps?: string[];         // Dependências declaradas em package.json
  files?: string[];        // Arquivos físicos marcadores
  regex?: {
    file: string;
    pattern: RegExp;       // Busca de Regex em arquivos específicos (ex: compose.yml)
  };
  wikiTemplate?: string;   // Nome da receita Markdown a ser injetada (em templates/wiki-recipes/)
}

export const TECHNOLOGY_SIGNATURES: TechnologySignature[] = [
  {
    name: 'TypeScript',
    deps: ['typescript', '@types/node'],
    files: ['tsconfig.json'],
    wikiTemplate: 'typescript.rules.md',
  },
  {
    name: 'Next.js',
    deps: ['next'],
    files: ['next.config.js', 'next.config.mjs'],
    wikiTemplate: 'nextjs.rules.md',
  },
  {
    name: 'React',
    deps: ['react', 'react-dom'],
    wikiTemplate: 'react.rules.md',
  },
  {
    name: 'NestJS',
    deps: ['@nestjs/core', '@nestjs/common'],
    files: ['nest-cli.json'],
  },
  {
    name: 'Express',
    deps: ['express', '@types/express'],
  },
  {
    name: 'Prisma ORM',
    deps: ['prisma', '@prisma/client'],
    files: ['prisma/schema.prisma'],
  },
  {
    name: 'PostgreSQL',
    deps: ['pg'],
    regex: {
      file: 'compose.yml',
      pattern: /image:\s*postgres/i,
    },
    wikiTemplate: 'postgresql.rules.md',
  },
  {
    name: 'PostgreSQL (Docker-Compose)',
    regex: {
      file: 'docker-compose.yml',
      pattern: /image:\s*postgres/i,
    },
    wikiTemplate: 'postgresql.rules.md',
  },
  {
    name: 'Tailwind CSS',
    deps: ['tailwindcss'],
    files: ['tailwind.config.js', 'tailwind.config.ts', 'postcss.config.js'],
    wikiTemplate: 'tailwindcss.rules.md',
  },
  {
    name: 'Redis',
    regex: {
      file: 'compose.yml',
      pattern: /image:\s*redis/i,
    },
  },
  {
    name: 'Redis (Docker-Compose)',
    regex: {
      file: 'docker-compose.yml',
      pattern: /image:\s*redis/i,
    },
  }
];

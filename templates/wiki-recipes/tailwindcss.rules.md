# Tailwind CSS - Padrões de Estilização Funcional

Este documento estabelece as regras de escrita e organização para classes utilitárias do Tailwind CSS.

## 🎯 Regras Obrigatórias para a IA

1. **Organização de Classes**:
   - Organize as classes utilitárias na ordem padrão: Layout (display, position), Box Model (width, height, padding, margin), Tipografia (font, text), Design Visual (bg, border, shadow), e Estados Interativos/Responsividade (`sm:`, `hover:`).

2. **Uso de Variáveis de Tema**:
   - Utilize cores e tokens definidos no arquivo de configuração do Tailwind (`tailwind.config.js`). Evite classes arbitrárias pesadas como `bg-[#ff22aa]` diretamente no HTML.

3. **Responsividade Mobile-First**:
   - Desenhe a estrutura móvel como base padrão do componente (sem prefixo) e adicione prefixos como `md:` e `lg:` progressivamente para telas maiores.

## 🚫 Práticas Banidas
- Criação de classes CSS customizadas tradicionais em arquivos separados para resolver problemas que podem ser resolvidos diretamente com classes utilitárias nativas do Tailwind.
- Misturar estilos in-line JavaScript (`style={{ ... }}`) com classes utilitárias do Tailwind.

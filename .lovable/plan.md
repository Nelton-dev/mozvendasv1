## Diagnóstico

O app funciona bem, mas o visual atual segue o "kit padrão" que muitos apps feitos com IA usam:

- Verde esmeralda neutro (`160 84% 39%`) — cor genérica de "marketplace"
- Cards brancos arredondados em grid uniforme — parece template de Shadcn
- Tipografia Plus Jakarta Sans em todos os pesos iguais — sem hierarquia forte
- Gradientes suaves e sombras leves — estética "SaaS limpinho"
- Sem nenhum elemento visual que diga "Moçambique" ou "social commerce"

O resultado é um app que pode ser confundido com qualquer outro marketplace genérico.

## Proposta: identidade "Mercado Vivo"

Inspiração: mercados moçambicanos (Xipamanine, Zimpeto), capulanas, sol intenso, energia urbana de Maputo. Combinado com layout social/editorial moderno (estilo Depop / Vinted / Gumroad), não corporativo.

### 1. Nova paleta — calor + autenticidade

Substituir o verde esmeralda por uma paleta inspirada em capulana:

```text
Light mode:
  bg          warm off-white   #FAF7F2   (em vez de cinza azulado)
  ink         deep charcoal    #1A1614   (texto principal, quase preto quente)
  primary     terracotta       #D94F2A   (laranja-tijolo, da capulana)
  accent      mustard gold     #E8B547   (CTAs secundários, badges)
  support     deep teal        #0F5C5C   (links, verificado, contraste)
  success     leaf green       #4A7C3A
  
Dark mode:
  bg          espresso         #1C1714
  surface     cocoa            #2A211C
  primary     warm coral       #F26B47
  accent      amber            #F4C56A
```

A cor primária terracota é distintiva, calorosa e culturalmente ancorada — não é "verde de marketplace nº 47".

### 2. Tipografia com personalidade

- Manter **Plus Jakarta Sans** para corpo/UI
- Adicionar **Fraunces** (serif display, gratuita no Google Fonts) para títulos de seção, preços grandes e o wordmark "MOZ VENDAS"
- Combinar serif display + sans body é o que dá ar editorial em vez de "dashboard"
- Preços passam a usar Fraunces em itálico no card — vira assinatura visual

### 3. ProductCard — reformular layout

Atual: header vendedor → imagem quadrada → título → preço → barra de ações. Muito "Instagram clonado".

Novo:
- Imagem com **aspect ratio 4:5** (vertical, mais cinematográfico) e cantos `rounded-3xl`
- Preço sobreposto na imagem em badge cremoso com serif: `2.500 MZN`
- Vendedor em rodapé compacto (avatar pequeno + nome + cidade, uma linha só)
- Botão "Comprar via WhatsApp" com ícone do WhatsApp explícito e verde do WhatsApp (`#25D366`) — ação clara, não genérica
- Like/comment em ícones desenhados mais finos (stroke 1.5)
- Sombra trocada por borda fina warm (`1px solid rgba(217,79,42,0.08)`) — mais leve e moderno

### 4. Header / wordmark

- "MOZ VENDAS" em Fraunces, "MOZ" em terracota, "VENDAS" em ink — estilo logo de revista
- Search bar com bordas arredondadas pill, fundo creme em vez de cinza
- Ícones com peso visual mais consistente

### 5. CategoryNav

- Pills com fundo creme + ícone colorido por categoria (laranja/mostarda/teal alternando)
- Ativo: pill terracota sólida com leve sombra interna
- Adicionar uma sutil linha divisória inferior em padrão geométrico (3 traços curtos) inspirada em motivos de capulana — detalhe sutil mas único

### 6. StoriesBar

- Anel do story em **gradiente terracota → mostarda** (em vez do cinza atual)
- Storyboard horizontal com leve fade nas bordas
- Próprio story com selo `+` em accent mustard

### 7. BottomNav

- Botão central "Anunciar" como círculo terracota com leve sombra colorida (não preta)
- Item ativo com pequeno ponto mostarda abaixo do ícone em vez de só mudar cor
- Fundo levemente translúcido warm

### 8. Detalhes que tiram a "cara de IA"

- **Microcopy mais humano**: "Nenhum produto ainda" → "Aqui ainda está vazio. Seja o primeiro a abrir banca."
- **Empty states ilustrados** com ícone grande monocromático em terracota, não o ícone genérico cinza
- **Skeleton loaders** com tom warm (`#F0EBE2`) em vez de cinza neutro
- **Badge "Novo"**: muda de pill verde para selo recortado estilo carimbo, em mostarda
- **Badge "Urgente"**: vira chip terracota com ponto pulsante
- Adicionar um **separador decorativo** (3 pontos `· · ·` em terracota) entre seções principais da home

## O que fica de fora deste plano

- Não muda lógica, dados, rotas, RLS, edge functions ou Supabase
- Não muda estrutura de componentes (só estilos e pequenos ajustes de markup)
- Não toca em testes, autenticação ou pagamentos

## Arquivos que serão editados

- `src/index.css` — nova paleta light/dark, import da Fraunces, tokens warm
- `tailwind.config.ts` — adicionar `font-display: Fraunces`
- `src/components/Header.tsx` — wordmark com serif, search pill creme
- `src/components/ProductCard.tsx` — novo layout 4:5, preço sobreposto, botão WhatsApp
- `src/components/CategoryNav.tsx` — pills com ícones coloridos
- `src/components/StoriesBar.tsx` — anel gradiente terracota/mostarda
- `src/components/BottomNav.tsx` — botão central terracota, indicador ativo
- `src/components/LoadingSkeleton.tsx` — tom warm
- `src/components/ProductFeed.tsx` — empty state com microcopy nova

## Memória

Após aprovação, vou atualizar `mem://design/visual-identity` com a nova paleta, fontes e princípios ("warm, editorial, mozambicano, anti-genérico") para que futuras telas mantenham coerência.

Posso seguir com a implementação?
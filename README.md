# 🛡️ IAPivara Anti-Boato — IA Brasileira contra Fake News

A **IAPivara** é uma iniciativa **open source** para combater a desinformação no Brasil através de verificação automatizada em fontes confiáveis.

Nosso objetivo é criar uma **IA brasileira focada exclusivamente na checagem de fake news**, priorizando **fontes confiáveis de informação** e fornecendo verificações transparentes e baseadas em evidências.

> 🤝 **Este projeto nasceu para ser colaborativo: qualquer pessoa pode contribuir!**  
> Juntos, podemos criar uma plataforma segura e acessível para ajudar milhões de brasileiros a identificar notícias falsas.

---

## 🎯 Por que combater fake news?

- 📰 **Desinformação prejudica a democracia** - Notícias falsas influenciam decisões importantes
- 🧠 **Proteção da sociedade** - Evita que pessoas sejam enganadas por informações incorretas  
- 🔍 **Transparência** - Fornece fontes verificáveis para cada verificação
- 🤖 **Automação inteligente** - Usa IA para analisar grandes volumes de informação rapidamente

---

## 🚀 Como funciona

### Sistema de Classificação por Semáforo

1. O usuário envia um **texto** ou **link público** para a API.
2. A IAPivara analisa a alegação, cruza com **fontes confiáveis** e retorna um **farol**:
   - 🔴 **VERMELHO** = Informação **falsa** ou contraditória
   - 🟡 **AMARELO** = Informação **incerta** ou evidências insuficientes  
   - 🟢 **VERDE** = Informação **verdadeira** confirmada por fontes confiáveis
3. Fora do escopo (pedir fotos, piadas, código, etc.): a IA responde **"Sou usada apenas para validar fake news."**

### Processo de Verificação Inteligente

1. **Análise da pergunta** - Extrai termos-chave e contexto
2. **Busca em fontes confiáveis** - Consulta portais da whitelist automaticamente
3. **Pontuação de evidências** - Avalia relevância e confiabilidade das fontes
4. **Detecção de contradições** - Identifica inconsistências entre pergunta e evidências
5. **Classificação final** - Combina evidências e análise de IA para resultado

### Exemplos Práticos

```bash
# Pergunta sobre política
"Lula morreu?" → 🔴 VERMELHO (falso - ele está vivo)

# Pergunta sobre esportes  
"Brasil é pentacampeão?" → 🟢 VERDE (verdadeiro - 1958, 1962, 1970, 1994, 2002)

# Pergunta sobre geografia
"Brasília é a capital do Brasil?" → 🟢 VERDE (verdadeiro)

# Validação de links
"https://g1.globo.com/..." → 🟢 VERDE (fonte confiável)
"https://site-duvidoso.com/..." → 🔴 VERMELHO (fonte não confiável)
```

---

## 🌍 Fontes Confiáveis (Whitelist)

Nossa whitelist inclui os principais portais de notícias e fact-checking do Brasil:

### Portais de Notícias
- **G1** (g1.globo.com) - Portal de notícias da Globo
- **UOL** (uol.com.br) - Portal de notícias e conteúdo
- **Folha de S.Paulo** (folha.uol.com.br) - Jornal tradicional
- **Estadão** (estadao.com.br) - O Estado de S. Paulo
- **R7 Notícias** (noticias.r7.com) - Portal da Record
- **Terra** (terra.com.br) - Portal de notícias

### Fact-Checking Especializados
- **Aos Fatos** (aosfatos.org) - Agência de checagem independente
- **Lupa** (lupa.uol.com.br) - Agência de fact-checking da UOL
- **Boatos.org** (boatos.org) - Especializada em desmentir boatos
- **Fato ou Fake** (g1.globo.com/fato-ou-fake) - Seção do G1

### Fontes Oficiais
- **Governo Federal** (gov.br) - Portal oficial do governo
- **Agência Brasil** (agenciabrasil.ebc.com.br) - Agência pública de notícias
- **Senado Federal** (senado.leg.br) - Portal oficial do Senado
- **Câmara dos Deputados** (camara.leg.br) - Portal oficial da Câmara

> 💡 **Essa lista está em constante evolução!** Você pode sugerir novas fontes confiáveis via **Pull Request** ou **Issue**.

---

## 🛠️ Instalação e Configuração

### Pré-requisitos

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Conta no Cloudflare Workers** (para deploy em produção)

### 1. Instalação Local

```bash
# Clone o repositório
git clone https://github.com/DhiegoPimenta/iapivara-antiboato.git
cd iapivara-antiboato

# Instale as dependências
npm install

# Configure o Wrangler (CLI do Cloudflare)
npm install -g wrangler
wrangler login
```

### 2. Configuração

1. **Configure suas credenciais do Cloudflare Workers AI** (para produção)
2. **Ajuste o arquivo `wrangler.toml` se necessário**

### 3. Executando Localmente

```bash
# Desenvolvimento local (requer credenciais do Cloudflare)
wrangler dev --remote

# Testes locais (modo stub - sem API externa)
npm run test
```

### 4. Deploy para Produção

```bash
# Deploy para Cloudflare Workers
wrangler deploy
```

---

## 📖 Como Usar a API

### Endpoint Principal

**URL:** `POST /`  
**Content-Type:** `application/json`

### Verificar Texto/Pergunta

```bash
curl -X POST https://seu-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"text": "Lula morreu?"}'
```

### Verificar URL/Link

```bash
curl -X POST https://seu-worker.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"url": "https://g1.globo.com/politica/noticia/..."}'
```

### Formato da Resposta

```json
{
  "engine": "workers-ai",
  "overall": "red|yellow|green", 
  "confidence": 0.9,
  "reason": "Explicação detalhada do resultado",
  "claim": "Pergunta analisada",
  "sources": ["lista", "de", "fontes", "consultadas"],
  "evidence": [
    {
      "source": "g1.globo.com",
      "title": "Título da notícia encontrada",
      "url": "https://...",
      "score": 3
    }
  ]
}
```

### Limitações e Escopo

❌ **Não fazemos:**
- Análise de imagens ou vídeos
- Acesso a redes sociais privadas (Instagram, Facebook)
- Previsões sobre o futuro
- Opiniões pessoais ou subjetivas

✅ **Focamos em:**
- Fatos verificáveis em fontes públicas
- Informações sobre política, economia, esportes
- Validação de fontes e links
- Eventos históricos e atuais

---

## 🤝 Como Contribuir (Open Source)

Este é um **projeto 100% open source** e contribuições são muito bem-vindas! 

### 🎯 Formas de Contribuir

#### 🐛 Reportar Bugs
- Abra uma [**Issue**](https://github.com/DhiegoPimenta/iapivara-antiboato/issues) descrevendo o problema
- Inclua exemplos de perguntas que não funcionaram corretamente
- Descreva o resultado esperado vs obtido

#### 💡 Sugerir Melhorias
- **Novas fontes confiáveis** - Sugira portais para a whitelist
- **Algoritmos de detecção** - Ideias para melhorar a precisão
- **Novos tipos de verificação** - Expandir capacidades do sistema
- **Interface de usuário** - Melhorias na experiência

#### 🔧 Contribuir com Código

1. **Fork** o repositório
2. **Crie uma branch** para sua feature: `git checkout -b feature/minha-melhoria`
3. **Implemente** suas mudanças seguindo os padrões do projeto
4. **Teste** localmente: `npm run test`
5. **Commit** suas mudanças: `git commit -m "Adiciona nova funcionalidade"`
6. **Push** para sua branch: `git push origin feature/minha-melhoria`
7. **Abra um Pull Request** descrevendo suas mudanças

#### 📝 Melhorar Documentação
- Corrigir erros no README
- Adicionar exemplos de uso
- Criar tutoriais e guias
- Traduzir para outros idiomas

### 📋 Diretrizes para Contribuição

- **Mantenha o foco genérico** - Evite hardcoding de fatos específicos
- **Priorize fontes confiáveis** - Toda verificação deve ser baseada em evidências
- **Teste suas mudanças** - Garanta que não quebrou funcionalidades existentes
- **Documente** - Explique suas mudanças no Pull Request
- **Seja respeitoso** - Mantenha discussões construtivas e profissionais

---

## 🔧 Arquitetura Técnica

### Stack Tecnológico

- **Runtime:** Cloudflare Workers (Edge Computing)
- **Linguagem:** TypeScript
- **IA:** Cloudflare Workers AI (Llama 3.1 8B)
- **Busca:** DuckDuckGo Search API
- **Deploy:** Wrangler CLI

### Componentes Principais

```typescript
src/index.ts
├── scoreByStems()          // Pontuação de relevância
├── enhanceSearchTerms()    // Geração de termos contextuais  
├── detectContradiction()   // Detecção de contradições
├── findCorroboration()     // Busca em fontes confiáveis
├── classifyWithLLM()       // Análise com IA
└── fetch()                 // Handler principal da API
```

### Fluxo de Dados

```
Pergunta → Análise → Busca → Pontuação → IA → Classificação → Resposta
```

---

## 🚧 Roadmap e Evolução Contínua

Este projeto está em **constante evolução**. Algumas melhorias planejadas:

### 🎯 Curto Prazo
- [ ] Melhorar detecção de contradições
- [ ] Expandir whitelist de fontes confiáveis
- [ ] Otimizar performance das buscas
- [ ] Adicionar mais testes automatizados

### 🚀 Médio Prazo  
- [ ] Interface web para usuários finais
- [ ] API de validação em lote
- [ ] Integração com redes sociais
- [ ] Sistema de cache inteligente

### 🌟 Longo Prazo
- [ ] Análise de imagens e vídeos
- [ ] Detecção de deepfakes
- [ ] Multilíngue (espanhol, inglês)
- [ ] Machine learning personalizado

---

## 📊 Transparência e Métricas

Acreditamos na **transparência total** do processo de verificação:

- **Fontes sempre citadas** - Toda verificação mostra as fontes consultadas
- **Algoritmo aberto** - Código 100% open source no GitHub
- **Sem viés político** - Baseado apenas em evidências de fontes confiáveis
- **Auditável** - Qualquer pessoa pode revisar e melhorar o código

---

## 📄 Licença

Este projeto é licenciado sob a [**MIT License**](LICENSE) - veja o arquivo LICENSE para detalhes.

---

## 🙋‍♂️ Suporte e Contato

- **🐛 Issues:** [GitHub Issues](https://github.com/DhiegoPimenta/iapivara-antiboato/issues)
- **💬 Discussões:** [GitHub Discussions](https://github.com/DhiegoPimenta/iapivara-antiboato/discussions)
- **👨‍💻 Autor:** [@DhiegoPimenta](https://github.com/DhiegoPimenta)

---

## 🌟 Agradecimentos

Agradecemos a todos que contribuem para tornar a informação mais confiável no Brasil. **Juntos, podemos combater a desinformação e fortalecer nossa democracia!**

**⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub!**

---

*"A verdade não teme a investigação" - IAPivara Anti-Boato* 🛡️

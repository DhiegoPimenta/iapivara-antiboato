# IAPivara Chat Frontend 🦫

**Uma interface de chat moderna para combater fake news no Brasil**

## 🎯 Propósito e Missão

O **IAPivara Chat Frontend** é uma interface web moderna e intuitiva criada para democratizar o acesso à verificação de notícias no Brasil. Nossa missão é combater a desinformação através de uma ferramenta acessível, rápida e confiável que qualquer pessoa pode usar.

### 🇧🇷 Por que existe?
- **Combate à Desinformação**: O Brasil enfrenta uma epidemia de fake news que afeta eleições, saúde pública e coesão social
- **Democratização da Verificação**: Tornar a checagem de fatos acessível a todos, não apenas jornalistas
- **Educação Digital**: Ensinar as pessoas a questionar e verificar informações antes de compartilhar
- **Transparência**: Mostrar as fontes e o processo de verificação de forma clara

### 🤝 Projeto Open Source
Este é um **projeto 100% open source** desenvolvido pela comunidade para a comunidade. Acreditamos que a luta contra fake news deve ser colaborativa e transparente.

**Qualquer pessoa pode contribuir:**
- 👩‍💻 **Desenvolvedores**: Melhorar código, adicionar features, corrigir bugs
- 🎨 **Designers**: Aprimorar UX/UI, criar assets, melhorar acessibilidade  
- 📝 **Redatores**: Melhorar documentação, traduzir conteúdo
- 🧪 **Testadores**: Reportar bugs, testar em diferentes dispositivos
- 💡 **Idealizadores**: Sugerir melhorias, novas funcionalidades
- 📢 **Divulgadores**: Espalhar a palavra, educar sobre fake news

## 🚀 Demo ao Vivo

**Teste agora:** https://fake-news-tester-0rcgcq69.devinapps.com

Experimente perguntar:
- "Lula morreu?" → 🔴 FAKE NEWS
- "Brasil é pentacampeão?" → 🟢 VERDADEIRO
- "Disney vai abrir parque no Brasil?" → 🔴 FAKE NEWS

## ⚡ Como Funciona

### 🔍 Processo de Verificação
1. **Usuário faz pergunta** sobre uma notícia
2. **Sistema consulta** múltiplas fontes confiáveis (G1, Folha, UOL, etc.)
3. **IA analisa** evidências e detecta contradições
4. **Resultado visual** com classificação por cores:
   - 🔴 **Vermelho**: Fake News (informação falsa)
   - 🟢 **Verde**: Verdadeiro (confirmado por fontes)
   - 🟡 **Amarelo**: Incerto (evidências insuficientes)

### 🛡️ Fontes Confiáveis
O sistema consulta apenas portais jornalísticos reconhecidos:
- **Grandes Veículos**: G1, Folha, UOL, Estadão, O Globo
- **Fact-Checkers**: Aos Fatos, Lupa, Boatos.org
- **Instituições**: Sites governamentais, universidades
- **Transparência**: Todas as fontes são mostradas ao usuário

## ✨ Características Técnicas

### 🎨 Design Moderno
- **Interface WhatsApp-style** familiar e intuitiva
- **Design Mobile-First** otimizado para celular
- **Gradientes elegantes** com identidade visual IAPivara
- **Animações suaves** e micro-interações
- **Tipografia moderna** com fonte Poppins

### 📱 Responsividade Total
- **Mobile-First**: Perfeito em smartphones
- **Desktop**: Layout profissional para computadores
- **Tablet**: Adaptação automática para tablets
- **Touch-Friendly**: Botões grandes para toque
- **Acessibilidade**: Seguindo padrões WCAG

### 🔧 Funcionalidades
- **Verificação em tempo real** via API
- **Indicador de digitação** animado
- **Histórico de conversas** na sessão
- **Tratamento de erros** elegante
- **Performance otimizada** com lazy loading

## 🛠️ Tecnologias Utilizadas

- **React 18** com TypeScript para type safety
- **Vite** para build rápido e hot reload
- **Tailwind CSS** para estilização moderna
- **shadcn/ui** para componentes consistentes
- **Lucide React** para ícones elegantes
- **API IAPivara** para verificação de fake news

## 📦 Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Git

### 🚀 Início Rápido

```bash
# 1. Clone o repositório
git clone https://github.com/DhiegoPimenta/iapivara-antiboato.git
cd iapivara-antiboato/frontend

# 2. Instale dependências
npm install

# 3. Configure ambiente
cp .env.example .env
# Edite .env com: VITE_API_URL=https://api.iapivara.com.br

# 4. Execute em desenvolvimento
npm run dev

# 5. Acesse http://localhost:5173
```

### 🏗️ Build para Produção

```bash
npm run build    # Gera pasta dist/
npm run preview  # Testa build localmente
```

## 🎯 Como Usar

1. **Abra a interface** no navegador
2. **Digite sua pergunta** sobre uma notícia
3. **Aguarde a análise** (indicador de digitação)
4. **Veja o resultado** com classificação colorida
5. **Confira as fontes** listadas na resposta

### 📝 Exemplos Práticos

```
✅ Política: "Lula está preso?" → Resultado baseado em fontes atuais
✅ Esportes: "Brasil ganhou a Copa?" → Verificação de conquistas
✅ Celebridades: "Gugu morreu?" → Confirmação de fatos
✅ Economia: "Dólar chegou a R$ 10?" → Checagem de valores
✅ Saúde: "Vacina causa autismo?" → Desmentido científico
```

## 🏗️ Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatMessage.tsx      # Mensagens com cores
│   │   └── TypingIndicator.tsx  # Animação de digitação
│   ├── lib/
│   │   └── utils.ts            # Utilitários
│   ├── types.ts                # Tipos da API
│   ├── App.tsx                 # Componente principal
│   ├── App.css                 # Estilos globais
│   └── main.tsx               # Entry point
├── public/                     # Assets estáticos
├── dist/                      # Build de produção
├── .env                       # Configuração da API
└── README.md                  # Esta documentação
```

## 🤝 Como Contribuir

### 🐛 Reportar Bugs
1. Verifique se o bug já foi reportado
2. Crie uma issue detalhada com:
   - Descrição do problema
   - Passos para reproduzir
   - Screenshots/vídeos
   - Informações do navegador

### 💡 Sugerir Melhorias
- **Novas funcionalidades**
- **Melhorias de UX/UI**
- **Otimizações de performance**
- **Acessibilidade**

### 👩‍💻 Contribuir com Código
1. **Fork** o repositório
2. **Crie** uma branch: `git checkout -b feature/nova-feature`
3. **Desenvolva** seguindo os padrões do projeto
4. **Teste** suas mudanças
5. **Commit**: `git commit -m 'Adiciona nova feature'`
6. **Push**: `git push origin feature/nova-feature`
7. **Abra** um Pull Request

### 📋 Diretrizes de Contribuição
- **Código limpo** e bem documentado
- **Testes** para novas funcionalidades
- **Responsividade** em todas as telas
- **Acessibilidade** seguindo WCAG
- **Performance** otimizada

## 🚀 Roadmap e Melhorias Futuras

### 🎯 Próximas Features
- [ ] **Modo escuro/claro**
- [ ] **Histórico persistente** de verificações
- [ ] **Compartilhamento** de resultados
- [ ] **Notificações push** para alertas
- [ ] **Integração** com redes sociais
- [ ] **Múltiplos idiomas** (inglês, espanhol)
- [ ] **API pública** para desenvolvedores
- [ ] **Plugin** para navegadores
- [ ] **App mobile** nativo

### 🔧 Melhorias Técnicas
- [ ] **PWA** (Progressive Web App)
- [ ] **Offline mode** com cache
- [ ] **Analytics** de uso
- [ ] **A/B testing** de interface
- [ ] **CDN** para assets
- [ ] **Monitoramento** de performance

## 🌍 Impacto Social

### 📊 Objetivos Mensuráveis
- **Reduzir** compartilhamento de fake news
- **Educar** usuários sobre verificação
- **Aumentar** confiança em fontes confiáveis
- **Promover** pensamento crítico

### 🎓 Educação Digital
- **Workshops** sobre fake news
- **Material educativo** gratuito
- **Parcerias** com escolas
- **Campanhas** de conscientização

## 🔧 Configuração da API

### Endpoint Principal
```
POST https://api.iapivara.com.br
Content-Type: application/json

{
  "text": "Sua pergunta sobre a notícia"
}
```

### Resposta da API
```typescript
{
  "engine": "workers-ai",
  "overall": "red" | "yellow" | "green",
  "confidence": number,
  "reason": string,
  "claim": string,
  "sources": string[],
  "evidence": Array<{
    source: string,
    title: string,
    url: string,
    score?: number
  }>
}
```

## 📄 Licença

Este projeto está sob a **Licença MIT** - veja [LICENSE](../LICENSE) para detalhes.

### 🆓 Uso Livre
- ✅ **Uso comercial** permitido
- ✅ **Modificação** permitida
- ✅ **Distribuição** permitida
- ✅ **Uso privado** permitido

## 🙏 Agradecimentos

- **Comunidade Open Source** brasileira
- **Jornalistas** e fact-checkers
- **Desenvolvedores** voluntários
- **Usuários** que testam e reportam bugs
- **Educadores** que promovem pensamento crítico

## 📞 Contato e Suporte

### 💬 Canais de Comunicação
- **Issues**: [GitHub Issues](https://github.com/DhiegoPimenta/iapivara-antiboato/issues)
- **Discussões**: [GitHub Discussions](https://github.com/DhiegoPimenta/iapivara-antiboato/discussions)
- **Email**: dhiegopimenta@gmail.com

### 🆘 Precisa de Ajuda?
1. **Consulte** esta documentação
2. **Procure** nas issues existentes
3. **Crie** uma nova issue se necessário
4. **Participe** das discussões da comunidade

---

## 🌟 Junte-se à Luta Contra Fake News!

**Cada contribuição importa.** Seja você desenvolvedor, designer, jornalista ou apenas alguém preocupado com a desinformação, há uma forma de você ajudar.

**Juntos, podemos construir um Brasil mais informado e menos suscetível a fake news.**

---

**Desenvolvido com ❤️ pela comunidade brasileira**  
**Para um Brasil mais informado e democrático** 🇧🇷

**Link da Sessão Devin:** https://app.devin.ai/sessions/ce8c147a0b034f348163d881e5354dbc  
**Criado por:** @DhiegoPimenta

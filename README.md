# 🦫 IAPivara — IA Brasileira contra Fake News

A **IAPivara** é uma iniciativa **open source** para combater a desinformação no Brasil.  
Nosso objetivo é criar uma **IA brasileira focada exclusivamente na checagem de fake news**, priorizando **fontes confiáveis de informação** como G1, Agência Brasil, BBC, gov.br, entre outras.

> Este projeto nasceu para ser colaborativo: **qualquer pessoa pode contribuir**!  
> Juntos, podemos criar uma plataforma segura e acessível para ajudar milhões de brasileiros a identificar notícias falsas.

---

## 🚀 Como funciona
1. O usuário envia um **texto** ou **link público** para a API.
2. A IAPivara analisa a alegação, cruza com **fontes confiáveis** e retorna um **farol**:
   - 🟥 **Red** = Fake news confirmado.
   - 🟨 **Yellow** = Pode ser / Informação insuficiente.
   - 🟩 **Green** = Verdade confirmado.
3. Fora do escopo (pedir fotos, piadas, código, etc.): a IA responde **"Sou usada apenas para validar fake news."**

---

## 🌍 Fontes confiáveis iniciais
- **Jornais e portais**: G1, UOL, R7, Terra, Folha, Estadão, CNN Brasil, BBC.
- **Agências de checagem**: Agência Brasil, Aos Fatos, Lupa, Boatos.org.
- **Órgãos oficiais**: gov.br, saude.gov.br, tse.jus.br, stf.jus.br, anvisa.gov.br.

> Essa lista está em constante evolução! Você pode sugerir novas fontes via **Pull Request**.

---

## 🛠 Rodando localmente
### 1. Instalar dependências
```bash
npm install
npm run test

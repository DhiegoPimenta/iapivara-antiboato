// src/index.ts

export interface Env {
  AI: { run: (model: string, payload: any) => Promise<any> };
  API_KEY?: string;
  TEST_MODE?: string; // "stub" para testes locais sem IA
}

/* =================== Config =================== */

const RESTRICTED = [
  "instagram.com","tiktok.com","facebook.com","x.com","twitter.com",
  "threads.net","youtube.com","youtu.be","kwai.com"
];

const TRUSTED = [
  // governo / judiciário / orgs
  "gov.br","planalto.gov.br","saude.gov.br","anvisa.gov.br","tse.jus.br","stf.jus.br",
  "ibge.gov.br","ipea.gov.br","who.int","paho.org","agenciabrasil.ebc.com.br",
  // imprensa
  "g1.globo.com","uol.com.br","noticias.r7.com","terra.com.br",
  "folha.uol.com.br","estadao.com.br","cnnbrasil.com.br",
  "bbc.com","bbc.co.uk","cnn.com","valor.globo.com","veja.abril.com.br",
  // checagem
  "aosfatos.org","lupa.uol.com.br","boatos.org"
];

// a lista usada para buscas (igual à acima, mas como vetor único)
const TRUSTED_DOMAINS = [
  "g1.globo.com","uol.com.br","noticias.r7.com","terra.com.br",
  "folha.uol.com.br","estadao.com.br","cnnbrasil.com.br",
  "bbc.com","bbc.co.uk","cnn.com","agenciabrasil.ebc.com.br",
  "gov.br","planalto.gov.br","tse.jus.br","stf.jus.br","ibge.gov.br","ipea.gov.br",
  "who.int","paho.org","valor.globo.com","veja.abril.com.br",
  "aosfatos.org","lupa.uol.com.br","boatos.org"
];

const OUT_OF_SCOPE_HINTS = [
  "foto","imagem","piada","receita","previsão do tempo","tempo amanhã",
  "traduza","tradução","programa isso","código","calcula","calcular",
  "capital da frança","jogo","signo","horóscopo","piadas","tocar música","cantar"
];

// termos para intenção de morte
const DEATH_KWS = ["morreu","faleceu","óbito","obito","morte","está morto","esta morto"];

/* =================== Utils =================== */

function json(data: unknown, status = 200, extraHeaders: Record<string,string> = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=UTF-8", ...extraHeaders }
  });
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type,x-api-key",
  "access-control-allow-methods": "POST,OPTIONS"
};

function removeDiacritics(str: string) {
  return (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
function stripTags(s: string){ return s.replace(/<[^>]+>/g,""); }
function getHost(url: string){ try{ return new URL(url).hostname.replace(/^www\./,''); }catch{ return ""; } }
function isRestricted(urlStr: string){ const h=getHost(urlStr).toLowerCase(); return RESTRICTED.some(d=>h.includes(d)); }
function isTrusted(urlStr: string){ const h=getHost(urlStr).toLowerCase(); return TRUSTED.some(d=>h.includes(d)); }

function isOutOfScope(text: string): boolean {
  const t = (text || "").toLowerCase();
  return OUT_OF_SCOPE_HINTS.some(h => t.includes(h));
}

function hasDeathIntent(text: string): boolean {
  const t = removeDiacritics(text.toLowerCase());
  return DEATH_KWS.some(k => t.includes(removeDiacritics(k)));
}

// Extrai nomes próprios (NER simples por capitalização)
function extractNames(text: string): string[] {
  const candidates = new Set<string>();
  const tokens = text.split(/[\s,.;:!?()"“”]+/).filter(Boolean);
  for (let i=0;i<tokens.length;i++){
    for (let len=4;len>=1;len--){
      const slice = tokens.slice(i,i+len);
      if (slice.length < len) continue;
      const ok = slice.every(w=>/^[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ][\p{L}\-']+$/u.test(w));
      if (ok) { candidates.add(slice.join(" ")); break; }
    }
  }
  // normaliza duplicatas
  const norm=(s:string)=>removeDiacritics(s.toLowerCase());
  const out:string[]=[];
  for (const c of candidates){
    const nc=norm(c);
    if (!out.some(o=>norm(o).includes(nc) || nc.includes(norm(o)))) out.push(c);
  }
  return out.slice(0,3);
}

function toStems(text: string): string[] {
  return removeDiacritics(text.toLowerCase())
    .replace(/[^\p{L}\s]/gu," ")
    .split(/\s+/).filter(w=>w.length>=3);
}

function scoreByStems(title: string, stems: string[]) {
  const t = removeDiacritics(title.toLowerCase());
  let s = stems.reduce((sum, st) => sum + (t.includes(st) ? 1 : 0), 0);
  
  if (/(oficial|confirm|anuncia|decide|aprov|derrub|campe[aã]o|t[ií]tulo)/.test(t)) s += 2;
  
  if (/(penta|pentacampe[aã]o|copa.*mundo|mundial.*futebol|1958|1962|1970|1994|2002|hexa|tetra|tri|bi)/.test(t)) s += 2;
  
  if (/(vivo|ativo|presidente|ex-presidente|candidato|politico|lider|morreu|morte|obito|faleceu)/.test(t)) s += 2;
  
  if (/(capital|sede|distrito.*federal|estado|regiao|litoral|praia|costa|porto)/.test(t)) s += 2;
  
  if (/(banda|musica|rock|emo|album|show|artista|cantor)/.test(t)) s += 2;
  
  if (/(parque|disney|investimento|construcao|projeto|anuncio)/.test(t)) s += 2;
  
  if (/(pec|emenda|constitucional|congresso|aprovacao|rejeicao|cancelada|aprovada)/.test(t)) s += 2;
  
  if (/(confirma|confirmado|verdade|fato|historico|registro|oficial)/.test(t)) s += 1;
  
  return s;
}

function enhanceSearchTerms(claim: string): string[] {
  const stems = toStems(claim);
  const enhanced = [...stems];
  
  const normalizedClaim = removeDiacritics(claim.toLowerCase());
  
  if (normalizedClaim.includes("penta") || normalizedClaim.includes("cinco") || normalizedClaim.includes("5")) {
    if (normalizedClaim.includes("brasil") || normalizedClaim.includes("copa")) {
      enhanced.push("brasil", "pentacampeao", "copa", "mundo", "futebol", "selecao", "cbf");
    }
  }
  
  if (normalizedClaim.includes("capital")) {
    enhanced.push("capital", "sede", "governo", "distrito", "federal");
  }
  
  if (normalizedClaim.includes("banda") || normalizedClaim.includes("emo") || normalizedClaim.includes("rock")) {
    enhanced.push("musica", "banda", "rock", "emo", "album", "show");
  }
  
  if (normalizedClaim.includes("litoral") || normalizedClaim.includes("praia") || normalizedClaim.includes("costa")) {
    enhanced.push("litoral", "praia", "costa", "mar", "porto", "cidade");
  }
  
  if (normalizedClaim.includes("parque") || normalizedClaim.includes("disney")) {
    enhanced.push("parque", "tematico", "disney", "turismo", "investimento");
  }
  
  if (normalizedClaim.includes("pec") || normalizedClaim.includes("blindagem")) {
    enhanced.push("pec", "emenda", "constitucional", "congresso", "aprovacao", "rejeicao");
  }
  
  if (hasDeathIntent(claim)) {
    const names = extractNames(claim);
    if (names.length > 0) {
      enhanced.push("morte", "obito", "falecimento", "morreu", "vivo", "ativo");
    }
  }
  
  return [...new Set(enhanced)];
}

function detectContradiction(claim: string, llmReason: string): boolean {
  const normalizedClaim = removeDiacritics(claim.toLowerCase());
  const normalizedReason = removeDiacritics(llmReason.toLowerCase());
  
  const contradictions = [
    { claimPattern: /morreu|morte|morto|morta|mortos|mortas|obito|faleceu|falecimento/, reasonPattern: /vivo|viva|vivos|vivas|ativo|ativa|ativos|ativas|vive/ },
    { claimPattern: /nao|não/, reasonPattern: /sim|verdade|confirma/ },
    { claimPattern: /falso|mentira/, reasonPattern: /verdade|correto|confirma/ },
    { claimPattern: /cancelad|rejeitad|derrubad/, reasonPattern: /aprovad|confirmad|mantid/ },
    { claimPattern: /foi.*para|transferiu|mudou/, reasonPattern: /permanece|continua|fica/ },
    { claimPattern: /causa|provoca|gera|resulta/, reasonPattern: /nao.*causa|não.*causa|nao.*provoca|não.*provoca|nenhuma.*evidencia|não.*encontr.*evidencia/ }
  ];
  
  for (const contradiction of contradictions) {
    if (contradiction.claimPattern.test(normalizedClaim) && 
        contradiction.reasonPattern.test(normalizedReason)) {
      return true;
    }
  }
  
  return false;
}

function bestPhrase(text: string){
  const m = text.match(/"([^"]{6,120})"/);
  return m?.[1] ?? "";
}

async function fetchPublicText(url: string): Promise<string> {
  try {
    const r = await fetch(url, { headers: { "User-Agent": "IAPivara/1.0 (+https://iapivara.com.br)" } });
    const html = await r.text();
    const title = (html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ?? "").trim();
    const meta  = (html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? "").trim();
    const og    = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] ?? "").trim();
    const ps = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/ig)]
      .slice(0, 12)
      .map(m => m[1].replace(/<[^>]+>/g, ""))
      .join(" ");
    return [title, meta, og, ps].filter(Boolean).join(" — ").slice(0, 5000);
  } catch { return ""; }
}

function extractClaim(text: string): string {
  const parts = text.split(/(?<=[.!?])\s+/).filter(s => s.length > 30);
  return (parts[0] || text).slice(0, 600);
}

/* =================== Busca via DuckDuckGo =================== */

// Busca “lite” no DuckDuckGo com filtro site:
async function ddgSearchSite(query: string, domain: string): Promise<{title:string,url:string}[]> {
  const q = `${query} site:${domain}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  
  try {
    const resp = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
      headers: { "User-Agent":"IAPivara/1.0" },
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    const html = await resp.text();

    const out: {title:string,url:string}[] = [];
    const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/ig;
    let m;
    while ((m = re.exec(html)) && out.length < 8) {
      const url = m[1];
      const title = stripTags(m[2]).replace(/\s+/g," ").trim();
      if (getHost(url).includes(domain)) out.push({ title, url });
    }
    return out;
  } catch (error) {
    clearTimeout(timeoutId);
    console.warn(`Search timeout for ${domain}:`, error);
    return [];
  }
}

type Evidence = { source:string; title:string; url:string; score:number };

function titleMatchesDeath(title: string, personName: string) {
  const t = removeDiacritics(title.toLowerCase());
  const p = removeDiacritics(personName.toLowerCase());
  const hasName = t.includes(p);
  const hasDeath = DEATH_KWS.some(k => t.includes(removeDiacritics(k)));
  return hasName && hasDeath;
}

async function findCorroboration(claim: string): Promise<{all:Evidence[], strong:Evidence[], moderate:Evidence[]}> {
  const enhancedStems = enhanceSearchTerms(claim);
  const names = extractNames(claim);
  const death = hasDeathIntent(claim);
  const primaryName = names[0];

  // query base
  const phrase = bestPhrase(claim);
  const baseQuery = phrase ? `"${phrase}"` : enhancedStems.slice(0, 6).join(" ");

  const priorityDomains = TRUSTED_DOMAINS.slice(0, 6);
  const perDomain = await Promise.all(priorityDomains.map(async (dom) => {
    try {
      const items = await ddgSearchSite(baseQuery, dom);
      const evidences: Evidence[] = items.map(it => ({
        source: dom,
        title: it.title.slice(0, 140),
        url: it.url.split("#")[0],
        score: scoreByStems(it.title, enhancedStems)
      }));
      return evidences;
    } catch (error) {
      console.warn(`Failed to search ${dom}:`, error);
      return [];
    }
  }));

  // dedupe por domínio (pega o melhor título)
  const allRaw = perDomain.flat();
  const bestPerDomain: Record<string, Evidence> = {};
  for (const e of allRaw) {
    const dom = getHost(e.url);
    if (!bestPerDomain[dom] || e.score > bestPerDomain[dom].score) bestPerDomain[dom] = e;
  }
  const all = Object.values(bestPerDomain).sort((a,b)=>b.score-a.score);

  const strong = all.filter(e => {
    if (death && primaryName) return titleMatchesDeath(e.title, primaryName);
    return e.score >= 2;
  });

  const moderate = all.filter(e => e.score >= 1);

  return { all, strong, moderate };
}

/* =================== Classificação LLM (fallback) =================== */

async function classifyWithLLM(env: Env, claim: string, context: string) {
  if (env.TEST_MODE === "stub") {
    return { light:"yellow", confidence:0.4, reason:"Teste local (stub)." };
  }

  const instructions =
`Você é a IAPivara, IA exclusiva para checagem de fake news.
- Foque em verificar a alegação no contexto e em fontes de alta reputação.
- Responda apenas JSON: {"light":"red|yellow|green","confidence":0-1,"reason":"frase curta"}.`;

  const messages = [
    { role: "system", content: instructions },
    { role: "user", content:
`ALEGACAO: ${claim}

CONTEXTO: ${context.slice(0,1200)}

Retorne SOMENTE JSON: {"light":"red|yellow|green","confidence":0-1,"reason":"frase curta"}` }
  ];

  // @ts-ignore
  const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages });
  const raw = (result?.response ?? result ?? "{}").toString();
  try { return JSON.parse(raw); }
  catch { return { light:"yellow", confidence:0.4, reason:"Modelo não retornou JSON válido." }; }
}

/* =================== Handler =================== */

const worker = {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return json({ error: "Use POST" }, 405, CORS);

    if (env.API_KEY) {
      const key = request.headers.get("x-api-key");
      if (key !== env.API_KEY) return json({ error: "Unauthorized" }, 401, CORS);
    }

    const body = await request.json().catch(()=> ({} as any));
    const url: string | undefined = body.url;
    const text: string | undefined = body.text;
    if (!url && !text) return json({ error: "Envie { url } ou { text }" }, 400, CORS);

    // guarda-corpo de escopo
    if (text && isOutOfScope(text)) {
      return json({ overall: "yellow", note: "Sou usada apenas para validar fake news." }, 200, CORS);
    }

    if (url && isRestricted(url)) {
      return json({
        overall:"yellow",
        note:"Ainda não acesso conteúdo de redes sociais/privado. Cole o texto/transcrição.",
        sources:[], evidence:[]
      }, 200, CORS);
    }

    let content = text ?? "";
    if (!content && url) content = await fetchPublicText(url);
    if (!content) return json({ overall:"yellow", note:"Não consegui extrair texto do link." }, 200, CORS);

    const claim = extractClaim(content);

    // 1) Busca e decisão por evidência
    const { all, strong } = await findCorroboration(claim);
    const strongDomains = new Set(strong.map(e => getHost(e.url)));
    const enoughStrong = strongDomains.size >= 2;

    if (enoughStrong) {
      return json({
        engine: env.TEST_MODE==="stub"?"stub":"workers-ai",
        overall: "green",
        confidence: 0.92,
        reason: hasDeathIntent(claim)
          ? "Múltiplas fontes confiáveis reportam o óbito."
          : "Múltiplas fontes confiáveis confirmam a alegação.",
        claim,
        sources: url ? [url] : [],
        evidence: [...strongDomains].map(dom => {
          const e = strong.find(x => getHost(x.url) === dom)!;
          return { source: e.source, title: e.title, url: e.url };
        })
      }, 200, CORS);
    }

    const hasAnyEvidence = all.length > 0;
    const hasGoodEvidence = all.filter(e => e.score >= 2).length > 0;
    const hasModerateEvidence = all.filter(e => e.score >= 1).length > 0;
    const totalScore = all.reduce((sum, e) => sum + e.score, 0);
    const avgScore = hasAnyEvidence ? totalScore / all.length : 0;
    const maxScore = hasAnyEvidence ? Math.max(...all.map(e => e.score)) : 0;
    
    // 2) Fallback LLM para explicar incerteza
    const llm = await classifyWithLLM(env, claim, content);
    const llmLight = llm?.light || "yellow";
    const llmReason = llm?.reason || "sem confirmação";
    const llmConfidence = Number(llm?.confidence ?? 0.5);
    
    const hasContradiction = detectContradiction(claim, llmReason);
    
    if (hasContradiction) {
      return json({
        engine: env.TEST_MODE==="stub" ? "stub" : "workers-ai",
        overall: "red",
        confidence: Math.max(0.8, llmConfidence),
        reason: "Informação contradiz evidências; " + llmReason,
        claim,
        sources: url ? [url] : [],
        evidence: all.map(e=>({ source:e.source, title:e.title, url:e.url }))
      }, 200, CORS);
    }
    
    if (hasGoodEvidence || (hasModerateEvidence && avgScore >= 1.2) || maxScore >= 3) {
      return json({
        engine: env.TEST_MODE==="stub" ? "stub" : "workers-ai",
        overall: "green",
        confidence: Math.min(0.9, 0.7 + (maxScore * 0.05)),
        reason: "Evidências sólidas encontradas em fontes confiáveis; " + llmReason,
        claim,
        sources: url ? [url] : [],
        evidence: all.map(e=>({ source:e.source, title:e.title, url:e.url }))
      }, 200, CORS);
    }
    
    if (llmConfidence >= 0.7) {
      if (llmLight === "green") {
        return json({
          engine: env.TEST_MODE==="stub" ? "stub" : "workers-ai",
          overall: "green",
          confidence: llmConfidence,
          reason: "Informação confirmada por análise; " + llmReason,
          claim,
          sources: url ? [url] : [],
          evidence: all.map(e=>({ source:e.source, title:e.title, url:e.url }))
        }, 200, CORS);
      }
      
      if (llmLight === "red") {
        return json({
          engine: env.TEST_MODE==="stub" ? "stub" : "workers-ai",
          overall: "red",
          confidence: llmConfidence,
          reason: "Informação não confirmada por análise; " + llmReason,
          claim,
          sources: url ? [url] : [],
          evidence: all.map(e=>({ source:e.source, title:e.title, url:e.url }))
        }, 200, CORS);
      }
    }
    
    if (hasModerateEvidence && llmLight === "green") {
      return json({
        engine: env.TEST_MODE==="stub" ? "stub" : "workers-ai",
        overall: "green",
        confidence: Math.min(0.8, 0.6 + (avgScore * 0.1)),
        reason: "Evidências moderadas com confirmação; " + llmReason,
        claim,
        sources: url ? [url] : [],
        evidence: all.map(e=>({ source:e.source, title:e.title, url:e.url }))
      }, 200, CORS);
    }
    
    if (!hasAnyEvidence && llmLight === "red") {
      return json({
        engine: env.TEST_MODE==="stub" ? "stub" : "workers-ai",
        overall: "red",
        confidence: Math.max(0.6, llmConfidence),
        reason: "Sem evidências em fontes confiáveis; " + llmReason,
        claim,
        sources: url ? [url] : [],
        evidence: []
      }, 200, CORS);
    }

    // Default fallback -> amarelo
    return json({
      engine: env.TEST_MODE==="stub"?"stub":"workers-ai",
      overall: "yellow",
      confidence: Math.max(0.5, llmConfidence),
      reason: "Evidências insuficientes para classificação definitiva; " + llmReason,
      claim,
      sources: url ? [url] : [],
      evidence: all.map(e=>({ source:e.source, title:e.title, url:e.url }))
    }, 200, CORS);
  }
};

export default worker;

/* ========= Simulação local (npm run test) ========= */
export async function simulate(body: any, envOverrides: Partial<Env> = {}) {
  const env: Env = {
    AI: { run: async () => ({ response: JSON.stringify({ light:"yellow", confidence:0.4, reason:"stub" }) }) },
    TEST_MODE: "stub",
    ...envOverrides
  };
  const req = new Request("http://worker.local/", {
    method:"POST",
    headers:{ "content-type":"application/json" },
    body: JSON.stringify(body)
  });
  const res = await worker.fetch(req as any, env as any);
  const txt = await res.text();
  return { status: res.status, body: txt };
}

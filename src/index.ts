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
  return stems.reduce((s,st)=> s + (t.includes(st)?1:0), 0);
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
  const resp = await fetch(`https://duckduckgo.com/html/?q=${encodeURIComponent(q)}`, {
    headers: { "User-Agent":"IAPivara/1.0" }
  });
  const html = await resp.text();

  // DuckDuckGo HTML: resultados em <a class="result__a" href="...">titulo</a>
  const out: {title:string,url:string}[] = [];
  const re = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>(.*?)<\/a>/ig;
  let m;
  while ((m = re.exec(html)) && out.length < 8) {
    const url = m[1];
    const title = stripTags(m[2]).replace(/\s+/g," ").trim();
    if (getHost(url).includes(domain)) out.push({ title, url });
  }
  return out;
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
  const stems = toStems(claim);
  const names = extractNames(claim);
  const death = hasDeathIntent(claim);
  const primaryName = names[0];

  // query base
  const phrase = bestPhrase(claim);
  const baseQuery = phrase ? `"${phrase}"` : stems.slice(0,6).join(" ");

  // consulta vários domínios
  const perDomain = await Promise.all(TRUSTED_DOMAINS.map(async (dom) => {
    const items = await ddgSearchSite(baseQuery, dom);
    const evidences: Evidence[] = items.map(it => ({
      source: dom,
      title: it.title.slice(0, 140),
      url: it.url.split("#")[0],
      score: scoreByStems(it.title, stems)
    }));
    return evidences;
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

    // 2) Fallback LLM para explicar incerteza
    const llm = await classifyWithLLM(env, claim, content);
    return json({
      engine: env.TEST_MODE==="stub"?"stub":"workers-ai",
      overall: "yellow",
      confidence: Math.max(0.5, Number(llm?.confidence ?? 0.5)),
      reason: "Não encontrei evidências sólidas em fontes confiáveis; " + (llm?.reason ?? "sem confirmação."),
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

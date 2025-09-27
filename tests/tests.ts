import { simulate } from "../src/index";

async function run() {
  const cases = [
    { name: "Lula morreu? (fake)", body: { text: "Verdade que o Lula morreu?" } },
    { name: "Brasil é penta? (verdade)", body: { text: "Verdade que o Brasil é pentacampeão de futebol?" } },
    { name: "Gugu morreu? (verdade)", body: { text: "O Gugu morreu?" } },
    { name: "Luciana morreu? (ambíguo)", body: { text: "A Luciana morreu?" } },
    { name: "Governo vai aumentar tarifa? (pode ser)", body: { text: "O governo vai aumentar tarifa de alguma coisa?" } },
    { name: "Fora de escopo - pedir foto", body: { text: "Me manda uma foto do Lula" } },
    { name: "Rede social restrita", body: { url: "https://www.instagram.com/p/abc123/" } },
    { name: "Link público (simulado)", body: { url: "https://example.com/noticia" } }
  ];

  for (const c of cases) {
    const res = await simulate(c.body, { TEST_MODE: "stub" });
    console.log("\n=== " + c.name + " ===");
    console.log(res.body);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

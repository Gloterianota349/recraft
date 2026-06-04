import { createFileRoute } from "@tanstack/react-router";

interface Msg { role: "user" | "assistant"; content: string }
interface Body {
  messages: Msg[];
  discovered: string[];
  undiscovered: { id: string; name: string; type: string; hint?: string }[];
  stats?: { totalDiscovered: number; totalDiscoverable: number; wasteCount: number };
}

export const Route = createFileRoute("/api/mentor")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "LOVABLE_API_KEY não configurada" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }
        let body: Body;
        try { body = await request.json() as Body; }
        catch { return new Response(JSON.stringify({ error: "Corpo inválido" }), { status: 400 }); }

        const discoveredList = body.discovered.slice(0, 80).join(", ") || "(nenhum)";
        const undiscoveredList = body.undiscovered
          .slice(0, 40)
          .map((u) => `- ${u.name} (${u.type})`)
          .join("\n") || "(todos descobertos!)";

        const system = `Você é o "Mentor Ecológico" do jogo RECraft — um(a) educador(a) ambiental amigável, paciente e curioso(a) que conversa em Português do Brasil.

SOBRE O JOGO: Os jogadores combinam resíduos (garrafa PET, jornal, papelão, lata, pneu) com ferramentas (tesoura, cola, tinta, cabo de madeira, barbante, tecido) para criar componentes intermediários e objetos finais sustentáveis (vassoura PET, vaso, horta vertical, maquete sustentável, luminária, etc.).

PROGRESSO DO JOGADOR:
- Descobertos (${body.stats?.totalDiscovered ?? 0}/${body.stats?.totalDiscoverable ?? 0}): ${discoveredList}
- Resíduos reaproveitados virtualmente: ${body.stats?.wasteCount ?? 0}
- Ainda não descobertos:\n${undiscoveredList}

SUAS REGRAS:
1. NUNCA revele a receita exata (ex.: "junte X + Y") a não ser que o jogador peça explicitamente após pelo menos uma tentativa.
2. Dê dicas pedagógicas e progressivas: primeiro fale do propósito do objeto, depois do material, e só por último dos ingredientes.
3. Ensine sobre impacto ambiental: tempo de decomposição, economia circular, reciclagem, reutilização.
4. Seja conciso (máx. 4-6 frases por resposta) e use emojis com moderação.
5. Use markdown leve (negrito, listas curtas) quando ajudar.
6. Se o jogador pedir algo fora do tema (sustentabilidade, jogo, meio ambiente), traga gentilmente de volta.
7. Celebre conquistas e incentive curiosidade.`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            stream: true,
            messages: [{ role: "system", content: system }, ...body.messages.slice(-12)],
          }),
        });

        if (!upstream.ok) {
          if (upstream.status === 429) return new Response(JSON.stringify({ error: "Muitas requisições. Aguarde um instante." }), { status: 429, headers: { "Content-Type": "application/json" } });
          if (upstream.status === 402) return new Response(JSON.stringify({ error: "Créditos da IA esgotados no workspace." }), { status: 402, headers: { "Content-Type": "application/json" } });
          const t = await upstream.text();
          console.error("mentor upstream", upstream.status, t);
          return new Response(JSON.stringify({ error: "Falha no gateway de IA" }), { status: 500, headers: { "Content-Type": "application/json" } });
        }

        return new Response(upstream.body, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" } });
      },
    },
  },
});

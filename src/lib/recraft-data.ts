export type ElementType = "residuo" | "ferramenta" | "componente" | "final";

export interface ElementDef {
  id: string;
  name: string;
  emoji: string;
  type: ElementType;
  category?: string;
  starter?: boolean;
  // For finals & components: detail info
  difficulty?: "Fácil" | "Médio" | "Difícil";
  impact?: number; // 1-5
  materials?: string[];
  benefit?: string[];
  application?: string;
  curiosity?: string;
  tutorial?: string[];
  wasteCount?: number; // residues reused virtually when discovered
  hints?: [string, string, string];
  explanation?: string; // "Explique para mim"
}

export interface Recipe {
  inputs: [string, string];
  output: string;
}

export const ELEMENTS: ElementDef[] = [
  // Resíduos
  { id: "garrafa_pet", name: "Garrafa PET", emoji: "🧴", type: "residuo", category: "Resíduos", starter: true,
    curiosity: "Uma garrafa PET pode levar mais de 400 anos para se decompor." },
  { id: "jornal", name: "Jornal", emoji: "📰", type: "residuo", category: "Resíduos", starter: true,
    curiosity: "Cada tonelada de papel reciclado evita o corte de cerca de 20 árvores." },
  { id: "papelao", name: "Papelão", emoji: "📦", type: "residuo", category: "Resíduos", starter: true,
    curiosity: "O papelão é um dos resíduos mais presentes em residências." },
  { id: "lata", name: "Lata de Alumínio", emoji: "🥫", type: "residuo", category: "Resíduos", starter: true,
    curiosity: "O alumínio pode ser reciclado infinitamente sem perder qualidade." },
  { id: "pneu", name: "Pneu Usado", emoji: "🛞", type: "residuo", category: "Resíduos", starter: true,
    curiosity: "Pneus descartados podem acumular água e favorecer a proliferação de mosquitos." },

  // Ferramentas
  { id: "tesoura", name: "Tesoura", emoji: "✂️", type: "ferramenta", category: "Ferramentas", starter: true },
  { id: "cola", name: "Cola", emoji: "🧴", type: "ferramenta", category: "Ferramentas", starter: true },
  { id: "tinta", name: "Tinta", emoji: "🎨", type: "ferramenta", category: "Ferramentas", starter: true },
  { id: "cabo", name: "Cabo de Madeira", emoji: "🪵", type: "ferramenta", category: "Ferramentas", starter: true },
  { id: "barbante", name: "Barbante", emoji: "🧶", type: "ferramenta", category: "Ferramentas", starter: true },
  { id: "tecido", name: "Tecido", emoji: "🧵", type: "ferramenta", category: "Ferramentas", starter: true },

  // Componentes
  { id: "tiras_pet", name: "Tiras de PET", emoji: "🎗️", type: "componente", category: "Componentes",
    hints: [
      "Este material é fino e flexível.",
      "Surge após modificar uma garrafa.",
      "Uma tesoura pode ajudar a revelar seu potencial.",
    ] },
  { id: "cerdas", name: "Cerdas Recicladas", emoji: "🧹", type: "componente", category: "Componentes",
    hints: [
      "Este componente não costuma aparecer sozinho.",
      "É utilizado em objetos de limpeza.",
      "Tiras plásticas podem ser agrupadas para criá-lo.",
    ] },
  { id: "papel_mache", name: "Papel Machê", emoji: "🗞️", type: "componente", category: "Componentes",
    hints: [
      "Este material é amplamente utilizado em artesanato.",
      "Surge a partir de papel reutilizado.",
      "Jornal e cola são os ingredientes principais.",
    ] },
  { id: "est_brinquedo", name: "Estrutura de Brinquedo", emoji: "🧱", type: "componente", category: "Componentes",
    hints: [
      "Este item serve como base para algo divertido.",
      "Sua origem está em embalagens de papelão.",
      "Peças cortadas podem criar algo novo.",
    ] },
  { id: "est_metalica", name: "Estrutura Metálica", emoji: "⚙️", type: "componente", category: "Componentes",
    hints: [
      "Este item serve de suporte para outras criações.",
      "Surge a partir de alumínio reaproveitado.",
      "Uma lata cortada pode ser transformada em algo mais robusto.",
    ] },
  { id: "recipiente_pet", name: "Recipiente PET", emoji: "🪴", type: "componente", category: "Componentes",
    hints: [
      "Este item pode receber terra, sementes ou plantas.",
      "Surge a partir de uma garrafa plástica muito comum.",
      "Primeiro transforme uma garrafa em um recipiente antes de decorá-lo.",
    ] },
  { id: "assento_reciclado", name: "Assento Reciclado", emoji: "🪑", type: "componente", category: "Componentes",
    hints: [
      "Esta estrutura serve de base para um móvel confortável.",
      "Surge a partir de um resíduo comum em veículos.",
      "Um pneu pode ser preparado antes de receber o revestimento final.",
    ] },

  // Objetos Finais
  {
    id: "vassoura_pet", name: "Vassoura PET", emoji: "🧹", type: "final",
    category: "Utilidades Domésticas", difficulty: "Médio", impact: 5, wasteCount: 18,
    materials: ["18 garrafas PET", "Cola", "Cabo de madeira", "Fita ou arame para fixação"],
    benefit: [
      "Reaproveita aproximadamente 18 garrafas PET.",
      "Reduz a quantidade de plástico descartado.",
      "Substitui produtos fabricados com matéria-prima nova.",
    ],
    application: "Limpeza de ambientes internos e externos.",
    curiosity: "Uma única garrafa PET pode permanecer no ambiente por mais de 400 anos.",
    tutorial: [
      "Lave todas as garrafas PET.",
      "Remova rótulos e tampas.",
      "Corte o fundo das garrafas.",
      "Faça cortes verticais formando tiras finas.",
      "Sobreponha as garrafas para criar volume nas cerdas.",
      "Faça um furo central para encaixe.",
      "Fixe as garrafas ao cabo utilizando arame ou fita resistente.",
      "Ajuste o comprimento das cerdas.",
      "Teste a resistência da vassoura.",
    ],
    hints: [
      "Este objeto ajuda a manter ambientes limpos.",
      "É produzido utilizando plástico reutilizado.",
      "Antes de existir, as garrafas precisam ser transformadas em tiras e depois em cerdas.",
    ],
    explanation: "A reutilização de garrafas PET reduz a quantidade de plástico descartado e transforma resíduos em produtos úteis para o cotidiano.",
  },
  {
    id: "vaso", name: "Vaso Decorativo", emoji: "🪴", type: "final",
    category: "Decoração", difficulty: "Fácil", impact: 2, wasteCount: 1,
    materials: ["Garrafa PET", "Tinta", "Cola"],
    benefit: ["Reutiliza embalagens plásticas.", "Incentiva o reaproveitamento doméstico."],
    application: "Plantio de flores, ervas e decoração.",
    curiosity: "Garrafas PET podem ser transformadas em diversos itens decorativos com baixo custo.",
    tutorial: [
      "Lave a garrafa.",
      "Corte-a na altura desejada.",
      "Lixe as bordas para evitar acidentes.",
      "Pinte utilizando tinta adequada.",
      "Adicione detalhes decorativos.",
      "Faça pequenos furos para drenagem.",
      "Coloque terra e plante a muda.",
    ],
    hints: [
      "Este objeto é utilizado para cultivar plantas.",
      "Sua origem está em uma embalagem plástica muito comum.",
      "Combine a garrafa com algo que dê cor.",
    ],
    explanation: "Transformar embalagens descartáveis em vasos reduz o consumo de produtos novos e dá nova vida ao plástico.",
  },
  {
    id: "horta", name: "Horta Vertical", emoji: "🌱", type: "final",
    category: "Jardinagem", difficulty: "Médio", impact: 4, wasteCount: 6,
    materials: ["Garrafas PET", "Barbante ou corda", "Terra", "Mudas ou sementes"],
    benefit: ["Incentiva a produção de alimentos em pequenos espaços.", "Reutiliza diversas embalagens plásticas."],
    application: "Cultivo de hortaliças e temperos.",
    curiosity: "Uma parede pequena pode produzir diversos temperos para uso doméstico.",
    tutorial: [
      "Corte uma abertura lateral nas garrafas.",
      "Faça furos para drenagem.",
      "Faça furos para passagem da corda.",
      "Passe o barbante formando níveis.",
      "Adicione terra fértil.",
      "Plante sementes ou mudas.",
      "Fixe a estrutura em uma parede ensolarada.",
      "Realize regas periódicas.",
    ],
    hints: [
      "Este objeto permite cultivar alimentos em pouco espaço.",
      "Sua construção utiliza mais de uma embalagem reaproveitada.",
      "Um vaso reciclado pode ser o primeiro passo para sua criação.",
    ],
    explanation: "Hortas verticais demonstram economia circular ao transformar plástico em uma fonte real de alimento.",
  },
  {
    id: "mascara", name: "Máscara Artesanal", emoji: "🎭", type: "final",
    category: "Artesanato", difficulty: "Fácil", impact: 3, wasteCount: 3,
    materials: ["Jornal", "Cola", "Água", "Tinta"],
    benefit: ["Reaproveita papel usado.", "Estimula atividades artísticas sustentáveis."],
    application: "Decoração, teatro e atividades escolares.",
    curiosity: "O papel machê é utilizado há séculos em produções artísticas.",
    tutorial: [
      "Rasgue o jornal em tiras pequenas.",
      "Misture cola e água.",
      "Mergulhe as tiras na mistura.",
      "Modele sobre um molde ou balão.",
      "Aplique várias camadas.",
      "Aguarde secagem completa.",
      "Remova o molde.",
      "Pinte e decore.",
    ],
    hints: [
      "Este objeto é frequentemente utilizado em atividades artísticas.",
      "Sua matéria-prima começa como papel usado.",
      "Primeiro transforme jornais em uma massa moldável, depois adicione cor.",
    ],
    explanation: "O papel machê mostra como resíduos cotidianos podem se transformar em arte e expressão cultural.",
  },
  {
    id: "porta_retrato", name: "Porta-Retrato Sustentável", emoji: "🖼️", type: "final",
    category: "Decoração", difficulty: "Fácil", impact: 3, wasteCount: 2,
    materials: ["Papelão", "Papel machê", "Cola", "Tinta"],
    benefit: ["Reaproveita materiais amplamente descartados."],
    application: "Exposição de fotografias.",
    curiosity: "O papelão é um dos resíduos mais presentes em residências.",
    tutorial: [
      "Corte o papelão em formato de moldura.",
      "Faça um suporte traseiro.",
      "Reforce a estrutura com cola.",
      "Cubra imperfeições com papel machê.",
      "Aguarde secagem.",
      "Pinte.",
      "Insira a fotografia.",
    ],
    hints: [
      "Este objeto guarda recordações importantes.",
      "Ele combina dois materiais muito comuns em embalagens.",
      "Papel machê e papelão possuem um destino interessante juntos.",
    ],
    explanation: "Combinar papelão e papel machê reduz drasticamente o descarte de embalagens residenciais.",
  },
  {
    id: "carrinho", name: "Carrinho Sustentável", emoji: "🚗", type: "final",
    category: "Brinquedos", difficulty: "Médio", impact: 3, wasteCount: 2,
    materials: ["Papelão", "Cola", "Tinta"],
    benefit: ["Reaproveita embalagens descartadas.", "Promove brinquedos sustentáveis."],
    application: "Brinquedo infantil.",
    curiosity: "Brinquedos recicláveis estimulam criatividade e consciência ambiental.",
    tutorial: [
      "Desenhe o modelo no papelão.",
      "Corte todas as peças.",
      "Monte a carroceria.",
      "Produza rodas com sobras de papelão.",
      "Cole as partes.",
      "Aguarde secagem.",
      "Pinte e personalize.",
    ],
    hints: [
      "Este objeto é um brinquedo.",
      "Sua estrutura é construída a partir de caixas descartadas.",
      "Primeiro monte uma estrutura antes de aplicar a pintura.",
    ],
    explanation: "Brinquedos feitos de papelão mostram que diversão pode nascer de materiais simples e reaproveitados.",
  },
  {
    id: "maquete", name: "Maquete Sustentável", emoji: "🏘️", type: "final",
    category: "Educação", difficulty: "Médio", impact: 4, wasteCount: 4,
    materials: ["Papelão", "Jornal", "Cola", "Tinta"],
    benefit: ["Reutiliza resíduos comuns em projetos educativos."],
    application: "Feiras científicas e apresentações.",
    curiosity: "Muitas maquetes profissionais utilizam materiais recicláveis.",
    tutorial: [
      "Planeje o projeto.",
      "Desenhe a base.",
      "Corte as estruturas.",
      "Monte os edifícios.",
      "Faça detalhes utilizando jornal.",
      "Pinte.",
      "Organize os elementos da maquete.",
    ],
    hints: [
      "Este objeto é muito utilizado em apresentações escolares.",
      "Ele nasce da combinação de dois resíduos de papel.",
      "Uma estrutura de papelão pode ganhar novos detalhes com papel machê.",
    ],
    explanation: "Maquetes sustentáveis unem aprendizado e prática ambiental em projetos escolares.",
  },
  {
    id: "porta_lapis", name: "Porta-Lápis", emoji: "✏️", type: "final",
    category: "Utilidades", difficulty: "Fácil", impact: 2, wasteCount: 1,
    materials: ["Lata de alumínio", "Tinta", "Cola"],
    benefit: ["Reutiliza embalagens metálicas.", "Reduz descarte de alumínio."],
    application: "Organização de materiais escolares.",
    curiosity: "O alumínio pode ser reciclado infinitamente.",
    tutorial: [
      "Lave a lata.",
      "Remova resíduos.",
      "Lixe as bordas.",
      "Pinte a superfície.",
      "Decore conforme desejado.",
      "Aguarde secagem.",
      "Utilize para armazenar materiais.",
    ],
    hints: [
      "Este objeto ajuda na organização da mesa de estudos.",
      "Sua matéria-prima principal é metálica.",
      "Uma lata pode ganhar nova função apenas com decoração.",
    ],
    explanation: "Reaproveitar latas reduz drasticamente o consumo energético da produção de alumínio novo.",
  },
  {
    id: "luminaria", name: "Luminária Sustentável", emoji: "💡", type: "final",
    category: "Decoração", difficulty: "Difícil", impact: 4, wasteCount: 3,
    materials: ["Estrutura metálica reciclada", "Garrafa PET", "Lâmpada LED"],
    benefit: ["Combina reaproveitamento de plástico e metal.", "Incentiva iluminação sustentável."],
    application: "Iluminação decorativa.",
    curiosity: "Lâmpadas LED consomem menos energia que lâmpadas convencionais.",
    tutorial: [
      "Limpe os materiais.",
      "Construa a estrutura de suporte.",
      "Corte a garrafa PET.",
      "Modele o difusor de luz.",
      "Fixe o sistema de iluminação LED.",
      "Monte toda a estrutura.",
      "Teste o funcionamento.",
      "Realize acabamento decorativo.",
    ],
    hints: [
      "Este objeto ilumina ambientes.",
      "Sua construção combina plástico e metal.",
      "Uma estrutura metálica pode ganhar uma nova função ao encontrar uma garrafa PET.",
    ],
    explanation: "Unir metal e plástico em uma luminária mostra como múltiplos resíduos podem se combinar em soluções úteis.",
  },
  {
    id: "puff", name: "Puff Sustentável", emoji: "🪑", type: "final",
    category: "Mobiliário", difficulty: "Médio", impact: 5, wasteCount: 1,
    materials: ["Pneu usado", "Papelão / Tecido", "Cola", "Revestimento"],
    benefit: ["Reutiliza resíduos de difícil decomposição.", "Evita descarte inadequado de pneus."],
    application: "Assento residencial.",
    curiosity: "Pneus descartados podem acumular água e favorecer a proliferação de mosquitos.",
    tutorial: [
      "Limpe o pneu.",
      "Corte dois discos de papelão ou madeira para base e tampa.",
      "Fixe as bases.",
      "Reforce a estrutura.",
      "Adicione espuma.",
      "Revestir com tecido.",
      "Finalize o acabamento.",
    ],
    hints: [
      "Este objeto é utilizado para sentar.",
      "Sua origem está em um resíduo encontrado em veículos.",
      "Um pneu revestido com tecido pode virar um móvel.",
    ],
    explanation: "Transformar pneus em móveis evita um dos resíduos mais nocivos de longo prazo no meio ambiente.",
  },
  {
    id: "jardineira", name: "Jardineira Sustentável", emoji: "🌷", type: "final",
    category: "Jardinagem", difficulty: "Fácil", impact: 4, wasteCount: 2,
    materials: ["Pneu usado", "Garrafa PET", "Tinta", "Terra vegetal"],
    benefit: ["Reutiliza dois resíduos de grande volume.", "Incentiva criação de áreas verdes."],
    application: "Cultivo de flores, ervas e plantas ornamentais.",
    curiosity: "Jardineiras feitas de pneus são amplamente utilizadas em projetos comunitários e escolas.",
    tutorial: [
      "Limpe o pneu.",
      "Pinte e decore.",
      "Faça furos de drenagem.",
      "Posicione em local adequado.",
      "Preencha com terra vegetal.",
      "Plante mudas ou sementes.",
      "Regue regularmente.",
      "Faça manutenção periódica.",
    ],
    hints: [
      "Este objeto abriga plantas e flores.",
      "Ele reaproveita dois resíduos bastante comuns.",
      "Um pneu reutilizado pode se transformar em um espaço para cultivo.",
    ],
    explanation: "Jardineiras de pneu transformam resíduos volumosos em áreas verdes acessíveis a qualquer comunidade.",
  },
];

// Recipes: order-insensitive lookup via sorted ids.
export const RECIPES: Recipe[] = [
  { inputs: ["garrafa_pet", "tesoura"], output: "tiras_pet" },
  { inputs: ["tiras_pet", "cola"], output: "cerdas" },
  { inputs: ["jornal", "cola"], output: "papel_mache" },
  { inputs: ["papelao", "tesoura"], output: "est_brinquedo" },
  { inputs: ["lata", "tesoura"], output: "est_metalica" },

  { inputs: ["cerdas", "cabo"], output: "vassoura_pet" },
  { inputs: ["garrafa_pet", "cola"], output: "recipiente_pet" },
  { inputs: ["recipiente_pet", "tinta"], output: "vaso" },
  { inputs: ["recipiente_pet", "barbante"], output: "horta" },
  { inputs: ["vaso", "barbante"], output: "horta" },
  { inputs: ["papel_mache", "tinta"], output: "mascara" },
  { inputs: ["papel_mache", "papelao"], output: "porta_retrato" },
  { inputs: ["est_brinquedo", "tinta"], output: "carrinho" },
  { inputs: ["papelao", "papel_mache"], output: "maquete" },
  { inputs: ["est_brinquedo", "papel_mache"], output: "maquete" },
  { inputs: ["lata", "tinta"], output: "porta_lapis" },
  { inputs: ["est_metalica", "garrafa_pet"], output: "luminaria" },
  { inputs: ["pneu", "cola"], output: "assento_reciclado" },
  { inputs: ["assento_reciclado", "tecido"], output: "puff" },
  { inputs: ["pneu", "tecido"], output: "puff" },
  { inputs: ["pneu", "garrafa_pet"], output: "jardineira" },
];

export function findRecipe(a: string, b: string): string | null {
  const key = [a, b].sort().join("|");
  for (const r of RECIPES) {
    if ([...r.inputs].sort().join("|") === key) return r.output;
  }
  return null;
}

export function getElement(id: string): ElementDef | undefined {
  return ELEMENTS.find((e) => e.id === id);
}

export const FINAL_IDS = ELEMENTS.filter((e) => e.type === "final").map((e) => e.id);
export const STARTER_IDS = ELEMENTS.filter((e) => e.starter).map((e) => e.id);
export const DISCOVERABLE_IDS = ELEMENTS.filter((e) => !e.starter).map((e) => e.id);

export type Rarity = "comum" | "incomum" | "rara" | "epica" | "lendaria";

export interface AchievementDef {
  id: string;
  name: string;
  description: string;
  category: "Descoberta" | "Sustentabilidade" | "Conhecimento" | "Progressão" | "Especiais";
  rarity: Rarity;
  hidden?: boolean;
  reward?: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "primeira_descoberta", name: "Primeira Descoberta", description: "O primeiro passo para transformar resíduos em recursos.", category: "Descoberta", rarity: "comum", reward: "+10 pontos sustentáveis" },
  { id: "pequeno_inventor", name: "Pequeno Inventor", description: "Você começou a enxergar possibilidades onde muitos veem apenas lixo.", category: "Descoberta", rarity: "comum" },
  { id: "explorador", name: "Explorador Sustentável", description: "Seu catálogo de criações está crescendo.", category: "Descoberta", rarity: "incomum" },
  { id: "mestre_combinacoes", name: "Mestre das Combinações", description: "Você dominou completamente o sistema de criação do RECraft.", category: "Descoberta", rarity: "epica" },

  { id: "amigo_natureza", name: "Amigo da Natureza", description: "Cada resíduo reaproveitado representa um impacto positivo.", category: "Sustentabilidade", rarity: "comum" },
  { id: "guardiao", name: "Guardião Ambiental", description: "Você já evitou que dezenas de materiais fossem descartados.", category: "Sustentabilidade", rarity: "incomum" },
  { id: "heroi", name: "Herói da Reciclagem", description: "Seu impacto ambiental positivo já é significativo.", category: "Sustentabilidade", rarity: "rara" },
  { id: "mestre_reutilizacao", name: "Mestre da Reutilização", description: "Você demonstrou que resíduos podem ganhar novas vidas.", category: "Sustentabilidade", rarity: "epica" },

  { id: "curioso", name: "Curioso", description: "Todo aprendizado começa com uma pergunta.", category: "Conhecimento", rarity: "comum" },
  { id: "aprendiz", name: "Aprendiz Sustentável", description: "Você está aprendendo a transformar teoria em prática.", category: "Conhecimento", rarity: "incomum" },
  { id: "artesao", name: "Artesão Consciente", description: "Agora você conhece todas as possibilidades apresentadas pelo jogo.", category: "Conhecimento", rarity: "rara" },

  { id: "primeira_criacao", name: "Primeira Criação", description: "Uma ideia se transformou em realidade.", category: "Progressão", rarity: "comum" },
  { id: "colecionador", name: "Colecionador", description: "Você já descobriu metade das possibilidades.", category: "Progressão", rarity: "incomum" },
  { id: "catalogo_completo", name: "Catálogo Completo", description: "Nenhum segredo do RECraft permanece escondido.", category: "Progressão", rarity: "lendaria" },
  { id: "especialista", name: "Especialista Circular", description: "Você domina a arte da reutilização.", category: "Progressão", rarity: "epica" },

  { id: "persistente", name: "Persistente", description: "Quem experimenta aprende.", category: "Especiais", rarity: "incomum", hidden: true },
  { id: "sem_dicas", name: "Sem Dicas", description: "Você confiou totalmente na sua criatividade.", category: "Especiais", rarity: "rara", hidden: true },
  { id: "detetive", name: "Detetive da Reciclagem", description: "Poucos conseguem chegar tão longe sozinhos.", category: "Especiais", rarity: "epica", hidden: true },
  { id: "rapida", name: "Descoberta Rápida", description: "Velocidade e criatividade caminharam juntas.", category: "Especiais", rarity: "rara", hidden: true },
];

export const RARITY_COLORS: Record<Rarity, string> = {
  comum: "text-slate-500 border-slate-400",
  incomum: "text-emerald-600 border-emerald-500",
  rara: "text-sky-600 border-sky-500",
  epica: "text-purple-600 border-purple-500",
  lendaria: "text-amber-600 border-amber-500",
};
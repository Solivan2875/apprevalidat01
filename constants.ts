import { Station } from './types';

export const USERS_KEY = "revalida-practice-users-v1";

export const DEFAULT_STATIONS: Station[] = [
  {
    id: "CM-URTICARIA",
    area: "Clínica Médica",
    title: "Urticária aguda pós-AINE (João, 20 anos)",
    pepMinutes: 10,
    weight: 1,
    script: `
NOME: João
IDADE: 20 anos
OCUPAÇÃO: Estudante universitário
ESTADO CIVIL: Solteiro

QUEIXA PRINCIPAL: "Coceira insuportável no corpo todo."

HISTÓRIA DA DOENÇA ATUAL (HDA):
- Início: há 4 dias.
- Lesões: avermelhadas e elevadas, pruriginosas, que pioram com o ato de coçar.
- Evolução das lesões: desaparecem em 8 a 10 horas sem deixar marcas, mas outras novas surgem em seguida em outros locais.
- Prurido: intensidade constante, sem período de melhora ou piora.
- Sintomas associados: nega outros sintomas.

HISTÓRICO DE USO DE MEDICAÇÕES:
- Sofreu uma contusão no tornozelo direito há 1 semana (praticando esporte).
- Desde então, está em uso de Nimesulida 100mg, 2 vezes ao dia.
- Usou Dipirona para dor nos primeiros dias após o trauma, mas poucas vezes.
- Tomou um comprimido para aliviar a coceira, que ajudou um pouco, mas não sabe o nome.

ANTECEDENTES:
- Episódio similar de lesões na pele há algum tempo, após tomar um remédio para gripe (não recorda o nome).
- Nega doenças recentes.
- Nega alergias conhecidas.
- Nega doenças pré-existentes.

PERGUNTAS A FAZER AO MÉDICO (se a anamnese for adequada):
- Qual é o diagnóstico?
- Qual é o tratamento?
- Preciso fazer algum exame?
`,
    personality: "Jovem, um pouco ansioso e assustado com as placas repentinas no corpo, mas colaborativo.",
    evaluationCriteria: `
1. Apresenta-se:
- Identifica-se; e
- Cumprimenta o paciente simulado.
PADRÃO ESPERADO: Adequado: realiza as duas ações. Parcialmente adequado: realiza apenas uma ação. Inadequado: não realiza ação alguma.

2. Pergunta sobre as manifestações e suas características:
- Início ou duração do prurido; e
- Lesões de pele/solicita ver a lesão.
PADRÃO ESPERADO: Adequado: investiga os dois itens. Parcialmente adequado: investiga apenas um item. Inadequado: não investiga item algum.

3. Pergunta sobre as manifestações associadas:
- Febre;
- Linfadenopatias;
- Tosse;
- Dispneia; e
- Manifestações digestivas (OU náuseas OU vômitos OU diarreia).
PADRÃO ESPERADO: Adequado: investiga quatro ou mais itens. Parcialmente adequado: investiga dois ou três itens. Inadequado: investiga apenas um item OU não investiga item algum.

4. Pergunta sobre desencadeantes e agravantes:
- Uso de medicamentos;
- Alimentos;
- Produtos de higiene/limpeza/cosméticos;
- Picadas/ferroadas de insetos/plantas; e
- Contatos com novas substâncias/joias.
- Contatos com animais (pelo de gato e/ou de cão); e
- Estímulos físicos (frio e/ou calor).
PADRÃO ESPERADO: Adequado: investiga quatro ou mais fatores. Parcialmente adequado: investiga dois ou três fatores. Inadequado: investiga apenas um fator OU não investiga fator algum.

5. Pergunta sobre antecedentes pessoais:
- Doenças prévias (autoimunes; alérgicas; infecciosas); e
- Uso de drogas lícitas ou ilícitas.
PADRÃO ESPERADO: Adequado: pergunta os dois itens. Parcialmente adequado: pergunta apenas um item. Inadequado: não pergunta item algum.

6. Formula hipótese diagnóstica da lesão de pele.
PADRÃO ESPERADO: Adequado: formula hipótese de Urticária aguda relacionada a medicamentos. Parcialmente adequado: formula hipótese de "reação alérgica" a medicamentos ou apenas "urticária". Inadequado: não verbaliza o diagnóstico correto.

7. Conduta médica relacionada a farmacodermia.
- Suspende o uso das medicações (AINE e analgésico); e
- Prescreve anti-histamínico oral.
PADRÃO ESPERADO: Adequado: indica as duas condutas. Parcialmente adequado: indica apenas uma. Inadequado: não indica nenhuma.

8. Recomenda.
- Retorno se houver persistência ou piora dos sintomas; e
- Evitar uso futuro de dipirona e AINEs.
PADRÃO ESPERADO: Adequado: recomenda os dois itens. Parcialmente adequado: recomenda só um item. Inadequado: não recomenda item algum.
`
  },
];
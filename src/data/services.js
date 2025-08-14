export const services = [
  // Laudos
  { id: 'spda', nome: 'SPDA', descricao: 'Sistema de Proteção contra Descargas Atmosféricas', preco_padrao: 18.88, categoria: 'Laudos' },
  { id: 'sistema-incendio', nome: 'Sistema de Incêndio', descricao: 'Laudo de sistema de incêndio', preco_padrao: 18.88, categoria: 'Laudos' },
  { id: 'abrangencia-geradores', nome: 'Abrangência de Geradores', descricao: 'Laudo de abrangência de geradores', preco_padrao: 18.88, categoria: 'Laudos' },
  { id: 'inst-eletricas', nome: 'Instalações Elétricas', descricao: 'Laudo de instalações elétricas', preco_padrao: 18.88, categoria: 'Laudos' },
  { id: 'surp-plano-abandono', nome: 'Surp. Plano de Abandono', descricao: 'Laudo de plano de abandono', preco_padrao: 18.88, categoria: 'Laudos' },
  { id: 'avcb', nome: 'AVCB', descricao: 'Auto de Vistoria do Corpo de Bombeiros', preco_padrao: 18.88, categoria: 'Laudos' },
  { id: 'calculo-demanda', nome: 'Cálculo de Demanda Elétrica', descricao: 'Cálculo de demanda elétrica', preco_padrao: 18.88, categoria: 'Laudos' },
  { id: 'inspecao-termografica', nome: 'Inspeção Termográfica', descricao: 'Laudo de inspeção termográfica', preco_padrao: 18.88, categoria: 'Laudos' },

  // Iluminação
  { id: 'arandela', nome: 'Arandela, pendente ou spot comum', descricao: '', preco_padrao: 70.00, categoria: 'Iluminação' },
  { id: 'lampada-tubular', nome: 'Lâmpada fluorescente/LED (tubular)', descricao: '', preco_padrao: 70.00, categoria: 'Iluminação' },
  { id: 'lustre-simples', nome: 'Lustre simples / luminária', descricao: '', preco_padrao: 90.00, categoria: 'Iluminação' },
  { id: 'lustre-grande', nome: 'Lustre grande', descricao: '', preco_padrao: 135.00, categoria: 'Iluminação' },
  { id: 'refletor-jardim', nome: 'Refletor de jardim', descricao: '', preco_padrao: 110.00, categoria: 'Iluminação' },
  { id: 'refletor-poste', nome: 'Refletor de poste', descricao: '', preco_padrao: 130.00, categoria: 'Iluminação' },

  // Tomadas e Interruptores
  { id: 'interruptor-simples', nome: 'Interruptor simples ou pulsador', descricao: '', preco_padrao: 50.00, categoria: 'Tomadas e Interruptores' },
  { id: 'interruptor-threeway', nome: 'Interruptor three-way / four-way', descricao: '', preco_padrao: 60.00, categoria: 'Tomadas e Interruptores' },
  { id: 'interruptor-duplo', nome: 'Interruptor duplo / bipolar', descricao: '', preco_padrao: 60.00, categoria: 'Tomadas e Interruptores' },
  { id: 'interruptor-tomada', nome: 'Interruptor + tomada (conjunto)', descricao: '', preco_padrao: 60.00, categoria: 'Tomadas e Interruptores' },
  { id: 'tomada-simples', nome: 'Tomada simples', descricao: '', preco_padrao: 40.00, categoria: 'Tomadas e Interruptores' },
  { id: 'tomada-dupla', nome: 'Tomada dupla', descricao: '', preco_padrao: 50.00, categoria: 'Tomadas e Interruptores' },
  { id: 'tomada-tripla', nome: 'Tomada tripla', descricao: '', preco_padrao: 60.00, categoria: 'Tomadas e Interruptores' },
  { id: 'tomada-piso', nome: 'Tomada de piso ou telefone', descricao: '', preco_padrao: 60.00, categoria: 'Tomadas e Interruptores' },
  { id: 'tomada-industrial', nome: 'Tomada industrial (3P+t)', descricao: '', preco_padrao: 100.00, categoria: 'Tomadas e Interruptores' },

  // Ventiladores e Chuveiros
  { id: 'ventilador-teto', nome: 'Ventilador de teto', descricao: '', preco_padrao: 140.00, categoria: 'Ventiladores e Chuveiros' },
  { id: 'ventilador-parede', nome: 'Ventilador de parede', descricao: '', preco_padrao: 90.00, categoria: 'Ventiladores e Chuveiros' },
  { id: 'chuveiro-simples', nome: 'Chuveiro elétrico simples', descricao: '', preco_padrao: 90.00, categoria: 'Ventiladores e Chuveiros' },
  { id: 'chuveiro-luxo', nome: 'Chuveiro luxo/pressurizado', descricao: '', preco_padrao: 135.00, categoria: 'Ventiladores e Chuveiros' },
  { id: 'troca-resistencia-chuveiro', nome: 'Troca de resistência de chuveiro', descricao: '', preco_padrao: 80.00, categoria: 'Ventiladores e Chuveiros' },
  { id: 'torneira-eletrica', nome: 'Torneira elétrica', descricao: '', preco_padrao: 90.00, categoria: 'Ventiladores e Chuveiros' },

  // Interfonia, CFTV e Portões
  { id: 'campainha', nome: 'Campainha (até 20m)', descricao: '', preco_padrao: 70.00, categoria: 'Interfonia, CFTV e Portões' },
  { id: 'interfone-1', nome: 'Interfone (1 chamada)', descricao: '', preco_padrao: 160.00, categoria: 'Interfonia, CFTV e Portões' },
  { id: 'interfone-2', nome: 'Interfone (2 chamadas)', descricao: '', preco_padrao: 200.00, categoria: 'Interfonia, CFTV e Portões' },
  { id: 'interfone-4', nome: 'Interfone (4 chamadas)', descricao: '', preco_padrao: 400.00, categoria: 'Interfonia, CFTV e Portões' },
  { id: 'videoporteiro', nome: 'Videoporteiro', descricao: '', preco_padrao: 185.00, categoria: 'Interfonia, CFTV e Portões' },
  { id: 'camera-wifi', nome: 'Câmera CFTV Wi-Fi (sem ponto elétrico)', descricao: '', preco_padrao: 150.00, categoria: 'Interfonia, CFTV e Portões' },
  { id: 'tres-cameras-wifi', nome: '3 câmeras Wi-Fi (sem ponto elétrico)', descricao: '', preco_padrao: 330.00, categoria: 'Interfonia, CFTV e Portões' },
  { id: 'portao-deslizante', nome: 'Portão eletrônico deslizante', descricao: '', preco_padrao: 250.00, categoria: 'Interfonia, CFTV e Portões' },
  { id: 'portao-pivotante', nome: 'Portão eletrônico pivotante/basculante', descricao: '', preco_padrao: 460.00, categoria: 'Interfonia, CFTV e Portões' },

  // Alarmes e Emergência
  { id: 'botoneira', nome: 'Botoneira para fechadura eletrônica', descricao: '', preco_padrao: 60.00, categoria: 'Alarmes e Emergência' },
  { id: 'fechadura-eletronica', nome: 'Fechadura eletrônica (portão social)', descricao: '', preco_padrao: 150.00, categoria: 'Alarmes e Emergência' },
  { id: 'exaustor', nome: 'Exaustor (cozinha ou banheiro)', descricao: '', preco_padrao: 220.00, categoria: 'Alarmes e Emergência' },
  { id: 'alarme-residencial', nome: 'Instalação de sistema de alarme residencial', descricao: '', preco_padrao: 850.00, categoria: 'Alarmes e Emergência' },
  { id: 'aquecedor-eletrico', nome: 'Aquecedor elétrico (com passagem de cabos)', descricao: '', preco_padrao: 2200.00, categoria: 'Alarmes e Emergência' },
  { id: 'detector-fumaca', nome: 'Detector de fumaça', descricao: '', preco_padrao: 1500.00, categoria: 'Alarmes e Emergência' },
  { id: 'cerca-eletrica', nome: 'Cerca elétrica (por metro)', descricao: 'Preço por metro', preco_padrao: 70.00, categoria: 'Alarmes e Emergência' },
  { id: 'nobreak', nome: 'Nobreak', descricao: '', preco_padrao: 280.00, categoria: 'Alarmes e Emergência' },
  { id: 'aquecedor-gas', nome: 'Aquecedor a gás', descricao: '', preco_padrao: 320.00, categoria: 'Alarmes e Emergência' },
  { id: 'termostato', nome: 'Termostato/temporizador', descricao: '', preco_padrao: 90.00, categoria: 'Alarmes e Emergência' },
  { id: 'detectores-presenca', nome: 'Detectores de Presença', descricao: 'Instalação de detectores de presença', preco_padrao: 90.00, categoria: 'Alarmes e Emergência' },
  { id: 'iluminacao-emergencia', nome: 'Iluminação de Emergência', descricao: 'Instalação de iluminação de emergência', preco_padrao: 180.00, categoria: 'Alarmes e Emergência' },

  // Quadros e Proteções
  { id: 'troca-disjuntor-monofasico', nome: 'Troca de disjuntor monofásico', descricao: '', preco_padrao: 50.00, categoria: 'Quadros e Proteções' },
  { id: 'troca-disjuntor-bifasico', nome: 'Troca de disjuntor bifásico', descricao: '', preco_padrao: 70.00, categoria: 'Quadros e Proteções' },
  { id: 'troca-disjuntor-trifasico', nome: 'Troca de disjuntor trifásico', descricao: '', preco_padrao: 100.00, categoria: 'Quadros e Proteções' },
  { id: 'instalacao-dr', nome: 'Instalação de DR (IDR)', descricao: '', preco_padrao: 130.00, categoria: 'Quadros e Proteções' },
  { id: 'instalacao-dps', nome: 'Instalação de DPS', descricao: '', preco_padrao: 110.00, categoria: 'Quadros e Proteções' },
  { id: 'barramentos', nome: 'Barramentos (Mono/Bi/Trifásico)', descricao: 'Preço médio (60-80)', preco_padrao: 70.00, categoria: 'Quadros e Proteções' },
  { id: 'haste-aterramento', nome: 'Haste de aterramento', descricao: '', preco_padrao: 180.00, categoria: 'Quadros e Proteções' },
  { id: 'contator-rele', nome: 'Contator e/ou relé térmico', descricao: '', preco_padrao: 200.00, categoria: 'Quadros e Proteções' },
  { id: 'qdc-6', nome: 'QDC com 6 circuitos + DR + DPS', descricao: '', preco_padrao: 485.00, categoria: 'Quadros e Proteções' },
  { id: 'qdc-12', nome: 'QDC com 12 circuitos + DR + DPS', descricao: '', preco_padrao: 725.00, categoria: 'Quadros e Proteções' },
  { id: 'qdc-18', nome: 'QDC com 18 circuitos + DR + DPS', descricao: '', preco_padrao: 900.00, categoria: 'Quadros e Proteções' },
  { id: 'qdc-24', nome: 'QDC com 24 circuitos + DR + DPS', descricao: '', preco_padrao: 1200.00, categoria: 'Quadros e Proteções' },

  // Passagem de Cabos e Eletrodutos
  { id: 'passagem-cabo-1-2-5', nome: 'Passagem de cabo 1,5mm² ou 2,5mm²', descricao: 'R$ 8,00 a R$ 12,00 / metro', preco_padrao: 10.00, categoria: 'Passagem de Cabos e Eletrodutos' },
  { id: 'passagem-cabo-4-10', nome: 'Passagem de cabo 4mm² a 10mm²', descricao: 'R$ 12,00 a R$ 18,00 / metro', preco_padrao: 15.00, categoria: 'Passagem de Cabos e Eletrodutos' },
  { id: 'passagem-eletroduto-pvc', nome: 'Passagem de eletroduto PVC (20–32mm)', descricao: 'R$ 10,00 a R$ 16,00 / metro', preco_padrao: 13.00, categoria: 'Passagem de Cabos e Eletrodutos' },
  { id: 'passagem-eletroduto-galvanizado', nome: 'Passagem de eletroduto galvanizado (3/4" a 1")', descricao: 'R$ 18,00 a R$ 25,00 / metro', preco_padrao: 21.50, categoria: 'Passagem de Cabos e Eletrodutos' },
  { id: 'cabeamento-estruturado', nome: 'Cabeamento estruturado (rede/telefonia)', descricao: 'R$ 8,00 a R$ 14,00 / metro', preco_padrao: 11.00, categoria: 'Passagem de Cabos e Eletrodutos' },
  { id: 'instalacao-eletrocalha', nome: 'Instalação de eletrocalha/leito', descricao: 'R$ 20,00 a R$ 30,00 / metro', preco_padrao: 25.00, categoria: 'Passagem de Cabos e Eletrodutos' },

  // Instalações Específicas
  { id: 'alimentacao-motores', nome: 'Alimentação elétrica para motores', descricao: '', preco_padrao: 180.00, categoria: 'Instalações Específicas' },
  { id: 'medidor-monofasico', nome: 'Instalação de medidor monofásico', descricao: '', preco_padrao: 1300.00, categoria: 'Instalações Específicas' },
  { id: 'medidor-bifasico', nome: 'Instalação de medidor bifásico', descricao: '', preco_padrao: 1500.00, categoria: 'Instalações Específicas' },
  { id: 'medidor-trifasico', nome: 'Instalação de medidor trifásico', descricao: '', preco_padrao: 1700.00, categoria: 'Instalações Específicas' },
  { id: 'painel-solar-8kwp', nome: 'Instalação de painel solar (8 kWp)', descricao: '', preco_padrao: 8000.00, categoria: 'Instalações Específicas' },
  { id: 'atendimento-emergencial-dia', nome: 'Atendimento técnico emergencial (dia útil)', descricao: '', preco_padrao: 180.00, categoria: 'Instalações Específicas' },
  { id: 'atendimento-emergencial-fds', nome: 'Atendimento técnico emergencial (final de semana)', descricao: '', preco_padrao: 240.00, categoria: 'Instalações Específicas' },

  // Manutenção
  { id: 'manutencao-preventiva', nome: 'Manutenção Preventiva', descricao: 'Manutenção preventiva de instalações elétricas', preco_padrao: 200.00, categoria: 'Manutenção' },
  { id: 'manutencao-corretiva', nome: 'Manutenção Corretiva', descricao: 'Manutenção corretiva de instalações elétricas', preco_padrao: 180.00, categoria: 'Manutenção' },
  { id: 'manutencao-preditiva', nome: 'Manutenção Preditiva', descricao: 'Manutenção preditiva de instalações elétricas', preco_padrao: 250.00, categoria: 'Manutenção' },
  { id: 'troca-lampadas', nome: 'Troca de Lâmpadas', descricao: 'Troca de lâmpadas', preco_padrao: 50.00, categoria: 'Manutenção' },
  { id: 'troca-reatores', nome: 'Troca de Reatores', descricao: 'Troca de reatores eletrônicos', preco_padrao: 80.00, categoria: 'Manutenção' },
  { id: 'troca-fusivel', nome: 'Troca de Fusível', descricao: 'Troca de fusíveis', preco_padrao: 40.00, categoria: 'Manutenção' },
  { id: 'teste-isolacao', nome: 'Teste de Resistência de Isolação', descricao: 'Teste de resistência de isolação', preco_padrao: 220.00, categoria: 'Manutenção' },

  // Projetos
  { id: 'projeto-eletrico-residencial', nome: 'Projeto Elétrico Residencial', descricao: 'Elaboração de projeto elétrico residencial', preco_padrao: 800.00, categoria: 'Projetos' },
  { id: 'projeto-eletrico-comercial', nome: 'Projeto Elétrico Comercial', descricao: 'Elaboração de projeto elétrico comercial', preco_padrao: 1200.00, categoria: 'Projetos' },
  { id: 'projeto-eletrico-industrial', nome: 'Projeto Elétrico Industrial', descricao: 'Elaboração de projeto elétrico industrial', preco_padrao: 2000.00, categoria: 'Projetos' },
  { id: 'projeto-spda', nome: 'Projeto de SPDA', descricao: 'Elaboração de projeto de SPDA', preco_padrao: 600.00, categoria: 'Projetos' },
  { id: 'projeto-automacao', nome: 'Projeto de Automação', descricao: 'Elaboração de projeto de automação elétrica', preco_padrao: 1500.00, categoria: 'Projetos' },
  { id: 'projeto-eficiencia', nome: 'Projeto de Eficiência Energética', descricao: 'Elaboração de projeto de eficiência energética', preco_padrao: 1000.00, categoria: 'Projetos' },
  { id: 'projeto-energia-solar', nome: 'Projeto de Energia Solar', descricao: 'Elaboração de projeto de energia solar', preco_padrao: 1800.00, categoria: 'Projetos' },

  // Outros
  { id: 'consultoria-eletrica', nome: 'Consultoria Elétrica', descricao: 'Consultoria técnica elétrica', preco_padrao: 200.00, categoria: 'Outros' },
  { id: 'pericia-tecnica', nome: 'Perícia Técnica', descricao: 'Perícia técnica em eletricidade', preco_padrao: 500.00, categoria: 'Outros' },
  { id: 'certificacao-instalacoes', nome: 'Certificação de Instalações', descricao: 'Certificação de instalações elétricas', preco_padrao: 400.00, categoria: 'Outros' },
  { id: 'treinamento-nr10', nome: 'Treinamento NR10', descricao: 'Treinamento de segurança NR10 para eletricistas', preco_padrao: 350.00, categoria: 'Outros' }
];

export const categories = [
  'Laudos',
  'Iluminação',
  'Tomadas e Interruptores',
  'Ventiladores e Chuveiros',
  'Interfonia, CFTV e Portões',
  'Alarmes e Emergência',
  'Quadros e Proteções',
  'Passagem de Cabos e Eletrodutos',
  'Instalações Específicas',
  'Manutenção',
  'Projetos',
  'Outros'
];

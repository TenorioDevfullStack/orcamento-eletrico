# Orçamento Elétrico - PWA

Sistema Progressive Web App (PWA) para geração de orçamentos de serviços elétricos, desenvolvido especificamente para eletricistas e engenheiros eletricistas realizarem visitas técnicas e gerarem orçamentos de forma rápida e profissional.

## 🚀 Funcionalidades

### ✅ Gestão de Clientes
- Cadastro de clientes com nome, contato e endereço
- Validação de campos obrigatórios
- Interface intuitiva para preenchimento rápido

### ⚡ Catálogo de Serviços
- **40+ serviços pré-definidos** organizados por categorias:
  - **Laudos**: SPDA, Sistema de Incêndio, AVCB, Cálculo de Demanda, etc.
  - **Instalações**: Iluminação, Tomadas, Quadros, DPS, Aterramento, etc.
  - **Manutenção**: Preventiva, Corretiva, Preditiva, Troca de componentes
  - **Projetos**: Elétricos (Residencial/Comercial/Industrial), SPDA, Automação
  - **Outros**: Emergência 24h, Consultoria, Perícia Técnica, etc.

### 🔧 Personalização de Orçamentos
- Seleção múltipla de serviços via checkbox
- Definição de quantidade por serviço
- Edição de preços individuais por orçamento
- Campo de observações específicas para cada serviço
- Adição de serviços manuais não listados
- Inclusão de despesas extras (combustível, deslocamento, etc.)
- Observações gerais do orçamento

### 📊 Geração de Orçamentos
- Cálculo automático do valor total
- Visualização completa antes da finalização
- Resumo organizado por categorias
- Data de criação automática
- Interface para impressão/compartilhamento

### 📱 Recursos PWA
- **Funciona offline** após primeira visita
- **Instalável** como app nativo no celular/tablet
- **Responsivo** para todos os tamanhos de tela
- **Rápido** com cache inteligente
- **Seguro** com HTTPS

## 🛠️ Tecnologias Utilizadas

- **React 18** - Framework principal
- **Vite** - Build tool e dev server
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes de interface
- **Lucide React** - Ícones
- **Service Worker** - Funcionalidade offline
- **Web App Manifest** - Instalação como PWA

## 🚀 Como Usar

### 1. Instalação Local
```bash
# Clone o repositório
git clone <url-do-repositorio>

# Entre na pasta
cd orcamento-eletrico

# Instale as dependências
pnpm install

# Execute o servidor de desenvolvimento
pnpm run dev
```

### 2. Uso da Aplicação

#### Passo 1: Dados do Cliente
- Preencha nome e contato (obrigatórios)
- Adicione endereço se necessário
- Clique em "Próximo: Selecionar Serviços"

#### Passo 2: Seleção de Serviços
- Navegue pelas categorias de serviços
- Marque os checkboxes dos serviços necessários
- Para cada serviço selecionado:
  - Informe a quantidade a ser instalada
  - Ajuste o preço se necessário
  - Adicione observações específicas
- Clique em "Próximo: Serviços Extras"

#### Passo 3: Serviços Extras
- **Serviços Adicionais**: Adicione serviços não listados
- **Despesas Extras**: Inclua combustível, deslocamento, etc.
- **Observações Gerais**: Adicione informações importantes
- Clique em "Finalizar: Ver Orçamento"

#### Passo 4: Orçamento Final
- Revise todos os itens e valores
- Caso necessário, informe uma porcentagem de desconto
- Visualize o total calculado automaticamente
- Clique em "Gerar Orçamento" para finalizar
- Use "Novo Orçamento" para começar outro

### 3. Instalação como PWA

#### No Android:
1. Abra o site no Chrome
2. Toque no menu (3 pontos)
3. Selecione "Adicionar à tela inicial"
4. Confirme a instalação

#### No iOS:
1. Abra o site no Safari
2. Toque no botão de compartilhar
3. Selecione "Adicionar à Tela de Início"
4. Confirme a instalação

## 💰 Tabela de Preços Padrão

### Laudos
- Valor base: R$ 18,88/m²
- SPDA
- Sistema de Incêndio
- AVCB
- Instalações Elétricas
- Cálculo de Demanda
- Inspeção Termográfica

### Instalações
- Iluminação: R$ 150,00
- Tomadas: R$ 80,00
- Quadros: R$ 250,00
- Painéis Solares: R$ 2.500,00
- Aterramento: R$ 200,00
- Iluminação de Emergência: R$ 180,00

### Manutenção
- Manutenção Preventiva: R$ 200,00
- Manutenção Corretiva: R$ 180,00
- Teste de Resistência de Isolação: R$ 220,00

### Projetos
- Projeto Residencial: R$ 800,00
- Projeto Comercial: R$ 1.200,00
- Projeto Industrial: R$ 2.000,00
- Projeto de Automação: R$ 1.500,00
- Projeto de Energia Solar: R$ 1.800,00

### Outros
- Consultoria Elétrica: R$ 200,00
- Treinamento NR10: R$ 350,00

*Preços podem ser ajustados individualmente em cada orçamento*

## 🔧 Personalização

### Adicionando Novos Serviços
Edite o arquivo `src/data/services.js` para adicionar novos serviços:

```javascript
{
  id: 'novo-servico',
  nome: 'Nome do Serviço',
  descricao: 'Descrição detalhada',
  preco_padrao: 100.00,
  categoria: 'Categoria'
}
```

### Modificando Categorias
As categorias disponíveis estão no final do arquivo `src/data/services.js`:

```javascript
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
```

## 📱 Compatibilidade

- ✅ Chrome (Android/Desktop)
- ✅ Safari (iOS/macOS)
- ✅ Firefox (Android/Desktop)
- ✅ Edge (Desktop)
- ✅ Samsung Internet (Android)

## 🚀 Deploy

### Opção 1: Vercel (Recomendado)
```bash
# Instale a CLI da Vercel
npm i -g vercel

# Faça o deploy
vercel

# Para deploys futuros
vercel --prod
```

### Opção 2: Netlify
```bash
# Build da aplicação
pnpm run build

# Faça upload da pasta dist/ no Netlify
```

### Opção 3: GitHub Pages
```bash
# Instale gh-pages
npm install --save-dev gh-pages

# Adicione ao package.json:
"homepage": "https://seuusuario.github.io/orcamento-eletrico",
"scripts": {
  "predeploy": "pnpm run build",
  "deploy": "gh-pages -d dist"
}

# Deploy
pnpm run deploy
```

## 📄 Licença

Este projeto foi desenvolvido especificamente para uso profissional de eletricistas e engenheiros eletricistas.

## 🆘 Suporte

Para dúvidas ou sugestões sobre o sistema, entre em contato através dos canais de suporte.

---

**Desenvolvido com ⚡ para profissionais da área elétrica**


## 📦 Empacotamento para Android e iOS

Este projeto pode ser convertido em um aplicativo nativo utilizando [Capacitor](https://capacitorjs.com/).

### Passos

1. Gere os arquivos da web:
   ```bash
   pnpm build
   ```
2. Sincronize os projetos nativos:
   ```bash
   pnpm sync
   ```
3. Abra o projeto desejado:
   ```bash
   pnpm android   # abre no Android Studio
   pnpm ios       # abre no Xcode
   ```

Após a abertura, use as ferramentas do Android Studio ou Xcode para gerar os instaladores (APK/AAB ou IPA).

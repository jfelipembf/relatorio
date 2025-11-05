# Blue November - Painel Swim

Sistema de gerenciamento para natação com dashboards interativos e relatórios detalhados.

## 🚀 Deploy no Easypanel

Este projeto está configurado para deploy no Easypanel via Git.

### 📋 Pré-requisitos

- Conta no Easypanel
- VPS no Hostingur conectada
- Domínio configurado (opcional)

### 🔧 Configuração no Easypanel

1. **Conectar repositório Git:**
   - URL: `https://github.com/jfelipembf/relatorio.git`
   - Branch: `main`

2. **Configurar serviço:**
   - Tipo: `Docker Compose`
   - Arquivo: `docker-compose.yml` (se existir)

3. **Variáveis de ambiente:**
   ```
   VITE_SUPABASE_URL=https://xpzehnazhjzeaztzlxvr.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwemVobmF6aGp6ZWF6dHpseHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Nzg2MzcsImV4cCI6MjA3MzM1NDYzN30.V_D5nQzW6gXd8Ua53t5KZ6-uClZVQkihj_jirg7kvss
   ```

4. **Configurar domínio:**
   - Adicionar domínio do Hostingur
   - Ativar SSL automático

### 🏗️ Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### 📦 Tecnologias Utilizadas

- **React 18** - Framework frontend
- **Vite** - Build tool e dev server
- **Supabase** - Backend e banco de dados
- **Plotly.js** - Gráficos interativos
- **Tailwind CSS** - Estilização

### 🏊 Funcionalidades

- 📊 Dashboards de performance
- 📈 Relatórios detalhados
- 👥 Gestão de alunos
- 🏆 Rankings e avaliações
- 📱 Interface responsiva

---

**Deploy automático:** Todo push para a branch `main` será automaticamente implantado no Easypanel.

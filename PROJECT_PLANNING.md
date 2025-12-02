# 📊 Planejamento de Projeto - Sistema Field Service

## Gráfico de Gantt - Lista de Tarefas

Este documento apresenta o planejamento detalhado do desenvolvimento do Sistema de Gestão de Equipes Externas (Field Service Management System), com estimativas de tempo para uma equipe de **1 desenvolvedor**.

---

## 📋 Resumo Executivo

| Fase | Duração (Semanas) | Início | Término |
|------|-------------------|--------|---------|
| 1. Levantamento de Requisitos | 2 | Semana 1 | Semana 2 |
| 2. Modelagem de Banco de Dados | 1 | Semana 3 | Semana 3 |
| 3. Desenvolvimento Backend | 4 | Semana 4 | Semana 7 |
| 4. Desenvolvimento Frontend Web | 3 | Semana 8 | Semana 10 |
| 5. Desenvolvimento Mobile App | 4 | Semana 11 | Semana 14 |
| 6. Testes | 2 | Semana 15 | Semana 16 |
| 7. Deploy | 1 | Semana 17 | Semana 17 |
| **TOTAL** | **17 semanas** | - | - |

---

## 📝 Fase 1: Levantamento de Requisitos
**Duração:** 2 semanas (Semana 1-2)

### Tarefas:

| ID | Tarefa | Duração | Dependências |
|----|--------|---------|--------------|
| 1.1 | Análise de stakeholders e usuários do sistema | 2 dias | - |
| 1.2 | Levantamento de requisitos funcionais | 3 dias | 1.1 |
| 1.3 | Levantamento de requisitos não-funcionais | 2 dias | 1.1 |
| 1.4 | Definição de casos de uso (Admin, Técnico, Cliente) | 3 dias | 1.2, 1.3 |
| 1.5 | Prototipagem de telas (wireframes) | 3 dias | 1.4 |
| 1.6 | Validação de requisitos e aprovação | 2 dias | 1.5 |

### Entregáveis:
- [ ] Documento de Requisitos Funcionais
- [ ] Documento de Requisitos Não-Funcionais
- [ ] Diagrama de Casos de Uso
- [ ] Wireframes das principais telas
- [ ] Ata de aprovação dos requisitos

---

## 🗄️ Fase 2: Modelagem de Banco de Dados
**Duração:** 1 semana (Semana 3)

### Tarefas:

| ID | Tarefa | Duração | Dependências |
|----|--------|---------|--------------|
| 2.1 | Modelagem conceitual (DER) | 2 dias | 1.6 |
| 2.2 | Modelagem lógica | 1 dia | 2.1 |
| 2.3 | Definição do schema Prisma | 1 dia | 2.2 |
| 2.4 | Criação das migrations | 0.5 dia | 2.3 |
| 2.5 | Validação e ajustes do modelo | 0.5 dia | 2.4 |

### Entidades Principais:
- **User** (Admin/Técnico)
- **Client** (Cliente)
- **ServiceOrder** (Ordem de Serviço)
- **ServicePhoto** (Fotos do Serviço)
- **MaintenanceReminder** (Lembretes de Manutenção)
- **AuditLog** (Registro de Auditoria)

### Entregáveis:
- [ ] Diagrama Entidade-Relacionamento (DER)
- [ ] Schema Prisma completo
- [ ] Scripts de migration
- [ ] Seed de dados de teste

---

## ⚙️ Fase 3: Desenvolvimento Backend
**Duração:** 4 semanas (Semana 4-7)

### Tarefas:

| ID | Tarefa | Duração | Dependências |
|----|--------|---------|--------------|
| 3.1 | Configuração do ambiente (Node.js, Fastify, Prisma) | 2 dias | 2.5 |
| 3.2 | Implementação de autenticação (JWT) | 3 dias | 3.1 |
| 3.3 | CRUD de Usuários (Admin/Técnico) | 2 dias | 3.2 |
| 3.4 | CRUD de Clientes | 2 dias | 3.2 |
| 3.5 | CRUD de Ordens de Serviço | 4 dias | 3.3, 3.4 |
| 3.6 | Sistema de upload de fotos | 2 dias | 3.5 |
| 3.7 | Sistema de avaliação (rating/feedback) | 1 dia | 3.5 |
| 3.8 | Lembretes de manutenção preventiva | 2 dias | 3.5 |
| 3.9 | Sistema de auditoria (AuditLog) | 1 dia | 3.5 |
| 3.10 | Geração de relatórios (PDF) | 2 dias | 3.5 |
| 3.11 | Documentação da API (Swagger) | 1 dia | 3.10 |
| 3.12 | Configuração de WebSocket (tempo real) | 2 dias | 3.11 |

### Entregáveis:
- [ ] API RESTful completa
- [ ] Autenticação JWT funcional
- [ ] Documentação Swagger
- [ ] Sistema de upload de arquivos
- [ ] Comunicação em tempo real (WebSocket)

---

## 🖥️ Fase 4: Desenvolvimento Frontend Web
**Duração:** 3 semanas (Semana 8-10)

### Tarefas:

| ID | Tarefa | Duração | Dependências |
|----|--------|---------|--------------|
| 4.1 | Configuração do projeto (Vite, React) | 1 dia | 3.12 |
| 4.2 | Implementação de autenticação (login/logout) | 2 dias | 4.1 |
| 4.3 | Dashboard administrativo | 3 dias | 4.2 |
| 4.4 | Tela de gestão de técnicos | 2 dias | 4.3 |
| 4.5 | Tela de gestão de clientes | 2 dias | 4.3 |
| 4.6 | Tela de ordens de serviço | 3 dias | 4.3 |
| 4.7 | Visualização de mapa com localização | 2 dias | 4.5, 4.6 |
| 4.8 | Tela de relatórios e métricas | 2 dias | 4.6 |
| 4.9 | Internacionalização (i18n) | 1 dia | 4.8 |
| 4.10 | Responsividade e ajustes de UI | 2 dias | 4.9 |

### Entregáveis:
- [ ] Aplicação web responsiva
- [ ] Dashboard com métricas
- [ ] Sistema de gestão completo (CRUD)
- [ ] Visualização de mapa
- [ ] Suporte a múltiplos idiomas

---

## 📱 Fase 5: Desenvolvimento Mobile App
**Duração:** 4 semanas (Semana 11-14)

### Tarefas:

| ID | Tarefa | Duração | Dependências |
|----|--------|---------|--------------|
| 5.1 | Configuração do projeto (Expo, React Native) | 1 dia | 4.10 |
| 5.2 | Implementação de autenticação | 2 dias | 5.1 |
| 5.3 | Tela de lista de ordens de serviço | 3 dias | 5.2 |
| 5.4 | Tela de detalhes da ordem de serviço | 2 dias | 5.3 |
| 5.5 | Sistema de captura de fotos (antes/depois) | 3 dias | 5.4 |
| 5.6 | Preenchimento de relatório técnico | 2 dias | 5.4 |
| 5.7 | Integração com GPS (localização) | 2 dias | 5.4 |
| 5.8 | Navegação até o cliente (mapas) | 2 dias | 5.7 |
| 5.9 | Notificações push | 2 dias | 5.3 |
| 5.10 | Modo offline básico | 3 dias | 5.6 |
| 5.11 | Ajustes de UI/UX | 2 dias | 5.10 |

### Entregáveis:
- [ ] App mobile funcional (iOS/Android)
- [ ] Sistema de captura de fotos
- [ ] Navegação GPS integrada
- [ ] Notificações em tempo real
- [ ] Funcionamento offline básico

---

## 🧪 Fase 6: Testes
**Duração:** 2 semanas (Semana 15-16)

### Tarefas:

| ID | Tarefa | Duração | Dependências |
|----|--------|---------|--------------|
| 6.1 | Testes unitários do backend | 3 dias | 5.11 |
| 6.2 | Testes de integração da API | 2 dias | 6.1 |
| 6.3 | Testes do frontend web | 2 dias | 6.1 |
| 6.4 | Testes do app mobile | 2 dias | 6.1 |
| 6.5 | Testes de segurança (autenticação, SQL injection) | 1 dia | 6.2 |
| 6.6 | Testes de performance/carga | 1 dia | 6.5 |
| 6.7 | Correção de bugs identificados | 3 dias | 6.6 |
| 6.8 | Teste de aceitação do usuário (UAT) | 1 dia | 6.7 |

### Entregáveis:
- [ ] Relatório de cobertura de testes
- [ ] Relatório de bugs corrigidos
- [ ] Aprovação do usuário (UAT)

---

## 🚀 Fase 7: Deploy
**Duração:** 1 semana (Semana 17)

### Tarefas:

| ID | Tarefa | Duração | Dependências |
|----|--------|---------|--------------|
| 7.1 | Configuração do ambiente de produção | 1 dia | 6.8 |
| 7.2 | Deploy do banco de dados (PostgreSQL) | 0.5 dia | 7.1 |
| 7.3 | Deploy do backend (Docker) | 1 dia | 7.2 |
| 7.4 | Deploy do frontend web | 0.5 dia | 7.3 |
| 7.5 | Publicação do app na Play Store | 1 dia | 7.4 |
| 7.6 | Publicação do app na App Store | 1 dia | 7.4 |
| 7.7 | Configuração de monitoramento e logs | 0.5 dia | 7.5, 7.6 |
| 7.8 | Documentação final e treinamento | 0.5 dia | 7.7 |

### Entregáveis:
- [ ] Sistema em produção
- [ ] App publicado nas lojas
- [ ] Documentação de deploy
- [ ] Manual do usuário

---

## 📅 Cronograma Visual (Gráfico de Gantt)

```
Semana:     1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17
            |--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|--|
Requisitos  ████
Banco          ███
Backend           █████████████
Frontend                        ██████████
Mobile                                    █████████████
Testes                                                 ███████
Deploy                                                        ███
```

---

## ⚠️ Considerações Importantes

### Riscos Identificados:
1. **Atrasos em aprovações** - Depende de feedback do stakeholder
2. **Complexidade da integração mobile** - GPS, câmera, notificações
3. **Publicação nas lojas** - Processo de revisão pode demorar
4. **Curva de aprendizado** - Tecnologias novas podem aumentar o tempo

### Mitigações:
- Comunicação frequente com stakeholders
- Uso de Expo para simplificar desenvolvimento mobile
- Docker para padronizar ambientes
- Iniciar processo de publicação nas lojas cedo

### Premissas:
- Desenvolvedor com conhecimento em Node.js, React e React Native
- Infraestrutura de nuvem já disponível (AWS, GCP, etc.)
- Acesso a dispositivos físicos para testes mobile
- Conta de desenvolvedor nas lojas (Apple e Google)

---

## 📊 Métricas de Acompanhamento

| Métrica | Meta |
|---------|------|
| Cobertura de testes | > 70% |
| Bugs críticos em produção | 0 |
| Tempo de resposta da API | < 200ms |
| Disponibilidade | > 99% |

---

## 🔄 Metodologia

**Abordagem:** Desenvolvimento iterativo com entregas incrementais

- Sprints de 1 semana
- Review semanal do progresso
- Uso de Git para versionamento
- CI/CD com GitHub Actions

---

*Documento gerado em: Dezembro 2024*
*Versão: 1.0*

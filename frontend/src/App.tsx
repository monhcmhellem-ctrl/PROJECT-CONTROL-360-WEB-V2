
import { useEffect, useState } from 'react'

import './index.css'

import Projetos from './pages/Projetos'
import Tarefas from './pages/Tarefas'
import Riscos from './pages/Riscos'
import Relatorios from './pages/Relatorios'

type ProjectStatus =
  | 'Planejamento'
  | 'Em andamento'
  | 'Concluído'
  | 'Em risco'

type Project = {
  id: string
  name: string
  owner: string
  progress?: number
  deadline: string
  budget: number
  status: ProjectStatus
}

type TaskStatus = 'Pendente' | 'Em andamento' | 'Concluída'
type TaskPriority = 'Baixa' | 'Média' | 'Alta' | 'Crítica'

type Task = {
  id: string
  titulo: string
  projeto: string
  responsavel: string
  prazo: string
  prioridade: TaskPriority
  status: TaskStatus
  descricao: string
}

type RiskStatus =
  | 'Identificado'
  | 'Em tratamento'
  | 'Monitorado'
  | 'Mitigado'

type Risk = {
  id: string
  titulo: string
  projeto: string
  responsavel: string
  probabilidade: number
  impacto: number
  planoMitigacao: string
  status: RiskStatus
}

const PROJECTS_KEY = 'project-control-360-projects-v1'
const TASKS_KEY = 'project-control-360-tasks-v1'
const RISKS_KEY = 'project-control-360-risks-v1'

const initialProjects: Project[] = [
  {
    id: 'p1',
    name: 'Implantação do sistema operacional',
    owner: 'Ana Martins',
    progress: 78,
    deadline: '2026-10-30',
    budget: 120000,
    status: 'Em andamento',
  },
  {
    id: 'p2',
    name: 'Otimização de processos',
    owner: 'Carlos Souza',
    progress: 52,
    deadline: '2026-11-05',
    budget: 85000,
    status: 'Em andamento',
  },
  {
    id: 'p3',
    name: 'Plano de melhoria contínua',
    owner: 'Mariana Costa',
    progress: 100,
    deadline: '2026-10-20',
    budget: 45000,
    status: 'Concluído',
  },
  {
    id: 'p4',
    name: 'Revisão dos indicadores regionais',
    owner: 'Pedro Almeida',
    progress: 34,
    deadline: '2026-11-12',
    budget: 0,
    status: 'Em risco',
  },
]

const initialTasks: Task[] = [
  {
    id: 't1',
    titulo: 'Validar cronograma de implantação',
    projeto: 'Implantação Hydro',
    responsavel: 'Monique Marques',
    prazo: '2026-11-05',
    prioridade: 'Alta',
    status: 'Em andamento',
    descricao: '',
  },
  {
    id: 't2',
    titulo: 'Mapear oportunidades de melhoria',
    projeto: 'Otimização de processos',
    responsavel: 'Carlos Souza',
    prazo: '2026-11-10',
    prioridade: 'Média',
    status: 'Pendente',
    descricao: '',
  },
]

const initialRisks: Risk[] = [
  {
    id: 'r1',
    titulo: 'Atraso no cronograma de implantação',
    projeto: 'Implantação Hydro',
    responsavel: 'Monique Marques',
    probabilidade: 4,
    impacto: 5,
    planoMitigacao: '',
    status: 'Em tratamento',
  },
  {
    id: 'r2',
    titulo: 'Indisponibilidade de recursos',
    projeto: 'Otimização de processos',
    responsavel: 'Carlos Souza',
    probabilidade: 3,
    impacto: 3,
    planoMitigacao: '',
    status: 'Monitorado',
  },
]

function readLocalData<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = localStorage.getItem(key)

    if (saved === null) return fallback

    const parsed: unknown = JSON.parse(saved)

    return Array.isArray(parsed) ? (parsed as T[]) : fallback
  } catch {
    return fallback
  }
}

function getToday(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getDateDifference(date: string, today: string): number {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return Number.POSITIVE_INFINITY
  }

  const dateValue = new Date(`${date}T12:00:00`)
  const todayValue = new Date(`${today}T12:00:00`)

  return Math.round(
    (dateValue.getTime() - todayValue.getTime()) / 86400000,
  )
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

function formatDate(value: string): string {
  if (!value) return '—'

  const parts = value.split('-')

  if (parts.length !== 3) return value

  return `${parts[2]}/${parts[1]}/${parts[0]}`
}

function percentage(part: number, total: number): number {
  if (total === 0) return 0

  return Math.round((part / total) * 100)
}

function getRiskLevel(risk: Risk): string {
  const score = risk.probabilidade * risk.impacto

  if (score >= 20) return 'Crítico'
  if (score >= 12) return 'Alto'
  if (score >= 6) return 'Moderado'

  return 'Baixo'
}

const menu = [
  { label: 'Dashboard', icon: '▦' },
  { label: 'Projetos', icon: '▣' },
  { label: 'Tarefas', icon: '☷' },
  { label: 'Riscos', icon: '△' },
  { label: 'Relatórios', icon: '▤' },
]

function App() {
  const [activeMenu, setActiveMenu] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)

  const [projects, setProjects] = useState<Project[]>(() =>
    readLocalData<Project>(PROJECTS_KEY, initialProjects),
  )

  const [tasks, setTasks] = useState<Task[]>(() =>
    readLocalData<Task>(TASKS_KEY, initialTasks),
  )

  const [risks, setRisks] = useState<Risk[]>(() =>
    readLocalData<Risk>(RISKS_KEY, initialRisks),
  )

  useEffect(() => {
    if (activeMenu !== 'Dashboard') return

    const refreshData = () => {
      setProjects(readLocalData<Project>(PROJECTS_KEY, initialProjects))
      setTasks(readLocalData<Task>(TASKS_KEY, initialTasks))
      setRisks(readLocalData<Risk>(RISKS_KEY, initialRisks))
    }

    refreshData()

    window.addEventListener('focus', refreshData)
    window.addEventListener('storage', refreshData)

    return () => {
      window.removeEventListener('focus', refreshData)
      window.removeEventListener('storage', refreshData)
    }
  }, [activeMenu])

  const today = getToday()

  const pendingTasks = tasks.filter(
    (task) => task.status === 'Pendente',
  ).length

  const completedTasks = tasks.filter(
    (task) => task.status === 'Concluída',
  ).length

  const overdueTaskList = tasks.filter(
    (task) =>
      task.status !== 'Concluída' &&
      getDateDifference(task.prazo, today) < 0,
  )

  const upcomingTaskList = tasks.filter((task) => {
    const daysUntilDeadline = getDateDifference(task.prazo, today)

    return (
      task.status !== 'Concluída' &&
      daysUntilDeadline >= 0 &&
      daysUntilDeadline <= 7
    )
  })

  const inProgressProjects = projects.filter(
    (project) => project.status === 'Em andamento',
  ).length

  const completedProjects = projects.filter(
    (project) => project.status === 'Concluído',
  ).length

  const atRiskProjects = projects.filter(
    (project) => project.status === 'Em risco',
  ).length

  const planningProjects = projects.filter(
    (project) => project.status === 'Planejamento',
  ).length

  const totalBudget = projects.reduce(
    (sum, project) => sum + (Number(project.budget) || 0),
    0,
  )

  const completedRisks = risks.filter(
    (risk) => risk.status === 'Mitigado',
  ).length

  const criticalRisks = risks.filter(
    (risk) =>
      risk.status !== 'Mitigado' &&
      getRiskLevel(risk) === 'Crítico',
  )

  const projectsWithoutRisk = projects.length - atRiskProjects

  const filteredProjects = projects
    .filter(
      (project) =>
        project.name.toLowerCase().includes(search.toLowerCase()) ||
        project.owner.toLowerCase().includes(search.toLowerCase()),
    )
    .map((project) => ({
      ...project,
      deadline: formatDate(project.deadline),
      progress:
        project.status === 'Concluído'
          ? 100
          : project.progress,
    }))

  const displayedProjects = showAll
    ? filteredProjects
    : filteredProjects.slice(0, 4)

  const hasAlerts =
    criticalRisks.length > 0 ||
    overdueTaskList.length > 0 ||
    upcomingTaskList.length > 0

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">PC</div>
          <div>
            <strong>PROJECT CONTROL</strong>
            <span>360 WEB · Gestão inteligente</span>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="side-nav" aria-label="Navegação principal">
          {menu.map((item) => (
            <button
              className={`nav-item ${activeMenu === item.label ? 'active' : ''}`}
              key={item.label}
              onClick={() => setActiveMenu(item.label)}
              type="button"
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button
            className={`nav-item settings-item ${
              activeMenu === 'Configurações' ? 'active' : ''
            }`}
            onClick={() => setActiveMenu('Configurações')}
            type="button"
          >
            <span className="nav-icon" aria-hidden="true">
              ⚙
            </span>
            <span>Configurações</span>
          </button>

          <div className="profile">
            <div className="avatar">MM</div>
            <div className="profile-text">
              <strong>Monique Marques</strong>
              <span>Administradora</span>
            </div>
            <span className="profile-more">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="crumb-slash">/</span>
            <strong>{activeMenu}</strong>
          </div>

          <div className="topbar-actions">
            <label className="search-box">
              <span aria-hidden="true">⌕</span>
              <input
                aria-label="Buscar projetos e responsáveis"
                placeholder="Buscar projetos..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </label>

            <button
              className="icon-button notification-button"
              aria-label="Notificações"
              type="button"
            >
              <span>♧</span>
              <i />
            </button>

            <div className="top-avatar">MM</div>
          </div>
        </header>

        <div className="page-content">
          {activeMenu === 'Projetos' ? (
            <Projetos />
          ) : activeMenu === 'Tarefas' ? (
            <Tarefas />
          ) : activeMenu === 'Riscos' ? (
            <Riscos />
          ) : activeMenu === 'Relatórios' ? (
            <Relatorios />
          ) : activeMenu === 'Dashboard' ? (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">
                    PROJECT CONTROL 360 · VISÃO EXECUTIVA
                  </div>
                  <h1>Dashboard executivo</h1>
                  <p className="page-subtitle">
                    Acompanhe resultados, prazos e prioridades em um só lugar.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setActiveMenu('Projetos')}
                  type="button"
                >
                  <span>＋</span> Novo projeto
                </button>
              </section>

              <section
                className="metrics-grid"
                aria-label="Indicadores principais"
              >
                <MetricCard
                  title="Total de projetos"
                  value={String(projects.length)}
                  change={`${inProgressProjects} em andamento`}
                  note={`${completedProjects} concluídos`}
                  icon="▣"
                  tone="green"
                />

                <MetricCard
                  title="Tarefas pendentes"
                  value={String(pendingTasks)}
                  change={`${overdueTaskList.length} atrasadas`}
                  note="Tarefas não concluídas"
                  icon="☷"
                  tone="amber"
                />

                <MetricCard
                  title="Orçamento planejado"
                  value={formatCurrency(totalBudget)}
                  change={`${projects.length} projetos`}
                  note="Soma dos orçamentos cadastrados"
                  icon="＄"
                  tone="blue"
                />

                <MetricCard
                  title="Tarefas concluídas"
                  value={`${percentage(completedTasks, tasks.length)}%`}
                  change={`${completedTasks} concluídas`}
                  note={`De ${tasks.length} tarefas cadastradas`}
                  icon="↗"
                  tone="violet"
                />
              </section>

              <section className="overview-grid">
                <div className="panel distribution-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Distribuição de projetos</h2>
                      <p>Visão geral por status atual</p>
                    </div>
                    <span className="demo-badge">
                      <span /> Dados cadastrados
                    </span>
                  </div>

                  <div className="distribution-list">
                    <StatusBar
                      label="Em andamento"
                      count={inProgressProjects}
                      total={projects.length}
                      color="green"
                    />
                    <StatusBar
                      label="Concluídos"
                      count={completedProjects}
                      total={projects.length}
                      color="blue"
                    />
                    <StatusBar
                      label="Em risco"
                      count={atRiskProjects}
                      total={projects.length}
                      color="amber"
                    />
                    <StatusBar
                      label="Em planejamento"
                      count={planningProjects}
                      total={projects.length}
                      color="violet"
                    />
                  </div>

                  <div className="distribution-footer">
                    <SmallStat
                      label="Total de projetos"
                      value={String(projects.length)}
                    />
                    <SmallStat
                      label="Concluídos"
                      value={String(completedProjects)}
                      tone="blue-text"
                    />
                    <SmallStat
                      label="Em risco"
                      value={String(atRiskProjects)}
                      tone="amber-text"
                    />
                  </div>
                </div>

                <div className="panel health-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Saúde do portfólio</h2>
                      <p>Indicadores de acompanhamento</p>
                    </div>
                    <button
                      className="dots-button"
                      aria-label="Mais opções"
                      type="button"
                    >
                      •••
                    </button>
                  </div>

                  <div className="health-list">
                    <HealthItem
                      label="Projetos sem status de risco"
                      value={percentage(projectsWithoutRisk, projects.length)}
                      color="green"
                    />
                    <HealthItem
                      label="Tarefas concluídas"
                      value={percentage(completedTasks, tasks.length)}
                      color="blue"
                    />
                    <HealthItem
                      label="Riscos mitigados"
                      value={percentage(completedRisks, risks.length)}
                      color="violet"
                    />
                  </div>

                  <div className="attention-box">
                    <div className="attention-icon">
                      {hasAlerts ? '!' : '✓'}
                    </div>
                    <div>
                      <strong>
                        {hasAlerts
                          ? 'Atenção necessária'
                          : 'Cenário monitorado'}
                      </strong>
                      <p>
                        {criticalRisks.length} risco(s) crítico(s),{' '}
                        {overdueTaskList.length} tarefa(s) atrasada(s) e{' '}
                        {upcomingTaskList.length} tarefa(s) com prazo nos
                        próximos 7 dias.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel projects-panel">
                <div className="panel-heading projects-heading">
                  <div>
                    <h2>Projetos recentes</h2>
                    <p>Acompanhe prazos, responsáveis e execução</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActiveMenu('Projetos')}
                    type="button"
                  >
                    Ver todos <span>↗</span>
                  </button>
                </div>

                <ProjectTable projects={displayedProjects} />

                <div className="table-footer">
                  <span>
                    Exibindo{' '}
                    {Math.min(
                      filteredProjects.length,
                      showAll ? filteredProjects.length : 4,
                    )}{' '}
                    de {filteredProjects.length} projetos cadastrados
                  </span>
                  <button
                    onClick={() => setShowAll(!showAll)}
                    type="button"
                  >
                    {showAll ? 'Mostrar menos' : 'Ver lista completa'}{' '}
                    <span>→</span>
                  </button>
                </div>
              </section>

              <section className="panel projects-panel">
                <div className="panel-heading projects-heading">
                  <div>
                    <h2>Alertas operacionais</h2>
                    <p>Prazos próximos, atrasos e riscos críticos</p>
                  </div>
                  <span className="demo-badge">
                    <span /> Atualizado com os dados cadastrados
                  </span>
                </div>

                {overdueTaskList.length === 0 &&
                upcomingTaskList.length === 0 &&
                criticalRisks.length === 0 ? (
                  <div className="attention-box">
                    <div className="attention-icon">✓</div>
                    <div>
                      <strong>Nenhum alerta identificado</strong>
                      <p>
                        Não há tarefas atrasadas, prazos nos próximos 7 dias
                        ou riscos críticos ativos.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="distribution-list">
                    {overdueTaskList.map((task) => (
                      <AlertRow
                        key={`overdue-${task.id}`}
                        title={task.titulo}
                        detail={`Tarefa atrasada · Prazo: ${formatDate(task.prazo)}`}
                        tone="amber"
                        onClick={() => setActiveMenu('Tarefas')}
                      />
                    ))}

                    {upcomingTaskList.map((task) => (
                      <AlertRow
                        key={`upcoming-${task.id}`}
                        title={task.titulo}
                        detail={`Prazo próximo · ${formatDate(task.prazo)} · ${task.responsavel}`}
                        tone="blue"
                        onClick={() => setActiveMenu('Tarefas')}
                      />
                    ))}

                    {criticalRisks.map((risk) => (
                      <AlertRow
                        key={`risk-${risk.id}`}
                        title={risk.titulo}
                        detail={`Risco crítico · Projeto: ${risk.projeto} · Responsável: ${risk.responsavel}`}
                        tone="amber"
                        onClick={() => setActiveMenu('Riscos')}
                      />
                    ))}
                  </div>
                )}
              </section>
            </>
          ) : (
            <>
              <section className="welcome-row">
                <div>
                  <div className="eyebrow">PROJECT CONTROL 360</div>
                  <h1>{activeMenu}</h1>
                  <p className="page-subtitle">
                    Esta área será desenvolvida na próxima etapa. O dashboard
                    continua disponível.
                  </p>
                </div>
              </section>

              <section className="panel placeholder-panel">
                <div className="placeholder-icon">
                  {menu.find((item) => item.label === activeMenu)?.icon ?? '⚙'}
                </div>
                <h2>{activeMenu}</h2>
                <p>Esta área ainda está em desenvolvimento.</p>
                <button
                  className="primary-button"
                  onClick={() => setActiveMenu('Dashboard')}
                  type="button"
                >
                  Voltar ao dashboard
                </button>
              </section>
            </>
          )}

          <footer className="page-footer">
            <span>© 2026 PROJECT CONTROL 360</span>
            <span>
              <span className="footer-status" /> Sistema de gestão
            </span>
          </footer>
        </div>
      </main>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  note,
  icon,
  tone,
}: {
  title: string
  value: string
  change: string
  note: string
  icon: string
  tone: string
}) {
  return (
    <article className="metric-card">
      <div className="metric-top">
        <span className="metric-title">{title}</span>
        <span className={`metric-icon ${tone}`}>{icon}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-bottom">
        <span className={`metric-change ${tone}`}>{change}</span>
        <span className="metric-note">{note}</span>
      </div>
    </article>
  )
}

function StatusBar({
  label,
  count,
  total,
  color,
}: {
  label: string
  count: number
  total: number
  color: string
}) {
  const value = percentage(count, total)

  return (
    <div className="status-row">
      <div className="status-label-line">
        <span>{label}</span>
        <strong>
          {count} <small>({value}%)</small>
        </strong>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function SmallStat({
  label,
  value,
  tone = '',
}: {
  label: string
  value: string
  tone?: string
}) {
  return (
    <div className="small-stat">
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
    </div>
  )
}

function HealthItem({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  return (
    <div className="health-item">
      <div className="health-label-line">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="progress-track health-track">
        <div
          className={`progress-fill ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function AlertRow({
  title,
  detail,
  tone,
  onClick,
}: {
  title: string
  detail: string
  tone: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="status-row"
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        border: 'none',
        background: 'transparent',
        padding: '12px 0',
        cursor: 'pointer',
      }}
    >
      <div className="status-label-line">
        <span>
          <span
            className={`metric-icon ${tone}`}
            style={{
              display: 'inline-flex',
              marginRight: 10,
              verticalAlign: 'middle',
            }}
          >
            !
          </span>
          {title}
        </span>
        <strong>›</strong>
      </div>
      <small>{detail}</small>
    </button>
  )
}

function ProjectTable({ projects }: { projects: Project[] }) {
  return (
    <div className="table-scroll">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Projeto</th>
            <th>Responsável</th>
            <th>Progresso</th>
            <th>Prazo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => (
            <tr key={project.id}>
              <td>
                <div className="project-name-cell">
                  <span className="project-symbol">▣</span>
                  <strong>{project.name}</strong>
                </div>
              </td>
              <td>
                <div className="owner-cell">
                  <span className="owner-avatar">
                    {project.owner
                      .split(' ')
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join('')}
                  </span>
                  {project.owner || '—'}
                </div>
              </td>
              <td>
                <div className="table-progress">
                  {typeof project.progress === 'number' ? (
                    <>
                      <div className="progress-track">
                        <div
                          className={`progress-fill ${
                            project.status === 'Em risco'
                              ? 'amber'
                              : project.status === 'Concluído'
                                ? 'blue'
                                : 'green'
                          }`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, project.progress),
                            )}%`,
                          }}
                        />
                      </div>
                      <span>{project.progress}%</span>
                    </>
                  ) : (
                    <span>—</span>
                  )}
                </div>
              </td>
              <td className="deadline-cell">{project.deadline || '—'}</td>
              <td>
                <span
                  className={`status-pill ${
                    project.status === 'Concluído'
                      ? 'completed'
                      : project.status === 'Em risco'
                        ? 'at-risk'
                        : 'in-progress'
                  }`}
                >
                  <span />
                  {project.status}
                </span>
              </td>
            </tr>
          ))}
          {projects.length === 0 && (
            <tr>
              <td colSpan={5}>Nenhum projeto encontrado.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default App

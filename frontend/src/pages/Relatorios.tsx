
import { useEffect, useMemo, useState } from 'react'

type Project = {
  id: string
  nome?: string
  titulo?: string
  status?: string
  progresso?: number
}

type Task = {
  id: string
  titulo?: string
  status?: string
  prazo?: string
  prioridade?: string
  projeto?: string
}

type Risk = {
  id: string
  titulo?: string
  status?: string
  probabilidade?: number
  impacto?: number
}

const STORAGE_KEYS = {
  projects: 'project-control-360-projects-v1',
  tasks: 'project-control-360-tasks-v1',
  risks: 'project-control-360-risks-v1',
}

function readData<T>(key: string): T[] {
  try {
    const value = localStorage.getItem(key)
    const parsed: unknown = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? (parsed as T[]) : []
  } catch {
    return []
  }
}

function getRiskLevel(risk: Risk) {
  const score = Number(risk.probabilidade ?? 0) * Number(risk.impacto ?? 0)

  if (score >= 20) return 'Crítico'
  if (score >= 12) return 'Alto'
  if (score >= 6) return 'Moderado'
  return 'Baixo'
}

function isCompleted(status?: string) {
  return status?.toLowerCase() === 'concluída' ||
    status?.toLowerCase() === 'concluida'
}

function isOverdue(task: Task) {
  if (!task.prazo || isCompleted(task.status)) return false

  const deadline = new Date(`${task.prazo}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return !Number.isNaN(deadline.getTime()) && deadline < today
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string
  value: number | string
  detail: string
}) {
  return (
    <article className="report-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function BarChart({
  title,
  items,
}: {
  title: string
  items: { label: string; value: number }[]
}) {
  const max = Math.max(...items.map((item) => item.value), 1)

  return (
    <section className="report-panel">
      <h2>{title}</h2>

      <div className="report-bars">
        {items.map((item) => (
          <div className="report-bar-row" key={item.label}>
            <span>{item.label}</span>
            <div className="report-bar-track">
              <div
                className="report-bar-fill"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
            <strong>{item.value}</strong>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Relatorios() {
  const [projects, setProjects] = useState<Project[]>(() =>
    readData<Project>(STORAGE_KEYS.projects),
  )
  const [tasks, setTasks] = useState<Task[]>(() =>
    readData<Task>(STORAGE_KEYS.tasks),
  )
  const [risks, setRisks] = useState<Risk[]>(() =>
    readData<Risk>(STORAGE_KEYS.risks),
  )

  useEffect(() => {
    const refreshData = () => {
      setProjects(readData<Project>(STORAGE_KEYS.projects))
      setTasks(readData<Task>(STORAGE_KEYS.tasks))
      setRisks(readData<Risk>(STORAGE_KEYS.risks))
    }

    window.addEventListener('focus', refreshData)
    window.addEventListener('storage', refreshData)

    return () => {
      window.removeEventListener('focus', refreshData)
      window.removeEventListener('storage', refreshData)
    }
  }, [])

  const metrics = useMemo(() => {
    const completed = tasks.filter((task) => isCompleted(task.status)).length
    const pending = tasks.filter(
      (task) => task.status?.toLowerCase() === 'pendente',
    ).length
    const inProgress = tasks.filter(
      (task) => task.status?.toLowerCase() === 'em andamento',
    ).length
    const overdue = tasks.filter(isOverdue).length

    const critical = risks.filter(
      (risk) => getRiskLevel(risk) === 'Crítico',
    ).length
    const high = risks.filter(
      (risk) => getRiskLevel(risk) === 'Alto',
    ).length
    const moderate = risks.filter(
      (risk) => getRiskLevel(risk) === 'Moderado',
    ).length
    const low = risks.filter(
      (risk) => getRiskLevel(risk) === 'Baixo',
    ).length

    return {
      completed,
      pending,
      inProgress,
      overdue,
      critical,
      high,
      moderate,
      low,
      completionRate:
        tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    }
  }, [tasks, risks])

  const projectStatusItems = useMemo(() => {
    const statuses = ['Em andamento', 'Concluído', 'Planejamento', 'Pausado']

    return statuses.map((status) => ({
      label: status,
      value: projects.filter(
        (project) => project.status?.toLowerCase() === status.toLowerCase(),
      ).length,
    }))
  }, [projects])

  const hasData = projects.length + tasks.length + risks.length > 0

  return (
    <section className="report-module">
      <header className="report-heading">
        <div>
          <span className="report-eyebrow">INTELIGÊNCIA DE GESTÃO</span>
          <h1>Relatórios</h1>
          <p>
            Indicadores consolidados de projetos, tarefas e riscos.
          </p>
        </div>

        <button
          type="button"
          className="report-refresh-button"
          onClick={() => {
            setProjects(readData<Project>(STORAGE_KEYS.projects))
            setTasks(readData<Task>(STORAGE_KEYS.tasks))
            setRisks(readData<Risk>(STORAGE_KEYS.risks))
          }}
        >
          ↻ Atualizar dados
        </button>
      </header>

      {!hasData && (
        <div className="report-empty-notice">
          Ainda não há dados salvos para gerar os relatórios. Cadastre projetos,
          tarefas ou riscos e clique em “Atualizar dados”.
        </div>
      )}

      <div className="report-section-heading">
        <h2>Visão geral</h2>
        <span>Dados registrados no navegador</span>
      </div>

      <div className="report-metrics-grid">
        <MetricCard
          label="Projetos cadastrados"
          value={projects.length}
          detail="Total de projetos registrados"
        />
        <MetricCard
          label="Total de tarefas"
          value={tasks.length}
          detail="Tarefas cadastradas"
        />
        <MetricCard
          label="Tarefas concluídas"
          value={metrics.completed}
          detail={`${metrics.completionRate}% do total de tarefas`}
        />
        <MetricCard
          label="Tarefas atrasadas"
          value={metrics.overdue}
          detail="Prazo vencido e não concluídas"
        />
        <MetricCard
          label="Riscos registrados"
          value={risks.length}
          detail="Total de riscos identificados"
        />
        <MetricCard
          label="Riscos críticos"
          value={metrics.critical}
          detail="Exigem atenção prioritária"
        />
      </div>

      <div className="report-section-heading">
        <h2>Desempenho operacional</h2>
        <span>Acompanhamento das tarefas</span>
      </div>

      <div className="report-charts-grid">
        <BarChart
          title="Tarefas por status"
          items={[
            { label: 'Concluídas', value: metrics.completed },
            { label: 'Em andamento', value: metrics.inProgress },
            { label: 'Pendentes', value: metrics.pending },
            { label: 'Atrasadas', value: metrics.overdue },
          ]}
        />

        <BarChart
          title="Projetos por status"
          items={projectStatusItems}
        />

        <BarChart
          title="Riscos por criticidade"
          items={[
            { label: 'Críticos', value: metrics.critical },
            { label: 'Altos', value: metrics.high },
            { label: 'Moderados', value: metrics.moderate },
            { label: 'Baixos', value: metrics.low },
          ]}
        />
      </div>

      <footer className="report-footer">
        Os indicadores são calculados com base nos registros salvos nos módulos
        do sistema. Clique em “Atualizar dados” após cadastrar ou alterar
        informações.
      </footer>
    </section>
  )
}

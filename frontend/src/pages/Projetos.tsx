
import { useEffect, useMemo, useState } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  FolderKanban,
  CalendarDays,
  CircleDollarSign,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from 'lucide-react'

type ProjectStatus = 'Planejamento' | 'Em andamento' | 'Concluído' | 'Em risco'

type Project = {
  id: string
  name: string
  description: string
  owner: string
  startDate: string
  deadline: string
  budget: number
  status: ProjectStatus
}

const STORAGE_KEY = 'project-control-360-projects-v1'

const initialProjects: Project[] = [
  {
    id: 'demo-1',
    name: 'Implantação do sistema operacional',
    description: 'Implantação e acompanhamento do sistema operacional.',
    owner: 'Ana Martins',
    startDate: '2026-09-01',
    deadline: '2026-10-30',
    budget: 120000,
    status: 'Em andamento',
  },
  {
    id: 'demo-2',
    name: 'Otimização de processos',
    description: 'Mapeamento e melhoria dos processos internos.',
    owner: 'Carlos Souza',
    startDate: '2026-09-15',
    deadline: '2026-11-05',
    budget: 85000,
    status: 'Em andamento',
  },
  {
    id: 'demo-3',
    name: 'Plano de melhoria contínua',
    description: 'Plano de ações para melhoria contínua.',
    owner: 'Mariana Costa',
    startDate: '2026-08-01',
    deadline: '2026-10-20',
    budget: 45000,
    status: 'Concluído',
  },
]

const emptyProject: Omit<Project, 'id'> = {
  name: '',
  description: '',
  owner: '',
  startDate: '',
  deadline: '',
  budget: 0,
  status: 'Planejamento',
}

const statusOptions: ProjectStatus[] = [
  'Planejamento',
  'Em andamento',
  'Concluído',
  'Em risco',
]

function loadProjects(): Project[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)

    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved)

      if (Array.isArray(parsed)) {
        return parsed as Project[]
      }
    }
  } catch {
    console.error('Não foi possível carregar os projetos salvos.')
  }

  return initialProjects
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: string) {
  if (!value) return '—'

  const [year, month, day] = value.split('-')
  return `${day}/${month}/${year}`
}

function statusClass(status: ProjectStatus) {
  switch (status) {
    case 'Concluído':
      return 'status-complete'
    case 'Em risco':
      return 'status-risk'
    case 'Em andamento':
      return 'status-progress'
    default:
      return 'status-planning'
  }
}

export default function Projetos() {
  const [projects, setProjects] = useState<Project[]>(loadProjects)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Project, 'id'>>(emptyProject)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects))
  }, [projects])

  const filteredProjects = useMemo(() => {
    const term = search.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(term) ||
        project.owner.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'Todos' || project.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [projects, search, statusFilter])

  const totalBudget = projects.reduce(
    (total, project) => total + Number(project.budget || 0),
    0,
  )

  const completedCount = projects.filter(
    (project) => project.status === 'Concluído',
  ).length

  const atRiskCount = projects.filter(
    (project) => project.status === 'Em risco',
  ).length

  function openNewForm() {
    setEditingId(null)
    setForm({ ...emptyProject })
    setFormError('')
    setFormOpen(true)
  }

  function openEditForm(project: Project) {
    setEditingId(project.id)
    setForm({
      name: project.name,
      description: project.description,
      owner: project.owner,
      startDate: project.startDate,
      deadline: project.deadline,
      budget: project.budget,
      status: project.status,
    })
    setFormError('')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingId(null)
    setForm({ ...emptyProject })
    setFormError('')
  }

  function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim() || !form.owner.trim()) {
      setFormError('Preencha o nome do projeto e o responsável.')
      return
    }

    if (
      form.startDate &&
      form.deadline &&
      form.deadline < form.startDate
    ) {
      setFormError('O prazo final não pode ser anterior à data de início.')
      return
    }

    if (Number(form.budget) < 0) {
      setFormError('O orçamento não pode ser negativo.')
      return
    }

    if (editingId) {
      setProjects((current) =>
        current.map((project) =>
          project.id === editingId
            ? { ...form, id: editingId, budget: Number(form.budget) }
            : project,
        ),
      )
    } else {
      const newProject: Project = {
        ...form,
        id: crypto.randomUUID(),
        budget: Number(form.budget),
      }

      setProjects((current) => [newProject, ...current])
    }

    closeForm()
  }

  function deleteProject(project: Project) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o projeto "${project.name}"?`,
    )

    if (!confirmed) return

    setProjects((current) =>
      current.filter((item) => item.id !== project.id),
    )
  }

  return (
    <div className="project-module">
      <section className="project-page-heading">
        <div>
          <p className="project-eyebrow">GESTÃO E ACOMPANHAMENTO</p>
          <h3>Gestão de projetos</h3>
          <p className="project-muted">
            Cadastre, acompanhe e organize seus projetos em um só lugar.
          </p>
        </div>

        <button className="project-primary-button" onClick={openNewForm}>
          <Plus size={18} />
          Novo projeto
        </button>
      </section>

      <section className="project-summary">
        <article className="project-summary-card">
          <div className="project-summary-icon green">
            <FolderKanban size={21} />
          </div>
          <div>
            <p>Total de projetos</p>
            <strong>{projects.length}</strong>
          </div>
        </article>

        <article className="project-summary-card">
          <div className="project-summary-icon blue">
            <CheckCircle2 size={21} />
          </div>
          <div>
            <p>Concluídos</p>
            <strong>{completedCount}</strong>
          </div>
        </article>

        <article className="project-summary-card">
          <div className="project-summary-icon amber">
            <AlertTriangle size={21} />
          </div>
          <div>
            <p>Em risco</p>
            <strong>{atRiskCount}</strong>
          </div>
        </article>

        <article className="project-summary-card">
          <div className="project-summary-icon purple">
            <CircleDollarSign size={21} />
          </div>
          <div>
            <p>Orçamento total</p>
            <strong className="budget-value">
              {formatCurrency(totalBudget)}
            </strong>
          </div>
        </article>
      </section>

      <section className="project-list-panel">
        <div className="project-list-toolbar">
          <label className="project-search">
            <Search size={18} />
            <input
              aria-label="Pesquisar projetos"
              placeholder="Pesquisar por projeto ou responsável..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <select
            aria-label="Filtrar por status"
            className="project-filter"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="Todos">Todos os status</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <div className="project-table-wrapper">
          <table className="project-table">
            <thead>
              <tr>
                <th>Projeto</th>
                <th>Responsável</th>
                <th>Início</th>
                <th>Prazo</th>
                <th>Orçamento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredProjects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div className="project-table-name">{project.name}</div>
                    {project.description && (
                      <div className="project-table-description">
                        {project.description}
                      </div>
                    )}
                  </td>
                  <td>{project.owner}</td>
                  <td>{formatDate(project.startDate)}</td>
                  <td>{formatDate(project.deadline)}</td>
                  <td>{formatCurrency(Number(project.budget))}</td>
                  <td>
                    <span
                      className={`project-status-badge ${statusClass(project.status)}`}
                    >
                      {project.status}
                    </span>
                  </td>
                  <td>
                    <div className="project-row-actions">
                      <button
                        type="button"
                        className="project-icon-button"
                        aria-label={`Editar ${project.name}`}
                        title="Editar projeto"
                        onClick={() => openEditForm(project)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="project-icon-button delete"
                        aria-label={`Excluir ${project.name}`}
                        title="Excluir projeto"
                        onClick={() => deleteProject(project)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="project-empty-state">
                    Nenhum projeto encontrado. Altere os filtros ou cadastre
                    um novo projeto.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="project-table-footer">
          Exibindo {filteredProjects.length} de {projects.length} projeto(s)
        </div>
      </section>

      {formOpen && (
        <div
          className="project-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeForm()
          }}
        >
          <section
            className="project-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-form-title"
          >
            <header className="project-modal-header">
              <div>
                <h3 id="project-form-title">
                  {editingId ? 'Editar projeto' : 'Novo projeto'}
                </h3>
                <p>Preencha os dados para organizar o acompanhamento.</p>
              </div>
              <button
                type="button"
                className="project-icon-button"
                aria-label="Fechar formulário"
                onClick={closeForm}
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={saveProject}>
              <div className="project-form-grid">
                <label className="project-form-field full">
                  Nome do projeto *
                  <input
                    required
                    maxLength={120}
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Ex.: Implantação de sistema"
                  />
                </label>

                <label className="project-form-field full">
                  Descrição
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                    placeholder="Descreva o objetivo do projeto"
                  />
                </label>

                <label className="project-form-field full">
                  Responsável *
                  <input
                    required
                    maxLength={100}
                    value={form.owner}
                    onChange={(event) =>
                      setForm({ ...form, owner: event.target.value })
                    }
                    placeholder="Nome do responsável"
                  />
                </label>

                <label className="project-form-field">
                  Data de início
                  <span className="project-input-with-icon">
                    <CalendarDays size={16} />
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(event) =>
                        setForm({ ...form, startDate: event.target.value })
                      }
                    />
                  </span>
                </label>

                <label className="project-form-field">
                  Prazo final
                  <span className="project-input-with-icon">
                    <Clock3 size={16} />
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={(event) =>
                        setForm({ ...form, deadline: event.target.value })
                      }
                    />
                  </span>
                </label>

                <label className="project-form-field">
                  Orçamento (R$)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.budget}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        budget: Number(event.target.value),
                      })
                    }
                  />
                </label>

                <label className="project-form-field">
                  Status
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as ProjectStatus,
                      })
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {formError && (
                <p className="project-form-error" role="alert">
                  {formError}
                </p>
              )}

              <footer className="project-form-actions">
                <button
                  type="button"
                  className="project-secondary-button"
                  onClick={closeForm}
                >
                  Cancelar
                </button>
                <button type="submit" className="project-primary-button">
                  {editingId ? 'Salvar alterações' : 'Cadastrar projeto'}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

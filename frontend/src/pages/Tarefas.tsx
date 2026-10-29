
import { useEffect, useMemo, useState, type FormEvent } from 'react'

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

const STORAGE_KEY = 'project-control-360-tasks-v1'

const initialTasks: Task[] = [
  {
    id: 't1',
    titulo: 'Validar cronograma de implantação',
    projeto: 'Implantação Hydro',
    responsavel: 'Monique Marques',
    prazo: '2026-11-05',
    prioridade: 'Alta',
    status: 'Em andamento',
    descricao: 'Revisar etapas e prazos do projeto.',
  },
  {
    id: 't2',
    titulo: 'Mapear oportunidades de melhoria',
    projeto: 'Otimização de processos',
    responsavel: 'Carlos Souza',
    prazo: '2026-11-10',
    prioridade: 'Média',
    status: 'Pendente',
    descricao: 'Identificar oportunidades nos processos.',
  },
]

const emptyTask = (): Omit<Task, 'id'> => ({
  titulo: '',
  projeto: '',
  responsavel: '',
  prazo: '',
  prioridade: 'Média',
  status: 'Pendente',
  descricao: '',
})

function loadTasks(): Task[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as Task[]) : initialTasks
  } catch {
    return initialTasks
  }
}

function formatDate(date: string) {
  if (!date) return '—'
  return new Date(`${date}T12:00:00`).toLocaleDateString('pt-BR')
}

function isOverdue(task: Task) {
  const now = new Date()
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-')

  return task.status !== 'Concluída' && Boolean(task.prazo) && task.prazo < today
}

export default function Tarefas() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [priorityFilter, setPriorityFilter] = useState('Todas')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Task, 'id'>>(emptyTask())
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const filteredTasks = useMemo(() => {
    const term = search.toLowerCase().trim()

    return tasks.filter((task) => {
      const matchesSearch =
        task.titulo.toLowerCase().includes(term) ||
        task.projeto.toLowerCase().includes(term) ||
        task.responsavel.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'Todos' || task.status === statusFilter

      const matchesPriority =
        priorityFilter === 'Todas' || task.prioridade === priorityFilter

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, search, statusFilter, priorityFilter])

  function openNewTask() {
    setEditingId(null)
    setForm(emptyTask())
    setError('')
    setModalOpen(true)
  }

  function openEditTask(task: Task) {
    const { id, ...taskData } = task
    setEditingId(id)
    setForm(taskData)
    setError('')
    setModalOpen(true)
  }

  function saveTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.titulo.trim() || !form.responsavel.trim()) {
      setError('Preencha o título e o responsável.')
      return
    }

    if (editingId) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingId ? { ...form, id: editingId } : task,
        ),
      )
    } else {
      setTasks((current) => [
        { ...form, id: crypto.randomUUID() },
        ...current,
      ])
    }

    setModalOpen(false)
    setEditingId(null)
    setForm(emptyTask())
    setError('')
  }

  function deleteTask(task: Task) {
    const confirmed = window.confirm(
      `Deseja realmente excluir a tarefa "${task.titulo}"? Esta ação não poderá ser desfeita.`,
    )

    if (!confirmed) return

    setTasks((current) => current.filter((item) => item.id !== task.id))
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyTask())
    setError('')
  }

  const pendingCount = tasks.filter((task) => task.status === 'Pendente').length
  const inProgressCount = tasks.filter((task) => task.status === 'Em andamento').length
  const completedCount = tasks.filter((task) => task.status === 'Concluída').length
  const overdueCount = tasks.filter(isOverdue).length

  return (
    <section className="task-module">
      <div className="task-heading">
        <div>
          <div className="task-eyebrow">GESTÃO E ACOMPANHAMENTO</div>
          <h1>Tarefas</h1>
          <p className="task-muted">
            Organize atividades, responsáveis, prioridades e prazos.
          </p>
        </div>

        <button
          type="button"
          className="task-primary-button"
          onClick={openNewTask}
        >
          ＋ Nova tarefa
        </button>
      </div>

      <div className="task-summary">
        {[
          { label: 'Total de tarefas', value: tasks.length },
          { label: 'Pendentes', value: pendingCount },
          { label: 'Em andamento', value: inProgressCount },
          { label: 'Concluídas', value: completedCount },
          { label: 'Atrasadas', value: overdueCount },
        ].map((item) => (
          <article className="task-summary-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </article>
        ))}
      </div>

      <div className="task-list-panel">
        <div className="task-toolbar">
          <input
            className="task-search"
            type="search"
            placeholder="Pesquisar tarefa, projeto ou responsável..."
            aria-label="Pesquisar tarefas"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="task-filter"
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="Todos">Todos os status</option>
            <option value="Pendente">Pendente</option>
            <option value="Em andamento">Em andamento</option>
            <option value="Concluída">Concluída</option>
          </select>

          <select
            className="task-filter"
            aria-label="Filtrar por prioridade"
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value)}
          >
            <option value="Todas">Todas as prioridades</option>
            <option value="Baixa">Baixa</option>
            <option value="Média">Média</option>
            <option value="Alta">Alta</option>
            <option value="Crítica">Crítica</option>
          </select>
        </div>

        <div className="task-table-wrapper">
          <table className="task-table">
            <thead>
              <tr>
                <th>TAREFA</th>
                <th>PROJETO</th>
                <th>RESPONSÁVEL</th>
                <th>PRAZO</th>
                <th>PRIORIDADE</th>
                <th>STATUS</th>
                <th>AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td>
                    <strong>{task.titulo}</strong>
                    {task.descricao && <small>{task.descricao}</small>}
                  </td>
                  <td>{task.projeto || '—'}</td>
                  <td>{task.responsavel}</td>
                  <td>
                    <span className={isOverdue(task) ? 'task-overdue' : ''}>
                      {formatDate(task.prazo)}
                    </span>
                    {isOverdue(task) && (
                      <small className="task-overdue">Atrasada</small>
                    )}
                  </td>
                  <td>
                    <span
                      className={`task-priority priority-${task.prioridade.toLowerCase()}`}
                    >
                      {task.prioridade}
                    </span>
                  </td>
                  <td>
                    <select
                      className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`}
                      value={task.status}
                      aria-label={`Status da tarefa ${task.titulo}`}
                      onChange={(event) => {
                        const status = event.target.value as TaskStatus
                        setTasks((current) =>
                          current.map((item) =>
                            item.id === task.id ? { ...item, status } : item,
                          ),
                        )
                      }}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Em andamento">Em andamento</option>
                      <option value="Concluída">Concluída</option>
                    </select>
                  </td>
                  <td>
                    <div className="task-actions">
                      <button
                        type="button"
                        className="task-edit-button"
                        title="Editar tarefa"
                        aria-label={`Editar tarefa ${task.titulo}`}
                        onClick={() => openEditTask(task)}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        className="task-delete-button"
                        title="Excluir tarefa"
                        aria-label={`Excluir tarefa ${task.titulo}`}
                        onClick={() => deleteTask(task)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={7} className="task-empty">
                    Nenhuma tarefa encontrada com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="task-table-footer">
          Exibindo {filteredTasks.length} de {tasks.length} tarefa(s)
        </div>
      </div>

      {modalOpen && (
        <div className="task-modal-backdrop">
          <form className="task-modal" onSubmit={saveTask}>
            <div className="task-modal-header">
              <div>
                <h2>{editingId ? 'Editar tarefa' : 'Nova tarefa'}</h2>
                <p>Informe os dados da atividade.</p>
              </div>
              <button
                type="button"
                className="task-close"
                aria-label="Fechar formulário"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="task-form-grid">
              <label className="task-field task-field-wide">
                Título *
                <input
                  required
                  value={form.titulo}
                  onChange={(event) =>
                    setForm({ ...form, titulo: event.target.value })
                  }
                  placeholder="Ex.: Validar indicadores"
                />
              </label>

              <label className="task-field task-field-wide">
                Descrição
                <textarea
                  rows={3}
                  value={form.descricao}
                  onChange={(event) =>
                    setForm({ ...form, descricao: event.target.value })
                  }
                  placeholder="Detalhes da tarefa..."
                />
              </label>

              <label className="task-field">
                Projeto
                <input
                  value={form.projeto}
                  onChange={(event) =>
                    setForm({ ...form, projeto: event.target.value })
                  }
                  placeholder="Nome do projeto"
                />
              </label>

              <label className="task-field">
                Responsável *
                <input
                  required
                  value={form.responsavel}
                  onChange={(event) =>
                    setForm({ ...form, responsavel: event.target.value })
                  }
                  placeholder="Nome do responsável"
                />
              </label>

              <label className="task-field">
                Prazo
                <input
                  type="date"
                  value={form.prazo}
                  onChange={(event) =>
                    setForm({ ...form, prazo: event.target.value })
                  }
                />
              </label>

              <label className="task-field">
                Prioridade
                <select
                  value={form.prioridade}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      prioridade: event.target.value as TaskPriority,
                    })
                  }
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Crítica">Crítica</option>
                </select>
              </label>

              <label className="task-field">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as TaskStatus,
                    })
                  }
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Em andamento">Em andamento</option>
                  <option value="Concluída">Concluída</option>
                </select>
              </label>
            </div>

            {error && <p className="task-form-error">{error}</p>}

            <div className="task-form-actions">
              <button
                type="button"
                className="task-secondary-button"
                onClick={closeModal}
              >
                Cancelar
              </button>
              <button type="submit" className="task-primary-button">
                Salvar tarefa
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

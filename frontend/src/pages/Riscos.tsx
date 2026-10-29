
import { useEffect, useMemo, useState, type FormEvent } from 'react'

type RiskStatus =
  | 'Identificado'
  | 'Em tratamento'
  | 'Monitorado'
  | 'Mitigado'

type RiskLevel = 'Baixo' | 'Moderado' | 'Alto' | 'Crítico'

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

const STORAGE_KEY = 'project-control-360-risks-v1'

const initialRisks: Risk[] = [
  {
    id: 'r1',
    titulo: 'Atraso no cronograma de implantação',
    projeto: 'Implantação Hydro',
    responsavel: 'Monique Marques',
    probabilidade: 4,
    impacto: 5,
    planoMitigacao:
      'Acompanhar o cronograma semanalmente e antecipar atividades críticas.',
    status: 'Em tratamento',
  },
  {
    id: 'r2',
    titulo: 'Indisponibilidade de recursos',
    projeto: 'Otimização de processos',
    responsavel: 'Carlos Souza',
    probabilidade: 3,
    impacto: 3,
    planoMitigacao:
      'Planejar recursos com antecedência e definir alternativas.',
    status: 'Monitorado',
  },
]

const emptyRisk = (): Omit<Risk, 'id'> => ({
  titulo: '',
  projeto: '',
  responsavel: '',
  probabilidade: 3,
  impacto: 3,
  planoMitigacao: '',
  status: 'Identificado',
})

function loadRisks(): Risk[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? (JSON.parse(saved) as Risk[]) : initialRisks
  } catch {
    return initialRisks
  }
}

function calculateLevel(
  risk: Pick<Risk, 'probabilidade' | 'impacto'>,
): RiskLevel {
  const score = risk.probabilidade * risk.impacto

  if (score >= 20) return 'Crítico'
  if (score >= 12) return 'Alto'
  if (score >= 6) return 'Moderado'
  return 'Baixo'
}

export default function Riscos() {
  const [risks, setRisks] = useState<Risk[]>(loadRisks)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [levelFilter, setLevelFilter] = useState('Todos')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Risk, 'id'>>(emptyRisk())
  const [error, setError] = useState('')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(risks))
  }, [risks])

  const filteredRisks = useMemo(() => {
    const term = search.toLowerCase().trim()

    return risks.filter((risk) => {
      const matchesSearch =
        risk.titulo.toLowerCase().includes(term) ||
        risk.projeto.toLowerCase().includes(term) ||
        risk.responsavel.toLowerCase().includes(term)

      const matchesStatus =
        statusFilter === 'Todos' || risk.status === statusFilter

      const matchesLevel =
        levelFilter === 'Todos' || calculateLevel(risk) === levelFilter

      return matchesSearch && matchesStatus && matchesLevel
    })
  }, [risks, search, statusFilter, levelFilter])

  function openNewRisk() {
    setEditingId(null)
    setForm(emptyRisk())
    setError('')
    setModalOpen(true)
  }

  function openEditRisk(risk: Risk) {
    const { id, ...riskData } = risk
    setEditingId(id)
    setForm(riskData)
    setError('')
    setModalOpen(true)
  }

  function saveRisk(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.titulo.trim() || !form.responsavel.trim()) {
      setError('Preencha a descrição do risco e o responsável.')
      return
    }

    if (editingId) {
      setRisks((current) =>
        current.map((risk) =>
          risk.id === editingId ? { ...form, id: editingId } : risk,
        ),
      )
    } else {
      setRisks((current) => [
        { ...form, id: crypto.randomUUID() },
        ...current,
      ])
    }

    closeModal()
  }

  function deleteRisk(risk: Risk) {
    const confirmed = window.confirm(
      `Deseja realmente excluir o risco "${risk.titulo}"? Esta ação não poderá ser desfeita.`,
    )

    if (!confirmed) return

    setRisks((current) =>
      current.filter((item) => item.id !== risk.id),
    )
  }

  function closeModal() {
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyRisk())
    setError('')
  }

  const criticalCount = risks.filter(
    (risk) => calculateLevel(risk) === 'Crítico',
  ).length

  const highCount = risks.filter(
    (risk) => calculateLevel(risk) === 'Alto',
  ).length

  const treatmentCount = risks.filter(
    (risk) => risk.status === 'Em tratamento',
  ).length

  const mitigatedCount = risks.filter(
    (risk) => risk.status === 'Mitigado',
  ).length

  return (
    <section className="risk-module">
      <div className="risk-heading">
        <div>
          <div className="risk-eyebrow">GESTÃO PREVENTIVA</div>
          <h1>Riscos</h1>
          <p className="risk-muted">
            Identifique ameaças, avalie impactos e acompanhe ações de mitigação.
          </p>
        </div>

        <button
          type="button"
          className="risk-primary-button"
          onClick={openNewRisk}
        >
          ＋ Novo risco
        </button>
      </div>

      <div className="risk-summary">
        {[
          { label: 'Total de riscos', value: risks.length },
          { label: 'Riscos críticos', value: criticalCount },
          { label: 'Riscos altos', value: highCount },
          { label: 'Em tratamento', value: treatmentCount },
          { label: 'Mitigados', value: mitigatedCount },
        ].map((item) => (
          <article className="risk-summary-card" key={item.label}>
            <span>{item.label}</span>
            <strong
              className={
                item.label === 'Riscos críticos'
                  ? 'risk-critical-text'
                  : item.label === 'Riscos altos'
                    ? 'risk-high-text'
                    : ''
              }
            >
              {item.value}
            </strong>
          </article>
        ))}
      </div>

      <div className="risk-list-panel">
        <div className="risk-toolbar">
          <input
            className="risk-search"
            type="search"
            placeholder="Pesquisar risco, projeto ou responsável..."
            aria-label="Pesquisar riscos"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            className="risk-filter"
            aria-label="Filtrar por status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <option value="Todos">Todos os status</option>
            <option value="Identificado">Identificado</option>
            <option value="Em tratamento">Em tratamento</option>
            <option value="Monitorado">Monitorado</option>
            <option value="Mitigado">Mitigado</option>
          </select>

          <select
            className="risk-filter"
            aria-label="Filtrar por nível de risco"
            value={levelFilter}
            onChange={(event) => setLevelFilter(event.target.value)}
          >
            <option value="Todos">Todos os níveis</option>
            <option value="Baixo">Baixo</option>
            <option value="Moderado">Moderado</option>
            <option value="Alto">Alto</option>
            <option value="Crítico">Crítico</option>
          </select>
        </div>

        <div className="risk-table-wrapper">
          <table className="risk-table">
            <thead>
              <tr>
                <th>RISCO</th>
                <th>PROJETO</th>
                <th>RESPONSÁVEL</th>
                <th>PROB. × IMPACTO</th>
                <th>NÍVEL</th>
                <th>STATUS</th>
                <th>AÇÕES</th>
              </tr>
            </thead>

            <tbody>
              {filteredRisks.map((risk) => {
                const level = calculateLevel(risk)

                return (
                  <tr key={risk.id}>
                    <td>
                      <strong>{risk.titulo}</strong>
                      <small>
                        {risk.planoMitigacao ||
                          'Nenhum plano de mitigação informado.'}
                      </small>
                    </td>

                    <td>{risk.projeto || '—'}</td>
                    <td>{risk.responsavel}</td>

                    <td>
                      {risk.probabilidade} × {risk.impacto} ={' '}
                      {risk.probabilidade * risk.impacto}
                    </td>

                    <td>
                      <span
                        className={`risk-level risk-level-${level.toLowerCase()}`}
                      >
                        {level}
                      </span>
                    </td>

                    <td>
                      <select
                        className="risk-status"
                        value={risk.status}
                        aria-label={`Status do risco ${risk.titulo}`}
                        onChange={(event) => {
                          const status = event.target.value as RiskStatus

                          setRisks((current) =>
                            current.map((item) =>
                              item.id === risk.id
                                ? { ...item, status }
                                : item,
                            ),
                          )
                        }}
                      >
                        <option value="Identificado">Identificado</option>
                        <option value="Em tratamento">Em tratamento</option>
                        <option value="Monitorado">Monitorado</option>
                        <option value="Mitigado">Mitigado</option>
                      </select>
                    </td>

                    <td>
                      <div className="risk-actions">
                        <button
                          type="button"
                          className="risk-edit-button"
                          title="Editar risco"
                          aria-label={`Editar risco ${risk.titulo}`}
                          onClick={() => openEditRisk(risk)}
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="risk-delete-button"
                          title="Excluir risco"
                          aria-label={`Excluir risco ${risk.titulo}`}
                          onClick={() => deleteRisk(risk)}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredRisks.length === 0 && (
                <tr>
                  <td colSpan={7} className="risk-empty">
                    Nenhum risco encontrado com esses filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="risk-table-footer">
          Exibindo {filteredRisks.length} de {risks.length} risco(s)
        </div>
      </div>

      {modalOpen && (
        <div className="risk-modal-backdrop">
          <form className="risk-modal" onSubmit={saveRisk}>
            <div className="risk-modal-header">
              <div>
                <h2>{editingId ? 'Editar risco' : 'Novo risco'}</h2>
                <p>
                  Registre o risco e as medidas previstas para mitigação.
                </p>
              </div>

              <button
                type="button"
                className="risk-close"
                aria-label="Fechar formulário"
                onClick={closeModal}
              >
                ×
              </button>
            </div>

            <div className="risk-form-grid">
              <label className="risk-field risk-field-wide">
                Descrição do risco *
                <input
                  required
                  value={form.titulo}
                  onChange={(event) =>
                    setForm({ ...form, titulo: event.target.value })
                  }
                  placeholder="Ex.: Atraso na entrega"
                />
              </label>

              <label className="risk-field">
                Projeto relacionado
                <input
                  value={form.projeto}
                  onChange={(event) =>
                    setForm({ ...form, projeto: event.target.value })
                  }
                  placeholder="Nome do projeto"
                />
              </label>

              <label className="risk-field">
                Responsável *
                <input
                  required
                  value={form.responsavel}
                  onChange={(event) =>
                    setForm({ ...form, responsavel: event.target.value })
                  }
                  placeholder="Responsável pelo acompanhamento"
                />
              </label>

              <label className="risk-field">
                Probabilidade (1 a 5)
                <select
                  value={form.probabilidade}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      probabilidade: Number(event.target.value),
                    })
                  }
                >
                  <option value={1}>1 — Muito baixa</option>
                  <option value={2}>2 — Baixa</option>
                  <option value={3}>3 — Média</option>
                  <option value={4}>4 — Alta</option>
                  <option value={5}>5 — Muito alta</option>
                </select>
              </label>

              <label className="risk-field">
                Impacto (1 a 5)
                <select
                  value={form.impacto}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      impacto: Number(event.target.value),
                    })
                  }
                >
                  <option value={1}>1 — Muito baixo</option>
                  <option value={2}>2 — Baixo</option>
                  <option value={3}>3 — Médio</option>
                  <option value={4}>4 — Alto</option>
                  <option value={5}>5 — Muito alto</option>
                </select>
              </label>

              <label className="risk-field">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      status: event.target.value as RiskStatus,
                    })
                  }
                >
                  <option value="Identificado">Identificado</option>
                  <option value="Em tratamento">Em tratamento</option>
                  <option value="Monitorado">Monitorado</option>
                  <option value="Mitigado">Mitigado</option>
                </select>
              </label>

              <label className="risk-field risk-field-wide">
                Plano de mitigação
                <textarea
                  rows={4}
                  value={form.planoMitigacao}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      planoMitigacao: event.target.value,
                    })
                  }
                  placeholder="Descreva as ações para reduzir a probabilidade ou o impacto..."
                />
              </label>
            </div>

            <div className="risk-score-preview">
              Pontuação calculada:{' '}
              <strong>
                {form.probabilidade * form.impacto} / 25
              </strong>
              {' — '}
              <strong>{calculateLevel(form)}</strong>
            </div>

            {error && <p className="risk-form-error">{error}</p>}

            <div className="risk-form-actions">
              <button
                type="button"
                className="risk-secondary-button"
                onClick={closeModal}
              >
                Cancelar
              </button>

              <button type="submit" className="risk-primary-button">
                Salvar risco
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  )
}

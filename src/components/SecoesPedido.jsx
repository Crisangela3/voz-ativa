import { TIPOS_INSTITUICAO, tipoPorId } from '../utils/pedido'
import { criarEntrada } from './entrada'

export function Campo({ id, rotulo, erro, dica, children }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">{rotulo}</label>
      {children}
      {dica && !erro && <p className="mt-1 text-xs text-texto-suave">{dica}</p>}
      {erro && <p id={`${id}-erro`} className="mt-1 text-xs font-semibold text-perigo">{erro}</p>}
    </div>
  )
}

export function Secao({ titulo, children }) {
  return (
    <fieldset className="space-y-3 rounded-xl border border-cartao-borda p-4">
      <legend className="px-2 text-sm font-extrabold uppercase tracking-wide text-titulo">{titulo}</legend>
      {children}
    </fieldset>
  )
}

// Cada seção recebe { id, d, erros, mudar, titulo }: o mesmo conjunto serve no cadastro e no perfil.

export function SecaoEscola({ id, d, erros, mudar, titulo, comCursoTurma }) {
  const entrada = criarEntrada({ id, d, erros, mudar })
  const tipo = tipoPorId(d.tipoId)
  return (
    <Secao titulo={titulo}>
      <Campo id={`${id}-tipoId`} rotulo="Tipo de escola ou curso" erro={erros.tipoId}>
        <select {...entrada('tipoId')}>
          <option value="">Selecione…</option>
          {TIPOS_INSTITUICAO.map((t) => (
            <option key={t.id} value={t.id}>{t.rotulo}</option>
          ))}
        </select>
      </Campo>
      {tipo && (
        <Campo id={`${id}-matricula`} rotulo={tipo.matricula} erro={erros.matricula} dica={tipo.dica}>
          <input {...entrada('matricula', { inputMode: 'numeric', autoComplete: 'off' })} />
        </Campo>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo id={`${id}-escolaNome`} rotulo="Nome da escola/instituição" erro={erros.escolaNome}>
          <input {...entrada('escolaNome')} />
        </Campo>
        <Campo id={`${id}-escolaCnpj`} rotulo="CNPJ da escola" erro={erros.escolaCnpj}>
          <input {...entrada('escolaCnpj', { inputMode: 'numeric', placeholder: '00.000.000/0000-00' })} />
        </Campo>
        <Campo id={`${id}-escolaTelefone`} rotulo="Telefone da escola" erro={erros.escolaTelefone}>
          <input {...entrada('escolaTelefone', { type: 'tel', autoComplete: 'off' })} />
        </Campo>
        <Campo id={`${id}-escolaEmail`} rotulo="E-mail da escola" erro={erros.escolaEmail}>
          <input {...entrada('escolaEmail', { type: 'email', autoComplete: 'off' })} />
        </Campo>
      </div>
      <Campo id={`${id}-escolaEndereco`} rotulo="Endereço da escola" erro={erros.escolaEndereco}>
        <input {...entrada('escolaEndereco', { autoComplete: 'off' })} />
      </Campo>
      {comCursoTurma && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Campo id={`${id}-curso`} rotulo="Curso ou disciplina (opcional)">
            <input {...entrada('curso', { autoComplete: 'off' })} />
          </Campo>
          <Campo id={`${id}-turma`} rotulo="Turma (opcional)">
            <input {...entrada('turma', { autoComplete: 'off' })} />
          </Campo>
        </div>
      )}
    </Secao>
  )
}

export function SecaoAluno({ id, d, erros, mudar, titulo }) {
  const entrada = criarEntrada({ id, d, erros, mudar })
  return (
    <Secao titulo={titulo}>
      <Campo id={`${id}-alunoNome`} rotulo="Nome completo do aluno" erro={erros.alunoNome}>
        <input {...entrada('alunoNome', { autoComplete: 'off' })} />
      </Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo id={`${id}-alunoTelefone`} rotulo="Telefone (com DDD)" erro={erros.alunoTelefone}>
          <input {...entrada('alunoTelefone', { type: 'tel', autoComplete: 'off' })} />
        </Campo>
        <Campo id={`${id}-alunoCep`} rotulo="CEP" erro={erros.alunoCep}>
          <input {...entrada('alunoCep', { inputMode: 'numeric', autoComplete: 'off' })} />
        </Campo>
      </div>
      <Campo id={`${id}-alunoEndereco`} rotulo="Endereço (rua, número, bairro, cidade)" erro={erros.alunoEndereco}>
        <input {...entrada('alunoEndereco', { autoComplete: 'off' })} />
      </Campo>
      <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
        <input type="checkbox" className="size-5" checked={d.menor} onChange={mudar('menor')} />
        O aluno tem menos de 18 anos
      </label>
      {!d.menor && (
        <Campo id={`${id}-alunoEmail`} rotulo="E-mail do aluno (receberá o código)" erro={erros.alunoEmail}>
          <input {...entrada('alunoEmail', { type: 'email', autoComplete: 'email' })} />
        </Campo>
      )}
    </Secao>
  )
}

export function SecaoResponsavel({ id, d, erros, mudar, titulo }) {
  const entrada = criarEntrada({ id, d, erros, mudar })
  return (
    <Secao titulo={titulo}>
      <Campo id={`${id}-respNome`} rotulo="Nome completo do responsável" erro={erros.respNome}>
        <input {...entrada('respNome', { autoComplete: 'name' })} />
      </Campo>
      <div className="grid gap-3 sm:grid-cols-2">
        <Campo id={`${id}-respEmail`} rotulo="E-mail do responsável (receberá o código)" erro={erros.respEmail}>
          <input {...entrada('respEmail', { type: 'email', autoComplete: 'email' })} />
        </Campo>
        <Campo id={`${id}-respTelefone`} rotulo="Telefone do responsável" erro={erros.respTelefone}>
          <input {...entrada('respTelefone', { type: 'tel', autoComplete: 'tel' })} />
        </Campo>
      </div>
    </Secao>
  )
}

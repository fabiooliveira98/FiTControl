import { ListaAlunos } from "@/components/alunos/lista-alunos";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { SearchForm } from "@/components/ui/search-form";
import { buscarAlunos } from "@/features/alunos/queries";

export default async function AlunosPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>;
}) {
  const { busca = "" } = await searchParams;
  const alunos = await buscarAlunos(busca);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Alunos"
        title="Pessoas, rotinas e lugares na agenda."
        description="Cadastre dias diferentes, organize aulas individuais, duplas ou trios e acompanhe pendencias sem perder o contexto."
        actions={<ButtonLink href="/alunos/novo">Novo aluno</ButtonLink>}
      />

      <SearchForm defaultValue={busca} placeholder="Buscar aluno pelo nome" />

      {alunos.length ? (
        <ListaAlunos alunos={alunos} />
      ) : (
        <EmptyState
          title={busca ? "Nenhum aluno encontrado" : "A lista de alunos esta vazia"}
          description={
            busca
              ? "Tente pesquisar por outro nome."
              : "Cadastre o primeiro aluno e escolha apenas horarios disponiveis na grade."
          }
          action={!busca ? <ButtonLink href="/alunos/novo">Cadastrar primeiro aluno</ButtonLink> : null}
        />
      )}
    </div>
  );
}

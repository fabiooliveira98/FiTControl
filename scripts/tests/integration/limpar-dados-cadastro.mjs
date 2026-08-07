import {
  CAMINHO_REGISTRO,
  criarClienteTesteAutenticado,
  encerrarClienteTeste,
  limparDadosRegistrados,
} from "./supabase-test-utils.mjs";

let supabase;

try {
  supabase = await criarClienteTesteAutenticado();
  const resultado = await limparDadosRegistrados(supabase);

  if (!resultado.encontrouRegistro) {
    console.log(`Nenhum dado de teste registrado em ${CAMINHO_REGISTRO}.`);
  } else {
    console.log(`${resultado.total} registro(s) exclusivo(s) do teste foram removidos.`);
  }
} finally {
  await encerrarClienteTeste(supabase);
}

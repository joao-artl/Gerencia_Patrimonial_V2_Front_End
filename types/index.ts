export interface Empresa {
  id: string
  nome: string
  cnpj: string
  email: string
  telefone: string
  senha: string
  endereco: {
    cep: string
    estado: string
    cidade: string
    bairro: string
    logradouro: string
    numero: string
    complemento?: string
  }
}

export interface Filial {
  id: string
  empresaId: string
  nome: string
  cnpj: string
  email: string
  telefone: string
  senha: string
  endereco: {
    cep: string
    estado: string
    cidade: string
    bairro: string
    logradouro: string
    numero: string
    complemento?: string
  }
}

export interface Funcionario {
  id: string
  empresaId: string
  filialId: string
  nome: string
  cpf: string
  email: string
  senha: string
}

export interface Usuario {
  id: string
  cpf: string
  nome: string
  email: string
  tipo_usuario: "GESTOR" | "FUNCIONARIO"
  filialId?: string
  empresaId?: string
  senha: string
  dataRegistro: string
}

// Interfaces específicas para cada tipo de patrimônio
export interface PatrimonioBase {
  id: string
  empresaId: string
  filialId: string
  nome: string
  valor: number
}

export interface Imovel extends PatrimonioBase {
  tipo: "imovel"
  area: number
  tipoImovel: string
  endereco: {
    cep: string
    estado: string
    cidade: string
    bairro: string
    logradouro: string
    numero: string
    complemento?: string
  }
}

export interface Veiculo extends PatrimonioBase {
  tipo: "veiculo"
  quantidade: number
  cor: string
  modelo: string
  fabricante: string
}

export interface Utilitario extends PatrimonioBase {
  tipo: "utilitario"
  quantidade: number
  descricao: string
  funcao: string
}

export type Patrimonio = Imovel | Veiculo | Utilitario

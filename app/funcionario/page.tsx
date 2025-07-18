"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Building2,
  Car,
  Wrench,
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  DollarSign,
  LogOut,
  User,
  Ruler,
  Hash,
  Palette,
  Building,
  Mail,
  Phone,
} from "lucide-react"
import type { Patrimonio, Imovel, Veiculo, Utilitario, Usuario, Filial, Empresa } from "@/types"

// Dados mockados
const empresas: Empresa[] = [
  {
    id: "1",
    nome: "TechCorp Ltda.",
    cnpj: "12.345.678/0001-90",
    email: "contato@techcorp.com.br",
    telefone: "(11) 3000-0000",
    senha: "123456",
    endereco: {
      cep: "01310-100",
      estado: "SP",
      cidade: "São Paulo",
      bairro: "Bela Vista",
      logradouro: "Av. Paulista",
      numero: "1000",
      complemento: "Sala 501",
    },
  },
  {
    id: "2",
    nome: "InnovaTech S.A.",
    cnpj: "98.765.432/0001-10",
    email: "contato@innovatech.com.br",
    telefone: "(21) 2000-0000",
    senha: "123456",
    endereco: {
      cep: "22240-000",
      estado: "RJ",
      cidade: "Rio de Janeiro",
      bairro: "Laranjeiras",
      logradouro: "Rua das Laranjeiras",
      numero: "200",
    },
  },
]

const filiais: Filial[] = [
  {
    id: "1",
    empresaId: "1",
    nome: "Matriz São Paulo",
    cnpj: "12.345.678/0001-90",
    email: "matriz@techcorp.com.br",
    telefone: "(11) 3000-0001",
    senha: "123456",
    endereco: {
      cep: "01310-100",
      estado: "SP",
      cidade: "São Paulo",
      bairro: "Bela Vista",
      logradouro: "Av. Paulista",
      numero: "1000",
    },
  },
  {
    id: "4",
    empresaId: "2",
    nome: "Sede Rio de Janeiro",
    cnpj: "98.765.432/0001-10",
    email: "sede@innovatech.com.br",
    telefone: "(21) 2000-0001",
    senha: "123456",
    endereco: {
      cep: "22240-000",
      estado: "RJ",
      cidade: "Rio de Janeiro",
      bairro: "Laranjeiras",
      logradouro: "Rua das Laranjeiras",
      numero: "200",
    },
  },
]

const getPatrimoniosPorFilial = (filialId: string): Patrimonio[] => {
  const todosPatrimonios: Patrimonio[] = [
    {
      id: "1",
      empresaId: "1",
      filialId: "1",
      nome: "Sede Principal",
      tipo: "imovel",
      valor: 850000,
      area: 500,
      tipoImovel: "Comercial",
      endereco: {
        cep: "01310-100",
        estado: "SP",
        cidade: "São Paulo",
        bairro: "Bela Vista",
        logradouro: "Av. Paulista",
        numero: "1000",
        complemento: "Sala 501",
      },
    } as Imovel,
    {
      id: "2",
      empresaId: "1",
      filialId: "1",
      nome: "Veículo Corporativo",
      tipo: "veiculo",
      valor: 45000,
      quantidade: 1,
      cor: "Prata",
      modelo: "Civic",
      fabricante: "Honda",
    } as Veiculo,
    {
      id: "6",
      empresaId: "1",
      filialId: "1",
      nome: "Notebook Dell",
      tipo: "utilitario",
      valor: 3500,
      quantidade: 5,
      descricao: "Notebooks para desenvolvimento de software",
      funcao: "Equipamento de TI",
    } as Utilitario,
    {
      id: "7",
      empresaId: "2",
      filialId: "4",
      nome: "Escritório Central",
      tipo: "imovel",
      valor: 1200000,
      area: 800,
      tipoImovel: "Comercial",
      endereco: {
        cep: "22240-000",
        estado: "RJ",
        cidade: "Rio de Janeiro",
        bairro: "Laranjeiras",
        logradouro: "Rua das Laranjeiras",
        numero: "200",
      },
    } as Imovel,
    {
      id: "8",
      empresaId: "2",
      filialId: "4",
      nome: "Impressora Multifuncional",
      tipo: "utilitario",
      valor: 2500,
      quantidade: 3,
      descricao: "Impressoras para uso administrativo",
      funcao: "Equipamento de Escritório",
    } as Utilitario,
  ]

  return todosPatrimonios.filter((p) => p.filialId === filialId)
}

const tiposImovel = [
  "Comercial",
  "Residencial",
  "Industrial",
  "Galpão",
  "Terreno",
  "Sala Comercial",
  "Loja",
  "Escritório",
]

const estados = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
]

export default function FuncionarioPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Patrimonio | null>(null)
  const [tipoSelecionado, setTipoSelecionado] = useState<"imovel" | "veiculo" | "utilitario">("imovel")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Estados para formulário de imóvel
  const [formDataImovel, setFormDataImovel] = useState<Partial<Imovel>>({
    nome: "",
    valor: 0,
    area: 0,
    tipoImovel: "",
    endereco: {
      cep: "",
      estado: "",
      cidade: "",
      bairro: "",
      logradouro: "",
      numero: "",
      complemento: "",
    },
  })

  // Estados para formulário de veículo
  const [formDataVeiculo, setFormDataVeiculo] = useState<Partial<Veiculo>>({
    nome: "",
    valor: 0,
    quantidade: 1,
    cor: "",
    modelo: "",
    fabricante: "",
  })

  // Estados para formulário de utilitário
  const [formDataUtilitario, setFormDataUtilitario] = useState<Partial<Utilitario>>({
    nome: "",
    valor: 0,
    quantidade: 1,
    descricao: "",
    funcao: "",
  })

  // Verificar autenticação e carregar dados
  useEffect(() => {
    const usuarioData = localStorage.getItem("usuario")
    if (!usuarioData) {
      router.push("/")
      return
    }

    const user = JSON.parse(usuarioData) as Usuario
    if (user.tipoUsuario !== "funcionario" || !user.filialId) {
      router.push("/dashboard")
      return
    }

    setUsuario(user)
    setPatrimonios(getPatrimoniosPorFilial(user.filialId))
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("usuario")
    router.push("/")
  }

  const filial = usuario?.filialId ? filiais.find((f) => f.id === usuario.filialId) : null
  const empresa = filial ? empresas.find((e) => e.id === filial.empresaId) : null

  const patrimoniosFiltrados = useMemo(() => {
    return patrimonios.filter((item) => {
      const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTipo = filterTipo === "todos" || item.tipo === filterTipo
      return matchesSearch && matchesTipo
    })
  }, [patrimonios, searchTerm, filterTipo])

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "imovel":
        return <Building2 className="w-5 h-5" />
      case "veiculo":
        return <Car className="w-5 h-5" />
      case "utilitario":
        return <Wrench className="w-5 h-5" />
      default:
        return null
    }
  }

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case "imovel":
        return "Imóvel"
      case "veiculo":
        return "Veículo"
      case "utilitario":
        return "Utilitário"
      default:
        return tipo
    }
  }

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, "$1-$2")
    }
    return value
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!usuario?.filialId) {
      setError("Erro: Filial não identificada.")
      return
    }

    let novoPatrimonio: Patrimonio

    if (tipoSelecionado === "imovel") {
      novoPatrimonio = {
        id: editingItem?.id || Date.now().toString(),
        empresaId: usuario.empresaId!,
        filialId: usuario.filialId,
        tipo: "imovel",
        ...formDataImovel,
      } as Imovel
    } else if (tipoSelecionado === "veiculo") {
      novoPatrimonio = {
        id: editingItem?.id || Date.now().toString(),
        empresaId: usuario.empresaId!,
        filialId: usuario.filialId,
        tipo: "veiculo",
        ...formDataVeiculo,
      } as Veiculo
    } else {
      novoPatrimonio = {
        id: editingItem?.id || Date.now().toString(),
        empresaId: usuario.empresaId!,
        filialId: usuario.filialId,
        tipo: "utilitario",
        ...formDataUtilitario,
      } as Utilitario
    }

    if (editingItem) {
      setPatrimonios((prev) => prev.map((item) => (item.id === editingItem.id ? novoPatrimonio : item)))
      setSuccess("Patrimônio atualizado com sucesso!")
    } else {
      setPatrimonios((prev) => [...prev, novoPatrimonio])
      setSuccess("Patrimônio adicionado com sucesso!")
    }

    resetForm()
  }

  const handleEdit = (item: Patrimonio) => {
    setEditingItem(item)
    setTipoSelecionado(item.tipo)

    if (item.tipo === "imovel") {
      setFormDataImovel(item as Imovel)
    } else if (item.tipo === "veiculo") {
      setFormDataVeiculo(item as Veiculo)
    } else {
      setFormDataUtilitario(item as Utilitario)
    }

    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setPatrimonios((prev) => prev.filter((item) => item.id !== id))
    setSuccess("Patrimônio excluído com sucesso!")
  }

  const resetForm = () => {
    setFormDataImovel({
      nome: "",
      valor: 0,
      area: 0,
      tipoImovel: "",
      endereco: {
        cep: "",
        estado: "",
        cidade: "",
        bairro: "",
        logradouro: "",
        numero: "",
        complemento: "",
      },
    })
    setFormDataVeiculo({
      nome: "",
      valor: 0,
      quantidade: 1,
      cor: "",
      modelo: "",
      fabricante: "",
    })
    setFormDataUtilitario({
      nome: "",
      valor: 0,
      quantidade: 1,
      descricao: "",
      funcao: "",
    })
    setEditingItem(null)
    setTipoSelecionado("imovel")
    setIsDialogOpen(false)
    setError("")
    setSuccess("")
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const renderPatrimonioDetails = (item: Patrimonio) => {
    if (item.tipo === "imovel") {
      const imovel = item as Imovel
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Ruler className="w-4 h-4" />
            <span>
              {imovel.area}m² - {imovel.tipoImovel}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>
              {imovel.endereco.logradouro}, {imovel.endereco.numero}
              {imovel.endereco.complemento && `, ${imovel.endereco.complemento}`}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            {imovel.endereco.bairro}, {imovel.endereco.cidade} - {imovel.endereco.estado}
          </div>
          <div className="text-sm text-gray-600">CEP: {imovel.endereco.cep}</div>
        </div>
      )
    } else if (item.tipo === "veiculo") {
      const veiculo = item as Veiculo
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="w-4 h-4" />
            <span>Quantidade: {veiculo.quantidade}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Palette className="w-4 h-4" />
            <span>Cor: {veiculo.cor}</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">{veiculo.fabricante}</span> - {veiculo.modelo}
          </div>
        </div>
      )
    } else {
      const utilitario = item as Utilitario
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Hash className="w-4 h-4" />
            <span>Quantidade: {utilitario.quantidade}</span>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-medium">Função:</span> {utilitario.funcao}
          </div>
          <div className="text-sm text-gray-600">{utilitario.descricao}</div>
        </div>
      )
    }
  }

  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header fixo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gestão de Empresa e Filiais</h1>
                <p className="text-sm text-gray-500">Gestão de Empresa e Filiais</p>
              </div>
            </div>

            {/* Informações do usuário */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <div className="text-right">
                  <p className="font-medium">{usuario.nome}</p>
                  <p className="text-xs text-gray-500">Funcionário</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mensagens de feedback */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Header da página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Patrimônio da Filial</h1>
          <p className="text-gray-600">Gerencie os patrimônios da sua filial</p>
        </div>

        {/* Informações da filial e empresa */}
        {filial && empresa && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Filial
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{filial.nome}</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{filial.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{filial.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {filial.endereco.logradouro}, {filial.endereco.numero} - {filial.endereco.bairro}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Empresa
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{empresa.nome}</p>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{empresa.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{empresa.telefone}</span>
                  </div>
                  <p>CNPJ: {empresa.cnpj}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar patrimônio..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterTipo} onValueChange={setFilterTipo}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="imovel">Imóveis</SelectItem>
                  <SelectItem value="veiculo">Veículos</SelectItem>
                  <SelectItem value="utilitario">Utilitários</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Patrimônio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingItem ? "Editar Patrimônio" : "Adicionar Novo Patrimônio"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Seletor de tipo */}
                  {!editingItem && (
                    <div>
                      <Label>Tipo de Patrimônio</Label>
                      <Select
                        value={tipoSelecionado}
                        onValueChange={(value: "imovel" | "veiculo" | "utilitario") => setTipoSelecionado(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="imovel">Imóvel</SelectItem>
                          <SelectItem value="veiculo">Veículo</SelectItem>
                          <SelectItem value="utilitario">Utilitário</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Formulário para Imóvel */}
                  {tipoSelecionado === "imovel" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Dados do Imóvel</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome *</Label>
                          <Input
                            id="nome"
                            value={formDataImovel.nome}
                            onChange={(e) => setFormDataImovel((prev) => ({ ...prev, nome: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="valor">Valor (R$) *</Label>
                          <Input
                            id="valor"
                            type="number"
                            step="0.01"
                            value={formDataImovel.valor}
                            onChange={(e) =>
                              setFormDataImovel((prev) => ({ ...prev, valor: Number.parseFloat(e.target.value) || 0 }))
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="area">Área (m²) *</Label>
                          <Input
                            id="area"
                            type="number"
                            step="0.01"
                            value={formDataImovel.area}
                            onChange={(e) =>
                              setFormDataImovel((prev) => ({ ...prev, area: Number.parseFloat(e.target.value) || 0 }))
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="tipoImovel">Tipo de Imóvel *</Label>
                          <Select
                            value={formDataImovel.tipoImovel}
                            onValueChange={(value) => setFormDataImovel((prev) => ({ ...prev, tipoImovel: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {tiposImovel.map((tipo) => (
                                <SelectItem key={tipo} value={tipo}>
                                  {tipo}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <h4 className="text-md font-semibold mt-6">Endereço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="cep">CEP *</Label>
                          <Input
                            id="cep"
                            value={formDataImovel.endereco?.cep}
                            onChange={(e) => {
                              const formatted = formatCEP(e.target.value)
                              setFormDataImovel((prev) => ({
                                ...prev,
                                endereco: { ...prev.endereco!, cep: formatted },
                              }))
                            }}
                            placeholder="00000-000"
                            maxLength={9}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="estado">Estado *</Label>
                          <Select
                            value={formDataImovel.endereco?.estado}
                            onValueChange={(value) =>
                              setFormDataImovel((prev) => ({
                                ...prev,
                                endereco: { ...prev.endereco!, estado: value },
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                              {estados.map((estado) => (
                                <SelectItem key={estado} value={estado}>
                                  {estado}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="cidade">Cidade *</Label>
                          <Input
                            id="cidade"
                            value={formDataImovel.endereco?.cidade}
                            onChange={(e) =>
                              setFormDataImovel((prev) => ({
                                ...prev,
                                endereco: { ...prev.endereco!, cidade: e.target.value },
                              }))
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="bairro">Bairro *</Label>
                          <Input
                            id="bairro"
                            value={formDataImovel.endereco?.bairro}
                            onChange={(e) =>
                              setFormDataImovel((prev) => ({
                                ...prev,
                                endereco: { ...prev.endereco!, bairro: e.target.value },
                              }))
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="logradouro">Logradouro *</Label>
                          <Input
                            id="logradouro"
                            value={formDataImovel.endereco?.logradouro}
                            onChange={(e) =>
                              setFormDataImovel((prev) => ({
                                ...prev,
                                endereco: { ...prev.endereco!, logradouro: e.target.value },
                              }))
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="numero">Número *</Label>
                          <Input
                            id="numero"
                            value={formDataImovel.endereco?.numero}
                            onChange={(e) =>
                              setFormDataImovel((prev) => ({
                                ...prev,
                                endereco: { ...prev.endereco!, numero: e.target.value },
                              }))
                            }
                            required
                          />
                        </div>

                        <div className="md:col-span-3">
                          <Label htmlFor="complemento">Complemento</Label>
                          <Input
                            id="complemento"
                            value={formDataImovel.endereco?.complemento}
                            onChange={(e) =>
                              setFormDataImovel((prev) => ({
                                ...prev,
                                endereco: { ...prev.endereco!, complemento: e.target.value },
                              }))
                            }
                            placeholder="Apartamento, sala, andar, etc."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Formulário para Veículo */}
                  {tipoSelecionado === "veiculo" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Dados do Veículo</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome *</Label>
                          <Input
                            id="nome"
                            value={formDataVeiculo.nome}
                            onChange={(e) => setFormDataVeiculo((prev) => ({ ...prev, nome: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="valor">Valor (R$) *</Label>
                          <Input
                            id="valor"
                            type="number"
                            step="0.01"
                            value={formDataVeiculo.valor}
                            onChange={(e) =>
                              setFormDataVeiculo((prev) => ({ ...prev, valor: Number.parseFloat(e.target.value) || 0 }))
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="quantidade">Quantidade *</Label>
                          <Input
                            id="quantidade"
                            type="number"
                            min="1"
                            value={formDataVeiculo.quantidade}
                            onChange={(e) =>
                              setFormDataVeiculo((prev) => ({
                                ...prev,
                                quantidade: Number.parseInt(e.target.value) || 1,
                              }))
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="cor">Cor *</Label>
                          <Input
                            id="cor"
                            value={formDataVeiculo.cor}
                            onChange={(e) => setFormDataVeiculo((prev) => ({ ...prev, cor: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="modelo">Modelo *</Label>
                          <Input
                            id="modelo"
                            value={formDataVeiculo.modelo}
                            onChange={(e) => setFormDataVeiculo((prev) => ({ ...prev, modelo: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="fabricante">Fabricante *</Label>
                          <Input
                            id="fabricante"
                            value={formDataVeiculo.fabricante}
                            onChange={(e) => setFormDataVeiculo((prev) => ({ ...prev, fabricante: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Formulário para Utilitário */}
                  {tipoSelecionado === "utilitario" && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Dados do Utilitário</h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome *</Label>
                          <Input
                            id="nome"
                            value={formDataUtilitario.nome}
                            onChange={(e) => setFormDataUtilitario((prev) => ({ ...prev, nome: e.target.value }))}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="valor">Valor (R$) *</Label>
                          <Input
                            id="valor"
                            type="number"
                            step="0.01"
                            value={formDataUtilitario.valor}
                            onChange={(e) =>
                              setFormDataUtilitario((prev) => ({
                                ...prev,
                                valor: Number.parseFloat(e.target.value) || 0,
                              }))
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="quantidade">Quantidade *</Label>
                          <Input
                            id="quantidade"
                            type="number"
                            min="1"
                            value={formDataUtilitario.quantidade}
                            onChange={(e) =>
                              setFormDataUtilitario((prev) => ({
                                ...prev,
                                quantidade: Number.parseInt(e.target.value) || 1,
                              }))
                            }
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="funcao">Função *</Label>
                          <Input
                            id="funcao"
                            value={formDataUtilitario.funcao}
                            onChange={(e) => setFormDataUtilitario((prev) => ({ ...prev, funcao: e.target.value }))}
                            placeholder="Ex: Equipamento de TI, Móvel, Ferramenta"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="descricao">Descrição *</Label>
                        <Textarea
                          id="descricao"
                          value={formDataUtilitario.descricao}
                          onChange={(e) => setFormDataUtilitario((prev) => ({ ...prev, descricao: e.target.value }))}
                          rows={3}
                          placeholder="Descreva o item, suas características e especificações"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit">{editingItem ? "Atualizar" : "Adicionar"}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Itens</p>
                  <p className="text-2xl font-bold">{patrimoniosFiltrados.length}</p>
                </div>
                <div className="text-blue-500">
                  <Building2 className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(patrimoniosFiltrados.reduce((sum, item) => sum + item.valor, 0))}
                  </p>
                </div>
                <div className="text-green-500">
                  <DollarSign className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Imóveis</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {patrimoniosFiltrados.filter((item) => item.tipo === "imovel").length}
                  </p>
                </div>
                <div className="text-purple-500">
                  <Building2 className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Veículos</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {patrimoniosFiltrados.filter((item) => item.tipo === "veiculo").length}
                  </p>
                </div>
                <div className="text-orange-500">
                  <Car className="w-8 h-8" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Patrimônio */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {patrimoniosFiltrados.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTipoIcon(item.tipo)}
                    <CardTitle className="text-lg">{item.nome}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{item.nome}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{getTipoLabel(item.tipo)}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-600">{formatCurrency(item.valor)}</span>
                  </div>

                  {renderPatrimonioDetails(item)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {patrimoniosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum patrimônio encontrado</h3>
            <p className="text-gray-600">Tente ajustar os filtros ou adicionar um novo item ao patrimônio.</p>
          </div>
        )}
      </div>
    </div>
  )
}

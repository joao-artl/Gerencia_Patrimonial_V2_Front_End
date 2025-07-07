"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
import { Building, Search, Plus, Edit, Trash2, Mail, User, Users, CreditCard, Lock, Eye, EyeOff } from "lucide-react"
import type { Funcionario } from "@/types"

const funcionariosIniciais: Funcionario[] = [
  {
    id: "1",
    empresaId: "1",
    filialId: "1",
    nome: "João Silva",
    cpf: "123.456.789-00",
    email: "joao.silva@techcorp.com.br",
    senha: "123456",
  },
  {
    id: "2",
    empresaId: "1",
    filialId: "1",
    nome: "Maria Santos",
    cpf: "987.654.321-00",
    email: "maria.santos@techcorp.com.br",
    senha: "123456",
  },
  {
    id: "3",
    empresaId: "1",
    filialId: "2",
    nome: "Carlos Oliveira",
    cpf: "456.789.123-00",
    email: "carlos.oliveira@techcorp.com.br",
    senha: "123456",
  },
  {
    id: "4",
    empresaId: "1",
    filialId: "2",
    nome: "Ana Costa",
    cpf: "789.123.456-00",
    email: "ana.costa@techcorp.com.br",
    senha: "123456",
  },
  {
    id: "5",
    empresaId: "1",
    filialId: "3",
    nome: "Pedro Lima",
    cpf: "321.654.987-00",
    email: "pedro.lima@techcorp.com.br",
    senha: "123456",
  },
  {
    id: "6",
    empresaId: "1",
    filialId: "1",
    nome: "Fernanda Costa",
    cpf: "654.321.987-00",
    email: "fernanda.costa@techcorp.com.br",
    senha: "123456",
  },
]

const filiais = [
  { id: "1", nome: "Matriz São Paulo" },
  { id: "2", nome: "Filial Rio de Janeiro" },
  { id: "3", nome: "Filial Belo Horizonte" },
  { id: "4", nome: "Filial Porto Alegre" },
  { id: "5", nome: "Filial Recife" },
]

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>(funcionariosIniciais)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFilial, setFilterFilial] = useState<string>("todas")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Funcionario | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<Partial<Funcionario>>({
    nome: "",
    cpf: "",
    email: "",
    senha: "",
    filialId: "",
  })

  const funcionariosFiltrados = useMemo(() => {
    return funcionarios.filter((funcionario) => {
      const matchesSearch =
        funcionario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        funcionario.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        funcionario.cpf.includes(searchTerm)

      const matchesFilial = filterFilial === "todas" || funcionario.filialId === filterFilial

      return matchesSearch && matchesFilial
    })
  }, [funcionarios, searchTerm, filterFilial])

  const getFilialNome = (filialId: string) => {
    const filial = filiais.find((f) => f.id === filialId)
    return filial ? filial.nome : "Filial não encontrada"
  }

  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, "")

    // Aplica a máscara
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
    }

    return value
  }

  const handleCPFChange = (value: string) => {
    const formatted = formatCPF(value)
    setFormData((prev) => ({ ...prev, cpf: formatted }))
  }

  const validateCPF = (cpf: string) => {
    // Remove pontos e traços
    const numbers = cpf.replace(/\D/g, "")

    // Verifica se tem 11 dígitos
    if (numbers.length !== 11) return false

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(numbers)) return false

    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validações
    if (!validateCPF(formData.cpf || "")) {
      alert("CPF inválido. Digite um CPF válido com 11 dígitos.")
      return
    }

    if (!formData.senha || formData.senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.")
      return
    }

    if (!formData.filialId) {
      alert("Selecione uma filial para o funcionário.")
      return
    }

    // Verificar se CPF já existe (exceto para edição do mesmo funcionário)
    if (funcionarios.some((f) => f.cpf === formData.cpf && f.id !== editingItem?.id)) {
      alert("Este CPF já está cadastrado.")
      return
    }

    // Verificar se email já existe (exceto para edição do mesmo funcionário)
    if (funcionarios.some((f) => f.email === formData.email && f.id !== editingItem?.id)) {
      alert("Este email já está cadastrado.")
      return
    }

    if (editingItem) {
      setFuncionarios((prev) =>
        prev.map((item) => (item.id === editingItem.id ? ({ ...item, ...formData } as Funcionario) : item)),
      )
    } else {
      const novoFuncionario: Funcionario = {
        id: Date.now().toString(),
        empresaId: "1",
        ...formData,
      } as Funcionario

      setFuncionarios((prev) => [...prev, novoFuncionario])
    }

    resetForm()
  }

  const handleEdit = (item: Funcionario) => {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    setFuncionarios((prev) => prev.filter((item) => item.id !== id))
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      cpf: "",
      email: "",
      senha: "",
      filialId: "",
    })
    setEditingItem(null)
    setIsDialogOpen(false)
    setShowPassword(false)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Funcionários</h1>
        <p className="text-gray-600">Gerencie todos os funcionários da empresa</p>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar funcionários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterFilial} onValueChange={setFilterFilial}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por filial" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as filiais</SelectItem>
                {filiais.map((filial) => (
                  <SelectItem key={filial.id} value={filial.id}>
                    {filial.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Editar Funcionário" : "Novo Funcionário"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">E-mail *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cpf">CPF *</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => handleCPFChange(e.target.value)}
                        className="pl-10"
                        placeholder="000.000.000-00"
                        maxLength={14}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="senha">Senha *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="senha"
                        type={showPassword ? "text" : "password"}
                        value={formData.senha}
                        onChange={(e) => setFormData((prev) => ({ ...prev, senha: e.target.value }))}
                        className="pl-10 pr-10"
                        placeholder="Mínimo 6 caracteres"
                        minLength={6}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <Label htmlFor="filialId">Filial Associada *</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                      <Select
                        value={formData.filialId}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, filialId: value }))}
                      >
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Selecione uma filial" />
                        </SelectTrigger>
                        <SelectContent>
                          {filiais.map((filial) => (
                            <SelectItem key={filial.id} value={filial.id}>
                              {filial.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingItem ? "Atualizar" : "Cadastrar"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="flex justify-center mb-6">
        <Card className="w-full max-w-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Funcionários</p>
                <p className="text-3xl font-bold text-green-600">{funcionariosFiltrados.length}</p>
              </div>
              <Users className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Funcionários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {funcionariosFiltrados.map((funcionario) => (
          <Card key={funcionario.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{funcionario.nome}</CardTitle>
                  <p className="text-sm text-gray-500">{funcionario.email}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(funcionario)}>
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
                          Tem certeza que deseja excluir o funcionário "{funcionario.nome}"? Esta ação não pode ser
                          desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(funcionario.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="w-4 h-4" />
                  <span>{getFilialNome(funcionario.filialId)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span>CPF: {funcionario.cpf}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Senha: {"*".repeat(funcionario.senha.length)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {funcionariosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Users className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum funcionário encontrado</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou cadastrar um novo funcionário.</p>
        </div>
      )}
    </div>
  )
}

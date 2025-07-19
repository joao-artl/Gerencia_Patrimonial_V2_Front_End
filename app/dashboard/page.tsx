"use client"

import type React from "react"

import { useState, useMemo, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Search,
  Plus,
  Edit,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Eye,
  LogOut,
  User,
  Lock,
  EyeOff,
  LinkIcon,
  UserPlus,
} from "lucide-react"
import type { Empresa, Usuario } from "@/types"
import api from "@/lib/api"; 

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

export default function DashboardPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false)
  const [isAddGestorDialogOpen, setIsAddGestorDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Empresa | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("criar")

  const [formData, setFormData] = useState<Partial<Empresa>>({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    senha: "",
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

  // Estados para conectar à empresa
  const [connectData, setConnectData] = useState({
    email: "",
    senha: "",
  })

  // Estados para adicionar gestor
  const [addGestorData, setAddGestorData] = useState({
    empresaId: "",
    empresaSenha: "",
    gestorEmail: "",
  })

  const fetchEmpresas = useCallback(async (gestorId: number) => {
    setLoading(true);
    try {
      const response = await api.get(`/usuarios/${gestorId}/empresas/`);
      setEmpresas(response.data);
    } catch (err) {
      console.error("Falha ao buscar empresas", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      setUsuario(userData);
      fetchEmpresas(userData.id);
    } else {
      router.push('/'); 
    }
  }, [router, fetchEmpresas]);

  const handleLogout = () => {
    localStorage.removeItem("usuario")
    router.push("/")
  }

  const empresasFiltradas = useMemo(() => {
    return empresas.filter((empresa) => {
      const matchesSearch =
        empresa.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empresa.cnpj.includes(searchTerm) ||
        empresa.email.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [empresas, searchTerm])

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, "$1-$2")
    }
    return value
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const dadosParaEnviar: Partial<Empresa> = { ...formData };
    
    if (dadosParaEnviar.endereco?.cep) {
    dadosParaEnviar.endereco.cep = dadosParaEnviar.endereco.cep.replace(/\D/g, "");
    }
    
    if (!dadosParaEnviar.senha) { 
      delete dadosParaEnviar.senha;
    }

    try {
      if (editingItem) {
        await api.patch(`/empresas/${editingItem.id}/`, dadosParaEnviar);
        setSuccess("Empresa atualizada com sucesso!");
      } else {
        await api.post('/empresas/', dadosParaEnviar);
        setSuccess("Empresa criada com sucesso!");
      }
      
      if (usuario) {
        fetchEmpresas(usuario.id);
      }
      resetForm();
    } catch (err: any) {
      setError("Falha ao salvar. Verifique se o CNPJ ou email já existem.");
      console.error("Erro ao salvar empresa:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

const handleConnectToCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
        const response = await api.post('/empresas/join-by-email/', {
            email: connectData.email,
            senha: connectData.senha,
        });

        setSuccess(response.data.message);
        
        if (usuario) {
            fetchEmpresas(usuario.id);
        }
        resetConnectForm(); 
    } catch (err: any) {

        setError(err.response?.data?.error || "Falha ao conectar. Verifique os dados.");
    } finally {
        setLoading(false);
    }
};

  const handleAddGestor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!addGestorData.empresaId || !addGestorData.gestorEmail || !addGestorData.empresaSenha) {
        setError("Por favor, preencha todos os campos para adicionar um gestor.");
        return;
    }
    setLoading(true);
    setError("");
    setSuccess("");

    try {
        const payload = {
            usuario_email: addGestorData.gestorEmail,
            senha_da_empresa: addGestorData.empresaSenha
        };
        const url = `/empresas/${addGestorData.empresaId}/gestores/`;
        await api.post(url, payload);

        setSuccess(`Gestor ${addGestorData.gestorEmail} adicionado com sucesso!`);
        resetAddGestorForm();

    } catch (err: any) {
        const errorMessage = err.response?.data?.detail || err.response?.data?.error || "Falha ao adicionar gestor.";
        setError(errorMessage);
    } finally {
        setLoading(false);
    }
};

  const handleEdit = (item: Empresa) => {
    setEditingItem(item)
    setFormData(item)
    setActiveTab("criar")
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => { 
    setLoading(true);
    try {
      await api.delete(`/empresas/${id}/`);
      setSuccess("Empresa excluída com sucesso!");
      if (usuario) {
        fetchEmpresas(usuario.id);
      }
    } catch (err) {
      setError("Falha ao excluir a empresa.");
      console.error("Erro ao excluir empresa:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      cnpj: "",
      email: "",
      telefone: "",
      senha: "",
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
    setEditingItem(null)
    setIsDialogOpen(false)
    setShowPassword(false)
    setError("")
    setSuccess("")
  }

  const resetConnectForm = () => {
    setConnectData({ email: "", senha: "" })
    setIsConnectDialogOpen(false)
    setError("")
    setSuccess("")
  }

  const resetAddGestorForm = () => {
    setAddGestorData({ empresaId: "", empresaSenha: "", gestorEmail: "" })
    setIsAddGestorDialogOpen(false)
    setError("")
    setSuccess("")
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
  }

  const getEnderecoCompleto = (endereco: Empresa["endereco"]) => {
    const partes = [
      endereco.logradouro,
      endereco.numero,
      endereco.complemento,
      endereco.bairro,
      endereco.cidade,
      endereco.estado,
      endereco.cep,
    ].filter(Boolean)

    return partes.join(", ")
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
                <h1 className="text-xl font-bold text-gray-900">Gerência Patrimonial</h1>
                <p className="text-sm text-gray-500">Gestão de Empresa e Filiais</p>
              </div>
            </div>

            {/* Informações do usuário */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <div className="text-right">
                  <p className="font-medium">{usuario.nome}</p>
                  <p className="text-xs text-gray-500">{usuario.email}</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Suas Empresas</h1>
          <p className="text-gray-600">Gerencie suas empresas, conecte-se a empresas existentes ou adicione gestores</p>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {/* Conectar à Empresa */}
              <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={resetConnectForm}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Conectar à Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Conectar à Empresa Existente</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleConnectToCompany} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="connect-email">Email da Empresa</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="connect-email"
                          type="email"
                          value={connectData.email}
                          onChange={(e) => setConnectData((prev) => ({ ...prev, email: e.target.value }))}
                          className="pl-10"
                          placeholder="empresa@exemplo.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="connect-senha">Senha da Empresa</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="connect-senha"
                          type="password"
                          value={connectData.senha}
                          onChange={(e) => setConnectData((prev) => ({ ...prev, senha: e.target.value }))}
                          className="pl-10"
                          placeholder="Senha da empresa"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={resetConnectForm}>
                        Cancelar
                      </Button>
                      <Button type="submit">Conectar</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Adicionar Gestor */}
              <Dialog open={isAddGestorDialogOpen} onOpenChange={setIsAddGestorDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={resetAddGestorForm}>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Adicionar Gestor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Adicionar Gestor à Empresa</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleAddGestor} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="gestor-empresa-select">Empresa</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 z-10" />
                        <Select
                          value={addGestorData.empresaId}
                          onValueChange={(value) => setAddGestorData((prev) => ({ ...prev, empresaId: value }))}
                        >
                          <SelectTrigger className="pl-10">
                            <SelectValue placeholder="Selecione uma empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            {empresas.map((empresa) => (
                              <SelectItem key={empresa.id} value={String(empresa.id)}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{empresa.nome}</span>
                                  <span className="text-sm text-gray-500">{empresa.email}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gestor-empresa-senha">Senha da Empresa</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="gestor-empresa-senha"
                          type="password"
                          value={addGestorData.empresaSenha}
                          onChange={(e) => setAddGestorData((prev) => ({ ...prev, empresaSenha: e.target.value }))}
                          className="pl-10"
                          placeholder="Senha da empresa"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="gestor-email">Email do Novo Gestor</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="gestor-email"
                          type="email"
                          value={addGestorData.gestorEmail}
                          onChange={(e) => setAddGestorData((prev) => ({ ...prev, gestorEmail: e.target.value }))}
                          className="pl-10"
                          placeholder="gestor@exemplo.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={resetAddGestorForm}>
                        Cancelar
                      </Button>
                      <Button type="submit">Adicionar Gestor</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Criar/Editar Empresa */}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button id="nova-empresa-button" onClick={() => resetForm()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Empresa
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Editar Empresa" : "Nova Empresa"}</DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="nome">Nome da Empresa *</Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="cnpj">CNPJ *</Label>
                        <Input
                          id="cnpj"
                          value={formData.cnpj}
                          onChange={(e) => setFormData((prev) => ({ ...prev, cnpj: e.target.value }))}
                          placeholder="00.000.000/0000-00"
                          required
                        />
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
                        <Label htmlFor="telefone">Telefone *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            id="telefone"
                            value={formData.telefone}
                            onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
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
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Endereço</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="cep">CEP *</Label>
                          <Input
                            id="cep"
                            value={formData.endereco?.cep}
                            onChange={(e) => {
                              const formatted = formatCEP(e.target.value)
                              setFormData((prev) => ({
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
                            value={formData.endereco?.estado}
                            onValueChange={(value) =>
                              setFormData((prev) => ({
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
                            value={formData.endereco?.cidade}
                            onChange={(e) =>
                              setFormData((prev) => ({
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
                            value={formData.endereco?.bairro}
                            onChange={(e) =>
                              setFormData((prev) => ({
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
                            value={formData.endereco?.logradouro}
                            onChange={(e) =>
                              setFormData((prev) => ({
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
                            value={formData.endereco?.numero}
                            onChange={(e) =>
                              setFormData((prev) => ({
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
                            value={formData.endereco?.complemento}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                endereco: { ...prev.endereco!, complemento: e.target.value },
                              }))
                            }
                            placeholder="Apartamento, sala, andar, etc."
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={resetForm}>
                        Cancelar
                      </Button>
                      <Button id="salvar-empresa-button" type="submit">{editingItem ? "Atualizar" : "Criar Empresa"}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="flex justify-center mb-6">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Empresas</p>
                  <p className="text-3xl font-bold text-blue-600">{empresasFiltradas.length}</p>
                </div>
                <Building2 className="w-10 h-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Empresas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {empresasFiltradas.map((empresa) => (
            <Card key={empresa.id} className="hover:shadow-lg transition-shadow group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{empresa.nome}</CardTitle>
                    <p className="text-sm text-gray-500">CNPJ: {formatCNPJ(empresa.cnpj)}</p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(empresa)}>
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
                            Tem certeza que deseja excluir a empresa "{empresa.nome}"? Esta ação não pode ser desfeita e
                            removerá todas as filiais, funcionários e patrimônios associados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(empresa.id)}
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
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-2">{getEnderecoCompleto(empresa.endereco)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{empresa.telefone}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{empresa.email}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Lock className="w-4 h-4" />
                    <span>Senha: ********</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <Link href={`/empresas/${empresa.id}`}>
                    <Button id={`acessar-empresa-${empresa.id}`} className="w-full" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Acessar Empresa
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {empresasFiltradas.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Building2 className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
            <p className="text-gray-600">
              Tente ajustar a busca, criar uma nova empresa ou conectar-se a uma existente.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

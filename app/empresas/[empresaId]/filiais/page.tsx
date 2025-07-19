"use client"

import type React from "react"
import { useState, useMemo,useCallback, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Building, Search, Plus, Edit, Trash2, MapPin, Phone, Mail, Eye, Lock, EyeOff, CreditCard } from "lucide-react"
import type { Filial } from "@/types"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"

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

export default function FiliaisPage() {
  const params = useParams();
  const router = useRouter(); 
  const empresaId = params.empresaId as string;
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(true); 
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Filial | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState<Partial<Filial>>({
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

  const fetchFiliais = useCallback(async () => {
      if (!empresaId) return; 
      setLoading(true);
      try {
        const response = await api.get(`/empresas/${empresaId}/filiais/`);
        setFiliais(response.data);
      } catch (err) {
        console.error("Falha ao buscar filiais", err);
      } finally {
        setLoading(false);
      }
  }, [empresaId]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/'); 
      return;
    }

    if (empresaId) {
      fetchFiliais();
    }
    
  }, [empresaId, router, fetchFiliais]);

  const filiaisFiltradas = useMemo(() => {
    return filiais.filter((filial) => {
      const matchesSearch =
        filial.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        filial.cnpj.includes(searchTerm) ||
        filial.email.toLowerCase().includes(searchTerm.toLowerCase())

      return matchesSearch
    })
  }, [filiais, searchTerm])

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, "")
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d{3})/, "$1-$2")
    }
    return value
  }

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")
  }

  const getEnderecoCompleto = (endereco: Filial["endereco"]) => {
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

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = { ...formData };
    if (payload.endereco?.cep) {
        payload.endereco.cep = payload.endereco.cep.replace(/\D/g, '');
    }
    if (editingItem && !payload.senha) {
        delete payload.senha;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
        let response;
        if (editingItem) {
            const url = `/empresas/${empresaId}/filiais/${editingItem.id}/`;
            response = await api.patch(url, payload);
            setSuccess("Filial atualizada com sucesso!");
        } else {
            const url = `/empresas/${empresaId}/filiais/`;
            response = await api.post(url, payload);
            setSuccess("Filial criada com sucesso!");
        }

        resetForm(); // Primeiro, fecha o modal

        setTimeout(() => {
            fetchFiliais();
        }, 300); 

    } catch (err: any) {
        if (err.response) {
            setError(`Erro da API (${err.response.status}): ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
            console.error("TIPO DE ERRO: Sem resposta do servidor.");
            setError("Erro de rede. Verifique a conexão com a API.");
        } else {
            console.error("TIPO DE ERRO: Erro de JavaScript ao montar a requisição.");
            console.error("MENSAGEM DE ERRO:", err.message);
            setError(`Erro no código do frontend: ${err.message}`);
        }
    } finally {
        setLoading(false);
    }
};

  const handleEdit = (item: Filial) => {
    setEditingItem(item)
    setFormData(item)
    setIsDialogOpen(true)
  }

const handleDelete = async (id: number) => { 
    setLoading(true);
    try {
        await api.delete(`/empresas/${empresaId}/filiais/${id}/`);
        
        setTimeout(() => {
            fetchFiliais();
        }, 300);

    } catch (err) {
        console.error("Erro ao excluir filial:", err);
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
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestão de Filiais</h1>
        <p className="text-gray-600">Gerencie todas as filiais da empresa</p>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar filiais..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button id="nova-filial-button" onClick={() => resetForm()}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Filial
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Editar Filial" : "Nova Filial"}</DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome da Filial *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cnpj">CNPJ *</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => setFormData((prev) => ({ ...prev, cnpj: e.target.value }))}
                        className="pl-10"
                        placeholder="00.000.000/0000-00"
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
                  <Button id="salvar-filial-button" type="submit">{editingItem ? "Atualizar" : "Criar Filial"}</Button>
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
                <p className="text-sm text-gray-600">Total de Filiais</p>
                <p className="text-3xl font-bold text-blue-600">{filiaisFiltradas.length}</p>
              </div>
              <Building className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Filiais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filiaisFiltradas.map((filial) => (
          <Card key={filial.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{filial.nome}</CardTitle>
                  <p className="text-sm text-gray-500">CNPJ: {formatCNPJ(filial.cnpj)}</p>
                </div>
                <div className="flex gap-1">
                  <Link href={`/empresas/${empresaId}/filiais/${filial.id}/patrimonios`}>
                    <Button size="sm" variant="ghost" title="Ver patrimônios">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(filial)}>
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
                          Tem certeza que deseja excluir a filial "{filial.nome}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(filial.id)}
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
                  <span className="line-clamp-2">{getEnderecoCompleto(filial.endereco)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{filial.telefone}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{filial.email}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock className="w-4 h-4" />
                  <span>Senha: ********</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filiaisFiltradas.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Building className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma filial encontrada</h3>
          <p className="text-gray-600">Tente ajustar os filtros ou criar uma nova filial.</p>
        </div>
      )}
    </div>
  )
}

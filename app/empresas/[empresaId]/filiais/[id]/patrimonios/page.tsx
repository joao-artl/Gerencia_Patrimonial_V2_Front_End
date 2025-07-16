"use client"

import type React from "react"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import api from "@/lib/api";
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
  ArrowLeft,
  Ruler,
  Hash,
  Palette,
} from "lucide-react"
import type { Patrimonio, Imovel, Veiculo, Utilitario } from "@/types"

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




export default function PatrimoniosFilialPage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = params.empresaId as string;
  const filialId = params.id as string;
  const [filial, setFilial] = useState<{ nome: string } | null>(null);
  const [patrimonios, setPatrimonios] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  const fetchPatrimonios = useCallback(async () => {
    if (!empresaId || !filialId) return;
    setLoading(true);
    try {
      const [resFilial, resPatrimonios] = await Promise.all([
        api.get(`/empresas/${empresaId}/filiais/${filialId}/`),
        api.get(`/empresas/${empresaId}/filiais/${filialId}/patrimonios/`)
      ]);

      setFilial(resFilial.data);

      const patrimoniosAgrupados = resPatrimonios.data;
      const listaCompleta = [
        ...patrimoniosAgrupados.veiculos.map((p: any) => ({ ...p, tipo: 'veiculo' })),
        ...patrimoniosAgrupados.utilitarios.map((p: any) => ({ ...p, tipo: 'utilitario' })),
        ...patrimoniosAgrupados.imobiliarios.map((p: any) => ({ ...p, tipo: 'imovel' })),
      ];
      setPatrimonios(listaCompleta);

    } catch (err) {
      console.error("Falha ao buscar dados da filial:", err);
    } finally {
      setLoading(false);
    }
  }, [empresaId, filialId]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/');
      return;
    }
    fetchPatrimonios();
  }, [fetchPatrimonios, router]);
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTipo, setFilterTipo] = useState<string>("todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Patrimonio | null>(null)
  const [tipoSelecionado, setTipoSelecionado] = useState<"imovel" | "veiculo" | "utilitario">("imovel")

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

  const [formDataVeiculo, setFormDataVeiculo] = useState<Partial<Veiculo>>({
    nome: "",
    valor: 0,
    quantidade: 1,
    cor: "",
    modelo: "",
    fabricante: "",
  })

  const [formDataUtilitario, setFormDataUtilitario] = useState<Partial<Utilitario>>({
    nome: "",
    valor: 0,
    quantidade: 1,
    descricao: "",
    funcao: "",
  })

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

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let endpoint = "";
    let payload: any = {};

    if (tipoSelecionado === "imovel") {
        endpoint = "imobiliarios";
        payload = {
            nome: formDataImovel.nome,
            valor: formDataImovel.valor,
            area: formDataImovel.area,
            tipo: formDataImovel.tipoImovel,
            endereco: formDataImovel.endereco,
        };
        if (payload.endereco?.cep) {
            payload.endereco.cep = payload.endereco.cep.replace(/\D/g, '');
        }
    } else if (tipoSelecionado === "veiculo") {
        endpoint = "veiculos";
        payload = { ...formDataVeiculo };
    } else {
        endpoint = "utilitarios";
        payload = { ...formDataUtilitario };
    }

    try {
        const baseUrl = `/empresas/${empresaId}/filiais/${filialId}/${endpoint}/`;
        if (editingItem) {
            await api.patch(`${baseUrl}${editingItem.id}/`, payload);
        } else {
            await api.post(baseUrl, payload);
        }

        resetForm();
        setTimeout(() => fetchPatrimonios(), 300); 

    } catch (err: any) {
        console.error("Erro ao salvar patrimônio:", err.response?.data);
    } finally {
        setLoading(false);
    }
};

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

  const handleDelete = async (item: Patrimonio) => {
      setLoading(true);
      const { id, tipo } = item;
      const endpoint = `${tipo === 'imovel' ? 'imobiliario' : tipo}s`;

      try {
          await api.delete(`/empresas/${empresaId}/filiais/${filialId}/${endpoint}/${id}/`);
          setTimeout(() => fetchPatrimonios(), 300); 
      } catch (err) {
          console.error("Erro ao excluir patrimônio:", err);
      } finally {
          setLoading(false);
      }
  };

  const valorTotalFiltrado = useMemo(() => {
    return patrimoniosFiltrados.reduce((acc, item) => {
        const valorUnitario = parseFloat(item.valor);
        const quantidade = parseInt(item.quantidade, 10);
        
        if (isNaN(valorUnitario) || isNaN(quantidade)) {
            return acc;
        }

        return acc + (valorUnitario * quantidade);
    }, 0);
  }, [patrimoniosFiltrados]); 

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

  if (!filial) {
    return (
      <div className="p-6 lg:p-8">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Filial não encontrada</h1>
          <Link href="/filiais">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar para Filiais
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/empresas/${empresaId}/filiais`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Patrimônio - {filial.nome}</h1>
        <p className="text-gray-600">Gerencie todos os bens patrimoniais desta filial</p>
      </div>

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
                  {formatCurrency(valorTotalFiltrado)}
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
                          onClick={() => handleDelete(item)}
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
  )
}

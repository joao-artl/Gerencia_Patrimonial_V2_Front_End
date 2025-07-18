"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Building2,
  Car,
  Wrench,
  Search,
  MapPin,
  DollarSign,
  Building,
  Filter,
  Ruler,
  Hash,
  Palette,
} from "lucide-react"
import type { Patrimonio, Imovel, Veiculo, Utilitario } from "@/types"
import { useParams, useRouter } from "next/navigation"
import api from "@/lib/api"

export default function PatrimoniosGlobaisPage() {
  const params = useParams();
  const router = useRouter();
  const empresaId = params.empresaId as string; 
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [filiais, setFiliais] = useState<{ id: number; nome: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [filterFilial, setFilterFilial] = useState<string>("todas");

  const patrimoniosFiltrados = useMemo(() => {
    return patrimonios.filter((item) => {
      const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTipo = filterTipo === "todos" || item.tipo === filterTipo;
      const matchesFilial = filterFilial === "todas" || item.filialId === Number(filterFilial);
      return matchesSearch && matchesTipo && matchesFilial;
    });
  }, [patrimonios, searchTerm, filterTipo, filterFilial]); 

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

useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        router.push('/');
        return;
    }

    if (empresaId) {
        const fetchDadosGlobais = async () => {
            setLoading(true);
            try {
                const [resFiliais, resPatrimonios] = await Promise.all([
                    api.get(`/empresas/${empresaId}/filiais/`),
                    api.get(`/empresas/${empresaId}/patrimonios/`)
                ]);

                setFiliais(resFiliais.data);

                const patrimoniosAgrupados = resPatrimonios.data;

                const listaCompleta: Patrimonio[] = [];
                Object.keys(patrimoniosAgrupados).forEach(keyFilial => {
                  const filialData = patrimoniosAgrupados[keyFilial];
                  const nomeDaFilial = keyFilial.split(' (ID:')[0].replace('Filial: ', '');
                  const idDaFilial = parseInt(keyFilial.split(' (ID: ')[1].replace(')', ''));

                  filialData.veiculos.forEach((p: any) => listaCompleta.push({ ...p, tipo: 'veiculo', filialId: idDaFilial, nomeFilial: nomeDaFilial }));
                  filialData.utilitarios.forEach((p: any) => listaCompleta.push({ ...p, tipo: 'utilitario', filialId: idDaFilial, nomeFilial: nomeDaFilial }));
                  filialData.imobiliarios.forEach((p: any) => listaCompleta.push({ ...p, tipo: 'imovel', filialId: idDaFilial, nomeFilial: nomeDaFilial }));
                });

                setPatrimonios(listaCompleta);

            } catch (error) {
                console.error("Falha ao buscar dados globais:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDadosGlobais();
    }
}, [empresaId, router]);

  const valorTotalFiltrado = useMemo(() => {
    return patrimoniosFiltrados.reduce((acc, item) => {
        const valorUnitario = parseFloat(item.valor);
        const quantidade = parseInt(item.quantidade, 10) || 1; 
        if (isNaN(valorUnitario)) {
            return acc; 
        }
        
        return acc + (valorUnitario * quantidade);
    }, 0); 
  }, [patrimoniosFiltrados]);

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
          <div className="text-sm text-gray-600 line-clamp-2">{utilitario.descricao}</div>
        </div>
      )
    }
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Busca Global de Patrimônios</h1>
        <p className="text-gray-600">Pesquise patrimônios em todas as filiais da empresa</p>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome do patrimônio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtros:</span>
            </div>

            <Select value={filterFilial} onValueChange={setFilterFilial}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todas as filiais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as filiais</SelectItem>
                {filiais.map((filial) => (
                  <SelectItem key={filial.id} value={String(filial.id)}>
                    {filial.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTipo} onValueChange={setFilterTipo}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="imovel">Imóveis</SelectItem>
                <SelectItem value="veiculo">Veículos</SelectItem>
                <SelectItem value="utilitario">Utilitários</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Encontrado</p>
                <p className="text-2xl font-bold">{patrimoniosFiltrados.length}</p>
              </div>
              <div className="text-blue-500">
                <Search className="w-8 h-8" />
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
                <p className="text-2xl font-bold">
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
                <p className="text-2xl font-bold">
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

      {/* Lista de Patrimônios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patrimoniosFiltrados.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTipoIcon(item.tipo)}
                  <CardTitle className="text-lg">{item.nome}</CardTitle>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{getTipoLabel(item.tipo)}</Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-600">{item.nomeFilial || "Filial não identificada"}</span>
                </div>

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
          <p className="text-gray-600">Tente ajustar os filtros de busca ou verificar se os dados estão corretos.</p>
        </div>
      )}
    </div>
  )
}

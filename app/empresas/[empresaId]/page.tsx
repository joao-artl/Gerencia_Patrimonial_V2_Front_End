"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Users, MapPin, DollarSign, TrendingUp, Building2, UserCheck, Activity } from "lucide-react"
import Link from "next/link" 
import api from "@/lib/api";

interface Empresa { id: number; nome: string; cnpj: string; }
interface Filial { id: number; nome: string; }
interface Funcionario { id: number; nome: string; }
interface PatrimonioPorFilial {
    veiculos: any[];
    utilitarios: any[];
    imobiliarios: any[];
}

export default function EmpresaDashboard() {
  const params = useParams()
  const router = useRouter()
  const empresaId = params.empresaId as string;
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [patrimonios, setPatrimonios] = useState<Record<string, PatrimonioPorFilial>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/'); 
      return;
    }

    if (empresaId) { 
      const fetchData = async () => {
        setLoading(true);
      try {
          const [resEmpresa, resFiliais, resFuncionarios, resPatrimonios] = await Promise.all([
            api.get(`/empresas/${empresaId}/`),
            api.get(`/empresas/${empresaId}/filiais/`),
            api.get(`/empresas/${empresaId}/funcionarios/`),
            api.get(`/empresas/${empresaId}/patrimonios/`)]); 
          setEmpresa(resEmpresa.data);
          setFiliais(resFiliais.data);
          setFuncionarios(resFuncionarios.data);
          setPatrimonios(resPatrimonios.data);
        } catch (err) {
          console.error("Falha ao carregar dados do dashboard:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [empresaId, router]);

  const metricas = useMemo(() => {
      let patrimonioTotalCalculado = 0;
      Object.values(patrimonios).forEach((filial: any) => {
          const todosOsItens = [...(filial.veiculos || []), ...(filial.utilitarios || []), ...(filial.imobiliarios || [])];

          patrimonioTotalCalculado += todosOsItens.reduce((acc, item: any) => {
              const valor = parseFloat(item.valor) || 0; 
              const qtd = parseInt(item.quantidade, 10) || 1;
              return acc + (valor * qtd); 
          }, 0);
      });

      return {
          totalFiliais: filiais.length,
          totalFuncionarios: funcionarios.length,
          patrimonioTotal: patrimonioTotalCalculado
      };
  }, [filiais, funcionarios, patrimonios]); 

  const patrimonioPorCategoria = useMemo(() => {
    const categorias = {
      imoveis: { quantidade: 0, valor: 0 },
      veiculos: { quantidade: 0, valor: 0 },
      utilitarios: { quantidade: 0, valor: 0 },
    };
    Object.values(patrimonios).forEach((filial: any) => {
        categorias.veiculos.quantidade += filial.veiculos.length;
        categorias.veiculos.valor += filial.veiculos.reduce((acc, item: any) => acc + parseFloat(item.valor), 0);
        categorias.utilitarios.quantidade += filial.utilitarios.length;
        categorias.utilitarios.valor += filial.utilitarios.reduce((acc, item: any) => acc + parseFloat(item.valor), 0);
        categorias.imoveis.quantidade += filial.imobiliarios.length;
        categorias.imoveis.valor += filial.imobiliarios.reduce((acc, item: any) => acc + parseFloat(item.valor), 0);
    });
    return categorias;
  }, [patrimonios]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Empresarial</h1>
        <p className="text-gray-600">Visão geral da {empresa?.nome}</p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Filiais</p>
                <p className="text-3xl font-bold text-blue-600">{filiais.length}</p>
              </div>
              <Building className="w-10 h-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Funcionários</p>
                <p className="text-3xl font-bold text-green-600">{funcionarios.length}</p>
              </div>
              <Users className="w-10 h-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Patrimônio Total</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(metricas.patrimonioTotal)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Filiais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Filiais por Desempenho
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filiais.map((filial) => (
                <div key={filial.id} className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900">{filial.nome}</h4>
                  <p className="text-sm text-gray-500">{filial.cnpj}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

{/* Card de Patrimônio por Categoria -- AGORA COM DADOS REAIS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Patrimônio por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* --- Imóveis --- */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Imóveis</p>
                    {/* Usa o novo objeto de cálculo 'patrimonioPorCategoria' */}
                    <p className="text-sm text-gray-500">{patrimonioPorCategoria.imoveis.quantidade} itens</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(patrimonioPorCategoria.imoveis.valor)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {/* Usa os novos objetos de cálculo e evita divisão por zero */}
                    {metricas.patrimonioTotal > 0 ? Math.round(
                      (patrimonioPorCategoria.imoveis.valor / metricas.patrimonioTotal) * 100
                    ) : 0}
                    % do total
                  </p>
                </div>
              </div>

              {/* --- Veículos --- */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Veículos</p>
                    <p className="text-sm text-gray-500">
                      {patrimonioPorCategoria.veiculos.quantidade} itens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(patrimonioPorCategoria.veiculos.valor)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {metricas.patrimonioTotal > 0 ? Math.round(
                      (patrimonioPorCategoria.veiculos.valor / metricas.patrimonioTotal) * 100
                    ) : 0}
                    % do total
                  </p>
                </div>
              </div>

              {/* --- Utilitários --- */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Utilitários</p>
                    <p className="text-sm text-gray-500">
                      {patrimonioPorCategoria.utilitarios.quantidade} itens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(patrimonioPorCategoria.utilitarios.valor)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {metricas.patrimonioTotal > 0 ? Math.round(
                      (patrimonioPorCategoria.utilitarios.valor / metricas.patrimonioTotal) * 100
                    ) : 0}
                    % do total
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações da empresa -- AGORA COM DADOS REAIS */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Razão Social</p>
              {/* Usa o estado 'empresa' e o optional chaining (?.) para segurança */}
              <p className="font-medium text-gray-900">{empresa?.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CNPJ</p>
              <p className="font-medium text-gray-900">{empresa?.cnpj}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
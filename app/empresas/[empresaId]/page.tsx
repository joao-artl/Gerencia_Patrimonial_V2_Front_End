"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Users, MapPin, DollarSign, TrendingUp, Building2, UserCheck, Activity } from "lucide-react"

// Dados mockados por empresa
const getEmpresaData = (empresaId: string) => {
  const empresasData = {
    "1": {
      empresa: {
        nome: "TechCorp Ltda.",
        cnpj: "12.345.678/0001-90",
        filiais: 5,
        funcionarios: 127,
        patrimonioTotal: 2850000,
      },
      filiais: [
        { id: "1", nome: "Matriz São Paulo", funcionarios: 45, patrimonio: 1200000, status: "ativa" },
        { id: "2", nome: "Filial Rio de Janeiro", funcionarios: 32, patrimonio: 850000, status: "ativa" },
        { id: "3", nome: "Filial Belo Horizonte", funcionarios: 28, patrimonio: 450000, status: "ativa" },
        { id: "4", nome: "Filial Porto Alegre", funcionarios: 22, patrimonio: 350000, status: "ativa" },
      ],
      patrimoniosPorTipo: {
        imoveis: { quantidade: 12, valor: 1800000 },
        veiculos: { quantidade: 25, valor: 750000 },
        utilitarios: { quantidade: 89, valor: 300000 },
      },
    },
    "2": {
      empresa: {
        nome: "InnovaTech S.A.",
        cnpj: "98.765.432/0001-10",
        filiais: 3,
        funcionarios: 85,
        patrimonioTotal: 1950000,
      },
      filiais: [
        { id: "1", nome: "Sede Rio de Janeiro", funcionarios: 40, patrimonio: 900000, status: "ativa" },
        { id: "2", nome: "Filial São Paulo", funcionarios: 30, patrimonio: 650000, status: "ativa" },
        { id: "3", nome: "Filial Brasília", funcionarios: 15, patrimonio: 400000, status: "ativa" },
      ],
      patrimoniosPorTipo: {
        imoveis: { quantidade: 8, valor: 1200000 },
        veiculos: { quantidade: 18, valor: 550000 },
        utilitarios: { quantidade: 45, valor: 200000 },
      },
    },
    "3": {
      empresa: {
        nome: "Digital Solutions Ltda.",
        cnpj: "11.222.333/0001-44",
        filiais: 2,
        funcionarios: 45,
        patrimonioTotal: 850000,
      },
      filiais: [
        { id: "1", nome: "Matriz Belo Horizonte", funcionarios: 30, patrimonio: 500000, status: "ativa" },
        { id: "2", nome: "Filial Uberlândia", funcionarios: 15, patrimonio: 350000, status: "ativa" },
      ],
      patrimoniosPorTipo: {
        imoveis: { quantidade: 4, valor: 600000 },
        veiculos: { quantidade: 8, valor: 150000 },
        utilitarios: { quantidade: 25, valor: 100000 },
      },
    },
  }

  return empresasData[empresaId as keyof typeof empresasData] || empresasData["1"]
}

export default function EmpresaDashboard() {
  const params = useParams()
  const router = useRouter()
  const empresaId = params.empresaId as string
  const dashboardData = getEmpresaData(empresaId)

  useEffect(() => {
    const gestorData = localStorage.getItem("gestor")
    if (!gestorData) {
      router.push("/")
      return
    }
  }, [router])

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
        <p className="text-gray-600">Visão geral da {dashboardData.empresa.nome}</p>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Filiais</p>
                <p className="text-3xl font-bold text-blue-600">{dashboardData.empresa.filiais}</p>
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
                <p className="text-3xl font-bold text-green-600">{dashboardData.empresa.funcionarios}</p>
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
                  {formatCurrency(dashboardData.empresa.patrimonioTotal)}
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
              {dashboardData.filiais.map((filial) => (
                <div key={filial.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{filial.nome}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-4 h-4" />
                        {filial.funcionarios} funcionários
                      </span>
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        {filial.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(filial.patrimonio)}</p>
                    <p className="text-sm text-gray-500">patrimônio</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patrimônio por tipo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Patrimônio por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Imóveis</p>
                    <p className="text-sm text-gray-500">{dashboardData.patrimoniosPorTipo.imoveis.quantidade} itens</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(dashboardData.patrimoniosPorTipo.imoveis.valor)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {Math.round(
                      (dashboardData.patrimoniosPorTipo.imoveis.valor / dashboardData.empresa.patrimonioTotal) * 100,
                    )}
                    % do total
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Veículos</p>
                    <p className="text-sm text-gray-500">
                      {dashboardData.patrimoniosPorTipo.veiculos.quantidade} itens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(dashboardData.patrimoniosPorTipo.veiculos.valor)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {Math.round(
                      (dashboardData.patrimoniosPorTipo.veiculos.valor / dashboardData.empresa.patrimonioTotal) * 100,
                    )}
                    % do total
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Utilitários</p>
                    <p className="text-sm text-gray-500">
                      {dashboardData.patrimoniosPorTipo.utilitarios.quantidade} itens
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(dashboardData.patrimoniosPorTipo.utilitarios.valor)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {Math.round(
                      (dashboardData.patrimoniosPorTipo.utilitarios.valor / dashboardData.empresa.patrimonioTotal) *
                        100,
                    )}
                    % do total
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Informações da empresa */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Razão Social</p>
              <p className="font-medium text-gray-900">{dashboardData.empresa.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">CNPJ</p>
              <p className="font-medium text-gray-900">{dashboardData.empresa.cnpj}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

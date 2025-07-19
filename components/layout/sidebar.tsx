"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useParams, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Building2, Search, Menu, X, Home, Building, ArrowLeft, LogOut, User, UserCheck, Users } from "lucide-react"
import type { Usuario } from "@/types"
import api from "@/lib/api";

const navigation = [
  {
    name: "Dashboard",
    href: "",
    icon: Home,
  },
  {
    name: "Filiais",
    href: "/filiais",
    icon: Building,
  },
  {
    name: "Funcionários",
    href: "/funcionarios",
    icon: Users,
  },
  {
    name: "Busca Patrimônios",
    href: "/patrimonios",
    icon: Search,
  },
]

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [empresa, setEmpresa] = useState<{ id: number; nome: string; cnpj: string } | null>(null);
    const pathname = usePathname();
    const params = useParams();
    const router = useRouter();
    const empresaId = (params.id || params.empresaId) as string;

    useEffect(() => {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        setUsuario(JSON.parse(userDataString));
      } else {
        router.push('/'); 
      }
    }, [router]); 

    useEffect(() => {
      if (empresaId) {
        const fetchEmpresa = async () => {
          try {
            const response = await api.get(`/empresas/${empresaId}/`);
            setEmpresa(response.data);
          } catch (error) {
            console.error("Erro ao buscar dados da empresa para a sidebar:", error);
            setEmpresa(null); 
          }
        };
        fetchEmpresa();
      }
    }, [empresaId]); 

  const handleLogout = () => {
      localStorage.clear();
      router.push("/");
  };

const getTipoUsuarioLabel = (tipo: string) => {

    return tipo === "GESTOR" ? "Gestor" : "Funcionário";
};

const getTipoUsuarioIcon = (tipo: string) => {
    return tipo === "GESTOR" ? <UserCheck className="w-4 h-4" /> : <User className="w-4 h-4" />;
};

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2 p-6 border-b border-gray-200">
            <Building2 className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">Gerência Patrimonial</h1>
              <p className="text-sm text-gray-500">Gestão de Empresa e Filiais</p>
            </div>
          </div>

          {/* Informações do usuário */}
          {usuario && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                {getTipoUsuarioIcon(usuario.tipo_usuario)}
                <div>
                  <p className="text-sm font-medium text-gray-900">{usuario.nome}</p>
                  <p className="text-xs text-gray-600">{getTipoUsuarioLabel(usuario.tipo_usuario)}</p>
                </div>
              </div>
              <p className="text-xs text-gray-600">{usuario.email}</p>
              {usuario.cpf && <p className="text-xs text-gray-600">CPF: {usuario.cpf}</p>}
            </div>
          )}

          {/* Voltar para dashboard */}
          <div className="p-4 border-b border-gray-200">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Empresas
              </Button>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const href = `/empresas/${empresaId}${item.href}`
              const isActive = pathname === href
              return (
                <Link
                  key={item.name}
                  href={href}
                  id={item.name === "Funcionários" ? "sidebar-link-funcionarios" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100",
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Company info */}
          {empresa && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p className="font-medium">{empresa.nome}</p>
                <p>CNPJ: {empresa.cnpj}</p>
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="p-4 border-t border-gray-200">
            <Button variant="outline" size="sm" onClick={handleLogout} className="w-full justify-start bg-transparent">
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}

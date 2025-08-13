"use client"

export const dynamic = 'force-dynamic';

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, Save, Building2, CreditCard } from "lucide-react"
import Link from "next/link"
import type { Usuario } from "@/types"
import api from "@/lib/api"

export default function ConfiguracoesPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  })
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push("/");
      return;
    }

    const loadUserData = async () => {
      const usuarioData = localStorage.getItem("userData");
      if (usuarioData) {
        const userFromCache = JSON.parse(usuarioData) as Usuario;
        
        setUsuario(userFromCache);
        setFormData((prev) => ({
            ...prev,
            nome: userFromCache.nome,
            email: userFromCache.email,
        }));

        try {
          const response = await api.get(`/usuarios/${userFromCache.id}/`);
          const fullUserData = response.data;
          setUsuario(fullUserData);
          localStorage.setItem("userData", JSON.stringify(fullUserData));
          setFormData((prev) => ({
              ...prev,
              nome: fullUserData.nome,
              email: fullUserData.email,
          }));

        } catch (error) {
          console.error("Falha ao buscar dados atualizados do usuário:", error);
        }
      } else {
        console.error("Token de acesso encontrado, mas dados do usuário ausentes.");
        router.push("/");
      }
    };

    loadUserData();
  }, [router]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!usuario) {
      setError("Sessão de usuário inválida.");
      setLoading(false);
      return;
    }

    if (formData.novaSenha && formData.novaSenha !== formData.confirmarSenha) {
      setError("A nova senha e a confirmação não coincidem.");
      setLoading(false);
      return;
    }
    if (formData.novaSenha && formData.novaSenha.length < 6) {
      setError("A nova senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        nome: formData.nome,
        email: formData.email,
        senha_atual: formData.senhaAtual,
      };

      if (formData.novaSenha) {
        payload.nova_senha = formData.novaSenha;
      }

      const response = await api.patch(`/usuarios/${usuario.id}/`, payload);
      const usuarioAtualizado = response.data;

      localStorage.setItem("userData", JSON.stringify(usuarioAtualizado));
      setUsuario(usuarioAtualizado);

      setSuccess("Perfil atualizado com sucesso!");

      setFormData((prev) => ({
        ...prev,
        senhaAtual: "",
        novaSenha: "",
        confirmarSenha: "",
      }));

    } catch (err: any) {
      const apiError = err.response?.data?.error || err.response?.data?.detail || "Falha ao atualizar. Verifique sua senha atual.";
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };
  
  if (!usuario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Fixo */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Gerência Patrimonial</h1>
                <p className="text-sm text-gray-500">Meu Perfil</p>
              </div>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Empresas
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header da Página */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
          <p className="text-gray-600">Atualize suas informações pessoais e de segurança.</p>
        </div>

        {/* Mensagens de Feedback */}
        {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert className="mb-6 border-green-500 text-green-700 bg-green-50"><AlertDescription>{success}</AlertDescription></Alert>}


        <div className="grid gap-8">
          {/* Card de Informações Pessoais */}
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Informações e Credenciais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Campos Não Editáveis */}
                <div className="p-4 bg-gray-50 rounded-lg border">
                    <h3 className="text-md font-semibold mb-3">Dados de Identificação</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-sm text-gray-500">CPF</Label>
                            <p className="font-medium text-gray-800 flex items-center gap-2"><CreditCard className="w-4 h-4"/> {usuario.cpf}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-sm text-gray-500">Tipo de Usuário</Label>
                             <p className="font-medium text-gray-800 capitalize flex items-center gap-2"><User className="w-4 h-4"/> {usuario.tipo_usuario.toLowerCase()}</p>
                        </div>
                    </div>
                </div>

                {/* Campos Editáveis */}
                 <div className="space-y-2">
                  <Label htmlFor="nome">Nome Completo *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="pl-10" required />
                  </div>
                </div>

                {/* Seção de Senha */}
                <div className="border-t pt-6 space-y-4">
                  <h3 className="text-lg font-medium">Alterar Senha</h3>
                  <div className="space-y-2">
                    <Label htmlFor="novaSenha">Nova Senha (Opcional)</Label>
                    <div className="relative">
                       <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                       <Input id="novaSenha" type={showNewPassword ? "text" : "password"} value={formData.novaSenha} onChange={(e) => setFormData({ ...formData, novaSenha: e.target.value })} className="pl-10 pr-10" placeholder="Deixe em branco para não alterar" />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                  </div>
                  {formData.novaSenha && (
                    <div className="space-y-2">
                      <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                      <Input id="confirmarSenha" type={showNewPassword ? "text" : "password"} value={formData.confirmarSenha} onChange={(e) => setFormData({ ...formData, confirmarSenha: e.target.value })} required={!!formData.novaSenha} />
                    </div>
                  )}
                </div>

                {/* Confirmação com Senha Atual */}
                <div className="border-t pt-6 space-y-2">
                   <Label htmlFor="senhaAtual" className="font-semibold">Senha Atual *</Label>
                   <p className="text-sm text-gray-500">Para confirmar as alterações, digite sua senha atual.</p>
                   <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input id="senhaAtual" type={showCurrentPassword ? "text" : "password"} value={formData.senhaAtual} onChange={(e) => setFormData({ ...formData, senhaAtual: e.target.value })} className="pl-10 pr-10" required />
                      <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                   </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
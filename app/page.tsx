"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react" 
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Building2, Mail, Lock, User, Eye, EyeOff, CreditCard } from "lucide-react"
import api, { apiSemToken } from "@/lib/api";

interface Usuario {
  id: string
  cpf: string
  nome: string
  email: string
  tipo_usuario: "GESTOR" | "FUNCIONARIO"
  filial_associada?: number
  empresaId?: number
  senha: string
  dataRegistro: string
}

export default function AuthPage() {
  const router = useRouter()
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [tabValue, setTabValue] = useState("login");
  const tabRef = useRef<any>(null);

  // Estados do formulário de login
  const [loginData, setLoginData] = useState({
    email: "",
    senha: "",
  })

  // Estados do formulário de cadastro
  const [cadastroData, setCadastroData] = useState({
    cpf: "",
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  })

  useEffect(() => {

    if (redirectUrl) {
      router.push(redirectUrl);
      }
    }, [redirectUrl, router]);

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
        const response = await apiSemToken.post('/token/', {
            email: loginData.email,
            senha: loginData.senha,
        });

        const usuario = response.data.usuario;

        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        localStorage.setItem('userData', JSON.stringify(usuario));
        
        setSuccess("Login realizado com sucesso! Redirecionando...");

        if (usuario.tipo_usuario === "GESTOR") {
            setRedirectUrl("/dashboard");
        } else if (usuario.tipo_usuario === "FUNCIONARIO") {
            setRedirectUrl("/funcionario");
        }

    } catch (err) {
        setError("Email ou senha incorretos.");
        console.error("Erro no login:", err);
    } finally {
        setLoading(false);
    }
};

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
    setCadastroData((prev) => ({ ...prev, cpf: formatted }))
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

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Validações
    if (!validateCPF(cadastroData.cpf)) {
      setError("CPF inválido. Digite um CPF válido com 11 dígitos.")
      setLoading(false)
      return
    }

    if (cadastroData.senha !== cadastroData.confirmarSenha) {
      setError("As senhas não coincidem.")
      setLoading(false)
      return
    }

    if (cadastroData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.")
      setLoading(false)
      return
    }

    try {
        const payload = {
            cpf: cadastroData.cpf.replace(/\D/g, ''),
            nome: cadastroData.nome,
            email: cadastroData.email,
            senha: cadastroData.senha,
            tipo_usuario: "GESTOR",
        };

        await apiSemToken.post('/usuarios/', payload);

        setSuccess("Conta criada com sucesso! Por favor, use a aba 'Entrar' para fazer o login.");
        resetForms();
        setTabValue("login"); 


    } catch (err: any) {
        if (err.response && err.response.data) {
            const apiErrors = err.response.data;
            const firstErrorKey = Object.keys(apiErrors)[0];
            const firstErrorMessage = Array.isArray(apiErrors[firstErrorKey]) ? apiErrors[firstErrorKey][0] : String(apiErrors[firstErrorKey]);
            setError(firstErrorMessage);
        } else {
            setError("Não foi possível criar a conta. Tente novamente mais tarde.");
        }
        console.error("Erro no cadastro:", err);
    }
    setLoading(false)
  }

  const resetForms = () => {
    setLoginData({ email: "", senha: "" })
    setCadastroData({
      cpf: "",
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    })
    setError("")
    setSuccess("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerência Patrimonial</h1>
              <p className="text-sm text-gray-600">Gestão de Empresa e Filiais</p>
            </div>
          </div>
          <p className="text-gray-600">Acesse sua conta ou crie uma nova para gerenciar seu patrimônio</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-center text-xl">Bem-vindo</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={tabValue} onValueChange={(val) => {
              resetForms();
              setTabValue(val); 
            }}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Entrar</TabsTrigger>
                <TabsTrigger value="cadastro">Criar Conta</TabsTrigger>
              </TabsList>

              {/* Mensagens de erro e sucesso */}
              {error && (
                <Alert className="mt-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="mt-4 border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">{success}</AlertDescription>
                </Alert>
              )}

              {/* Tab de Login */}
              <TabsContent value="login" className="space-y-4 mt-6">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-senha">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="login-senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={loginData.senha}
                        onChange={(e) => setLoginData((prev) => ({ ...prev, senha: e.target.value }))}
                        className="pl-10 pr-10"
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

                  <Button id="login-submit-button" type="submit" className="w-full" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </form>
              </TabsContent>

              {/* Tab de Cadastro */}
              <TabsContent value="cadastro" className="space-y-4 mt-6">
                <form onSubmit={handleCadastro} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cadastro-cpf">CPF</Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="cadastro-cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        value={cadastroData.cpf}
                        onChange={(e) => handleCPFChange(e.target.value)}
                        className="pl-10"
                        maxLength={14}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cadastro-nome">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="cadastro-nome"
                        type="text"
                        placeholder="Seu nome completo"
                        value={cadastroData.nome}
                        onChange={(e) => setCadastroData((prev) => ({ ...prev, nome: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cadastro-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="cadastro-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={cadastroData.email}
                        onChange={(e) => setCadastroData((prev) => ({ ...prev, email: e.target.value }))}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cadastro-senha">Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="cadastro-senha"
                        type={showPassword ? "text" : "password"}
                        placeholder="Mínimo 6 caracteres"
                        value={cadastroData.senha}
                        onChange={(e) => setCadastroData((prev) => ({ ...prev, senha: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                        minLength={6}
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

                  <div className="space-y-2">
                    <Label htmlFor="cadastro-confirmar-senha">Confirmar Senha</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="cadastro-confirmar-senha"
                        type={showPasswordConfirm ? "text" : "password"}
                        placeholder="Confirme sua senha"
                        value={cadastroData.confirmarSenha}
                        onChange={(e) => setCadastroData((prev) => ({ ...prev, confirmarSenha: e.target.value }))}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswordConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <Button id="cadastro-submit-button" type="submit" className="w-full" disabled={loading}>
                    {loading ? "Criando conta..." : "Criar Conta"}
                  </Button>
                </form>

                {/* Informações sobre o cadastro */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Após criar sua conta:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>• Você poderá criar novas empresas</p>
                    <p>• Ou conectar-se a empresas existentes</p>
                    <p>• Gerenciar patrimônios e filiais</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>© 2025 João Artur Leles. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}

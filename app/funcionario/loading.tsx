import { Building2 } from "lucide-react"

export default function FuncionarioLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4 animate-pulse" />
        <p className="text-gray-600">Carregando patrimônios...</p>
      </div>
    </div>
  )
}

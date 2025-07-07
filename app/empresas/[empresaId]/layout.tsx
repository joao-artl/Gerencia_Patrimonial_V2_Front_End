import type React from "react"
import { Sidebar } from "@/components/layout/sidebar"

export default function EmpresaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 lg:ml-64 overflow-auto">{children}</main>
    </div>
  )
}

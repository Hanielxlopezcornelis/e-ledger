import Filters from "../../components/tables/Filters";
import DataTable from "../../components/tables/DataTable";
import ProtectedRoute from "../../components/layout/ProtectedRoute";

export default function GastosPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen p-4 md:p-8 bg-brand-bg flex justify-center">
        
        {/* Contenedor centralizado con un ancho máximo generoso */}
        <div className="w-full max-w-[1400px] flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Panel Izquierdo: Filtros (Ancho fijo) */}
          <aside className="w-full lg:w-[280px] shrink-0">
            <Filters />
          </aside>

          {/* Panel Derecho: Tabla (Ocupa todo el espacio restante) */}
          <section className="w-full lg:flex-1 min-w-0">
            <DataTable />
          </section>
          
        </div>

      </main>
    </ProtectedRoute>
  );
}
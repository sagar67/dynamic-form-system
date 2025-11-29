import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import DynamicForm from "./components/DynamicForm";
import SubmissionsTable from "./components/SubmissionsTable";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans text-slate-900">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Header */}
          <header className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Employee Onboarding
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Register a new employee into the system using the dynamic form
              below.
            </p>
          </header>

          {/* Form Section - Centered Card */}
          <main className="flex justify-center w-full">
            <div className="w-full max-w-lg">
              <DynamicForm />
            </div>
          </main>

          {/* Table Section - Full Width */}
          <section className="space-y-4 pt-8 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">
                Recent Submissions
              </h2>
            </div>
            <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
              <SubmissionsTable />
            </div>
          </section>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;

import MainLayout from '@/components/layout/Mainlayout'

const InvestmentOpportunies = () => {
  return (
    <MainLayout>
        <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight">Manage Investment Opportunities</h1>
            <div className="p-6 bg-white rounded-xl border shadow-sm">
                <p className="text-gray-500">Manage your investment opportunities here.</p>
            </div>
        </div>
    </MainLayout>
  )
}

export default InvestmentOpportunies
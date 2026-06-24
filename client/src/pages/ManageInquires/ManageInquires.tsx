import MainLayout from "@/components/layout/Mainlayout"

const ManageInquiries = () => {
  return (
    <MainLayout>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Manage Inquiries</h1>
        <div className="p-6 bg-white rounded-xl border shadow-sm">
          <p className="text-gray-500">Manage your inquiries here.</p>
        </div>
      </div>
    </MainLayout>
  )
}

export default ManageInquiries

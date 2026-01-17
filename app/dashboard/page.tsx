import { Overview } from "@/components/dashboard/Overview";
import { RecentPayments } from "@/components/dashboard/RecentPayments";
// import { CustomerList } from "@/components/dashboard/customer-list";

export default function DashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Overview />
      <div className="w-full">
        <RecentPayments />
        {/* <CustomerList className="col-span-3" /> */}
      </div>
    </div>
  );
}

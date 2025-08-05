import DashboardLayout from "@/components/layout/DashboardLayout";
import Card from "@/components/ui/Card";
import { FaBolt, FaBatteryHalf, FaChartLine, FaClock } from "react-icons/fa";

export default function Dashboard() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">Welcome back!</h2>
          <p className="text-charcoal/70">Here&apos;s your energy overview for today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card 
            title="Current Energy" 
            value="85%" 
            subtitle="High level"
            icon={<FaBolt />}
          />
          <Card 
            title="Social Battery" 
            value="60%" 
            subtitle="Moderate"
            icon={<FaBatteryHalf />}
          />
          <Card 
            title="Productivity Score" 
            value="7.8" 
            subtitle="Above average"
            icon={<FaChartLine />}
          />
          <Card 
            title="Focus Time" 
            value="4.2h" 
            subtitle="Today"
            icon={<FaClock />}
          />
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-primary/10 p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Energy Levels This Week</h3>
            <div className="h-64 bg-cream rounded flex items-center justify-center">
              <p className="text-charcoal/50">Chart visualization will be here</p>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-primary/10 p-6">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Social Battery Trends</h3>
            <div className="h-64 bg-cream rounded flex items-center justify-center">
              <p className="text-charcoal/50">Chart visualization will be here</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-primary/10 p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              Log Energy Level
            </button>
            <button className="bg-secondary text-white px-6 py-3 rounded-lg font-medium hover:bg-secondary/90 transition-colors">
              Update Social Battery
            </button>
            <button className="bg-accent text-charcoal px-6 py-3 rounded-lg font-medium hover:bg-accent/90 transition-colors">
              View Insights
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
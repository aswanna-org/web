import React from 'react';
import { Users, DollarSign, ShoppingBag, Activity, TrendingUp, TrendingDown } from 'lucide-react';

const Dashboard = () => {
  const statCards = [
    { title: 'Total Revenue', value: '$45,231.89', change: '+20.1%', isPositive: true, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
    { title: 'New Customers', value: '+2350', change: '+180.1%', isPositive: true, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Sales', value: '+12,234', change: '+19%', isPositive: true, icon: ShoppingBag, color: 'text-purple-600', bg: 'bg-purple-100' },
    { title: 'Active Now', value: '573', change: '-5%', isPositive: false, icon: Activity, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const recentOrders = [
    { id: '#ORD-001', customer: 'John Doe', product: 'Organic Tomatoes', date: 'Oct 24, 2026', amount: '$120.00', status: 'Completed' },
    { id: '#ORD-002', customer: 'Jane Smith', product: 'Fresh Carrots', date: 'Oct 23, 2026', amount: '$45.50', status: 'Processing' },
    { id: '#ORD-003', customer: 'Robert Johnson', product: 'Premium Rice 5kg', date: 'Oct 23, 2026', amount: '$210.00', status: 'Completed' },
    { id: '#ORD-004', customer: 'Emily Davis', product: 'Avocado Pack', date: 'Oct 22, 2026', amount: '$32.00', status: 'Pending' },
    { id: '#ORD-005', customer: 'Michael Wilson', product: 'Organic Fertilizer', date: 'Oct 21, 2026', amount: '$85.00', status: 'Completed' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 w-full mx-auto">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {stat.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm font-medium ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                <span className="ml-2 text-sm text-gray-500">from last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
            <button className="text-sm font-medium text-green-600 hover:text-green-700">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3">Order ID</th>
                  <th scope="col" className="px-6 py-3">Customer</th>
                  <th scope="col" className="px-6 py-3">Product</th>
                  <th scope="col" className="px-6 py-3">Amount</th>
                  <th scope="col" className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0">
                    <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4">{order.customer}</td>
                    <td className="px-6 py-4 text-gray-500">{order.product}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{order.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products/Analytics Widget */}
        <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Traffic Sources</h2>
          <div className="flex-1 flex items-center justify-center py-4">
            {/* Simple placeholder for a chart */}
            <div className="relative h-48 w-48 rounded-full border-[16px] border-green-500 border-t-blue-500 border-r-purple-500 border-b-yellow-500 flex items-center justify-center shadow-inner">
              <div className="text-center">
                <span className="block text-2xl font-bold text-gray-800">42K</span>
                <span className="text-xs text-gray-500">Visits</span>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-gray-600">Direct</span></div>
              <span className="font-medium">45%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-gray-600">Social</span></div>
              <span className="font-medium">25%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-purple-500"></div><span className="text-gray-600">Organic</span></div>
              <span className="font-medium">20%</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><span className="text-gray-600">Referral</span></div>
              <span className="font-medium">10%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

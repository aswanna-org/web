import { useState, useEffect } from 'react';
import { Search, Trash2, ShoppingCart, ChevronDown, ChevronRight } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface OrderItem { id: string; productName: string; price: number; quantity: number; }
interface Order {
  id: string; name: string; email?: string; address: string; mobile: string;
  secondaryMobile?: string; totalAmount: number; status: string; createdAt: string; items: OrderItem[];
}

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const fetchOrders = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/orders?page=${page}&limit=15`, { headers });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
        if (data.meta) setTotalPages(data.meta.totalPages);
      }
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchOrders(currentPage); }, [currentPage]);

  const handleStatusChange = async (id: string, status: string) => {
    const res = await fetch(`${API_BASE_URL}/orders/${id}/status`, { method: 'PUT', headers, body: JSON.stringify({ status }) });
    if (res.ok) fetchOrders(currentPage);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this order?')) return;
    await fetch(`${API_BASE_URL}/orders/${id}`, { method: 'DELETE', headers });
    fetchOrders(currentPage);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = { PENDING: 'bg-yellow-100 text-yellow-700', PROCESSING: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700' };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const filteredOrders = orders.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.mobile.includes(search));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer orders</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or mobile..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/50" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center py-20"><div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" /></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><ShoppingCart className="mx-auto mb-2" size={32} /><p>No orders found</p></div>
            ) : filteredOrders.map(order => (
              <div key={order.id}>
                <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className="p-1 hover:bg-gray-200 rounded transition-colors">
                        {expandedId === order.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                      <div>
                        <p className="font-semibold text-gray-800">{order.name}</p>
                        <p className="text-sm text-gray-500">{order.mobile} {order.email && `• ${order.email}`}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-bold text-gray-800">Rs. {order.totalAmount?.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">{order.items?.length} item(s)</p>
                      </div>
                      <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border-0 focus:ring-2 focus:ring-green-500/50 cursor-pointer ${getStatusColor(order.status)}`}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => handleDelete(order.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
                {expandedId === order.id && (
                  <div className="px-16 pb-4 bg-gray-50">
                    <p className="text-sm text-gray-500 mb-2"><strong>Address:</strong> {order.address}</p>
                    <table className="w-full text-sm">
                      <thead><tr className="text-xs text-gray-500 border-b border-gray-200"><th className="text-left pb-2">Product</th><th className="text-left pb-2">Price</th><th className="text-left pb-2">Qty</th><th className="text-left pb-2">Total</th></tr></thead>
                      <tbody>
                        {order.items?.map(item => (
                          <tr key={item.id} className="border-b border-gray-100 last:border-0">
                            <td className="py-2 text-gray-800">{item.productName}</td>
                            <td className="py-2 text-gray-600">Rs. {item.price?.toLocaleString()}</td>
                            <td className="py-2 text-gray-600">{item.quantity}</td>
                            <td className="py-2 font-medium text-gray-800">Rs. {(item.price * item.quantity)?.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </div>
    </div>
  );
}

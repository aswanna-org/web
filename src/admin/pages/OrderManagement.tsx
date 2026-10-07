import { useState, useEffect } from 'react';
import { Search, Trash2, ShoppingCart, ChevronDown, ChevronRight, Eye, X, Phone, Mail, MapPin } from 'lucide-react';
import Pagination from '../../components/admin/Pagination';
import AgroLoader from '../../components/common/AgroLoader';
import { useConfirm } from '../components/ConfirmDialog';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface OrderItem { id: string; productName: string; price: number; quantity: number; }
interface Order {
  id: string; name: string; email?: string; address: string; mobile: string;
  secondaryMobile?: string; totalAmount: number; status: string; createdAt: string; items: OrderItem[];
}

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function OrderManagement() {
  const { confirm } = useConfirm();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const token = localStorage.getItem('admin_token');
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
    if (!await confirm({
      title: 'Delete Order',
      subtitle: 'ඇණවුම ස්ථිරවම ඉවත් කිරීම',
      message: 'Are you sure you want to delete this order? This action cannot be undone.',
      confirmText: 'Delete Order'
    })) return;
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
          <div className="flex justify-center items-center py-20"><AgroLoader message="Loading orders..." /></div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 text-gray-400"><ShoppingCart className="mx-auto mb-2" size={32} /><p>No orders found</p></div>
            ) : filteredOrders.map(order => (
              <div key={order.id}>
                <div className="px-3 py-1.5 hover:bg-gray-50/70 transition-colors">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} className="p-0.5 hover:bg-gray-200 rounded transition-colors text-gray-500 cursor-pointer">
                        {expandedId === order.id ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                      <span className="font-semibold text-gray-900 truncate max-w-[160px]" title={order.name}>{order.name}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-600 truncate max-w-[150px]">{order.mobile || order.email}</span>
                      <span className="text-gray-400">|</span>
                      <span className="text-gray-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-bold text-gray-900 whitespace-nowrap">Rs. {order.totalAmount?.toLocaleString()}</span>
                      <select value={order.status} onChange={e => handleStatusChange(order.id, e.target.value)}
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border-0 focus:ring-1 focus:ring-emerald-500/50 cursor-pointer ${getStatusColor(order.status)}`}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button onClick={() => setViewingOrder(order)} title="View Order Details" className="p-1 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors cursor-pointer"><Eye size={15} /></button>
                      <button onClick={() => handleDelete(order.id)} title="Delete Order" className="p-1 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"><Trash2 size={15} /></button>
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

      {/* Order Details Preview Modal */}
      {viewingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingOrder(null)} />
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative z-10 overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200 shrink-0">
                  <ShoppingCart size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">Order Details</h3>
                  <p className="text-[11px] text-gray-500">ඇණවුමේ සම්පූර්ණ විස්තරය</p>
                </div>
              </div>
              <button
                onClick={() => setViewingOrder(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <span className="text-xs text-gray-400">Customer Name</span>
                  <h2 className="text-lg font-bold text-gray-900">{viewingOrder.name}</h2>
                  <p className="text-xs text-gray-500">{new Date(viewingOrder.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 block mb-1">Status</span>
                  <select
                    value={viewingOrder.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      handleStatusChange(viewingOrder.id, newStatus);
                      setViewingOrder({ ...viewingOrder, status: newStatus });
                    }}
                    className={`text-xs font-semibold px-3 py-1 rounded-full cursor-pointer outline-none ${getStatusColor(viewingOrder.status)}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Primary Mobile</span>
                  <a href={`tel:${viewingOrder.mobile}`} className="font-bold text-emerald-700 hover:underline flex items-center gap-1 font-mono">
                    <Phone size={12} /> {viewingOrder.mobile}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 block mb-0.5">Secondary Mobile</span>
                  {viewingOrder.secondaryMobile ? (
                    <a href={`tel:${viewingOrder.secondaryMobile}`} className="font-medium text-emerald-700 hover:underline flex items-center gap-1 font-mono">
                      <Phone size={12} /> {viewingOrder.secondaryMobile}
                    </a>
                  ) : <span className="text-gray-400">-</span>}
                </div>
                {viewingOrder.email && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-400 block mb-0.5">Email Address</span>
                    <a href={`mailto:${viewingOrder.email}`} className="font-medium text-gray-800 hover:underline flex items-center gap-1">
                      <Mail size={12} /> {viewingOrder.email}
                    </a>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <span className="text-gray-400 block mb-0.5">Delivery Address</span>
                  <p className="font-medium text-gray-800 flex items-start gap-1">
                    <MapPin size={12} className="shrink-0 mt-0.5 text-gray-400" />
                    <span>{viewingOrder.address}</span>
                  </p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Ordered Items</h4>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2">Product</th>
                        <th className="px-3 py-2 text-right">Unit Price</th>
                        <th className="px-3 py-2 text-center">Qty</th>
                        <th className="px-3 py-2 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {viewingOrder.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50/50">
                          <td className="px-3 py-2 font-medium text-gray-900">{item.productName}</td>
                          <td className="px-3 py-2 text-right text-gray-600">Rs. {item.price?.toLocaleString()}</td>
                          <td className="px-3 py-2 text-center font-semibold text-gray-700">{item.quantity}</td>
                          <td className="px-3 py-2 text-right font-bold text-gray-900">Rs. {(item.price * item.quantity)?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200 font-bold">
                      <tr>
                        <td colSpan={3} className="px-3 py-2.5 text-gray-700 uppercase text-[11px]">Total Order Amount</td>
                        <td className="px-3 py-2.5 text-right text-emerald-700 text-sm">Rs. {viewingOrder.totalAmount?.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/70 flex justify-end gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setViewingOrder(null)}
                className="px-4 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

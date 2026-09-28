import { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, TextField, InputAdornment, CircularProgress,
  IconButton, Tooltip, Select, MenuItem, Collapse, Table,
  TableHead, TableBody, TableRow, TableCell, TableContainer
} from '@mui/material';
import {
  Search as SearchIcon, Delete as DeleteIcon,
  ShoppingCart as ShoppingCartIcon, ExpandMore as ExpandMoreIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import Pagination from '../../components/admin/Pagination';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface OrderItem { id: string; productName: string; price: number; quantity: number; }
interface Order {
  id: string; name: string; email?: string; address: string; mobile: string;
  secondaryMobile?: string; totalAmount: number; status: string; createdAt: string; items: OrderItem[];
}

const STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

const statusColors: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: '#fef9c3', color: '#a16207' },
  PROCESSING: { bg: '#dbeafe', color: '#1d4ed8' },
  SHIPPED: { bg: '#ede9fe', color: '#6d28d9' },
  DELIVERED: { bg: '#dcfce7', color: '#15803d' },
  CANCELLED: { bg: '#fee2e2', color: '#b91c1c' },
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    if (!confirm('Delete this order?')) return;
    await fetch(`${API_BASE_URL}/orders/${id}`, { method: 'DELETE', headers });
    fetchOrders(currentPage);
  };

  const filteredOrders = orders.filter(o => o.name.toLowerCase().includes(search.toLowerCase()) || o.mobile.includes(search));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }}>Order Management</Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>Manage customer orders</Typography>
      </Box>

      {/* Search */}
      <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'grey.100', borderRadius: 3 }}>
        <TextField size="small" placeholder="Search by name or mobile..." value={search} onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} /></InputAdornment> } }}
          sx={{ maxWidth: 400, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
      </Paper>

      {/* Orders */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'grey.100', borderRadius: 3, overflow: 'hidden' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress sx={{ color: '#16a34a' }} />
          </Box>
        ) : filteredOrders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <ShoppingCartIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>No orders found</Typography>
          </Box>
        ) : (
          <Box sx={{ divide: 'grey.50' }}>
            {filteredOrders.map((order, idx) => (
              <Box key={order.id} sx={{ borderBottom: idx < filteredOrders.length - 1 ? '1px solid' : 'none', borderColor: 'grey.50' }}>
                {/* Order Row */}
                <Box sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', '&:hover': { bgcolor: 'grey.50' }, transition: 'background 0.15s' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <IconButton size="small" onClick={() => setExpandedId(expandedId === order.id ? null : order.id)} sx={{ color: 'text.disabled' }}>
                      {expandedId === order.id ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
                    </IconButton>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{order.name}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{order.mobile}{order.email && ` • ${order.email}`}</Typography>
                      <Typography variant="caption" sx={{ color: "text.disabled", display: "block" }}>{new Date(order.createdAt).toLocaleString()}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Rs. {order.totalAmount?.toLocaleString()}</Typography>
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{order.items?.length} item(s)</Typography>
                    </Box>
                    <Select
                      value={order.status} size="small"
                      onChange={e => handleStatusChange(order.id, e.target.value)}
                      sx={{
                        fontSize: '0.7rem', fontWeight: 700, borderRadius: 5, height: 28,
                        bgcolor: statusColors[order.status]?.bg || '#f3f4f6',
                        color: statusColors[order.status]?.color || '#6b7280',
                        '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                        '& .MuiSelect-icon': { color: statusColors[order.status]?.color || '#6b7280', fontSize: 16 },
                      }}
                    >
                      {STATUSES.map(s => <MenuItem key={s} value={s} sx={{ fontSize: '0.7rem', fontWeight: 600 }}>{s}</MenuItem>)}
                    </Select>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(order.id)} sx={{ color: 'text.disabled', '&:hover': { color: 'error.main', bgcolor: 'error.50' } }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {/* Expanded Items */}
                <Collapse in={expandedId === order.id}>
                  <Box sx={{ px: 8, pb: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", mb: 1, display: "block" }}>
                      <strong>Address:</strong> {order.address}
                    </Typography>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            {['Product', 'Price', 'Qty', 'Total'].map(h => (
                              <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.65rem', textTransform: 'uppercase', color: 'text.secondary', pb: 0.5 }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {order.items?.map(item => (
                            <TableRow key={item.id} sx={{ '&:last-child td': { border: 0 } }}>
                              <TableCell><Typography variant="body2">{item.productName}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>Rs. {item.price?.toLocaleString()}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ color: "text.secondary" }}>{item.quantity}</Typography></TableCell>
                              <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>Rs. {(item.price * item.quantity)?.toLocaleString()}</Typography></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </Box>
        )}
        {totalPages > 1 && <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />}
      </Paper>
    </Box>
  );
}

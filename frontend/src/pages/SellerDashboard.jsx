import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, Package, ShoppingBag, DollarSign, TrendingUp, Plus, X, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const initialProductForm = {
  name: '',
  description: '',
  price: '',
  originalPrice: '',
  stock: '',
  category: 'grocery',
  imageUrls: '',
  tags: '',
};

const SellerDashboard = () => {
  const { user, supabase } = useAuth();
  const [storeData, setStoreData] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductForm, setShowProductForm] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [productForm, setProductForm] = useState(initialProductForm);
  const [specRows, setSpecRows] = useState([
    { key: 'Size', value: 'S, M, L, XL' },
    { key: 'Color', value: 'Black, White' },
  ]);
  const [savingProduct, setSavingProduct] = useState(false);

  const fetchSellerData = async () => {
    if (!user) return;

    setLoading(true);
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .select('*')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (storeError) {
      console.error(storeError);
      setLoading(false);
      return;
    }

    if (store) {
      setStoreData(store);

      const { data: storeProducts, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });
      if (!productsError) setProducts(storeProducts || []);

      const { data: storeOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('store_id', store.id)
        .order('created_at', { ascending: false });
      if (!ordersError) setOrders(storeOrders || []);
    } else {
      setStoreData(null);
      setProducts([]);
      setOrders([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchSellerData();
  }, [user, supabase]);

  useEffect(() => {
    if (!user || !storeData?.id) return undefined;

    const subscription = supabase
      .channel('public:orders:seller')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `store_id=eq.${storeData.id}` }, () => {
        fetchSellerData();
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [user, supabase, storeData?.id]);

  const handleProductInput = (event) => {
    const { name, value } = event.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateSpecRow = (index, field, value) => {
    setSpecRows((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row)));
  };

  const addSpecRow = () => {
    setSpecRows((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeSpecRow = (index) => {
    setSpecRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleAddProduct = async (event) => {
    event.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSavingProduct(true);

    if (!storeData?.id) {
      setFormError('Store details are not ready yet.');
      setSavingProduct(false);
      return;
    }

    if (!productForm.name || !productForm.description || !productForm.price || !productForm.stock) {
      setFormError('Please add a product name, description, price and stock.');
      setSavingProduct(false);
      return;
    }

    const imageUrls = productForm.imageUrls
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const tags = productForm.tags
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    const specifications = specRows
      .filter((row) => row.key.trim())
      .map((row) => ({ key: row.key.trim(), value: row.value.trim() }));

    const variations = specifications.map((item) => ({
      name: item.key,
      options: item.value.split(',').map((value) => value.trim()).filter(Boolean),
    }));

    const productPayload = {
      store_id: storeData.id,
      name: productForm.name.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      original_price: productForm.originalPrice ? Number(productForm.originalPrice) : null,
      stock: Number(productForm.stock),
      category: productForm.category,
      images: imageUrls,
      tags,
      specifications,
      variations,
      is_active: true,
      rating: 0,
      total_reviews: 0,
    };

    const { data, error } = await supabase.from('products').insert([productPayload]).select().single();

    if (error) {
      console.error(error);
      setFormError(error.message || 'Unable to add this product right now.');
      setSavingProduct(false);
      return;
    }

    setProducts((prev) => [data, ...prev]);
    setFormSuccess(`${data.name} is now live in your store.`);
    setProductForm(initialProductForm);
    setSpecRows([
      { key: 'Size', value: 'S, M, L, XL' },
      { key: 'Color', value: 'Black, White' },
    ]);
    setShowProductForm(false);
    setSavingProduct(false);
  };

  if (loading) {
    return <div className="container centered" style={{ minHeight: '60vh' }}><div className="loading" /></div>;
  }

  if (!storeData) {
    return (
      <div className="container centered" style={{ paddingTop: '60px', textAlign: 'center' }}>
        <Store size={64} color="var(--text-muted)" style={{ margin: '0 auto 20px' }} />
        <h2>You don't have a store yet</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>Set up your store to start selling.</p>
        <button className="btn btn-primary">Create Store</button>
      </div>
    );
  }

  return (
    <div className="dashboard-layout container" style={{ paddingTop: '20px', paddingBottom: '40px' }}>
      <header className="section-header-premium" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', gap: '16px', flexWrap: 'wrap' }}>
        <div>
          <h2>Seller Dashboard</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back, {storeData.store_name || storeData.name || 'your store'}</p>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setShowProductForm((prev) => !prev)}>
          {showProductForm ? <X size={18} /> : <Plus size={18} />} {showProductForm ? 'Close' : 'Add Product'}
        </button>
      </header>

      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="premium-card glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ background: 'var(--primary-light)', padding: '12px', borderRadius: '12px' }}>
              <DollarSign size={24} color="var(--primary)" />
            </div>
            <TrendingUp size={20} color="var(--success)" />
          </div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Estimated Revenue</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>
            ₵{orders.reduce((sum, order) => sum + (order.total_amount || 0), 0).toFixed(2)}
          </p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="premium-card glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <ShoppingBag size={24} color="var(--success)" />
            </div>
          </div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Total Store Orders</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>{orders.length}</p>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="premium-card glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px' }}>
              <Package size={24} color="var(--warning)" />
            </div>
          </div>
          <h4 style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '5px' }}>Active Products</h4>
          <p style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--secondary)' }}>{products.length}</p>
        </motion.div>
      </div>

      {showProductForm && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="premium-card glass-card" style={{ marginBottom: '24px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Add a new item</h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Products will appear in your storefront and cart flow</span>
          </div>

          {formError && <div className="badge badge-danger" style={{ display: 'block', marginBottom: '16px', padding: '10px 12px' }}>{formError}</div>}
          {formSuccess && <div className="badge" style={{ display: 'block', marginBottom: '16px', padding: '10px 12px', background: 'rgba(34, 197, 94, 0.12)', color: 'var(--success)' }}>{formSuccess}</div>}

          <form onSubmit={handleAddProduct} style={{ display: 'grid', gap: '16px' }}>
            <div className="auth-form-grid">
              <div className="form-group">
                <label>Product name</label>
                <input name="name" value={productForm.name} onChange={handleProductInput} placeholder="e.g. Premium Hoodie" required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select name="category" value={productForm.category} onChange={handleProductInput}>
                  <option value="grocery">Grocery</option>
                  <option value="fashion">Fashion</option>
                  <option value="electronics">Electronics</option>
                  <option value="food">Food</option>
                  <option value="pharmacy">Pharmacy</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea name="description" value={productForm.description} onChange={handleProductInput} rows="3" placeholder="Describe the item, materials, use case and benefits" required />
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label>Price (₵)</label>
                <input name="price" type="number" min="0" step="0.01" value={productForm.price} onChange={handleProductInput} placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label>Original price (optional)</label>
                <input name="originalPrice" type="number" min="0" step="0.01" value={productForm.originalPrice} onChange={handleProductInput} placeholder="0.00" />
              </div>
            </div>

            <div className="auth-form-grid">
              <div className="form-group">
                <label>Stock</label>
                <input name="stock" type="number" min="0" value={productForm.stock} onChange={handleProductInput} placeholder="10" required />
              </div>
              <div className="form-group">
                <label>Image URLs (comma separated)</label>
                <input name="imageUrls" value={productForm.imageUrls} onChange={handleProductInput} placeholder="https://...jpg, https://...jpg" />
              </div>
            </div>

            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input name="tags" value={productForm.tags} onChange={handleProductInput} placeholder="new, best-seller, limited" />
            </div>

            <div className="form-group">
              <label>Item details</label>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '10px' }}>Add size, color, weight, height, or other useful options.</p>
              {specRows.map((row, index) => (
                <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr auto', gap: '8px', marginBottom: '8px' }}>
                  <input value={row.key} onChange={(event) => updateSpecRow(index, 'key', event.target.value)} placeholder="e.g. Size" />
                  <input value={row.value} onChange={(event) => updateSpecRow(index, 'value', event.target.value)} placeholder="e.g. S, M, L, XL" />
                  <button type="button" className="btn btn-secondary" style={{ padding: '10px', minWidth: '42px' }} onClick={() => removeSpecRow(index)}>
                    <X size={16} />
                  </button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary" style={{ marginTop: '6px', padding: '10px 14px' }} onClick={addSpecRow}>+ Add detail</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setShowProductForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={savingProduct}>
                {savingProduct ? 'Saving...' : 'Publish Product'}
              </button>
            </div>
          </form>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="premium-card">
          <div className="card-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px', gap: '12px', flexWrap: 'wrap' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={20} color="var(--primary)" /> Your Products
            </h3>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{products.length} item(s) live</span>
          </div>

          {products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No products yet. Add your first item to start selling.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {products.map((product) => (
                <div key={product.id} className="glass-card" style={{ padding: '16px', borderRadius: '16px' }}>
                  <div style={{ width: '100%', height: '150px', background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(15,23,42,0.06))', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    {product.images?.[0] ? (
                      <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                    ) : (
                      <ImageIcon size={28} color="var(--primary)" />
                    )}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <h4 style={{ fontSize: '15px' }}>{product.name}</h4>
                    <span className={`status-badge ${product.is_active ? 'status-confirmed' : 'status-cancelled'}`}>{product.is_active ? 'Live' : 'Draft'}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px', minHeight: '38px' }}>{product.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '800', color: 'var(--primary)' }}>₵{Number(product.price || 0).toFixed(2)}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Stock {product.stock || 0}</span>
                  </div>
                  {product.specifications?.length > 0 && (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {product.specifications.slice(0, 2).map((spec) => `${spec.key}: ${spec.value}`).join(' • ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="premium-card">
          <div className="card-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-light)', paddingBottom: '15px' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} color="var(--primary)" /> Recent Incoming Orders
            </h3>
          </div>

          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
              No recent orders found.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '13px', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 10px' }}>Order ID & Date</th>
                    <th>Delivery Target</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 10).map((order) => (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border-light)', transition: 'background 0.2s', background: order.status === 'pending' ? 'rgba(245, 158, 11, 0.05)' : 'transparent' }} className="table-row-hover">
                      <td style={{ padding: '15px 10px' }}>
                        <p style={{ fontWeight: '800', fontFamily: 'monospace' }}>#{order.id.substring(0, 8)}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{new Date(order.created_at).toLocaleString()}</p>
                      </td>
                      <td>
                        <p style={{ fontWeight: '600' }}>{order.delivery_address || 'N/A'}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{order.town}</p>
                      </td>
                      <td style={{ fontWeight: '800', color: 'var(--primary)' }}>₵{Number(order.total_amount || 0).toFixed(2)}</td>
                      <td>
                        <span className={`status-badge status-${order.status || 'pending'}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        {order.status === 'pending' ? (
                          <button
                            onClick={async () => {
                              const { error } = await supabase.from('orders').update({ status: 'confirmed' }).eq('id', order.id);
                              if (!error) setOrders(orders.map((item) => (item.id === order.id ? { ...item, status: 'confirmed' } : item)));
                            }}
                            className="btn btn-primary"
                            style={{ padding: '6px 16px', fontSize: '12px', background: 'var(--success)' }}
                          >
                            Accept Order
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Assigned to Rider</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SellerDashboard;

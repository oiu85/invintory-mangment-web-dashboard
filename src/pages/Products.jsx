import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/Textarea';
import Button from '../components/ui/Button';
import SearchInput from '../components/SearchInput';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { getAllProductDimensions } from '../api/roomApi';
import { Grid, List, Search, Package as PackageIcon } from 'lucide-react';

const Products = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category_id: '',
    description: '',
    image: '',
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchDimensions();
  }, []);

  const fetchDimensions = async () => {
    try {
      const data = await getAllProductDimensions();
      setDimensions(Array.isArray(data) ? data : []);
    } catch (error) {
      // Dimensions might not exist for all products
      setDimensions([]);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      const response = await axiosClient.get('/products');
      setProducts(response.data);
      setFilteredProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast(t('errorLoadingProducts'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      price: '',
      category_id: '',
      description: '',
      image: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category_id: product.category_id,
      description: product.description || '',
      image: product.image || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) {
        formDataToSend.append(key, formData[key]);
      }
    });

    try {
      if (editingProduct) {
        await axiosClient.put(`/products/${editingProduct.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast(t('productUpdated'), 'success');
      } else {
        await axiosClient.post('/products', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast(t('productCreated'), 'success');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      showToast(error.response?.data?.message || t('errorSavingProduct'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      await axiosClient.delete(`/products/${productToDelete.id}`);
      showToast(t('productDeleted'), 'success');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      showToast(t('errorDeletingProduct'), 'error');
    }
  };

  const getStockBadgeVariant = (quantity) => {
    if (quantity < 10) return { variant: 'error', label: 'Low' };
    if (quantity < 50) return { variant: 'warning', label: 'Medium' };
    return { variant: 'success', label: 'Good' };
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('pageTitleProducts')}
        subtitle={t('pageDescriptionProducts')}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleCreate} icon={PackageIcon} iconPosition="left">
              {t('addProduct')}
            </Button>
          </div>
        }
      />

      {/* Search and View Toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400 z-10" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchProducts')}
            className="w-full pl-10 pr-4 py-2 border-2 border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent focus:bg-gradient-to-r focus:from-primary-50 focus:to-secondary-50 dark:focus:from-primary-900/20 dark:focus:to-secondary-900/20 focus:shadow-glow-primary/20 bg-white dark:bg-neutral-800/50 text-neutral-900 dark:text-neutral-100 shadow-sm transition-all duration-300"
          />
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-neutral-100/50 to-neutral-200/30 dark:from-neutral-800/50 dark:to-neutral-700/30 p-1 rounded-lg glass">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded transition-all duration-200 ${
              viewMode === 'table'
                ? 'bg-gradient-primary text-white shadow-elevated-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50'
            }`}
            aria-label="Table view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-all duration-200 ${
              viewMode === 'grid'
                ? 'bg-gradient-primary text-white shadow-elevated-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-100/50 dark:hover:bg-neutral-700/50'
            }`}
            aria-label="Grid view"
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <Card variant="glass">
          <Card.Body>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton variant="avatar" />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="heading" />
                    <Skeleton variant="text" />
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      ) : viewMode === 'table' ? (
        <Card variant="glass" className="overflow-hidden">
          <Table
            headers={[
              { key: 'id', label: t('id'), sortable: true },
              { key: 'image', label: t('image') },
              { key: 'name', label: t('name'), sortable: true },
              { key: 'price', label: t('price'), sortable: true },
              { key: 'category', label: t('category') },
              { key: 'dimensions', label: t('dimensions') },
              { key: 'warehouseStock', label: t('warehouseStock'), sortable: true },
              { key: 'driverStock', label: t('driverStock') },
              { key: 'totalSold', label: t('totalSold') },
            ]}
            data={filteredProducts}
            sortable={true}
            loading={loading}
            emptyMessage={t('noData')}
            renderRow={(product) => {
              const productDim = dimensions.find(d => d.product_id === product.id);
              const stockBadge = getStockBadgeVariant(product.warehouse_quantity || 0);
              
              return (
                <>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm font-semibold text-neutral-900 dark:text-neutral-100">{product.id}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-lg border-2 border-neutral-200/60 dark:border-neutral-700/60 shadow-sm" />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 rounded-lg flex items-center justify-center border-2 border-neutral-200/60 dark:border-neutral-700/60 shadow-sm">
                        <PackageIcon className="w-5 h-5 text-neutral-400 dark:text-neutral-500" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-bold">{product.name}</td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    <span className="font-bold text-success-600 dark:text-success-400">${product.price}</span>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    <Badge variant="primary">{product.category?.name || t('nA')}</Badge>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    {productDim ? (
                      <Badge variant="success">                     
                        {parseFloat(productDim.width || 0).toFixed(0)}×{parseFloat(productDim.depth || 0).toFixed(0)}×{parseFloat(productDim.height || 0).toFixed(0)} {t('cm')}
                      </Badge>
                    ) : (
                      <Badge variant="error">{t('dimensionsMissing')}</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    <Badge variant={stockBadge.variant}>
                      {product.warehouse_quantity || 0} {t('units')}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    <Badge variant="secondary">{product.total_driver_stock || 0} {t('units')}</Badge>
                  </td>
                  <td className="px-4 py-2.5 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                    <Badge>{product.total_sold || 0} {t('units')}</Badge>
                  </td>
                </>
              );
            }}
            actions={(product) => (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                  {t('edit')}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/product-dimensions')}>
                  {t('manageDimensions')}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product)}>
                  {t('delete')}
                </Button>
              </div>
            )}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((product) => {
            const productDim = dimensions.find(d => d.product_id === product.id);
            const stockBadge = getStockBadgeVariant(product.warehouse_quantity || 0);
            
            return (
              <Card key={product.id} variant="glass" hover className="overflow-hidden group">
                <div className="relative h-40 bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800 overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PackageIcon className="w-12 h-12 text-neutral-400 dark:text-neutral-500" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <Card.Body compact>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-neutral-900 dark:text-white text-lg">{product.name}</h3>
                    <Badge variant={stockBadge.variant}>{product.warehouse_quantity || 0}</Badge>
                  </div>
                  <p className="text-2xl font-bold text-success-600 dark:text-success-400 mb-3">${product.price}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">{t('category')}:</span>
                      <Badge variant="primary" size="sm">{product.category?.name || t('nA')}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">{t('dimensions')}:</span>
                      {productDim ? (
                        <Badge variant="success" size="sm">
                          {parseFloat(productDim.width || 0).toFixed(0)}×{parseFloat(productDim.depth || 0).toFixed(0)}×{parseFloat(productDim.height || 0).toFixed(0)}
                        </Badge>
                      ) : (
                        <Badge variant="error" size="sm">{t('dimensionsMissing')}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="flex-1" onClick={() => handleEdit(product)}>
                      {t('edit')}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product)}>
                      {t('delete')}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? t('editProduct') : t('createProduct')}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formData.image && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">{t('imagePreview')}</label>
              <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700" />
            </div>
          )}
          <Input
            id="product-name"
            label={t('productName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            id="product-price"
            label={t('productPrice')}
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <Select
            id="product-category"
            label={t('productCategory')}
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            options={[
              { value: '', label: t('selectCategory') },
              ...categories.map((cat) => ({ value: cat.id, label: cat.name }))
            ]}
            required
          />
          <Textarea
            id="product-description"
            label={t('productDescription')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <Input
            id="product-image"
            label={t('productImage')}
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button type="submit" loading={submitting} className="flex-1">
              {editingProduct ? t('update') : t('create')}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProductToDelete(null);
        }}
        onConfirm={handleDelete}
        title={t('deleteProduct')}
        message={t('deleteProductMessage').replace('{name}', productToDelete?.name || '')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </div>
  );
};

export default Products;

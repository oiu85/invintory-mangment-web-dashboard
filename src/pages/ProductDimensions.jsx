import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getAllProductDimensions, getProductDimensions, createProductDimensions, updateProductDimensions, deleteProductDimensions } from '../api/roomApi';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/layout/PageHeader';
import { Ruler, Package, AlertTriangle, CheckCircle2, Search, Plus } from 'lucide-react';

const ProductDimensions = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [dimensions, setDimensions] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [dimensionToDelete, setDimensionToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    width: '',
    depth: '',
    height: '',
    weight: '',
    rotatable: true,
    fragile: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.id.toString().includes(searchTerm)
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsResponse, dimensionsResponse] = await Promise.all([
        axiosClient.get('/products'),
        getAllProductDimensions().catch(() => []),
      ]);
      
      const productsData = productsResponse.data;
      const dimensionsData = Array.isArray(dimensionsResponse) ? dimensionsResponse : [];
      
      // Create a map of product_id to dimensions
      const dimensionsMap = {};
      dimensionsData.forEach(dim => {
        dimensionsMap[dim.product_id] = dim;
      });

      // Merge products with their dimensions
      const productsWithDimensions = productsData.map(product => ({
        ...product,
        dimensions: dimensionsMap[product.id] || null,
      }));

      setProducts(productsWithDimensions);
      setFilteredProducts(productsWithDimensions);
      setDimensions(dimensionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast(t('errorLoadingDimensions'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = (product) => {
    setEditingProduct(product);
    setFormData({
      width: '',
      depth: '',
      height: '',
      weight: '',
      rotatable: true,
      fragile: false,
    });
    setIsModalOpen(true);
  };

  const handleEdit = async (product) => {
    try {
      const dimData = await getProductDimensions(product.id);
      setEditingProduct(product);
      setFormData({
        width: dimData.width || '',
        depth: dimData.depth || '',
        height: dimData.height || '',
        weight: dimData.weight || '',
        rotatable: dimData.rotatable !== false,
        fragile: dimData.fragile === true,
      });
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching dimensions:', error);
      showToast(t('errorLoadingDimensions'), 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const dataToSend = {
        width: parseFloat(formData.width),
        depth: parseFloat(formData.depth),
        height: parseFloat(formData.height),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        rotatable: formData.rotatable,
        fragile: formData.fragile,
      };

      if (editingProduct?.dimensions) {
        await updateProductDimensions(editingProduct.id, dataToSend);
        showToast(t('dimensionsUpdated'), 'success');
      } else {
        await createProductDimensions(editingProduct.id, dataToSend);
        showToast(t('dimensionsCreated'), 'success');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchData();
    } catch (error) {
      console.error('Error saving dimensions:', error);
      showToast(error.response?.data?.message || t('errorSavingDimensions'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (product) => {
    setDimensionToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!dimensionToDelete) return;

    try {
      await deleteProductDimensions(dimensionToDelete.id);
      showToast(t('dimensionsDeleted'), 'success');
      setIsDeleteModalOpen(false);
      setDimensionToDelete(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting dimensions:', error);
      showToast(t('errorDeletingDimensions'), 'error');
    }
  };

  // Calculate statistics
  const totalProducts = filteredProducts.length;
  const withDimensions = filteredProducts.filter(p => p.dimensions).length;
  const withoutDimensions = totalProducts - withDimensions;

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const colorConfigs = {
      blue: { iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600', text: 'text-blue-600 dark:text-blue-400' },
      green: { iconBg: 'bg-gradient-to-br from-success-500 to-success-600', text: 'text-success-600 dark:text-success-400' },
      orange: { iconBg: 'bg-gradient-to-br from-warning-500 to-warning-600', text: 'text-warning-600 dark:text-warning-400' },
    };
    const config = colorConfigs[color] || colorConfigs.blue;

    return (
      <Card variant="glass" hover>
        <Card.Body>
          <div className="flex items-center justify-between mb-4">
            <div className={`${config.iconBg} p-3 rounded-xl shadow-lg`}>
              {Icon && <Icon className="w-6 h-6 text-white" />}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${config.text} mb-1`}>{value}</p>
            {subtitle && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>}
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('pageTitleProductDimensions')}
        subtitle={t('pageDescriptionProductDimensions')}
      />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {loading ? (
          <>
            {[...Array(3)].map((_, i) => (
              <Card key={i} variant="elevated">
                <Card.Body>
                  <Skeleton variant="avatar" className="mb-4" />
                  <Skeleton variant="title" className="mb-2" />
                  <Skeleton variant="text" />
                </Card.Body>
              </Card>
            ))}
          </>
        ) : (
          <>
            <StatCard
              title={t('totalProducts')}
              value={totalProducts}
              icon={Package}
              color="blue"
              subtitle={t('allProducts')}
            />
            <StatCard
              title={t('dimensionsSet')}
              value={withDimensions}
              icon={CheckCircle2}
              color="green"
              subtitle={t('withDimensions')}
            />
            <StatCard
              title={t('dimensionsMissing')}
              value={withoutDimensions}
              icon={AlertTriangle}
              color="orange"
              subtitle={t('needsDimensions')}
            />
          </>
        )}
      </div>

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchProducts')}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>

      <Card variant="glass" className="overflow-hidden">
        <Table
          headers={[
            { key: 'productId', label: t('productId'), sortable: true },
            { key: 'productName', label: t('productName'), sortable: true },
            { key: 'dimensions', label: t('dimensions') },
            { key: 'weight', label: t('weight'), sortable: true },
            { key: 'rotatable', label: t('rotatable') },
            { key: 'fragile', label: t('fragile') },
            { key: 'status', label: t('status') },
          ]}
          data={filteredProducts}
          sortable={true}
          loading={loading}
          emptyMessage={t('noData')}
          renderRow={(product) => {
            const dim = product.dimensions;
            const hasDimensions = !!dim;

            return (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{product.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-semibold">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  {hasDimensions ? (
                    <Badge variant="primary">
                      {parseFloat(dim.width || 0).toFixed(0)} × {parseFloat(dim.depth || 0).toFixed(0)} × {parseFloat(dim.height || 0).toFixed(0)} {t('cm')}
                    </Badge>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-500">{t('nA')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  {hasDimensions && dim.weight ? (
                    <span>{parseFloat(dim.weight).toFixed(2)} kg</span>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-500">{t('nA')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  {hasDimensions ? (
                    <Badge variant={dim.rotatable !== false ? 'success' : 'error'} size="sm">
                      {dim.rotatable !== false ? t('yes') : t('no')}
                    </Badge>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-500">{t('nA')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                  {hasDimensions ? (
                    <Badge variant={dim.fragile === true ? 'warning' : 'default'} size="sm">
                      {dim.fragile === true ? t('yes') : t('no')}
                    </Badge>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-500">{t('nA')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {hasDimensions ? (
                    <Badge variant="success" size="sm">
                      {t('dimensionsSet')}
                    </Badge>
                  ) : (
                    <Badge variant="error" size="sm">
                      {t('dimensionsMissing')}
                    </Badge>
                  )}
                </td>
              </>
            );
          }}
          actions={(product) => (
            <div className="flex gap-2">
              {product.dimensions ? (
                <>
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}>
                    {t('editDimensions')}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product)}>
                    {t('delete')}
                  </Button>
                </>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => handleCreate(product)}>
                  {t('addDimensions')}
                </Button>
              )}
            </div>
          )}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct?.dimensions ? t('editDimensions') : t('addDimensions')}
        size="lg"
      >
        {editingProduct && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('product')}</p>
            <p className="font-semibold text-gray-900 dark:text-white">{editingProduct.name}</p>
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-4">
            <Input
              label={t('width')}
              type="number"
              step="0.01"
              min="0.01"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              required
            />
            <Input
              label={t('depth')}
              type="number"
              step="0.01"
              min="0.01"
              value={formData.depth}
              onChange={(e) => setFormData({ ...formData, depth: e.target.value })}
              required
            />
            <Input
              label={t('height')}
              type="number"
              step="0.01"
              min="0.01"
              value={formData.height}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              required
            />
          </div>
          <Input
            label={t('weight')}
            type="number"
            step="0.01"
            min="0"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            placeholder={t('optional')}
          />
          <div className="flex items-center gap-4 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.rotatable}
                onChange={(e) => setFormData({ ...formData, rotatable: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('rotatable')}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.fragile}
                onChange={(e) => setFormData({ ...formData, fragile: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('fragile')}</span>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? t('saving') : editingProduct?.dimensions ? t('update') : t('create')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => {
              setIsModalOpen(false);
              setEditingProduct(null);
            }}>
              {t('cancel')}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDimensionToDelete(null);
        }}
        onConfirm={handleDelete}
        title={t('deleteDimensions')}
        message={t('deleteDimensionsMessage').replace('{name}', dimensionToDelete?.name || '')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </div>
  );
};

export default ProductDimensions;

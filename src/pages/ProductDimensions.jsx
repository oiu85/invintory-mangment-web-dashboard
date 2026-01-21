import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { getAllProductDimensions, getProductDimensions, createProductDimensions, updateProductDimensions, deleteProductDimensions } from '../api/roomApi';
import Table from '../components/Table';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Input from '../components/Input';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import { Ruler, Package, AlertTriangle, CheckCircle2 } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSpinner fullScreen />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-sm min-h-screen relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{t('pageTitleProductDimensions')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('pageDescriptionProductDimensions')}</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card
          title={t('totalProducts')}
          value={totalProducts}
          icon={Package}
          color="blue"
          subtitle={t('allProducts')}
        />
        <Card
          title={t('dimensionsSet')}
          value={withDimensions}
          icon={CheckCircle2}
          color="green"
          subtitle={t('withDimensions')}
        />
        <Card
          title={t('dimensionsMissing')}
          value={withoutDimensions}
          icon={AlertTriangle}
          color="orange"
          subtitle={t('needsDimensions')}
        />
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchProducts')}
          className="max-w-md"
        />
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <Table
          headers={[t('productId'), t('productName'), t('dimensions'), t('weight'), t('rotatable'), t('fragile'), t('status')]}
          data={filteredProducts}
          renderRow={(product) => {
            const dim = product.dimensions;
            const hasDimensions = !!dim;

            return (
              <>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{product.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {hasDimensions ? (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                      {parseFloat(dim.width || 0).toFixed(0)} × {parseFloat(dim.depth || 0).toFixed(0)} × {parseFloat(dim.height || 0).toFixed(0)} cm
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">{t('nA')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {hasDimensions && dim.weight ? (
                    <span>{parseFloat(dim.weight).toFixed(2)} kg</span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">{t('nA')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {hasDimensions ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      dim.rotatable !== false
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'
                    }`}>
                      {dim.rotatable !== false ? t('yes') : t('no')}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">{t('nA')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                  {hasDimensions ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      dim.fragile === true
                        ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}>
                      {dim.fragile === true ? t('yes') : t('no')}
                    </span>
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500">{t('nA')}</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {hasDimensions ? (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                      {t('dimensionsSet')}
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300">
                      {t('dimensionsMissing')}
                    </span>
                  )}
                </td>
              </>
            );
          }}
          actions={(product) => (
            <div className="flex gap-2">
              {product.dimensions ? (
                <>
                  <Button variant="secondary" onClick={() => handleEdit(product)}>
                    {t('editDimensions')}
                  </Button>
                  <Button variant="danger" onClick={() => handleDeleteClick(product)}>
                    {t('delete')}
                  </Button>
                </>
              ) : (
                <Button onClick={() => handleCreate(product)}>
                  {t('addDimensions')}
                </Button>
              )}
            </div>
          )}
        />
      </div>

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

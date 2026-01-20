import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Input from '../components/Input';
import Select from '../components/Select';
import Textarea from '../components/Textarea';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const Products = () => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
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
  }, []);

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
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{t('pageTitleProducts')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('pageDescriptionProducts')}</p>
        </div>
        <Button onClick={handleCreate}>{t('addProduct')}</Button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchProducts')}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Table
          headers={[t('id'), t('image'), t('name'), t('price'), t('category'), t('warehouseStock'), t('driverStock'), t('totalSold'), t('description')]}
          data={filteredProducts}
          renderRow={(product) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{product.id}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                    <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">{product.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="font-semibold text-green-600 dark:text-green-400">${product.price}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                  {product.category?.name || t('nA')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  (product.warehouse_quantity || 0) < 10 
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300' 
                    : (product.warehouse_quantity || 0) < 50 
                    ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300' 
                    : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                }`}>
                  {product.warehouse_quantity || 0} {t('units')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 rounded-full text-xs font-medium">
                  {product.total_driver_stock || 0} {t('units')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-full text-xs font-medium">
                  {product.total_sold || 0} {t('units')}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">{product.description || t('nA')}</td>
            </>
          )}
          actions={(product) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => handleEdit(product)}>
                {t('edit')}
              </Button>
              <Button variant="danger" onClick={() => handleDeleteClick(product)}>
                {t('delete')}
              </Button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? t('editProduct') : t('createProduct')}
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          {formData.image && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('imagePreview')}</label>
              <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
            </div>
          )}
          <Input
            label={t('productName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label={t('productPrice')}
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
          <Select
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
            label={t('productDescription')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <Input
            label={t('productImage')}
            type="url"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://example.com/image.jpg"
          />
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? t('saving') : editingProduct ? t('update') : t('create')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
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

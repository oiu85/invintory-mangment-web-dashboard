import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/Table';
import Modal from '../components/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import Button from '../components/Button';
import SearchInput from '../components/SearchInput';
import LoadingSpinner from '../components/LoadingSpinner';
import { useLanguage } from '../context/LanguageContext';

const Categories = () => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get('/categories');
      setCategories(response.data);
      setFilteredCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      showToast(t('errorLoadingCategories'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    if (formData.description) {
      formDataToSend.append('description', formData.description);
    }

    try {
      if (editingCategory) {
        await axiosClient.put(`/categories/${editingCategory.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast(t('categoryUpdated'), 'success');
      } else {
        await axiosClient.post('/categories', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showToast(t('categoryCreated'), 'success');
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      showToast(error.response?.data?.message || t('errorSavingCategory'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await axiosClient.delete(`/categories/${categoryToDelete.id}`);
      showToast(t('categoryDeleted'), 'success');
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast(t('errorDeletingCategory'), 'error');
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
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">{t('pageTitleCategories')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('pageDescriptionCategories')}</p>
        </div>
        <Button onClick={handleCreate}>{t('addCategory')}</Button>
      </div>

      <div className="mb-4">
        <SearchInput
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t('searchCategories')}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <Table
          headers={[t('id'), t('name'), t('description'), t('productsCount'), t('totalValue'), t('created')]}
          data={filteredCategories}
          renderRow={(category) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{category.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-semibold">{category.name}</td>
              <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs">{category.description || t('nA')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                  {category.product_count || 0} {t('products')}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ${parseFloat(category.total_value || 0).toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                {new Date(category.created_at).toLocaleDateString()}
              </td>
            </>
          )}
          actions={(category) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => handleEdit(category)}>
                {t('edit')}
              </Button>
              <Button variant="danger" onClick={() => handleDeleteClick(category)}>
                {t('delete')}
              </Button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? t('editCategory') : t('createCategory')}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label={t('categoryName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            label={t('categoryDescription')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? t('saving') : editingCategory ? t('update') : t('create')}
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
          setCategoryToDelete(null);
        }}
        onConfirm={handleDelete}
        title={t('deleteCategory')}
        message={t('deleteCategoryMessage').replace('{name}', categoryToDelete?.name || '')}
        confirmText={t('delete')}
        cancelText={t('cancel')}
        variant="danger"
      />
    </div>
  );
};

export default Categories;

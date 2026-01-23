import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import ConfirmModal from '../components/ConfirmModal';
import Input from '../components/ui/Input';
import Textarea from '../components/Textarea';
import Button from '../components/ui/Button';
import Skeleton from '../components/ui/Skeleton';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import PageHeader from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { Search, Tag } from 'lucide-react';

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

  return (
    <div className="min-h-screen">
      <PageHeader
        title={t('pageTitleCategories')}
        subtitle={t('pageDescriptionCategories')}
        actions={
          <Button onClick={handleCreate} icon={Tag} iconPosition="left">
            {t('addCategory')}
          </Button>
        }
      />

      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('searchCategories')}
            className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
          />
        </div>
      </div>

      <Card variant="glass" className="overflow-hidden">
        <Table
          headers={[
            { key: 'id', label: t('id'), sortable: true },
            { key: 'name', label: t('name'), sortable: true },
            { key: 'description', label: t('description') },
            { key: 'productsCount', label: t('productsCount'), sortable: true },
            { key: 'totalValue', label: t('totalValue'), sortable: true },
            { key: 'created', label: t('created'), sortable: true },
          ]}
          data={filteredCategories}
          sortable={true}
          loading={loading}
          emptyMessage={t('noData')}
          renderRow={(category) => (
            <>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-neutral-100">{category.id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100 font-semibold">{category.name}</td>
              <td className="px-6 py-4 text-sm text-neutral-900 dark:text-neutral-100 max-w-xs">{category.description || t('nA')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <Badge variant="primary">{category.product_count || 0} {t('products')}</Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                <span className="font-semibold text-success-600 dark:text-success-400">
                  ${parseFloat(category.total_value || 0).toFixed(2)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900 dark:text-neutral-100">
                {new Date(category.created_at).toLocaleDateString()}
              </td>
            </>
          )}
          actions={(category) => (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                {t('edit')}
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(category)}>
                {t('delete')}
              </Button>
            </div>
          )}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? t('editCategory') : t('createCategory')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="category-name"
            label={t('categoryName')}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Textarea
            id="category-description"
            label={t('categoryDescription')}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
          <div className="flex gap-2 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <Button type="submit" loading={submitting} className="flex-1">
              {editingCategory ? t('update') : t('create')}
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

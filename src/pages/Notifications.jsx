import { useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import { useToast } from '../context/ToastContext';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PageHeader from '../components/layout/PageHeader';
import { useLanguage } from '../context/LanguageContext';
import { Send, Users, User, Loader2 } from 'lucide-react';

const Notifications = () => {
  const { showToast } = useToast();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';
  const [drivers, setDrivers] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [sending, setSending] = useState(false);

  // Individual notification form
  const [individualForm, setIndividualForm] = useState({
    driver_id: '',
    title: '',
    body: '',
    data: '',
  });

  // Bulk notification form
  const [bulkForm, setBulkForm] = useState({
    title: '',
    body: '',
    data: '',
  });

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoadingDrivers(true);
      const response = await axiosClient.get('/admin/drivers');
      setDrivers(response.data || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      showToast(t('errorLoadingDrivers') || 'Error loading drivers', 'error');
    } finally {
      setLoadingDrivers(false);
    }
  };

  const handleIndividualSubmit = async (e) => {
    e.preventDefault();

    if (!individualForm.driver_id) {
      showToast(t('pleaseSelectDriver') || 'Please select a driver', 'error');
      return;
    }

    if (!individualForm.title.trim() || !individualForm.body.trim()) {
      showToast(t('titleAndBodyRequired') || 'Title and body are required', 'error');
      return;
    }

    setSending(true);
    try {
      let data = {};
      if (individualForm.data.trim()) {
        try {
          data = JSON.parse(individualForm.data);
        } catch (parseError) {
          showToast(t('invalidJsonData') || 'Invalid JSON data', 'error');
          setSending(false);
          return;
        }
      }

      const payload = {
        title: individualForm.title.trim(),
        body: individualForm.body.trim(),
      };

      // Only include data if it's not empty
      if (Object.keys(data).length > 0) {
        payload.data = data;
      }

      const response = await axiosClient.post(
        `/admin/notifications/send-to-driver/${parseInt(individualForm.driver_id, 10)}`,
        payload
      );

      if (response.data?.success) {
        showToast(
          response.data?.message || t('notificationSentSuccessfully') || 'Notification sent successfully',
          'success'
        );
        // Reset form
        setIndividualForm({
          driver_id: '',
          title: '',
          body: '',
          data: '',
        });
      } else {
        showToast(
          response.data?.message || t('errorSendingNotification') || 'Error sending notification',
          'error'
        );
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        t('errorSendingNotification') ||
        'Error sending notification';
      showToast(errorMessage, 'error');
    } finally {
      setSending(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();

    if (!bulkForm.title.trim() || !bulkForm.body.trim()) {
      showToast(t('titleAndBodyRequired') || 'Title and body are required', 'error');
      return;
    }

    const confirmMessage =
      t('confirmSendBulkNotification') ||
      `Are you sure you want to send this notification to all ${drivers.length} drivers?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setSending(true);
    try {
      let data = {};
      if (bulkForm.data.trim()) {
        try {
          data = JSON.parse(bulkForm.data);
        } catch (parseError) {
          showToast(t('invalidJsonData') || 'Invalid JSON data', 'error');
          setSending(false);
          return;
        }
      }

      const payload = {
        title: bulkForm.title.trim(),
        body: bulkForm.body.trim(),
      };

      // Only include data if it's not empty
      if (Object.keys(data).length > 0) {
        payload.data = data;
      }

      const response = await axiosClient.post('/admin/notifications/send-to-all-drivers', payload);

      if (response.data?.success) {
        showToast(
          response.data?.message || t('notificationSentSuccessfully') || 'Notification sent successfully',
          'success'
        );
        // Reset form
        setBulkForm({
          title: '',
          body: '',
          data: '',
        });
      } else {
        showToast(
          response.data?.message || t('errorSendingNotification') || 'Error sending notification',
          'error'
        );
      }
    } catch (error) {
      console.error('Error sending bulk notification:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        t('errorSendingNotification') ||
        'Error sending notification';
      showToast(errorMessage, 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`min-h-screen ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHeader
        title={t('notifications') || 'Notifications'}
        subtitle={t('sendNotificationsToDrivers') || 'Send notifications to drivers'}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Notification Form */}
        <Card variant="glass">
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="bg-primary-100 dark:bg-primary-900/20 p-2 rounded-lg">
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {t('sendToIndividualDriver') || 'Send to Individual Driver'}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t('sendNotificationToSpecificDriver') || 'Send a notification to a specific driver'}
                </p>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleIndividualSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('driver') || 'Driver'} <span className="text-error-500">*</span>
                </label>
                {loadingDrivers ? (
                  <div className="px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800 animate-pulse">
                    {t('loading') || 'Loading drivers...'}
                  </div>
                ) : (
                  <Select
                    value={individualForm.driver_id}
                    onChange={(e) =>
                      setIndividualForm({ ...individualForm, driver_id: e.target.value })
                    }
                    options={[
                      { value: '', label: t('selectDriver') || 'Select a driver' },
                      ...drivers.map((driver) => ({
                        value: driver.id.toString(),
                        label: `${driver.name} (${driver.email})`,
                      })),
                    ]}
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('title') || 'Title'} <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  value={individualForm.title}
                  onChange={(e) =>
                    setIndividualForm({ ...individualForm, title: e.target.value })
                  }
                  placeholder={t('notificationTitle') || 'Notification title'}
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('message') || 'Message'} <span className="text-error-500">*</span>
                </label>
                <textarea
                  value={individualForm.body}
                  onChange={(e) =>
                    setIndividualForm({ ...individualForm, body: e.target.value })
                  }
                  placeholder={t('notificationMessage') || 'Notification message'}
                  required
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('additionalData') || 'Additional Data (JSON)'} <span className="text-xs text-neutral-500">({t('optional') || 'Optional'})</span>
                </label>
                <textarea
                  value={individualForm.data}
                  onChange={(e) =>
                    setIndividualForm({ ...individualForm, data: e.target.value })
                  }
                  placeholder='{"key": "value"}'
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                icon={sending ? Loader2 : Send}
                iconPosition="left"
                disabled={sending || loadingDrivers}
                className="w-full"
              >
                {sending
                  ? t('sending') || 'Sending...'
                  : t('sendNotification') || 'Send Notification'}
              </Button>
            </form>
          </Card.Body>
        </Card>

        {/* Bulk Notification Form */}
        <Card variant="glass">
          <Card.Header>
            <div className="flex items-center gap-3">
              <div className="bg-secondary-100 dark:bg-secondary-900/20 p-2 rounded-lg">
                <Users className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  {t('sendToAllDrivers') || 'Send to All Drivers'}
                </h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {t('sendNotificationToAllDrivers') || `Send a notification to all ${drivers.length} drivers`}
                </p>
              </div>
            </div>
          </Card.Header>
          <Card.Body>
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('title') || 'Title'} <span className="text-error-500">*</span>
                </label>
                <Input
                  type="text"
                  value={bulkForm.title}
                  onChange={(e) => setBulkForm({ ...bulkForm, title: e.target.value })}
                  placeholder={t('notificationTitle') || 'Notification title'}
                  required
                  maxLength={255}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('message') || 'Message'} <span className="text-error-500">*</span>
                </label>
                <textarea
                  value={bulkForm.body}
                  onChange={(e) => setBulkForm({ ...bulkForm, body: e.target.value })}
                  placeholder={t('notificationMessage') || 'Notification message'}
                  required
                  maxLength={1000}
                  rows={4}
                  className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  {t('additionalData') || 'Additional Data (JSON)'} <span className="text-xs text-neutral-500">({t('optional') || 'Optional'})</span>
                </label>
                <textarea
                  value={bulkForm.data}
                  onChange={(e) => setBulkForm({ ...bulkForm, data: e.target.value })}
                  placeholder='{"key": "value"}'
                  rows={3}
                  className="w-full px-4 py-2 border border-neutral-200 dark:border-neutral-700 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-mono text-sm"
                />
              </div>

              <Button
                type="submit"
                variant="secondary"
                icon={sending ? Loader2 : Users}
                iconPosition="left"
                disabled={sending || drivers.length === 0}
                className="w-full"
              >
                {sending
                  ? t('sending') || 'Sending...'
                  : t('sendToAllDrivers') || `Send to All ${drivers.length} Drivers`}
              </Button>
            </form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Notifications;

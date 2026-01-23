import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Lock, Mail, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const isRTL = language === 'ar';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || t('loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-neutral-50 to-secondary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)] dark:bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent)]" />
      <Card variant="elevated" className="w-full max-w-md p-8 relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-4 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">{t('inventorySystem')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400">{t('signInToAccount')}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label={t('emailAddress')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={Mail}
            iconPosition="left"
            placeholder="admin@inventory.com"
            required
          />
          <Input
            id="password"
            label={t('password')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={Lock}
            iconPosition="left"
            placeholder={t('enterPassword')}
            required
          />
          {error && (
            <div className="p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg" role="alert">
              <p className="text-error-600 dark:text-error-400 text-sm">{error}</p>
            </div>
          )}
          <Button type="submit" loading={loading} className="w-full" size="lg">
            {t('signIn')}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {t('defaultCredentials')}
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;

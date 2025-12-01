import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import fixora_logo from '../../assets/fixora-logo.svg';
import styles from './Login.module.css';
import { initializeDummyUser } from '../../utils/dummyData';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Email: '',
    Password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.Email.trim()) {
      newErrors.Email = 'البريد الإلكتروني مطلوب';
    }
    if (!formData.Password) {
      newErrors.Password = 'كلمة المرور مطلوبة';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await authAPI.login(formData.Email, formData.Password);
      if (response.accessToken && response.refreshToken) {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
      }
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      // Redirect based on user type
      const userType = response.user?.UserType || response.user?.userType;
      if (userType === 'worker') {
        navigate('/worker/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل تسجيل الدخول. حاول مرة أخرى.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['login-container']}>
      <div className={styles['login-card']}>
        <div className={styles['login-header']}>
          <div className={styles['logo']}>
            <Link to="/" tabIndex={-1} style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <div className={styles['logo-icon']}><img src={fixora_logo} alt='fixora logo' /></div>
              <h1>فيكسورا</h1>
            </Link>
          </div>
          <h2>تسجيل الدخول</h2>
          <p>ادخل إلى حسابك للاستفادة من خدماتنا</p>
        </div>
        <form onSubmit={handleSubmit} className={styles['login-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="Email">البريد الإلكتروني *</label>
            <input
              type="email"
              id="Email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              className={errors.Email ? styles['error'] : ''}
              placeholder="example@email.com"
              autoComplete="username"
            />
            {errors.Email && <span className={styles['error-message']}>{errors.Email}</span>}
          </div>
          <div className={styles['form-group']}>
            <label htmlFor="Password">كلمة المرور *</label>
            <input
              type="password"
              id="Password"
              name="Password"
              value={formData.Password}
              onChange={handleChange}
              className={errors.Password ? styles['error'] : ''}
              placeholder="كلمة المرور"
              autoComplete="current-password"
            />
            {errors.Password && <span className={styles['error-message']}>{errors.Password}</span>}
          </div>
          {errors.submit && <div className={styles['submit-error']}>{errors.submit}</div>}
          <button type="submit" className={styles['submit-button']} disabled={isLoading}>
            {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل دخول'}
          </button>
          <div className={styles['oauth-section']}>
            <button
              type="button"
              className={styles['google-button']}
              onClick={() => alert('قريباً: تسجيل الدخول بواسطة جوجل')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M43.611 20.083h-1.69V20H24v8h11.245c-1.62 4.29-5.644 7-11.245 7-6.627 0-12-5.373-12-12s5.373-12 12-12c2.734 0 5.238.938 7.217 2.488l6.111-6.11C36.017 5.592 30.307 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20c10.581 0 19.68-7.693 19.68-19.68 0-1.338-.138-2.355-.309-3.237z" /><path fill="#34A853" d="M6.306 14.691l6.571 4.82C14.29 16.174 18.76 13 24 13c2.734 0 5.238.938 7.217 2.488l6.111-6.11C36.017 5.592 30.307 3 24 3c-7.941 0-14.627 4.79-18.091 11.691z" /><path fill="#FBBC05" d="M24 44c6.095 0 11.215-2.005 14.955-5.464l-6.899-5.715C29.07 34.658 26.783 35.5 24 35.5c-5.573 0-9.582-3.698-11.156-7.056l-6.563 5.08C7.342 39.25 15.062 44 24 44z" /><path fill="#EA4335" d="M43.611 20.083h-1.69V20H24v8h11.245c-1.302 3.486-4.825 7-11.245 7-4.08 0-7.858-1.359-10.156-3.856l-6.563 5.08C10.484 42.517 16.678 46 24 46c10.581 0 19.68-7.693 19.68-19.68 0-1.338-.138-2.355-.309-3.237z" /></g></svg>
                <span>تسجيل دخول بواسطة جوجل</span>
              </span>
            </button>
            <button
              type="button"
              className={styles['facebook-button']}
              onClick={() => alert('قريباً: تسجيل الدخول بواسطة فيسبوك')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="16" fill="#1877F3" /><path d="M21.119 21.905l.62-4.057h-3.872v-2.635c0-1.111.545-2.179 2.288-2.179h1.77V9.588c-.923-.124-2.037-.235-3.099-.235-3.162 0-5.095 1.913-5.095 5.366v2.129H9.354v4.057h3.177v10.363A16.072 16.072 0 0016 32c.722 0 1.431-.048 2.122-.14V21.905h2.997z" fill="#fff" /></svg>
                <span>تسجيل دخول بواسطة فيسبوك</span>
              </span>
            </button>
          </div>
          <p className={styles['login-link']}>
            لا تملك حساباً؟ <Link to="/register">إنشاء حساب جديد</Link>
          </p>
        </form>
        {/* أزرار تسجيل دخول وهمي - احذفها قبل رفع الكود للمنتج النهائي */}
        <div style={{marginTop: "12px", display:"flex", flexDirection: "column", gap:8}}>
          <button type="button" onClick={() => {initializeDummyUser('user'); window.location.href = '/';}} className={styles.submitButton}>
            تسجيل دخول وهمي (عميل)
          </button>
          <button type="button" onClick={() => {initializeDummyUser('worker'); window.location.href = '/worker/dashboard';}} className={styles.submitButton}>
            تسجيل دخول وهمي (عامل)
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;

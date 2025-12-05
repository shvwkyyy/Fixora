import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import fixora_logo from "../../assets/fixora-logo.svg";
import styles from './Register.module.css';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    FName: '',
    LName: '',
    Email: '',
    Password: '',
    confirmPassword: '',
    Phone: '',
    City: '',
    Area: '',
    UserType: 'user',
    Specialty: '', // For workers
    HourlyRate: '', // For workers
    coordinates: [0, 0], // [longitude, latitude]
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Get user location
  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('الموقع الجغرافي غير مدعوم في متصفحك');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { longitude, latitude } = position.coords;
        setFormData((prev) => ({
          ...prev,
          coordinates: [longitude, latitude],
        }));
        setLocationError('');
        setIsLoading(false);
      },
      (error) => {
        setLocationError('فشل في الحصول على الموقع. يرجى المحاولة مرة أخرى.');
        setIsLoading(false);
      }
    );
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.FName.trim()) {
      newErrors.FName = 'الاسم الأول مطلوب';
    }

    if (!formData.LName.trim()) {
      newErrors.LName = 'اسم العائلة مطلوب';
    }

    if (!formData.Email.trim()) {
      newErrors.Email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.Email)) {
      newErrors.Email = 'البريد الإلكتروني غير صحيح';
    }

    if (!formData.Password) {
      newErrors.Password = 'كلمة المرور مطلوبة';
    } else if (formData.Password.length < 8) {
      newErrors.Password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }

    if (formData.Password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    if (!formData.Phone.trim()) {
      newErrors.Phone = 'رقم الهاتف مطلوب';
    } else if (!/^01[0-2,5]{1}[0-9]{8}$/.test(formData.Phone)) {
      newErrors.Phone = 'رقم الهاتف غير صحيح (يجب أن يكون رقم مصري)';
    }

    if (!formData.City.trim()) {
      newErrors.City = 'المدينة مطلوبة';
    }

    if (!formData.Area.trim()) {
      newErrors.Area = 'المنطقة مطلوبة';
    }

    // Validate worker-specific fields
    if (formData.UserType === 'worker') {
      if (!formData.Specialty.trim()) {
        newErrors.Specialty = 'التخصص مطلوب للصنايعيين';
      }
      if (!formData.HourlyRate || formData.HourlyRate <= 0) {
        newErrors.HourlyRate = 'سعر الساعة مطلوب ويجب أن يكون أكبر من صفر';
      }
    }

    // Location validation - currently optional as backend doesn't accept it in register
    // if (formData.coordinates[0] === 0 && formData.coordinates[1] === 0) {
    //   newErrors.location = 'يرجى تحديد موقعك الجغرافي';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    try {
      const { confirmPassword, ...submitData } = formData;

      // Note: Backend register endpoint doesn't currently accept location
      // Location will need to be updated separately or backend needs to be updated
      const { coordinates, ...registerData } = submitData;

      // Map worker-specific fields
      if (registerData.UserType === 'worker') {
        registerData.specialty = registerData.Specialty;
        registerData.hourPrice = registerData.HourlyRate;
      }

      const response = await authAPI.register(registerData);

      // Don't store tokens - user needs to login first
      // Show success message and redirect to login
      alert('تم إنشاء الحساب بنجاح! يرجى تسجيل الدخول الآن.');
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const EGYPT_GOVS = [
    'القاهرة',
    'الجيزة',
    'الإسكندرية',
    'الدقهلية',
    'البحر الأحمر',
    'البحيرة',
    'الفيوم',
    'الغربية',
    'الإسماعيلية',
    'المنوفية',
    'المنيا',
    'القليوبية',
    'الوادي الجديد',
    'السويس',
    'أسوان',
    'أسيوط',
    'بني سويف',
    'بورسعيد',
    'دمياط',
    'جنوب سيناء',
    'كفر الشيخ',
    'مطروح',
    'الأقصر',
    'قنا',
    'شمال سيناء',
    'سوهاج',
    'الشرقية',
  ];

  return (
    <div className={styles['register-container']}>
      <div className={styles['register-card']}>
        <div className={styles['register-header']}>
          <div className={styles['logo']}>
            <Link to="/" tabIndex={-1} style={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
              <div className={styles['logo-icon']}><img src={fixora_logo} alt="fixora logo" /></div>
              <h1 style={{ color: '#1e293b', margin: 0 }}>فيكسورا</h1>
            </Link>
          </div>
          <h2>إنشاء حساب جديد</h2>
          <p>انضم إلى فيكسورا واحصل على أفضل الخدمات المنزلية</p>
        </div>

        <form onSubmit={handleSubmit} className={styles['register-form']}>
          {/* User Type Selection */}
          <div className={styles['form-group']}>
            <label>نوع الحساب</label>
            <div className={styles['user-type-buttons']}>
              <button
                type="button"
                className={`${styles['type-button']} ${formData.UserType === 'user' ? styles['active'] : ''
                  }`}
                onClick={() => setFormData((prev) => ({ ...prev, UserType: 'user' }))}
              >
                عميل
              </button>
              <button
                type="button"
                className={`${styles['type-button']} ${formData.UserType === 'worker' ? styles['active'] : ''
                  }`}
                onClick={() => setFormData((prev) => ({ ...prev, UserType: 'worker' }))}
              >
                صنايعي
              </button>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className={styles['oauth-section']}>
            <button
              type="button"
              className={styles['google-button']}
              onClick={() => alert('قريباً: التسجيل بواسطة جوجل')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 48 48"><g><path fill="#4285F4" d="M43.611 20.083h-1.69V20H24v8h11.245c-1.62 4.29-5.644 7-11.245 7-6.627 0-12-5.373-12-12s5.373-12 12-12c2.734 0 5.238.938 7.217 2.488l6.111-6.11C36.017 5.592 30.307 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20c10.581 0 19.68-7.693 19.68-19.68 0-1.338-.138-2.355-.309-3.237z" /><path fill="#34A853" d="M6.306 14.691l6.571 4.82C14.29 16.174 18.76 13 24 13c2.734 0 5.238.938 7.217 2.488l6.111-6.11C36.017 5.592 30.307 3 24 3c-7.941 0-14.627 4.79-18.091 11.691z" /><path fill="#FBBC05" d="M24 44c6.095 0 11.215-2.005 14.955-5.464l-6.899-5.715C29.07 34.658 26.783 35.5 24 35.5c-5.573 0-9.582-3.698-11.156-7.056l-6.563 5.08C7.342 39.25 15.062 44 24 44z" /><path fill="#EA4335" d="M43.611 20.083h-1.69V20H24v8h11.245c-1.302 3.486-4.825 7-11.245 7-4.08 0-7.858-1.359-10.156-3.856l-6.563 5.08C10.484 42.517 16.678 46 24 46c10.581 0 19.68-7.693 19.68-19.68 0-1.338-.138-2.355-.309-3.237z" /></g></svg>
                <span>التسجيل بواسطة جوجل</span>
              </span>
            </button>
            <button
              type="button"
              className={styles['facebook-button']}
              onClick={() => alert('قريباً: التسجيل بواسطة فيسبوك')}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="16" fill="#1877F3" /><path d="M21.119 21.905l.62-4.057h-3.872v-2.635c0-1.111.545-2.179 2.288-2.179h1.77V9.588c-.923-.124-2.037-.235-3.099-.235-3.162 0-5.095 1.913-5.095 5.366v2.129H9.354v4.057h3.177v10.363A16.072 16.072 0 0016 32c.722 0 1.431-.048 2.122-.14V21.905h2.997z" fill="#fff" /></svg>
                <span>التسجيل بواسطة فيسبوك</span>
              </span>
            </button>
          </div>

          {/* Name Fields */}
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label htmlFor="FName">الاسم الأول *</label>
              <input
                type="text"
                id="FName"
                name="FName"
                value={formData.FName}
                onChange={handleChange}
                placeholder="أدخل الاسم الأول"
                className={errors.FName ? styles['error'] : ''}
              />
              {errors.FName && <span className={styles['error-message']}>{errors.FName}</span>}
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="LName">اسم العائلة *</label>
              <input
                type="text"
                id="LName"
                name="LName"
                value={formData.LName}
                onChange={handleChange}
                placeholder="أدخل اسم العائلة"
                className={errors.LName ? styles['error'] : ''}
              />
              {errors.LName && <span className={styles['error-message']}>{errors.LName}</span>}
            </div>
          </div>

          {/* Email */}
          <div className={styles['form-group']}>
            <label htmlFor="Email">البريد الإلكتروني *</label>
            <input
              type="email"
              id="Email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              placeholder="example@email.com"
              className={errors.Email ? styles['error'] : ''}
            />
            {errors.Email && <span className={styles['error-message']}>{errors.Email}</span>}
          </div>

          {/* Password Fields */}
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label htmlFor="Password">كلمة المرور *</label>
              <input
                type="password"
                id="Password"
                name="Password"
                value={formData.Password}
                onChange={handleChange}
                placeholder="8 أحرف على الأقل"
                className={errors.Password ? styles['error'] : ''}
              />
              {errors.Password && (
                <span className={styles['error-message']}>{errors.Password}</span>
              )}
            </div>

            <div className={styles['form-group']}>
              <label htmlFor="confirmPassword">تأكيد كلمة المرور *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="أعد إدخال كلمة المرور"
                className={errors.confirmPassword ? styles['error'] : ''}
              />
              {errors.confirmPassword && (
                <span className={styles['error-message']}>{errors.confirmPassword}</span>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className={styles['form-group']}>
            <label htmlFor="Phone">رقم الهاتف *</label>
            <input
              type="tel"
              id="Phone"
              name="Phone"
              value={formData.Phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              className={errors.Phone ? styles['error'] : ''}
            />
            {errors.Phone && <span className={styles['error-message']}>{errors.Phone}</span>}
          </div>

          {/* City as Dropdown */}
          <div className={styles['form-group']}>
            <label htmlFor="City">المحافظة *</label>
            <select
              id="City"
              name="City"
              value={formData.City}
              onChange={handleChange}
              className={errors.City ? styles['error'] : ''}
              required
            >
              <option value="">اختر المحافظة</option>
              {EGYPT_GOVS.map((gov) => (
                <option value={gov} key={gov}>{gov}</option>
              ))}
            </select>
            {errors.City && <span className={styles['error-message']}>{errors.City}</span>}
          </div>

          {/* Area */}
          <div className={styles['form-group']}>
            <label htmlFor="Area">المنطقة *</label>
            <input
              type="text"
              id="Area"
              name="Area"
              value={formData.Area}
              onChange={handleChange}
              placeholder="أدخل المنطقة"
              className={errors.Area ? styles['error'] : ''}
            />
            {errors.Area && <span className={styles['error-message']}>{errors.Area}</span>}
          </div>

          {/* Worker-specific fields */}
          {formData.UserType === 'worker' && (
            <>
              <div className={styles['form-group']}>
                <label htmlFor="Specialty">التخصص *</label>
                <select
                  id="Specialty"
                  name="Specialty"
                  value={formData.Specialty}
                  onChange={handleChange}
                  className={errors.Specialty ? styles['error'] : ''}
                  required
                >
                  <option value="">اختر التخصص</option>
                  <option value="سباكة">سباكة</option>
                  <option value="كهرباء">كهرباء</option>
                  <option value="تنظيف">تنظيف</option>
                  <option value="دهان">دهان</option>
                  <option value="نجارة">نجارة</option>
                  <option value="إصلاح أجهزة">إصلاح أجهزة</option>
                  <option value="بناء">بناء</option>
                  <option value="نجارة أثاث">نجارة أثاث</option>
                  <option value="سباك صحي">سباك صحي</option>
                  <option value="أخرى">أخرى</option>
                </select>
                {errors.Specialty && <span className={styles['error-message']}>{errors.Specialty}</span>}
              </div>

              <div className={styles['form-group']}>
                <label htmlFor="HourlyRate">سعر الساعة (جنيه مصري) *</label>
                <input
                  type="number"
                  id="HourlyRate"
                  name="HourlyRate"
                  value={formData.HourlyRate}
                  onChange={handleChange}
                  placeholder="أدخل سعر الساعة"
                  className={errors.HourlyRate ? styles['error'] : ''}
                  min="1"
                  required
                />
                {errors.HourlyRate && <span className={styles['error-message']}>{errors.HourlyRate}</span>}
              </div>
            </>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className={styles['submit-error']}>{errors.submit}</div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className={styles['submit-button']}
            disabled={isLoading}
          >
            {isLoading ? 'جاري التسجيل...' : 'إنشاء حساب'}
          </button>

          {/* Login Link */}
          <p className={styles['login-link']}>
            لديك حساب بالفعل؟ <Link to="/login">تسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;


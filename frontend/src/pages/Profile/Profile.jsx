import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, userAPI } from '../../utils/api';
import styles from './Profile.module.css';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', optionalPhone: '', city: '', area: '' });
  const [editMode, setEditMode] = useState(false); // Start in view mode
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await authAPI.getProfile();
        setProfile(res.user);
        setFormData({
          firstName: res.user.firstName || '',
          lastName: res.user.lastName || '',
          phone: res.user.phone || '',
          optionalPhone: res.user.optionalPhone || '',
          city: res.user.city || '',
          area: res.user.area || '',
        });
      } catch (e) {
        // Try to load from localStorage in demo mode
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user) {
            setProfile({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              phone: user.phone || '',
              city: user.city || '',
              area: user.area || '',
            });
            setFormData({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              phone: user.phone || '',
              optionalPhone: user.optionalPhone || '',
              city: user.city || '',
              area: user.area || '',
            });
          } else {
            setError('لم يتم تحميل الملف الشخصي.');
          }
        } catch {
          setError('لم يتم تحميل الملف الشخصي.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      // Update via API
      const response = await userAPI.updateMe(formData);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
        setProfile(response.user);
        // Trigger event to update header
        window.dispatchEvent(new Event('localStorageUpdated'));
      }
      setEditMode(false);
      // Show success message
      alert('تم حفظ التعديلات بنجاح!');
    } catch (err) {
      console.error('Update profile error:', err);
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'فشل حفظ التعديلات، حاول مرة أخرى.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original profile data
    if (profile) {
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        optionalPhone: profile.optionalPhone || '',
        city: profile.city || '',
        area: profile.area || '',
      });
    }
    setEditMode(false);
    setError('');
  };

  const handleLogout = async () => {
    await authAPI.logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className={styles['profile-container']}>
        <div className={styles['profile-card']}>جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className={styles['profile-container']}>
      <div className={styles['profile-card']}>
        <div className={styles['profile-header']}>
          <h2>الملف الشخصي</h2>
          <p>راجع وعدل بياناتك الشخصية</p>
        </div>
        <form className={styles['profile-form']} onSubmit={handleSave}>
          <div className={styles['form-group']}>
            <label>الاسم الأول</label>
            {editMode ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            ) : (
              <p className={styles['profile-text']}>{profile.firstName}</p>
            )}
          </div>
          <div className={styles['form-group']}>
            <label>اسم العائلة</label>
            {editMode ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            ) : (
              <p className={styles['profile-text']}>{profile.lastName}</p>
            )}
          </div>
          <div className={styles['form-group']}>
            <label>البريد الإلكتروني</label>
            <p className={styles['profile-text']} style={{ color: '#64748b', fontStyle: 'italic' }}>
              {profile.email || 'غير متوفر'}
            </p>
            <small style={{ color: '#94a3b8', fontSize: '0.85rem' }}>البريد الإلكتروني غير قابل للتعديل</small>
          </div>
          <div className={styles['form-group']}>
            <label>رقم الهاتف</label>
            {editMode ? (
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
              />
            ) : (
              <p className={styles['profile-text']}>{profile.phone}</p>
            )}
          </div>
          <div className={styles['form-group']}>
            <label>رقم هاتف إضافي (اختياري)</label>
            {editMode ? (
              <input
                type="text"
                name="optionalPhone"
                value={formData.optionalPhone}
                onChange={handleChange}
                placeholder="01XXXXXXXXX"
              />
            ) : (
              <p className={styles['profile-text']}>{profile.optionalPhone || 'غير متوفر'}</p>
            )}
          </div>
          <div className={styles['form-group']}>
            <label>المدينة</label>
            {editMode ? (
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            ) : (
              <p className={styles['profile-text']}>{profile.city}</p>
            )}
          </div>
          <div className={styles['form-group']}>
            <label>المنطقة</label>
            {editMode ? (
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
              />
            ) : (
              <p className={styles['profile-text']}>{profile.area}</p>
            )}
          </div>
          {error && <div className={styles['error-message']}>{error}</div>}
          <div className={styles['profile-actions']}>
            {editMode ? (
              <>
                <button className={styles['save-button']} type="submit" disabled={saving}>
                  {saving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
                <button 
                  className={styles['cancel-button']} 
                  type="button" 
                  onClick={handleCancel}
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontSize: '1rem',
                    fontWeight: '500',
                    marginLeft: '10px'
                  }}
                >
                  إلغاء
                </button>
              </>
            ) : (
              <button className={styles['save-button']} type="button" onClick={() => setEditMode(true)}>
                تعديل
              </button>
            )}
            {!editMode && (
              <button className={styles['logout-button']} type="button" onClick={handleLogout}>
                تسجيل الخروج
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;

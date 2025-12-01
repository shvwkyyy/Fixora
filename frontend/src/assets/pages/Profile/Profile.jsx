import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import styles from './Profile.module.css';

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '', city: '', area: '' });
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
      // Update localStorage for dummy data persistence
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const updatedUser = { ...storedUser, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setProfile((prev) => ({ ...prev, ...formData }));
      setEditMode(false);
    } catch (err) {
      setError('فشل حفظ التعديلات، حاول مرة أخرى.');
    } finally {
      setSaving(false);
    }
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
            <label>رقم الهاتف</label>
            {editMode ? (
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            ) : (
              <p className={styles['profile-text']}>{profile.phone}</p>
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
              <button className={styles['save-button']} type="submit" disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
            ) : (
              <button className={styles['save-button']} type="button" onClick={() => setEditMode(true)}>
                تعديل
              </button>
            )}
            <button className={styles['logout-button']} type="button" onClick={handleLogout}>
              تسجيل الخروج
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;

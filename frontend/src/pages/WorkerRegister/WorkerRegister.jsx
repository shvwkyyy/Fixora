import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './WorkerRegister.module.css';

const SPECIALTIES = ['سباكة', 'كهرباء', 'تنظيف', 'دهان', 'نجارة', 'إصلاح أجهزة', 'بناء', 'نجارة أثاث', 'سباك صحي', 'أخرى'];

function WorkerRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    specialty: '',
    hourlyRate: '',
    portfolio: [], // { file, url }
    nationalIdFront: null,
    nationalIdBack: null,
    idSelfie: null,
    facebook: '',
    tiktok: '',
    linkedin: '',
  });
  const [preview, setPreview] = useState({ portfolio: [] });
  const [status, setStatus] = useState('لم يتم التحقق بعد');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Handle file and photo uploads
  const handlePortfolioChange = (e) => {
    const files = Array.from(e.target.files);
    setForm(prev => ({ ...prev, portfolio: files }));
    setPreview(prev => ({ ...prev, portfolio: files.map(file => URL.createObjectURL(file)) }));
  };
  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setForm(prev => ({ ...prev, [name]: files[0] }));
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    // TODO: connect to backend
    setTimeout(() => {
      setStatus('قيد المراجعة');
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className={styles['worker-register-container']}>
      <div className={styles['worker-register-card']}>
        <div className={styles['worker-register-header']}>
          <h2>تسجيل صنايعي جديد</h2>
          <p>املأ بيانات تخصصك وارفع المستندات لإكمال التسجيل</p>
        </div>
        <form onSubmit={handleSubmit} className={styles['worker-register-form']}>
          <div className={styles['form-group']}>
            <label>التخصص *</label>
            <select
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">اختر تخصصك</option>
              {SPECIALTIES.map(spec => (
                <option value={spec} key={spec}>{spec}</option>
              ))}
            </select>
          </div>
          <div className={styles['form-group']}>
            <label>سعر الساعة (جنيه مصري) *</label>
            <input
              type="number"
              name="hourlyRate"
              value={form.hourlyRate}
              onChange={handleChange}
              required
              className={styles.input}
              min={1}
            />
          </div>
          <div className={styles['form-group']}>
            <label>معرض الأعمال (صور مع وصف مختصر) *</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePortfolioChange}
              className={styles['file-upload']}
            />
            {preview.portfolio.length > 0 && (
              <div className={styles['upload-preview']}>
                {preview.portfolio.map((url, i) => (
                  <img src={url} key={i} alt={`عمل-${i + 1}`} />
                ))}
              </div>
            )}
          </div>
          <div className={styles['form-group']}>
            <label>الرقم القومي (أمامي)</label>
            <input
              type="file"
              name="nationalIdFront"
              accept="image/*"
              onChange={handleFileChange}
              className={styles['file-upload']}
            />
          </div>
          <div className={styles['form-group']}>
            <label>الرقم القومي (خلفي)</label>
            <input
              type="file"
              name="nationalIdBack"
              accept="image/*"
              onChange={handleFileChange}
              className={styles['file-upload']}
            />
          </div>
          <div className={styles['form-group']}>
            <label>صورة سيلفي مع الهوية</label>
            <input
              type="file"
              name="idSelfie"
              accept="image/*"
              onChange={handleFileChange}
              className={styles['file-upload']}
            />
          </div>
          <div className={styles['form-group']}>
            <label>روابط السوشيال ميديا</label>
            <div className={styles['socials-row']}>
              <input
                type="text"
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                placeholder="Facebook"
                className={styles.input}
              />
              <input
                type="text"
                name="tiktok"
                value={form.tiktok}
                onChange={handleChange}
                placeholder="TikTok"
                className={styles.input}
              />
              <input
                type="text"
                name="linkedin"
                value={form.linkedin}
                onChange={handleChange}
                placeholder="LinkedIn"
                className={styles.input}
              />
            </div>
          </div>
          <div className={styles['verification-status']}>حالة التحقق: {status}</div>
          {error && <div className={styles['error-message']}>{error}</div>}
          <button 
            className={styles['submit-button']}
            disabled={submitting}
            type="submit"
          >
            {submitting ? 'جاري إرسال الطلب...' : 'إرسال الطلب'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default WorkerRegister;

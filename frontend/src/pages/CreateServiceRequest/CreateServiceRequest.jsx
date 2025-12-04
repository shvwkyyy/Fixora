import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { serviceRequestAPI } from '../../utils/api';
import styles from './CreateServiceRequest.module.css';

function CreateServiceRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    problemDescription: '',
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
    if (!formData.problemDescription.trim()) {
      newErrors.problemDescription = 'وصف المشكلة مطلوب';
    } else if (formData.problemDescription.trim().length < 10) {
      newErrors.problemDescription = 'وصف المشكلة يجب أن يكون 10 أحرف على الأقل';
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
      const response = await serviceRequestAPI.create(formData.problemDescription);
      if (response.ok && response.request) {
        alert('تم إنشاء طلب الخدمة بنجاح!');
        navigate('/jobs');
      } else {
        setErrors({ submit: 'فشل إنشاء الطلب. يرجى المحاولة مرة أخرى.' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'حدث خطأ أثناء إنشاء الطلب. يرجى المحاولة مرة أخرى.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['create-request-container']}>
      <div className={styles['create-request-card']}>
        <div className={styles['create-request-header']}>
          <h2>إنشاء طلب خدمة جديد</h2>
          <p>اكتب وصفاً مفصلاً للمشكلة التي تحتاج إلى حلها</p>
        </div>

        <form onSubmit={handleSubmit} className={styles['create-request-form']}>
          <div className={styles['form-group']}>
            <label htmlFor="problemDescription">وصف المشكلة *</label>
            <textarea
              id="problemDescription"
              name="problemDescription"
              value={formData.problemDescription}
              onChange={handleChange}
              className={errors.problemDescription ? styles['error'] : ''}
              placeholder="مثال: أحتاج إلى سباكة لإصلاح تسريب في الحمام. التسريب موجود تحت الحوض..."
              rows={8}
              required
            />
            {errors.problemDescription && (
              <span className={styles['error-message']}>{errors.problemDescription}</span>
            )}
            <small className={styles['help-text']}>
              كلما كان الوصف أكثر تفصيلاً، كلما كان من السهل على الصنايعي فهم المشكلة ومساعدتك
            </small>
          </div>

          {errors.submit && (
            <div className={styles['submit-error']}>{errors.submit}</div>
          )}

          <div className={styles['form-actions']}>
            <button
              type="button"
              className={styles['cancel-button']}
              onClick={() => navigate('/jobs')}
              disabled={isLoading}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={styles['submit-button']}
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء الطلب'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateServiceRequest;


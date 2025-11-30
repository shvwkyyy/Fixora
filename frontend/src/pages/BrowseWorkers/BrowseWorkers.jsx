import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workerAPI } from '../../utils/api';
import { getDummyData } from '../../utils/dummyData';
import styles from './BrowseWorkers.module.css';

const SPECIALTIES = ['سباكة', 'كهرباء', 'تنظيف', 'دهان', 'نجارة', 'إصلاح أجهزة', 'بناء', 'نجارة أثاث', 'سباك صحي', 'أخرى'];
const SORT_OPTIONS = [
  { value: 'rating', label: 'التقييم (الأعلى أولاً)' },
  { value: 'price-low', label: 'السعر (الأقل أولاً)' },
  { value: 'price-high', label: 'السعر (الأعلى أولاً)' },
  { value: 'distance', label: 'المسافة (الأقرب أولاً)' },
  { value: 'newest', label: 'الأحدث' },
];

function BrowseWorkers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workers, setWorkers] = useState([]);
  const [filteredWorkers, setFilteredWorkers] = useState([]);
  
  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [userLocation, setUserLocation] = useState(null);
  
  // Cities from Egyptian governorates
  const EGYPT_CITIES = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'بورسعيد', 'دمياط',
    'أسوان', 'الأقصر', 'سوهاج', 'أسيوط', 'الإسماعيلية', 'السويس',
    'طنطا', 'بنها', 'شبين الكوم', 'كفر الشيخ', 'شبين القناطر',
    'الفيوم', 'بني سويف', 'الزقازيق', 'المحلة الكبرى', 'العريش',
    'قنا', 'دمنهور', 'مرسى مطروح', 'المنوفية', 'الغردقة', 'شرم الشيخ',
  ];

  useEffect(() => {
    loadWorkers();
    getUserLocation();
  }, [selectedSpecialty, selectedCity]);

  useEffect(() => {
    applyFilters();
  }, [workers, selectedSpecialty, selectedCity, selectedDistance, minPrice, maxPrice, sortBy, userLocation]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Could not get user location:', error);
        }
      );
    }
  };

  const loadWorkers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        verificationStatus: 'verified', // Only show verified workers
      };
      
      if (selectedSpecialty) {
        params.specialty = selectedSpecialty;
      }
      
      if (selectedCity) {
        params.city = selectedCity;
      }

      let response;
      try {
        response = await workerAPI.listWorkers(params);
      } catch (e) {
        response = { workers: [] };
      }
      
      let workersList = response.workers || [];
      
      // Use dummy data if empty
      if (workersList.length === 0) {
        workersList = getDummyData('workers');
      }
      
      // Enrich workers with distance and rating
      const ratingMap = {
        'worker1': { rating: 4.8, reviewsCount: 24 },
        'worker2': { rating: 4.6, reviewsCount: 18 },
        'worker3': { rating: 4.9, reviewsCount: 32 },
        'worker4': { rating: 4.5, reviewsCount: 15 },
        'worker5': { rating: 4.7, reviewsCount: 21 },
      };
      
      const enrichedWorkers = workersList.map(worker => {
        let distance = null;
        if (userLocation && worker.userId?.location) {
          // Calculate distance if location data is available
          distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            worker.userId.location.latitude || 0,
            worker.userId.location.longitude || 0
          );
        }
        
        // Get rating from map or use defaults
        const workerRating = ratingMap[worker._id] || { rating: 4.5, reviewsCount: 10 };
        
        return { ...worker, distance, rating: workerRating.rating, reviewsCount: workerRating.reviewsCount };
      });

      setWorkers(enrichedWorkers);
    } catch (err) {
      setError('فشل تحميل قائمة الصنايعيين. يرجى المحاولة مرة أخرى.');
      console.error('Load workers error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula to calculate distance between two coordinates
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Distance in km
  };

  const applyFilters = () => {
    let filtered = [...workers];

    // Filter by distance
    if (selectedDistance !== 'all' && userLocation) {
      const maxDistance = parseFloat(selectedDistance);
      filtered = filtered.filter(worker => {
        if (!worker.distance) return false;
        return worker.distance <= maxDistance;
      });
    }

    // Filter by price range
    if (minPrice) {
      const min = parseFloat(minPrice);
      filtered = filtered.filter(worker => {
        return worker.hourPrice >= min;
      });
    }
    
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filtered = filtered.filter(worker => {
        return worker.hourPrice <= max;
      });
    }

    // Sort workers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'price-low':
          return (a.hourPrice || 0) - (b.hourPrice || 0);
        case 'price-high':
          return (b.hourPrice || 0) - (a.hourPrice || 0);
        case 'distance':
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    setFilteredWorkers(filtered);
  };

  const clearFilters = () => {
    setSelectedSpecialty('');
    setSelectedCity('');
    setSelectedDistance('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('rating');
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <span className={styles['rating-stars']}>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(emptyStars)}
      </span>
    );
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || 'ص';
  };

  if (loading) {
    return (
      <div className={styles['browse-workers-container']}>
        <div className={styles.loading}>جاري تحميل الصنايعيين...</div>
      </div>
    );
  }

  return (
    <div className={styles['browse-workers-container']}>
      <div className={styles['page-header']}>
        <h1>تصفح الصنايعيين</h1>
        <p>ابحث عن صنايعي محترف لاحتياجاتك</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Filters Section */}
      <div className={styles['filters-section']}>
        <div className={styles['filters-header']}>
          <h3>تصفية الصنايعيين</h3>
          {(selectedSpecialty || selectedCity || selectedDistance !== 'all' || minPrice || maxPrice) && (
            <button className={styles['clear-filters']} onClick={clearFilters}>
              مسح الفلاتر
            </button>
          )}
        </div>
        
        <div className={styles['filters-grid']}>
          <div className={styles['filter-group']}>
            <label htmlFor="specialty">التخصص</label>
            <select
              id="specialty"
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
            >
              <option value="">جميع التخصصات</option>
              {SPECIALTIES.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
          </div>

          <div className={styles['filter-group']}>
            <label htmlFor="city">المدينة</label>
            <select
              id="city"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">جميع المدن</option>
              {EGYPT_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div className={styles['filter-group']}>
            <label htmlFor="distance">المسافة</label>
            <select
              id="distance"
              value={selectedDistance}
              onChange={(e) => setSelectedDistance(e.target.value)}
              disabled={!userLocation}
            >
              <option value="all">جميع المسافات</option>
              <option value="5">أقل من 5 كم</option>
              <option value="10">أقل من 10 كم</option>
              <option value="20">أقل من 20 كم</option>
              <option value="50">أقل من 50 كم</option>
            </select>
            {!userLocation && (
              <small style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
                تفعيل الموقع الجغرافي لتصفية حسب المسافة
              </small>
            )}
          </div>

          <div className={styles['filter-group']}>
            <label>نطاق السعر (ج.م/ساعة)</label>
            <div className={styles['price-range-inputs']}>
              <input
                type="number"
                placeholder="من"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                min="0"
              />
              <span style={{ color: '#64748b' }}>إلى</span>
              <input
                type="number"
                placeholder="إلى"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>

        <div className={styles['sort-section']}>
          <label htmlFor="sort">ترتيب حسب:</label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers Section */}
      <div className={styles['workers-section']}>
        <div className={styles['workers-header']}>
          <h2>الصنايعيين المتاحين</h2>
          <span className={styles['workers-count']}>
            {filteredWorkers.length} صنايعي متاح
          </span>
        </div>

        {filteredWorkers.length === 0 ? (
          <div className={styles['empty-state']}>
            <div className={styles['empty-state-icon']}>🔍</div>
            <h3>لا يوجد صنايعيين متاحين</h3>
            <p>
              {selectedSpecialty || selectedCity || selectedDistance !== 'all' || minPrice || maxPrice
                ? 'جرب تغيير الفلاتر للعثور على المزيد من الصنايعيين'
                : 'لا يوجد صنايعيين متاحين حالياً. تحقق لاحقاً!'}
            </p>
          </div>
        ) : (
          <div className={styles['workers-grid']}>
            {filteredWorkers.map((worker) => (
              <div key={worker._id} className={styles['worker-card']}>
                <div className={styles['worker-card-header']}>
                  {worker.userId?.profilePhoto ? (
                    <img
                      src={worker.userId.profilePhoto}
                      alt={worker.userId.firstName}
                      className={styles['worker-photo']}
                    />
                  ) : (
                    <div className={styles['worker-photo-placeholder']}>
                      {getInitials(worker.userId?.firstName, worker.userId?.lastName)}
                    </div>
                  )}
                  
                  <div className={styles['worker-info']}>
                    <div className={styles['worker-name']}>
                      {worker.userId?.firstName} {worker.userId?.lastName}
                    </div>
                    <div className={styles['worker-specialty']}>
                      {worker.specialty}
                    </div>
                    <div className={styles['worker-rating']}>
                      {renderStars(worker.rating || 0)}
                      <span className={styles['rating-value']}>
                        {worker.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span className={styles['reviews-count']}>
                        ({worker.reviewsCount || 0} تقييم)
                      </span>
                    </div>
                    {worker.verificationStatus === 'verified' && (
                      <span className={`${styles['verification-badge']} ${styles.verified}`}>
                        ✓ محقق
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles['worker-details']}>
                  <div className={styles['detail-item']}>
                    <span className={styles['detail-item-icon']}>💰</span>
                    <span>{worker.hourPrice || 0} ج.م/ساعة</span>
                  </div>
                  
                  <div className={styles['detail-item']}>
                    <span className={styles['detail-item-icon']}>📍</span>
                    <span>
                      {worker.userId?.city || 'غير محدد'}
                      {worker.userId?.area && ` - ${worker.userId.area}`}
                    </span>
                  </div>
                  
                  {worker.distance !== null && (
                    <div className={styles['detail-item']}>
                      <span className={styles['detail-item-icon']}>📏</span>
                      <span>{worker.distance} كم</span>
                    </div>
                  )}
                </div>

                <div className={styles['worker-card-actions']}>
                  <button
                    className={`${styles.btn} ${styles['btn-primary']}`}
                    onClick={() => navigate(`/worker/${worker._id}`)}
                  >
                    عرض الملف الشخصي
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseWorkers;


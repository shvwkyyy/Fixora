import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { workerAPI, reviewAPI } from '../../utils/api';
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
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workers, setWorkers] = useState([]);
  
  // Filters
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistance, setSelectedDistance] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [userLocation, setUserLocation] = useState(null);
  const [minRating, setMinRating] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWorkers, setTotalWorkers] = useState(0);
  const ITEMS_PER_PAGE = 20;
  
  // Debounce refs
  const debounceTimer = useRef(null);
  const isInitialMount = useRef(true);
  
  // Debug: Log component mount
  useEffect(() => {
    console.log('BrowseWorkers component mounted');
  }, []);
  
  // Cities from Egyptian governorates
  const EGYPT_CITIES = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'بورسعيد', 'دمياط',
    'أسوان', 'الأقصر', 'سوهاج', 'أسيوط', 'الإسماعيلية', 'السويس',
    'طنطا', 'بنها', 'شبين الكوم', 'كفر الشيخ', 'شبين القناطر',
    'الفيوم', 'بني سويف', 'الزقازيق', 'المحلة الكبرى', 'العريش',
    'قنا', 'دمنهور', 'مرسى مطروح', 'المنوفية', 'الغردقة', 'شرم الشيخ',
  ];

  // Calculate distance function (defined before loadWorkers)
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
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
  }, []);

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

  const loadWorkers = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
      };
      
      // Show all workers (verified and unverified)
      // Users can see verification badge on each worker card
      
      // Check for search query in URL
      const urlParams = new URLSearchParams(location.search);
      const searchParam = urlParams.get('search');
      if (searchParam) {
        params.search = searchParam;
      }
      
      if (selectedSpecialty) {
        params.specialty = selectedSpecialty;
      }
      
      if (selectedCity) {
        params.city = selectedCity;
      }

      const response = await workerAPI.listWorkers(params);
      
      // Handle different response structures
      if (!response) {
        throw new Error('No response from server');
      }
      
      // Backend returns { ok: true, workers: [], pagination: {} }
      const workersList = response.workers || [];
      
      console.log('Workers response:', { 
        ok: response.ok, 
        workersCount: workersList.length, 
        total: response.pagination?.total,
        workers: workersList 
      });
      
      if (!Array.isArray(workersList)) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response format');
      }
      
      setTotalWorkers(response.pagination?.total || 0);
      setTotalPages(response.pagination?.pages || 1);
      
      // Enrich workers with distance and fetch ratings (with timeout to prevent hanging)
      const enrichedWorkers = await Promise.allSettled(
        workersList.map(async (worker) => {
          let distance = null;
          // Calculate distance if user location is available
          if (userLocation && worker.userId?.location) {
            distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              worker.userId.location.latitude || 0,
              worker.userId.location.longitude || 0
            );
          }
          
          // Get real ratings from backend (fetch in parallel for better performance)
          let rating = 0;
          let reviewsCount = 0;
          try {
            const reviewsResponse = await reviewAPI.getWorkerReviews(worker._id, { limit: 100 });
            if (reviewsResponse.ok && reviewsResponse.reviews) {
              const reviews = reviewsResponse.reviews;
              reviewsCount = reviews.length;
              if (reviews.length > 0) {
                const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
                rating = sum / reviews.length;
              }
            }
          } catch (err) {
            // Silently fail - workers will show 0 rating if reviews can't be loaded
            console.warn('Failed to load reviews for worker:', worker._id);
          }
          
          return { 
            ...worker, 
            distance, 
            rating: Math.round(rating * 10) / 10, // Round to 1 decimal place
            reviewsCount 
          };
        })
      );

      // Extract successful results, filter out failures
      const successfulWorkers = enrichedWorkers
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);
      
      setWorkers(successfulWorkers);
      isInitialMount.current = false;
    } catch (err) {
      console.error('Load workers error:', err);
      const errorMessage = err.response?.data?.error || err.message || 'فشل تحميل قائمة الصنايعيين. يرجى المحاولة مرة أخرى.';
      setError(errorMessage);
      setWorkers([]);
      setTotalWorkers(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [selectedSpecialty, selectedCity, userLocation, selectedDistance, calculateDistance, location.search]);

  // Get user location on mount
  useEffect(() => {
    getUserLocation();
    
    // Check if a specialty was passed from homepage
    if (location.state?.specialty) {
      setSelectedSpecialty(location.state.specialty);
    }
    
    // Check for search query in URL
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      // Try to match search query with specialty
      const matchedSpecialty = SPECIALTIES.find(spec => 
        spec.toLowerCase().includes(searchParam.toLowerCase()) || 
        searchParam.toLowerCase().includes(spec.toLowerCase())
      );
      if (matchedSpecialty) {
        setSelectedSpecialty(matchedSpecialty);
      }
    }
    
    // Initial load - only run once on mount
    if (isInitialMount.current) {
      loadWorkers(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced load workers when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      return;
    }
    
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    // Debounce API call
    debounceTimer.current = setTimeout(() => {
      loadWorkers(1);
    }, 300);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSpecialty, selectedCity, location.search]);

  // Load workers when page changes
  useEffect(() => {
    if (!isInitialMount.current) {
      loadWorkers(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Memoized filtered and sorted workers
  const filteredWorkers = useMemo(() => {
    let filtered = [...workers];

    // فلتر المسافة (only if distance filter is active)
    if (selectedDistance !== 'all' && userLocation) {
      const maxDistance = parseFloat(selectedDistance);
      filtered = filtered.filter(w => {
        if (!w.distance) {
          // Calculate distance on the fly if not already calculated
          if (w.userId?.location) {
            const dist = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              w.userId.location.latitude || 0,
              w.userId.location.longitude || 0
            );
            w.distance = dist;
            return dist <= maxDistance;
          }
          return false;
        }
        return w.distance <= maxDistance;
      });
    }
    
    // فلتر السعر
    if (minPrice) {
      filtered = filtered.filter(w => Number(w.hourPrice) >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(w => Number(w.hourPrice) <= Number(maxPrice));
    }
    
    // فلتر التقييم
    if (minRating) {
      filtered = filtered.filter(w => Number(w.rating ?? 0) >= Number(minRating));
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'price-low': return (a.hourPrice || 0) - (b.hourPrice || 0);
        case 'price-high': return (b.hourPrice || 0) - (a.hourPrice || 0);
        case 'distance':
          if (!a.distance) return 1;
          if (!b.distance) return -1;
          return a.distance - b.distance;
        case 'newest': return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        default: return 0;
      }
    });

    return filtered;
  }, [workers, selectedDistance, minPrice, maxPrice, minRating, sortBy, userLocation, calculateDistance]);

  const clearFilters = useCallback(() => {
    setSelectedSpecialty('');
    setSelectedCity('');
    setSelectedDistance('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('rating');
    setMinRating('');
    setCurrentPage(1);
  }, []);

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

  return (
    <div className={styles['browse-workers-container']}>
      <div className={styles['page-header']}>
        <h1>تصفح الصنايعيين</h1>
        <p>ابحث عن صنايعي محترف لاحتياجاتك</p>
      </div>

      {loading && workers.length === 0 && (
        <div className={styles.loading} style={{ 
          padding: '40px', 
          textAlign: 'center', 
          fontSize: '1.1rem',
          color: '#64748b'
        }}>
          جاري تحميل الصنايعيين...
        </div>
      )}

      {error && (
        <div className={styles.error} style={{ 
          padding: '16px', 
          margin: '20px', 
          background: '#fee2e2', 
          color: '#dc2626', 
          borderRadius: '8px',
          textAlign: 'right'
        }}>
          {error}
          <button 
            onClick={() => loadWorkers(currentPage)}
            style={{
              marginTop: '10px',
              padding: '8px 16px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Filters Section */}
      <div className={styles['filters-section']}>
        <div className={styles['filters-header']}>
          <h3>تصفية الصنايعيين</h3>
          {(selectedSpecialty || selectedCity || selectedDistance !== 'all' || minPrice || maxPrice || minRating) && (
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

          {/* فلتر التقييم (أصفر) */}
          <div className={styles['filter-group']}>
            <label htmlFor="rating">التقييم</label>
            <select
              id="rating"
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
            >
              <option value="">كل التقييمات</option>
              <option value="5">5 نجوم</option>
              <option value="4.5">4.5+</option>
              <option value="4">4+</option>
              <option value="3.5">3.5+</option>
              <option value="3">3+</option>
            </select>
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
            {totalWorkers > 0 ? `${totalWorkers} صنايعي متاح` : `${filteredWorkers.length} صنايعي متاح`}
          </span>
        </div>

        {filteredWorkers.length === 0 ? (
          <div className={styles['empty-state']}>
            <div className={styles['empty-state-icon']}>🔍</div>
            <h3>لا يوجد صنايعيين متاحين</h3>
            <p>
              {selectedSpecialty || selectedCity || selectedDistance !== 'all' || minPrice || maxPrice || minRating
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
                        {worker.rating ? worker.rating.toFixed(1) : '0.0'}
                      </span>
                      {worker.reviewsCount > 0 && (
                        <span className={styles['reviews-count']}>
                          ({worker.reviewsCount} تقييم)
                        </span>
                      )}
                      {worker.reviewsCount === 0 && (
                        <span className={styles['reviews-count']} style={{ color: '#94a3b8' }}>
                          (لا توجد تقييمات)
                        </span>
                      )}
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
                  
                  <div className={styles['detail-item']}>
                    <span className={styles['detail-item-icon']}>📞</span>
                    <span>{worker.userId?.phone || '-'}</span>
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
                  <button
                    className={`${styles.btn} ${styles['btn-secondary']}`}
                    onClick={() => {
                      const workerUserId = worker.userId?._id || worker.userId?.id;
                      const workerName = `${worker.userId?.firstName || ''} ${worker.userId?.lastName || ''}`.trim();
                      navigate(`/messages?userId=${workerUserId}&userName=${encodeURIComponent(workerName)}`);
                    }}
                  >
                    مراسلة
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className={styles['pagination']}>
            <button
              className={styles['pagination-btn']}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1 || loading}
            >
              السابق
            </button>
            <span className={styles['pagination-info']}>
              صفحة {currentPage} من {totalPages}
            </span>
            <button
              className={styles['pagination-btn']}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || loading}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseWorkers;


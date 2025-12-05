import fixora_logo from '../../assets/fixora-logo.svg';
import search_glass from '../../assets/search.svg';
import styles from './Header.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import notification_icon from '../../assets/notification.svg';
import { FaUserCircle, FaBell, FaEnvelope } from 'react-icons/fa';

function Header() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userName, setUserName] = useState('');
    const [userType, setUserType] = useState('');
    const [unreadNotifications, setUnreadNotifications] = useState(3); // Dummy notification count
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchInput, setShowSearchInput] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userToken = localStorage.getItem('accessToken');
        if (userToken) {
            setIsLoggedIn(true);
            try {
                const userObj = JSON.parse(localStorage.getItem('user'));
                if (userObj) {
                    // Show full name if available, otherwise first name, otherwise email
                    if (userObj.firstName && userObj.lastName) {
                        const fullName = `${userObj.firstName} ${userObj.lastName}`;
                        setUserName(fullName.length > 20 ? userObj.firstName : fullName);
                    } else if (userObj.firstName) {
                        setUserName(userObj.firstName);
                    } else if (userObj.email) {
                        setUserName(userObj.email.split('@')[0]);
                    } else {
                        setUserName('حسابي');
                    }
                    // Set user type
                    setUserType(userObj.userType || 'user');
                } else {
                    setUserName('حسابي');
                    setUserType('user');
                }
            } catch { 
                setUserName('حسابي');
                setUserType('user');
            }
        } else {
            setIsLoggedIn(false);
            setUserName('');
            setUserType('');
        }
    }, []);

    // Listen for storage changes to update user name when profile is updated
    useEffect(() => {
        const handleStorageChange = () => {
            const userToken = localStorage.getItem('accessToken');
            if (userToken) {
                try {
                    const userObj = JSON.parse(localStorage.getItem('user'));
                    if (userObj) {
                        if (userObj.firstName && userObj.lastName) {
                            const fullName = `${userObj.firstName} ${userObj.lastName}`;
                            setUserName(fullName.length > 20 ? userObj.firstName : fullName);
                        } else if (userObj.firstName) {
                            setUserName(userObj.firstName);
                        } else if (userObj.email) {
                            setUserName(userObj.email.split('@')[0]);
                        } else {
                            setUserName('حسابي');
                        }
                    }
                } catch {
                    setUserName('حسابي');
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        // Also listen for custom event when localStorage is updated in same tab
        window.addEventListener('localStorageUpdated', handleStorageChange);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('localStorageUpdated', handleStorageChange);
        };
    }, []);

    // CLOSE DROPDOWN ON CLICK OUTSIDE
    useEffect(() => {
        function handleClickOutside(e) {
            if (!e.target.closest('.profile-dropdown-btn') && !e.target.closest('.profile-dropdown-menu')) {
                setShowProfileDropdown(false);
            }
        }
        if (showProfileDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showProfileDropdown]);

    // LOGOUT FN (نسخ من ملف البروفايل)
    const handleLogout = async () => {
        if (window.authAPI && window.authAPI.logout) {
            await window.authAPI.logout();
        }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Search functionality
    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Navigate to workers page with search query
            navigate(`/workers?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setShowSearchInput(false);
        }
    };

    const handleSearchClick = () => {
        if (showSearchInput && searchQuery.trim()) {
            handleSearch(new Event('submit'));
        } else {
            setShowSearchInput(true);
        }
    };

    // Handle navigation to homepage sections
    const handleNavLink = (hash) => {
        if (window.location.pathname === '/') {
            // Already on homepage, just scroll
            const element = document.getElementById(hash);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            // Navigate to homepage with hash
            navigate(`/#${hash}`);
        }
    };

    return (
        <>
            <nav className={styles["header-nav"]}>
                <div className={styles["nav-content"]}>
                    {isLoggedIn ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                            <button
                                className={styles["icon-btn"]}
                                title="الإشعارات"
                                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                            >
                                <FaBell size={24} />
                                {unreadNotifications > 0 && (
                                    <span className={styles["notification-badge"]}>{unreadNotifications}</span>
                                )}
                            </button>
                            {showNotificationsDropdown && (
                                <div className={styles["notifications-dropdown"]}>
                                    <p style={{ padding: '10px', textAlign: 'center', color: '#666' }}>
                                        لا توجد إشعارات حالياً.
                                    </p>
                                </div>
                            )}
                            <button 
                                className={styles["icon-btn"]}
                                title="الرسائل"
                                onClick={() => navigate('/messages')}
                            >
                                <FaEnvelope size={24} />
                            </button>
                            {/* البروفايل DROPDOWN */}
                            <div style={{position:'relative', display:'inline-block'}}>
                                <button
                                    type="button"
                                    className="profile-dropdown-btn"
                                    style={{background:'transparent', border:'none', display:'flex',alignItems:'center', cursor:'pointer'}}
                                    onClick={() => setShowProfileDropdown(v => !v)}
                                >
                                    <FaUserCircle size={28} style={{verticalAlign:'middle'}}/>
                                    <span style={{marginInlineStart:4}}>{userName || "حسابي"}</span>
                                </button>
                                {showProfileDropdown && (
                                    <div className="profile-dropdown-menu" style={{position:'absolute',top:'110%',left:0,background:'#fff',boxShadow:'0 2px 8px rgba(0,0,0,0.08)',borderRadius:10,minWidth:140, zIndex:100}}>
                                        {userType === 'worker' && (
                                            <>
                                                <button
                                                    style={{padding:'10px 16px',width:'100%',background:'none',border:'none',textAlign:'right',cursor:'pointer',fontSize:'1rem'}}
                                                    onClick={()=>{setShowProfileDropdown(false); navigate('/worker/dashboard')}}>
                                                    لوحة تحكم الصنايعي
                                                </button>
                                                <div style={{height:1,background:'#e0e0e0', margin:'2px 0'}}/>
                                            </>
                                        )}
                                        <button
                                            style={{padding:'10px 16px',width:'100%',background:'none',border:'none',textAlign:'right',cursor:'pointer',fontSize:'1rem'}}
                                            onClick={()=>{setShowProfileDropdown(false); navigate('/profile')}}>
                                            الملف الشخصي
                                        </button>
                                        <div style={{height:1,background:'#e0e0e0', margin:'2px 0'}}/>
                                        <button
                                            style={{padding:'10px 16px',width:'100%',background:'none',border:'none',textAlign:'right',color:'#dc2626',cursor:'pointer',fontSize:'1rem'}}
                                            onClick={handleLogout}
                                        >
                                            تسجيل الخروج
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link to="/register" className={styles["sign-up-btn"]}>إنشاء حساب</Link>
                            <Link to="/login" className={styles["login-btn"]}>تسجيل دخول</Link>
                        </>
                    )}
                    {showSearchInput ? (
                        <form 
                            onSubmit={handleSearch}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث عن صنايعي أو تخصص..."
                                autoFocus
                                style={{
                                    padding: '8px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    minWidth: '200px',
                                    direction: 'rtl'
                                }}
                                onBlur={(e) => {
                                    // Delay hiding to allow form submission
                                    setTimeout(() => {
                                        if (!e.target.value.trim()) {
                                            setShowSearchInput(false);
                                        }
                                    }, 200);
                                }}
                            />
                            <button 
                                type="submit"
                                className={styles["search-btn"]}
                                style={{ margin: 0 }}
                            >
                                <img src={search_glass} alt="search glass" />
                            </button>
                        </form>
                    ) : (
                        <button 
                            className={styles["search-btn"]}
                            onClick={handleSearchClick}
                        >
                            <span>ابحث عن عمال</span>
                            <img src={search_glass} alt="search glass" />
                        </button>
                    )}
                </div>
                <div className={styles["nav-content-links"]}>
                    <a 
                        href="/#about-us"
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavLink('about-us');
                        }}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        من نحن
                    </a>
                    <a 
                        href="/#how-works"
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavLink('how-works');
                        }}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        كيف يعمل
                    </a>
                    <a 
                        href="/#services"
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavLink('services');
                        }}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        الخدمات
                    </a>
                    <Link to="/">
                        <img src={fixora_logo} alt="fixora logo" />
                    </Link>
                </div>
            </nav>
            <header>
                <section className={styles["header-section"]}>
                    <h1>خدمات منزلية سهلة وبسيطة</h1>
                    <p className={styles["header-paragraph"]}>تواصل مع محترفين موثوقين لجميع احتياجات الخدمات المنزلية. من السباكة إلى الدهان، التنظيف إلى الإصلاحات - نحن</p>
                    <p className={styles["header-paragraph"]}>. هنا لخدمتك</p>
                </section>
            </header>
        </>
    );
}

export default Header
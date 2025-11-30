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
    const [unreadNotifications, setUnreadNotifications] = useState(3); // Dummy notification count
    const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const userToken = localStorage.getItem('accessToken');
        if (userToken) {
            setIsLoggedIn(true);
            try {
                const userObj = JSON.parse(localStorage.getItem('user'));
                if (userObj && userObj.firstName) {
                    setUserName(userObj.firstName);
                }
            } catch { setUserName(''); }
        } else {
            setIsLoggedIn(false);
            setUserName('');
        }
    }, []);

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
                            <Link to="/profile" className={styles["profile-link"]} title="الملف الشخصي">
                                <div style={{position: 'relative', display: 'inline-block'}}>
                                    <FaUserCircle size={28} style={{ verticalAlign: 'middle'}}/>
                                </div>
                                <span>{userName && userName.length <= 8 ? userName : "حسابي"}</span>
                            </Link>
                        </div>
                    ) : (
                        <>
                            <Link to="/register" className={styles["sign-up-btn"]}>إنشاء حساب</Link>
                            <Link to="/login" className={styles["login-btn"]}>تسجيل دخول</Link>
                        </>
                    )}
                    <button className={styles["search-btn"]}>
                        <span>ابحث عن عمال</span>
                        <img src={search_glass} alt="search glass" />
                    </button>
                </div>
                <div className={styles["nav-content-links"]}>
                    <a href="#about-us">من نحن</a>
                    <a href="#how-works">كيف يعمل</a>
                    <a href="#services">الخدمات</a>
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
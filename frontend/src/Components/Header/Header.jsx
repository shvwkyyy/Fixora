import fixora_logo from '../../assets/fixora-logo.svg';
import search_glass from '../../assets/search.svg';
import styles from './Header.module.css';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <>
            <nav className={styles["header-nav"]}>
                <div className={styles["nav-content"]}>
                    <Link to="/register" className={styles["sign-up-btn"]}>إنشاء حساب</Link>
                    <Link to="/login" className={styles["login-btn"]}>تسجيل دخول</Link>
                    <button className={styles["search-btn"]}>
                        <span >ابحث عن عمال</span>
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
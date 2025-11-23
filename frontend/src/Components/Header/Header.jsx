import fixora_logo from '../../assets/fixora-logo.svg';
import search_glass from '../../assets/search.svg';
import styles from './Header.module.css';

function Header() {
    return (
        <header>
            <nav className={styles["header-nav"]}>
                <div className={styles["nav-content"]}>
                    <button className={styles["sign-up-btn"]}>
                        كن عاملاً
                    </button>
                    <button className={styles["login-btn"]}>
                        تسجيل الدخول
                    </button>
                    <button className={styles["search-btn"]}>
                        <span >ابحث عن عمال</span>
                        <img src={search_glass} alt="search glass" />
                    </button>
                </div>
                <div className={styles["nav-content-links"]}>
                    <a href="#">من نحن</a>
                    <a href="#">كيف يعمل</a>
                    <a href="#">الخدمات</a>
                    <img src={fixora_logo} alt="fixora logo" />
                </div>
            </nav>
        </header>
    );
}

export default Header
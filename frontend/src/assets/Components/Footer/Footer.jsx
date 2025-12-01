import styles from "./Footer.module.css";

function Footer() {
    const date = new Date();
    let year = date.getFullYear();

    return (
        <footer className={styles["footer"]}>
            <div className={styles["footer-container"]}>
                <div className={styles["footer-logo"]}>
                    <div className={styles["logo-container"]}>
                        <div className={styles["logo-icon"]}>ف</div>
                        <span className={styles["logo-text"]}>فيكسورا</span>
                    </div>
                    <p className={styles["tagline"]}>منصتك الموثوقة للخدمات المنزلية</p>
                </div>
                <div className={styles["footer-element"]}>
                    <h6>الخدمات</h6>
                    <p>السباكة</p>
                    <p>التنظيف</p>
                    <p>الدهان</p>
                    <p>الكهرباء</p>
                </div>
                <div className={styles["footer-element"]}>
                    <h6>الشركة</h6>
                    <p>من نحن</p>
                    <p>كيف يعمل</p>
                    <p>الوظائف</p>
                    <p>اتصل بنا</p>
                </div>
                <div className={styles["footer-element"]}>
                    <h6>الدعم</h6>
                    <p>مركز المساعدة</p>
                    <p>الأمان</p>
                    <p>سياسة الخصوصية</p>
                    <p>شروط الخدمة</p>
                </div>
            </div>
            <div className={styles["footer-divider"]}></div>
            <div className={styles["footer-copyright"]}>
                <p>© {year} فيكسورا. جميع الحقوق محفوظة.</p>
            </div>
        </footer>
    );
}

export default Footer;
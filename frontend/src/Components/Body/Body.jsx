import styles from './Body.module.css';

function Body() {
    return (
        <main>
            <section className={styles["introduction-section"]}>
                <h2 className={styles["services-header"]}>خدماتنا</h2>
                <p className={styles["services-paragraph"]}>ابحث عن محترفين موثوقين لأي خدمة منزلية تحتاجها</p>
            </section>
        </main>
    );
}

export default Body;
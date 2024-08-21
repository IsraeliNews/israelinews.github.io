let allArticles = [];
let currentCategory = 'ראשי';
let displayedArticles = 0;
const articlesPerLoad = 10;

const categoryImages = {
    'ראשי': 'https://images.unsplash.com/photo-1495020689067-958852a7765e',
    'מדיני': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620',
    'כלכלה': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3',
    'ספורט': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211',
    'תרבות': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
    'ביטחון': 'https://images.unsplash.com/photo-1542451542907-6cf80ff362d6'
};

async function getNews() {
    try {
        const response = await fetch('news_data.json');
        const data = await response.json();
        allArticles = data.articles;
        displayLastUpdated(data.timestamp);
        setupCategoryLinks();
        await displayNews(allArticles, true);
        setupBreakingNews();
        setupWeatherWidget();
        setupArchive();
        applyStoredTheme();
    } catch (error) {
        console.error('Error fetching news:', error);
        displayError();
    }
}

async function displayNews(articles, reset = false, searchTerm = '') {
    const newsContainer = document.getElementById('news-container');
    if (reset) {
        newsContainer.innerHTML = '';
        displayedArticles = 0;
    }

    let filteredArticles = articles;
    if (currentCategory !== 'ראשי') {
        filteredArticles = articles.filter(article => article.category === currentCategory);

        // Add category image
        const categoryImageContainer = document.createElement('div');
        categoryImageContainer.classList.add('category-image-container');
        categoryImageContainer.innerHTML = `
            <div class="category-image" style="background-image: url(${categoryImages[currentCategory]})"></div>
            <h2 class="category-title">${currentCategory}</h2>
        `;
        newsContainer.appendChild(categoryImageContainer);
    }

    if (searchTerm) {
        filteredArticles = filteredArticles.filter(article =>
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    const articlesToShow = filteredArticles.slice(displayedArticles, displayedArticles + articlesPerLoad);
    displayedArticles += articlesToShow.length;

    if (currentCategory === 'ראשי') {
        const categories = ['מדיני', 'כלכלה', 'ספורט', 'תרבות', 'ביטחון'];
        for (const category of categories) {
            const categoryArticles = articles.filter(article => article.category === category).slice(0, 3);
            const categorySection = document.createElement('div');
            categorySection.classList.add('category-section');
            categorySection.innerHTML = `
                <h2 class="category-header">
                    ${category}
                    <a href="#" class="category-link" data-category="${category}">לכל הכתבות</a>
                </h2>
                <div class="category-image" style="background-image: url(${categoryImages[category]})"></div>
                <div class="category-articles"></div>
            `;
            const categoryArticlesContainer = categorySection.querySelector('.category-articles');
            categoryArticles.forEach(article => {
                categoryArticlesContainer.appendChild(createArticleElement(article));
            });
            newsContainer.appendChild(categorySection);
        }
    } else {
        articlesToShow.forEach(article => {
            newsContainer.appendChild(createArticleElement(article));
        });
    }

    if (displayedArticles < filteredArticles.length) {
        showLoadMoreButton();
    } else {
        hideLoadMoreButton();
    }

    setupCategoryLinks();

    // If no articles are found after filtering
    if (filteredArticles.length === 0) {
        const noResultsMessage = document.createElement('p');
        noResultsMessage.classList.add('no-results');
        noResultsMessage.textContent = 'לא נמצאו תוצאות מתאימות לחיפוש שלך.';
        newsContainer.appendChild(noResultsMessage);
    }
}

function createArticleElement(article) {
    const newsItem = document.createElement('div');
    newsItem.classList.add('news-item');

    const date = new Date(article.publishedAt);
    const formattedDate = date.toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });

    newsItem.innerHTML = `
        <div class="news-image" style="background-image: url(${article.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'})"></div>
        <div class="news-content">
            <h3>${article.title}</h3>
            <div class="news-meta">
                <span class="news-source"><i class="fas fa-newspaper"></i> ${article.source}</span>
                <span class="news-date"><i class="far fa-calendar-alt"></i> ${formattedDate}</span>
                <span class="news-readtime"><i class="far fa-clock"></i> ${article.readTime} דקות קריאה</span>
                <span class="news-category"><i class="fas fa-tag"></i> ${article.category}</span>
            </div>
            <p class="news-description">${article.description || 'תיאור לא זמין'}</p>
            <p class="news-author"><i class="fas fa-user"></i> מאת: ${article.author}</p>
            <div class="news-link">
                <a href="${article.url}" target="_blank"><i class="fas fa-external-link-alt"></i> קרא עוד</a>
            </div>
            <div class="social-share">
                <a href="#" onclick="shareOnFacebook('${article.url}')"><i class="fab fa-facebook"></i></a>
                <a href="#" onclick="shareOnTwitter('${article.url}', '${article.title}')"><i class="fab fa-twitter"></i></a>
                <a href="#" onclick="shareOnWhatsApp('${article.url}', '${article.title}')"><i class="fab fa-whatsapp"></i></a>
            </div>
            <button class="bookmark-btn" data-url="${article.url}">
                <i class="far fa-bookmark"></i>
            </button>
        </div>
    `;

    newsItem.querySelector('.bookmark-btn').addEventListener('click', toggleBookmark);

    return newsItem;
}

function setupCategoryLinks() {
    const links = document.querySelectorAll('nav ul li a, .category-link');
    const categoryTitle = document.getElementById('category-title');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const navLinks = document.querySelectorAll('nav ul li a');
            navLinks.forEach(l => l.classList.remove('active'));
            currentCategory = link.getAttribute('data-category');
            navLinks.forEach(l => {
                if (l.getAttribute('data-category') === currentCategory) {
                    l.classList.add('active');
                }
            });
            categoryTitle.textContent = currentCategory === 'ראשי' ? 'כותרות ראשיות' : `חדשות ${currentCategory}`;
            displayNews(allArticles, true);
        });
    });
}

function setupArchive() {
    const archiveLink = document.createElement('a');
    archiveLink.href = '#';
    archiveLink.textContent = 'ארכיון';
    archiveLink.classList.add('archive-link');
    archiveLink.addEventListener('click', (e) => {
        e.preventDefault();
        showArchive();
    });
    document.querySelector('nav ul').appendChild(document.createElement('li').appendChild(archiveLink));
}

function showArchive() {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '<h2>ארכיון חדשות אחרונות</h2>';

    const monthsMap = {};
    allArticles.forEach(article => {
        const date = new Date(article.publishedAt);
        const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        if (!monthsMap[monthYear]) {
            monthsMap[monthYear] = [];
        }
        monthsMap[monthYear].push(article);
    });

    const sortedMonths = Object.keys(monthsMap).sort((a, b) => b.localeCompare(a));

    sortedMonths.forEach(month => {
        const monthSection = document.createElement('div');
        monthSection.classList.add('archive-month');
        const [year, monthNum] = month.split('-');
        const monthName = new Date(year, monthNum - 1).toLocaleString('he-IL', { month: 'long' });
        monthSection.innerHTML = `<h3>${monthName} ${year}</h3>`;

        const articleList = document.createElement('ul');
        monthsMap[month].forEach(article => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <a href="${article.url}" target="_blank">${article.title}</a>
                <span class="archive-date">${new Date(article.publishedAt).toLocaleDateString('he-IL')}</span>
            `;
            articleList.appendChild(listItem);
        });

        monthSection.appendChild(articleList);
        newsContainer.appendChild(monthSection);
    });
}

function showLoadMoreButton() {
    let loadMoreButton = document.getElementById('load-more');
    if (!loadMoreButton) {
        loadMoreButton = document.createElement('button');
        loadMoreButton.id = 'load-more';
        loadMoreButton.innerHTML = '<i class="fas fa-plus"></i> טען עוד כתבות';
        loadMoreButton.addEventListener('click', () => displayNews(allArticles));
        document.getElementById('news-container').after(loadMoreButton);
    }
    loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
    const loadMoreButton = document.getElementById('load-more');
    if (loadMoreButton) {
        loadMoreButton.style.display = 'none';
    }
}

function displayLastUpdated(timestamp) {
    const lastUpdatedElement = document.getElementById('last-updated');
    const date = new Date(timestamp);
    const formattedDate = date.toLocaleString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });
    lastUpdatedElement.innerHTML = `<i class="fas fa-sync-alt"></i> עודכן לאחרונה: ${formattedDate}`;
}

function setupBreakingNews() {
    const ticker = document.getElementById('ticker');
    const breakingNews = allArticles.slice(0, 5).map(article =>
        `<a href="${article.url}" target="_blank"><i class="fas fa-bolt"></i> ${article.title}</a>`
    ).join('');
    ticker.innerHTML = breakingNews;
}

function setupWeatherWidget() {
    const weatherWidget = document.getElementById('weather-widget');
    weatherWidget.innerHTML = `
        <h3><i class="fas fa-cloud-sun"></i> מזג אוויר</h3>
        <a href="https://israelweather.github.io/" target="_blank">צפה בתחזית מזג האוויר</a>
    `;
}

function toggleBookmark(event) {
    const button = event.target.closest('.bookmark-btn');
    const url = button.getAttribute('data-url');
    let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

    if (bookmarks.includes(url)) {
        bookmarks = bookmarks.filter(bookmark => bookmark !== url);
        button.innerHTML = '<i class="far fa-bookmark"></i>';
    } else {
        bookmarks.push(url);
        button.innerHTML = '<i class="fas fa-bookmark"></i>';
    }

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
}

function shareOnFacebook(url) {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}

function shareOnTwitter(url, title) {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
}

function shareOnWhatsApp(url, title) {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`, '_blank');
}

function applyStoredTheme() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('night-mode', isDarkMode);
    document.getElementById('night-mode-toggle').innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function displayError() {
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = '<p class="error-message"><i class="fas fa-exclamation-triangle"></i> אירעה שגיאה בטעינת החדשות. אנא רענן את הדף ונסה שוב.</p>';
}

document.getElementById('night-mode-toggle').addEventListener('click', function() {
    document.body.classList.toggle('night-mode');
    const isDarkMode = document.body.classList.contains('night-mode');
    this.innerHTML = isDarkMode ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    localStorage.setItem('darkMode', isDarkMode);
});

document.getElementById('search-button').addEventListener('click', function() {
    const searchTerm = document.getElementById('search-input').value;
    displayNews(allArticles, true, searchTerm);
});

window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        const loadMoreButton = document.getElementById('load-more');
        if (loadMoreButton && loadMoreButton.style.display !== 'none') {
            loadMoreButton.click();
        }
    }
});

getNews();
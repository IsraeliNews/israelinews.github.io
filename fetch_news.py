import requests
import json
from datetime import datetime, timedelta
import random

API_KEY = 'b6c7fd8ed0714e1aa7c8261731ebdec3'
EVERYTHING_URL = 'https://newsapi.org/v2/everything'


def fetch_news():
    categories = {
        'general': {
            'hebrew': 'ראשי',
            'keywords': ['חדשות', 'ישראל', 'עדכון', 'אקטואליה']
        },
        'politics': {
            'hebrew': 'מדיני',
            'keywords': ['פוליטיקה', 'כנסת', 'ממשלה', 'מדיניות', 'בחירות']
        },
        'business': {
            'hebrew': 'כלכלה',
            'keywords': ['כלכלה', 'עסקים', 'שוק ההון', 'בורסה', 'כספים']
        },
        'sports': {
            'hebrew': 'ספורט',
            'keywords': ['ספורט', 'כדורגל', 'כדורסל', 'אולימפיאדה', 'טניס']
        },
        'entertainment': {
            'hebrew': 'תרבות',
            'keywords': ['בידור', 'קולנוע', 'מוזיקה', 'תיאטרון', 'אמנות']
        },
        'security': {
            'hebrew': 'ביטחון',
            'keywords': ['ביטחון', 'צה"ל', 'טרור', 'מלחמה', 'צבא', 'משטרה', 'פיגוע']
        }
    }

    all_articles = []

    for category, data in categories.items():
        articles = fetch_category_news(data['keywords'], data['hebrew'])
        all_articles.extend(articles)
        print(f"Fetched {len(articles)} articles for category: {data['hebrew']}")

    news_data = {
        'articles': all_articles,
        'timestamp': datetime.now().isoformat()
    }

    with open('news_data.json', 'w', encoding='utf-8') as f:
        json.dump(news_data, f, ensure_ascii=False, indent=2)


def fetch_category_news(keywords, hebrew_category):
    articles = []
    for keyword in keywords:
        params = {
            'q': keyword,
            'language': 'he',
            'apiKey': API_KEY,
            'sortBy': 'publishedAt',
            'from': (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'),
            'pageSize': 20
        }
        response = requests.get(EVERYTHING_URL, params=params)
        data = response.json()

        if 'articles' in data:
            for article in data['articles']:
                articles.append(format_article(article, hebrew_category))
        else:
            print(f"No articles found for keyword: {keyword} in category: {hebrew_category}")
            print(f"API response: {data}")

    return articles


def format_article(article, category):
    return {
        'title': article.get('title'),
        'description': article.get('description', 'תיאור לא זמין'),
        'url': article.get('url'),
        'publishedAt': article.get('publishedAt'),
        'source': article.get('source', {}).get('name'),
        'category': category,
        'imageUrl': article.get('urlToImage', 'https://via.placeholder.com/300x200?text=No+Image'),
        'readTime': random.randint(3, 10),
        'author': article.get('author', 'לא ידוע')
    }


if __name__ == "__main__":
    fetch_news()
import json
import logging
from bs4 import BeautifulSoup
import requests
import time
from typing import Dict, List, Any, Optional

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def fetch_product_reviews(
    product_id: str,
    shop_domain: str = "purelyyours-com.myshopify.com",
    max_pages: int = None,
    per_page: int = 9
) -> Optional[List[Dict[str, Any]]]:
    """
    Fetch all reviews for a specific product from Judge.me API.
    
    Args:
        product_id: The product ID to fetch reviews for
        shop_domain: The shop domain (default: purelyyours-com.myshopify.com)
        max_pages: Maximum number of pages to fetch (None for all pages)
        per_page: Number of reviews per page (max 9)
        
    Returns:
        List of review dictionaries or None if error occurs
    """
    try:
        base_url = "https://api.judge.me/reviews/reviews_for_widget"
        params = {
            "url": shop_domain,
            "shop_domain": shop_domain,
            "platform": "shopify",
            "per_page": per_page,
            "product_id": product_id,
            "sort_by": "most_helpful",
            "page": 1
        }

        headers = {
            'Referer': f'https://{shop_domain.split(".")[0]}.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': '*/*',
        }

        all_reviews = []
        page_count = 0

        logger.info(f"Starting to fetch reviews for product {product_id}")

        while True:
            if max_pages and page_count >= max_pages:
                logger.info(f"Reached maximum page limit ({max_pages})")
                break

            logger.info(f"Fetching page {params['page']}...")

            try:
                response = requests.get(base_url, headers=headers, params=params, timeout=30)
                response.raise_for_status()
                
                data = response.json()
                html_content = data.get('html', '')
                
                if not html_content:
                    logger.info("No HTML content found, ending pagination")
                    break
                
                soup = BeautifulSoup(html_content, 'lxml')
                review_blocks = soup.find_all('div', class_='jdgm-rev')

                if not review_blocks:
                    logger.info("No more review blocks found, ending pagination")
                    break

                page_reviews = []
                for block in review_blocks:
                    try:
                        # Extract rating
                        rating_elem = block.find('span', class_='jdgm-rev__rating')
                        rating = int(rating_elem.get('data-score')) if rating_elem else 0
                        
                        # Extract author
                        author_elem = block.find('span', class_='jdgm-rev__author')
                        author = author_elem.text.strip() if author_elem else "Anonymous"
                        
                        # Extract timestamp
                        timestamp_elem = block.find('span', class_='jdgm-rev__timestamp')
                        timestamp = timestamp_elem.get('data-content') if timestamp_elem else ""
                        
                        # Extract title
                        title_elem = block.find('b', class_='jdgm-rev__title')
                        title = title_elem.text.strip() if title_elem else ""
                        
                        # Extract body
                        body_elem = block.find('div', class_='jdgm-rev__body')
                        body = body_elem.text.strip() if body_elem else ""

                        review = {
                            'review_id': block.get('data-review-id'),
                            'verified_buyer': block.get('data-verified-buyer') == 'true',
                            'product_title': block.get('data-product-title'),
                            'product_url': block.get('data-product-url'),
                            'rating': rating,
                            'author': author,
                            'timestamp': timestamp,
                            'title': title,
                            'body': body
                        }
                        page_reviews.append(review)
                        
                    except Exception as e:
                        logger.warning(f"Error parsing review block: {e}")
                        continue

                all_reviews.extend(page_reviews)
                logger.info(f"Fetched {len(page_reviews)} reviews from page {params['page']}")

                params['page'] += 1
                page_count += 1
                time.sleep(0.5)  # Be kind to the API

            except requests.exceptions.RequestException as e:
                logger.error(f"API request failed on page {params['page']}: {e}")
                break
            except Exception as e:
                logger.error(f"Unexpected error on page {params['page']}: {e}")
                break

        logger.info(f"Total reviews fetched: {len(all_reviews)}")
        return all_reviews

    except Exception as e:
        logger.error(f"Failed to fetch product reviews: {e}")
        return None

def save_reviews_to_file(reviews: List[Dict[str, Any]], filename: str = "product_reviews.json") -> bool:
    """
    Save reviews to a JSON file.
    
    Args:
        reviews: List of review dictionaries
        filename: Output filename
        
    Returns:
        True if successful, False otherwise
    """
    try:
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(reviews, f, indent=2, ensure_ascii=False)
        logger.info(f"Reviews saved to {filename}")
        return True
    except Exception as e:
        logger.error(f"Failed to save reviews to file: {e}")
        return False

def get_reviews_summary(reviews: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate a summary of the reviews.
    
    Args:
        reviews: List of review dictionaries
        
    Returns:
        Dictionary containing review summary statistics
    """
    if not reviews:
        return {}

    try:
        total_reviews = len(reviews)
        ratings = [review['rating'] for review in reviews if review.get('rating')]
        
        if not ratings:
            return {"total_reviews": total_reviews, "average_rating": 0}

        average_rating = sum(ratings) / len(ratings)
        rating_distribution = {}
        
        for i in range(1, 6):
            rating_distribution[f"{i}_star"] = sum(1 for r in ratings if r == i)

        verified_buyers = sum(1 for review in reviews if review.get('verified_buyer'))

        return {
            "total_reviews": total_reviews,
            "average_rating": round(average_rating, 2),
            "rating_distribution": rating_distribution,
            "verified_buyers": verified_buyers,
            "verified_buyer_percentage": round((verified_buyers / total_reviews) * 100, 1) if total_reviews > 0 else 0
        }

    except Exception as e:
        logger.error(f"Error generating reviews summary: {e}")
        return {"total_reviews": len(reviews) if reviews else 0}

def main():
    """Main execution function for testing."""
    try:
        product_id = "7601857429694"
        reviews = fetch_product_reviews(product_id)
        
        if reviews:
            summary = get_reviews_summary(reviews)
            print(f"Reviews Summary: {json.dumps(summary, indent=2)}")
            
            # Save to file
            save_reviews_to_file(reviews, f"product_{product_id}_reviews.json")
        else:
            print("Failed to retrieve reviews")
            
    except Exception as e:
        logger.error(f"Application error: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main()

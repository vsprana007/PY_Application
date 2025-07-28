import os
import requests
import json
import logging
import re
from html import unescape
from typing import Dict, Any, Optional
from dotenv import load_dotenv, find_dotenv
from metafields import get_product_metafields
from shopify_reviews import fetch_product_reviews, get_reviews_summary
from product_collections import get_collection_names

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def clean_html_content(html_content):
    """Convert HTML content to plain text"""
    if not html_content:
        return ""
    
    # Remove HTML tags
    clean_text = re.sub(r'<[^>]+>', '', html_content)
    
    # Decode HTML entities
    clean_text = unescape(clean_text)
    
    # Clean up extra whitespace
    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
    
    return clean_text

def load_environment_variables() -> tuple[str, str]:
    """Load and validate environment variables."""
    try:
        dotenv_path = find_dotenv()
        load_dotenv(dotenv_path)
        
        token = os.getenv("PY_TOKEN")
        merchant = os.getenv("PY_MERCHANT")
        
        if not token or not merchant:
            raise ValueError("Missing PY_TOKEN or PY_MERCHANT environment variable")
        
        return token, merchant
    except Exception as e:
        logger.error(f"Error loading environment variables: {e}")
        raise

def fetch_product_data(merchant_url: str, product_id: str, token: str) -> Optional[Dict[str, Any]]:
    """
    Fetch product data from Shopify API.
    
    Args:
        merchant_url: The merchant URL (e.g., "https://shop-name.myshopify.com/admin/api/2023-07/")
        product_id: The product ID to fetch
        token: Shopify API access token
        
    Returns:
        Product data dictionary or None if error occurs
    """
    try:
        url = f"{merchant_url}products/{product_id}.json"
        headers = {
            "X-Shopify-Access-Token": token,
            "Content-Type": "application/json"
        }
        
        logger.info(f"Fetching product data for product {product_id}")
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Failed to fetch product: {response.status_code} - {response.text}")
            return None
        
        product_data = response.json()
        logger.info(f"Successfully fetched product: {product_data['product'].get('title', 'Unknown')}")
        return product_data
        
    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed: {e}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error fetching product data: {e}")
        return None

def get_complete_product_data(
    product_id: str = None,
    shop_name: str = "purelyyours-com",
    shop_domain: str = "purelyyours-com.myshopify.com",
    include_metafields: bool = True,
    include_reviews: bool = True,
    include_collections: bool = True,
    max_review_pages: int = None
) -> Optional[Dict[str, Any]]:
    """
    Get complete product data including metafields, reviews, and collections.
    
    Args:
        product_id: The product ID to fetch
        shop_name: Shop name for metafields API
        shop_domain: Full shop domain for reviews API
        include_metafields: Whether to include structured metafields
        include_reviews: Whether to include customer reviews
        include_collections: Whether to include collection names
        max_review_pages: Maximum number of review pages to fetch (None for all)
        
    Returns:
        Complete product data dictionary or None if error occurs
    """
    try:
        # Check if product_id is provided, if not return None
        if not product_id:
            logger.warning("No product ID provided. Program ending.")
            return None
        
        # Load environment variables
        token, merchant = load_environment_variables()
        
        # Fetch basic product data
        product_data = fetch_product_data(merchant, product_id, token)
        if not product_data:
            logger.error("Failed to fetch basic product data")
            return None
        
        # Convert body_html to plain text
        if 'body_html' in product_data['product']:
            product_data['product']['body_html'] = clean_html_content(product_data['product']['body_html'])
            logger.info("Converted body_html to plain text")
        
        # Add metafields if requested
        if include_metafields:
            try:
                logger.info("Fetching structured metafields...")
                metafields_data = get_product_metafields(shop_name=shop_name, product_id=product_id)
                
                if metafields_data:
                    product_data['product']['structured_metafields'] = metafields_data
                    logger.info(f"Added structured metafields with {len(metafields_data)} sections")
                else:
                    logger.warning("No metafields data retrieved")
                    product_data['product']['structured_metafields'] = {}
            except Exception as e:
                logger.error(f"Error fetching metafields: {e}")
                product_data['product']['structured_metafields'] = {}
        
        # Add reviews if requested
        if include_reviews:
            try:
                logger.info("Fetching product reviews...")
                reviews_data = fetch_product_reviews(
                    product_id=product_id, 
                    shop_domain=shop_domain,
                    max_pages=max_review_pages
                )
                
                if reviews_data:
                    product_data['product']['reviews'] = reviews_data
                    product_data['product']['reviews_summary'] = get_reviews_summary(reviews_data)
                    logger.info(f"Added {len(reviews_data)} reviews with summary")
                else:
                    logger.warning("No reviews data retrieved")
                    product_data['product']['reviews'] = []
                    product_data['product']['reviews_summary'] = {}
            except Exception as e:
                logger.error(f"Error fetching reviews: {e}")
                product_data['product']['reviews'] = []
                product_data['product']['reviews_summary'] = {}
        
        # Add collections if requested
        if include_collections:
            try:
                logger.info("Fetching product collections...")
                collection_names = get_collection_names(
                    product_id=product_id,
                    shop_domain=merchant,
                    access_token=token
                )
                
                if collection_names:
                    product_data['product']['collections'] = collection_names
                    logger.info(f"Added {len(collection_names)} collections: {', '.join(collection_names)}")
                else:
                    logger.warning("No collections data retrieved")
                    product_data['product']['collections'] = []
            except Exception as e:
                logger.error(f"Error fetching collections: {e}")
                product_data['product']['collections'] = []
        
        logger.info("Successfully compiled complete product data")
        return product_data
        
    except Exception as e:
        logger.error(f"Failed to get complete product data: {e}")
        return None

def save_product_data(product_data: Dict[str, Any], filename: str = None) -> bool:
    """
    Save product data to a JSON file.
    
    Args:
        product_data: Product data dictionary
        filename: Output filename (auto-generated if None)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        if not filename:
            product_id = product_data.get('product', {}).get('id', 'unknown')
            filename = f"product_{product_id}_complete.json"
        
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(product_data, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Product data saved to {filename}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to save product data: {e}")
        return False

def print_product_summary(product_data: Dict[str, Any]) -> None:
    """Print a summary of the product data."""
    try:
        product = product_data.get('product', {})
        
        print(f"\n{'='*50}")
        print(f"PRODUCT SUMMARY")
        print(f"{'='*50}")
        print(f"ID: {product.get('id')}")
        print(f"Title: {product.get('title')}")
        print(f"Vendor: {product.get('vendor')}")
        print(f"Product Type: {product.get('product_type')}")
        print(f"Status: {product.get('status')}")
        print(f"Variants: {len(product.get('variants', []))}")
        print(f"Images: {len(product.get('images', []))}")
        
        # Show clean description
        description = product.get('body_html', '')
        if description:
            print(f"Description: {description[:100]}...")
        
        # Collections summary
        collections = product.get('collections', [])
        if collections:
            print(f"Collections: {len(collections)}")
            for collection in collections:
                print(f"  - {collection}")
        
        # Metafields summary
        metafields = product.get('structured_metafields', {})
        if metafields:
            print(f"Metafields Sections: {len(metafields)}")
            if 'faqs' in metafields:
                print(f"  - FAQs: {len(metafields['faqs'])}")
            if 'key_benefits' in metafields:
                print(f"  - Key Benefits: {len(metafields['key_benefits'])}")
            if 'key_ingredients' in metafields:
                print(f"  - Key Ingredients: {len(metafields['key_ingredients'])}")
        
        # Reviews summary
        reviews_summary = product.get('reviews_summary', {})
        if reviews_summary:
            print(f"Reviews: {reviews_summary.get('total_reviews', 0)}")
            print(f"Average Rating: {reviews_summary.get('average_rating', 0)}")
            print(f"Verified Buyers: {reviews_summary.get('verified_buyer_percentage', 0)}%")
        
        print(f"{'='*50}\n")
        
    except Exception as e:
        logger.error(f"Error printing summary: {e}")

def main():
    """Main execution function."""
    try:
        # Get complete product data including collections
        product_data = get_complete_product_data(
            product_id="7601857429694",
            include_metafields=True,
            include_reviews=True,
            include_collections=True,
            max_review_pages=None  # Fetch all review pages
        )
        
        if product_data:
            # Print summary
            print_product_summary(product_data)
            
            # Print full JSON (optional - uncomment if needed)
            # print(json.dumps(product_data, indent=2, ensure_ascii=False))
            
            # Save to file
            save_product_data(product_data)
            
        else:
            print("Failed to retrieve complete product data")
            
    except Exception as e:
        logger.error(f"Application error: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main()


# from product import get_complete_product_data

# # Get everything
# data = get_complete_product_data()

# # Get only product + metafields (no reviews)
# data = get_complete_product_data(include_reviews=False)

# # Different product
# data = get_complete_product_data(product_id="123456789")

# # Fetch specific product with limited reviews
# product_data = get_complete_product_data(
#     product_id="7601857429694",
#     shop_name="my-shop", 
#     shop_domain="my-shop.myshopify.com",
#     include_metafields=True,
#     include_reviews=True,
#     max_review_pages=10  # Limit to 10 pages
# )
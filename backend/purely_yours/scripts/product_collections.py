import os
import requests
import json
import logging
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv, find_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

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

def get_collection_names(
    product_id: str,
    shop_domain: str = None,
    access_token: str = None
) -> Optional[List[str]]:
    """
    Get only the collection names/titles for a product.
    
    Args:
        product_id: The product ID to fetch collections for
        shop_domain: The shop domain (will load from env if None)
        access_token: The access token (will load from env if None)
        
    Returns:
        List of collection names/titles
        Returns None if error occurs
    """
    try:
        # Load environment variables if not provided
        if not shop_domain or not access_token:
            access_token, shop_domain = load_environment_variables()
        
        # Step 1: Get collection IDs that the product belongs to
        collects_url = f"{shop_domain}collects.json?product_id={product_id}"
        headers = {
            "X-Shopify-Access-Token": access_token,
            "Content-Type": "application/json"
        }
        
        logger.info(f"Fetching collections for product {product_id}")
        response = requests.get(collects_url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            logger.error(f"Failed to fetch collects: {response.status_code} - {response.text}")
            return None
        
        collects_data = response.json()
        collects = collects_data.get('collects', [])
        
        if not collects:
            logger.info("Product is not in any collections")
            return []
        
        collection_ids = [collect['collection_id'] for collect in collects]
        logger.info(f"Product belongs to {len(collection_ids)} collections")
        
        # Step 2: Fetch details for each collection
        collection_names = []
        for collection_id in collection_ids:
            try:
                collection_url = f"{shop_domain}collections/{collection_id}.json"
                collection_response = requests.get(collection_url, headers=headers, timeout=30)
                
                if collection_response.status_code == 200:
                    collection_data = collection_response.json()
                    collection = collection_data.get('collection', {})
                    
                    collection_title = collection.get('title', 'Unknown')
                    collection_names.append(collection_title)
                    logger.info(f"Fetched collection: {collection_title}")
                    
                else:
                    logger.warning(f"Failed to fetch collection {collection_id}: {collection_response.status_code}")
                    
            except Exception as e:
                logger.error(f"Error fetching collection {collection_id}: {e}")
                continue
        
        logger.info(f"Successfully fetched {len(collection_names)} collection names")
        return collection_names
        
    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed: {e}")
        return None
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {e}")
        return None
    except Exception as e:
        logger.error(f"Unexpected error fetching collections: {e}")
        return None

def main():
    """Main execution function for testing."""
    try:
        # Test with specific product ID
        PRODUCT_ID = "7601857429694"
        
        # Get collection names
        names = get_collection_names(PRODUCT_ID)
        if names:
            print("Collection Names:")
            for name in names:
                print(f"- {name}")
        else:
            print("Failed to retrieve collections or product has no collections")
            
    except Exception as e:
        logger.error(f"Application error: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
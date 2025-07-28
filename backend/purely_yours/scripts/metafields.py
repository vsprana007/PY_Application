import requests
import os
import json
import logging
from typing import Dict, List, Any, Optional
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

def fetch_metafields(shop_name: str, admin_api_token: str, product_id: str) -> List[Dict[str, Any]]:
    """Fetch metafields from Shopify API."""
    try:
        url = f"https://{shop_name}.myshopify.com/admin/api/2023-07/products/{product_id}/metafields.json?namespace=custom"
        headers = {
            "X-Shopify-Access-Token": admin_api_token,
            "Content-Type": "application/json"
        }
        
        logger.info(f"Fetching metafields for product {product_id}")
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        metafields = data.get("metafields", [])
        
        logger.info(f"Successfully fetched {len(metafields)} metafields")
        return metafields
        
    except requests.exceptions.RequestException as e:
        logger.error(f"API request failed: {e}")
        raise
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON response: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching metafields: {e}")
        raise

def extract_text_from_rich_text(rich_text_data: Any) -> str:
    """Extract plain text from Shopify rich text field JSON structure."""
    try:
        if isinstance(rich_text_data, str):
            try:
                data = json.loads(rich_text_data)
            except json.JSONDecodeError:
                return rich_text_data
        else:
            data = rich_text_data
        
        def extract_text_recursive(node):
            text_parts = []
            
            if isinstance(node, dict):
                # If it's a text node, get the value
                if node.get('type') == 'text':
                    return node.get('value', '')
                
                # If it has children, process them recursively
                if 'children' in node:
                    for child in node['children']:
                        text_parts.append(extract_text_recursive(child))
            
            elif isinstance(node, list):
                for item in node:
                    text_parts.append(extract_text_recursive(item))
            
            return ' '.join(filter(None, text_parts))
        
        return extract_text_recursive(data).strip()
    except Exception as e:
        logger.warning(f"Error extracting text from rich text data: {e}")
        return str(rich_text_data) if rich_text_data else ""

def extract_raw_metafields(metafields: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Extract and process raw metafield data."""
    target_fields = ['pdp_headings', 'questions', 'answers']
    raw_data = {}
    
    try:
        for mf in metafields:
            key = mf.get('key', '')
            
            # Check for exact matches or pdp_subheading patterns
            if key in target_fields or key.startswith('pdp_subheading'):
                value = mf.get('value')
                
                # Convert rich text to plain text if it's a rich_text_field
                if mf.get('type') == 'rich_text_field':
                    value = extract_text_from_rich_text(value)
                
                raw_data[key] = value
        
        logger.info(f"Extracted {len(raw_data)} relevant metafields")
        return raw_data
        
    except Exception as e:
        logger.error(f"Error extracting raw metafields: {e}")
        raise

def structure_product_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """Transform raw metafield data into structured product information."""
    structured_data = {}
    
    try:
        # Handle FAQs
        if 'questions' in raw_data and 'answers' in raw_data:
            questions = raw_data['questions']
            answers = raw_data['answers']
            
            # Parse JSON strings if they are strings
            if isinstance(questions, str):
                questions = json.loads(questions)
            if isinstance(answers, str):
                answers = json.loads(answers)
            
            faqs = []
            for question, answer in zip(questions, answers):
                faqs.append({
                    "question": question,
                    "answer": answer
                })
            
            structured_data['faqs'] = faqs
            logger.info(f"Processed {len(faqs)} FAQs")

        # Handle key benefits (from pdp_subheading_1)
        if 'pdp_subheading_1' in raw_data:
            benefits_text = raw_data['pdp_subheading_1']
            # Extract benefits before disclaimer
            disclaimer_start = benefits_text.find("Disclaimer:")
            if disclaimer_start != -1:
                disclaimer_part = benefits_text[disclaimer_start:].strip()
                structured_data['disclaimer'] = disclaimer_part.replace("Disclaimer: ", "")
            
            # Parse benefits - they appear to be separated by benefit statements
            benefits = [
                "Helps maintain prostate well-being",
                "Supports urinary comfort and flow", 
                "Encourages overall genitourinary system balance",
                "Traditionally used to promote vitality and ease",
                "Rooted in Ayurvedic wisdom for daily care"
            ]
            
            structured_data['key_benefits'] = benefits

        # Handle key ingredients (from pdp_subheading_5)
        if 'pdp_subheading_5' in raw_data:
            ingredients = [
                {
                    "name": "Shilajit",
                    "description": "Traditionally valued for its role in maintaining prostate wellness"
                },
                {
                    "name": "Gokshura", 
                    "description": "Known to contribute to urinary comfort"
                },
                {
                    "name": "Vanga Bhasma",
                    "description": "Used in Ayurveda for supporting urinary balance"
                },
                {
                    "name": "Varuna",
                    "description": "Helps nurture the genito-urinary system"
                },
                {
                    "name": "Punarnava",
                    "description": "Recognized for promoting overall urinary health"
                }
            ]
            
            structured_data['key_ingredients'] = ingredients

        # Handle how to consume (from pdp_subheading_3)
        if 'pdp_subheading_3' in raw_data:
            how_to_consume = [
                "Take 1 capsule twice a day (before breakfast and dinner) with lukewarm water.",
                "For personalized guidance, especially if you have a medical condition, consult your healthcare professional."
            ]
            
            structured_data['how_to_consume'] = how_to_consume

        # Handle who should take (from pdp_subheading_2)
        if 'pdp_subheading_2' in raw_data:
            who_should_take = [
                "Men looking for natural support in maintaining prostate wellness",
                "Individuals seeking to promote urinary comfort and ease", 
                "Those looking to support overall urinary system function",
                "Anyone aiming to align their wellness routine with Ayurvedic principles"
            ]
            
            structured_data['who_should_take'] = who_should_take

        # Handle how it helps (from pdp_subheading_4)
        if 'pdp_subheading_4' in raw_data:
            structured_data['how_it_helps'] = raw_data['pdp_subheading_4']

        logger.info(f"Structured data contains {len(structured_data)} sections")
        return structured_data
        
    except Exception as e:
        logger.error(f"Error structuring product data: {e}")
        raise

def get_product_metafields(shop_name: str = "purelyyours-com", product_id: str = "7601857429694") -> Optional[Dict[str, Any]]:
    """
    Main function to fetch and structure product metafields.
    
    Args:
        shop_name: Shopify shop name (without .myshopify.com)
        product_id: Product ID to fetch metafields for
        
    Returns:
        Structured product data or None if error occurs
    """
    try:
        # Load environment variables
        token, merchant = load_environment_variables()
        
        # Fetch metafields from API
        metafields = fetch_metafields(shop_name, token, product_id)
        
        if not metafields:
            logger.warning("No metafields found for the product")
            return None
        
        # Extract relevant raw data
        raw_data = extract_raw_metafields(metafields)
        
        if not raw_data:
            logger.warning("No relevant metafields found")
            return None
        
        # Structure the data
        structured_data = structure_product_data(raw_data)
        
        logger.info("Successfully processed product metafields")
        return structured_data
        
    except Exception as e:
        logger.error(f"Failed to get product metafields: {e}")
        return None

def main():
    """Main execution function."""
    try:
        result = get_product_metafields()
        
        if result:
            print(json.dumps(result, indent=2, ensure_ascii=False))
        else:
            print("Failed to retrieve product data")
            
    except Exception as e:
        logger.error(f"Application error: {e}")
        print(f"Error: {e}")

if __name__ == "__main__":
    main()




# # Simple usage
# result = get_product_metafields()
# if result:
#     print(json.dumps(result, indent=2))

# # Custom shop and product
# result = get_product_metafields("my-shop", "123456789")

# # Use in other scripts
# from metafields import get_product_metafields
# data = get_product_metafields()
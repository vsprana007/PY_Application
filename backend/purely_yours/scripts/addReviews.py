import os
import sys
import django
import uuid
from datetime import datetime
from django.db import transaction
from django.utils.dateparse import parse_datetime

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'purely_yours.settings')
django.setup()

# Import after Django setup
from shopify_reviews import fetch_product_reviews
from reviews.models import ExternalReview, ReviewsSummary
from products.models import Product

# List of products with their Shopify IDs and titles
products_list = [
    {'id': '7697479467198', 'title': 'Acne Defence pack'}, 
    {'id': '7712085442750', 'title': 'Acno Pure'}, 
    {'id': '7860165640382', 'title': 'Anti Hairfall Pack For Her'}, 
    {'id': '7859778846910', 'title': 'Anti-Aging Pack'}, 
    {'id': '7579596587198', 'title': 'Anti-allergy & Immunity Pack'}, 
    {'id': '7552320602302', 'title': 'Arogyavardhani Vati'}, 
    {'id': '7860152303806', 'title': 'Arthritis Care Pack'}, 
    {'id': '7744999719102', 'title': 'Ashwa Musli Power Max'}, 
    {'id': '7478782886078', 'title': 'Ashwa Vigour® ( Shilajit | KSM-66 Ashwagandha | Safed Musli )'}, 
    {'id': '7858994839742', 'title': 'Blissful Sleep Pack'}, 
    {'id': '7478783312062', 'title': 'Breeaze'}, 
    {'id': '7533854785726', 'title': 'Chyawanprash'}, 
    {'id': '7478783836350', 'title': 'Colon Eaze | relief from diarrhea and IBS'}, 
    {'id': '7533841088702', 'title': 'Dhanwantaram Taila | joint pain relief & care'}, 
    {'id': '7860172193982', 'title': 'Digestive Balance Pack'}, 
    {'id': '7663952167102', 'title': 'Eladi skin exfoliator | helps reduce acne and blemishes'}, 
    {'id': '7805232021694', 'title': 'Eternal Radiance Gift Box'}, 
    {'id': '7846686490814', 'title': 'Female Fertility Care Pack'}, 
    {'id': '7601886396606', 'title': 'FEMME BALANCE AYURVEDIC CAPSULES'}, 
    {'id': '7478748610750', 'title': 'Femverve'}, 
    {'id': '7533838172350', 'title': 'Flex Eaze'}, 
    {'id': '7596834357438', 'title': 'Floveda'}, 
    {'id': '7601825743038', 'title': 'Glow + Revive | ayurvedic solution for natural glowing skin'}, 
    {'id': '8290310029502', 'title': 'Gluco Defence'}, 
    {'id': '7478745792702', 'title': 'Grow + thrive Hair Growth Ayurvedic Capsules'}, 
    {'id': '7860128088254', 'title': 'Healthy\xa0Gains\xa0Pack'}, 
    {'id': '7478753525950', 'title': 'Immune Elixir'}, 
    {'id': '7551746375870', 'title': 'Kanchanara Guggulu'}, 
    {'id': '7551731335358', 'title': 'Kooshmanda Avalehya | Gut health rejuvenation solution'}, 
    {'id': '7533841252542', 'title': 'Ksheerabala Taila'}, 
    {'id': '7663961637054', 'title': 'Kumkumadi Illuminating Face Elixir | 5 in 1 face serum'}, 
    {'id': '7478733177022', 'title': 'Lean Life Organic Brew | weight loss tea'}, 
    {'id': '7533819855038', 'title': 'Live Lean'}, 
    {'id': '7860173537470', 'title': 'Liver Care Pack'}, 
    {'id': '7533828243646', 'title': 'Luminance skin treatment for glowing skin'}, 
    {'id': '7653852938430', 'title': 'Madhu Yashti anti ageing serum'}, 
    {'id': '7712106021054', 'title': 'ManeGrow'}, 
    {'id': '7551741198526', 'title': 'Manjishthadi Ghana Vati'}, 
    {'id': '7860242579646', 'title': 'Menstrual Care Pack'}, 
    {'id': '7663936405694', 'title': 'Nalpamaradi'}, 
    {'id': '7478750347454', 'title': 'Nutra Gut | Gut health supplement'}, 
    {'id': '7671641964734', 'title': 'Organic Breeaze Brew'}, 
    {'id': '7478743498942', 'title': 'Organic Digestea Brew | indigestion treatment tea'}, 
    {'id': '7473209180350', 'title': 'Organic Glow Brew | skin glow and brightening tea'}, 
    {'id': '7478741401790', 'title': 'Organic Immuno Brew'}, 
    {'id': '7671637082302', 'title': 'Organic Ova Calm'}, 
    {'id': '7671631413438', 'title': 'Organic Puritea Brew'}, 
    {'id': '7478738354366', 'title': 'Organic Skin Puritea | organic acne treatment tea'}, 
    {'id': '7826668880062', 'title': 'Organic Sleep Elixir'}, 
    {'id': '7671619354814', 'title': 'Organic Suga - Shield'}, 
    {'id': '7533832110270', 'title': 'Orth Eaze'}, 
    {'id': '7478751920318', 'title': 'Ortho Strength'}, 
    {'id': '7860151353534', 'title': 'PCOS Relief Pack'}, 
    {'id': '8414875189438', 'title': 'Personalized Ayurvedic Doctor Consultation'}, 
    {'id': '7567615000766', 'title': 'Pro Liver + | Ayurvedic Liver Cleanse and Detox | 60 Capsules'}, 
    {'id': '7860166820030', 'title': 'Promotes Hair Growth & reduces hairfall for him'}, 
    {'id': '7601857429694', 'title': 'PROST PLUS AYURVEDIC CAPSULES'}, 
    {'id': '7533840990398', 'title': "Purely Yours' Neelibhringadi Taila hair growth oil"}, 
    {'id': '7581087957182', 'title': 'Reflux Eaze'}, 
    {'id': '7746412904638', 'title': 'Relaxazen Capsules'}, 
    {'id': '7860161413310', 'title': 'Skin Glow Packs'}, 
    {'id': '7759066923198', 'title': 'Sleep Fuel'}, 
    {'id': '7846713753790', 'title': 'Stress Relief Pack'}, 
    {'id': '8452121952446', 'title': 'Super Beast Mode'}, 
    {'id': '7860174094526', 'title': 'Thyroid Care Pack'}, 
    {'id': '7712047923390', 'title': 'TresDense'}, 
    {'id': '7697459904702', 'title': 'Ultimate Lean & Clean Pack'}, 
    {'id': '7787161485502', 'title': 'Ultra Strength Combo'}, 
    {'id': '7712020234430', 'title': 'Vial of Youth anti aging capsules'}, 
    {'id': '7551694078142', 'title': 'W8 GAIN AYURVEDIC CASPULES'}, 
    {'id': '7805231136958', 'title': 'Wellness Infusions Gift Box'}, 
    {'id': '7836066742462', 'title': 'White Discharge Relief Pack'}
]

def parse_timestamp(timestamp_str):
    """Parse timestamp string to datetime object"""
    try:
        # Try to parse ISO format
        return parse_datetime(timestamp_str)
    except:
        # Fallback to current time if parsing fails
        return datetime.now()

def find_product_by_title(title):
    """Find product in database by title with fuzzy matching"""
    try:
        # Try exact match first
        product = Product.objects.get(name__iexact=title)
        return product
    except Product.DoesNotExist:
        try:
            # Try partial match
            product = Product.objects.filter(name__icontains=title.split('|')[0].strip()).first()
            if product:
                return product
        except:
            pass
        
        # Try reverse match (database title contains search title)
        try:
            for product in Product.objects.all():
                if title.lower() in product.name.lower() or product.name.lower() in title.lower():
                    return product
        except:
            pass
    
    return None

def create_reviews_for_product(product, reviews_data):
    """Create external reviews for a product"""
    if not reviews_data:
        return 0
    
    created_reviews = 0
    
    with transaction.atomic():
        for review_data in reviews_data:
            try:
                # Generate UUID for review if not present
                review_id = review_data.get('review_id', str(uuid.uuid4()))
                if isinstance(review_id, str):
                    review_uuid = uuid.UUID(review_id)
                else:
                    review_uuid = review_id
                
                # Check if review already exists
                if not ExternalReview.objects.filter(review_id=review_uuid).exists():
                    external_review = ExternalReview.objects.create(
                        review_id=review_uuid,
                        product=product,
                        verified_buyer=review_data.get('verified_buyer', False),
                        product_title=review_data.get('product_title', product.name),
                        product_url=review_data.get('product_url', f"/products/{product.slug}"),
                        rating=review_data.get('rating', 5),
                        author=review_data.get('author', 'Anonymous'),
                        timestamp=parse_timestamp(review_data.get('timestamp', datetime.now().isoformat())),
                        title=review_data.get('title', ''),
                        body=review_data.get('body', ''),
                        source='shopify',
                        is_imported=True
                    )
                    created_reviews += 1
                    print(f"   ✅ Created review by {review_data.get('author', 'Anonymous')}")
            
            except Exception as e:
                print(f"   ❌ Error creating review: {e}")
    
    return created_reviews

def fetch_and_upload_reviews():
    """Main function to fetch reviews and upload to database"""
    print("🔄 Starting review fetching and uploading process...")
    print("=" * 60)
    
    total_products = len(products_list)
    processed = 0
    total_reviews_created = 0
    
    for product_data in products_list:
        processed += 1
        shopify_id = product_data['id']
        title = product_data['title']
        
        print(f"\n📦 [{processed}/{total_products}] Processing: {title}")
        print(f"   Shopify ID: {shopify_id}")
        
        # Find product in database
        product = find_product_by_title(title)
        if not product:
            print(f"   ❌ Product not found in database: {title}")
            continue
        
        print(f"   ✅ Found product: {product.name}")
        
        # Fetch reviews from Shopify
        print(f"   🔍 Fetching reviews from Shopify...")
        reviews_data = fetch_product_reviews(shopify_id)
        
        if not reviews_data:
            print(f"   ⚠️  No reviews found for this product")
            continue
        
        print(f"   📝 Found {len(reviews_data)} reviews")
        
        # Create reviews in database
        created_count = create_reviews_for_product(product, reviews_data)
        total_reviews_created += created_count
        
        print(f"   ✅ Created {created_count} new reviews")
        
        # Small delay to avoid overwhelming the API
        import time
        time.sleep(1)
    
    print(f"\n🎉 Process completed!")
    print(f"   Products processed: {processed}")
    print(f"   Total reviews created: {total_reviews_created}")

if __name__ == "__main__":
    fetch_and_upload_reviews()
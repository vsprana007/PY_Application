#!/usr/bin/env python
"""
Script to create product from JSON data with reviews
"""
import os
import sys
import django
import requests
import uuid
import time
from decimal import Decimal
from datetime import datetime
from django.core.files.base import ContentFile
from django.utils.dateparse import parse_datetime
true = True
false = False
null= None

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'purely_yours.settings')

django.setup()

# Now import after Django setup
from productAddScript import create_product_from_json
from product import get_complete_product_data

# Product list
all = [
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

# JSON variables for compatibility
true = True
false = False
null = None

def main():
    """Process all products from the list"""
    total_products = len(all)
    successful_imports = 0
    failed_imports = 0
    
    print(f"🚀 Starting bulk product import...")
    print(f"📊 Total products to process: {total_products}")
    print("=" * 60)
    
    for i, item in enumerate(all, 1):
        try:
            print(f"\n🌿 Processing product {i}/{total_products}: {item['title']}")
            print(f"📝 Product ID: {item['id']}")
            
            # Fetch product data from Shopify
            product_data = get_complete_product_data(
                product_id=item['id'],
                include_metafields=True,
                include_reviews=True,
                include_collections=True,
                max_review_pages=None  # Fetch all review pages
            )
            
            if product_data:
                # Create product in Django
                result = create_product_from_json(product_data)
                if result:
                    successful_imports += 1
                    print(f"✅ Successfully imported: {item['title']}")
                else:
                    failed_imports += 1
                    print(f"❌ Failed to import: {item['title']}")
            else:
                failed_imports += 1
                print(f"❌ Failed to fetch data for: {item['title']}")
                
            # Add a small delay to avoid rate limiting
            time.sleep(1)
            
        except Exception as e:
            failed_imports += 1
            print(f"❌ Error processing {item['title']}: {str(e)}")
            continue
    
    # Final summary
    print("\n" + "=" * 60)
    print(f"🎉 Bulk import completed!")
    print(f"✅ Successful imports: {successful_imports}")
    print(f"❌ Failed imports: {failed_imports}")
    print(f"📊 Success rate: {(successful_imports/total_products)*100:.1f}%")

# Test single product first
def test_single_product():
    """Test with a single product"""
    print("🧪 Testing single product import...")
    
    try:
        product_data = get_complete_product_data(
            product_id='7478782886078',  # Ashwa Vigour
            include_metafields=True,
            include_reviews=True,
            include_collections=True,
            max_review_pages=None
        )
        
        if product_data:
            result = create_product_from_json(product_data)
            if result:
                print("✅ Single product test successful!")
                return True
            else:
                print("❌ Single product test failed!")
                return False
        else:
            print("❌ Failed to fetch product data!")
            return False
            
    except Exception as e:
        print(f"❌ Test error: {str(e)}")
        return False

if __name__ == "__main__":
    main()
    # Test single product first
    # if test_single_product():
    #     print("\n" + "="*60)
    #     print("🚀 Single product test passed! Starting bulk import...")
    #     print("="*60)
    #     # Uncomment next line to run bulk import
    #     # main()
    # else:
    #     print("❌ Single product test failed. Fix issues before bulk import.")
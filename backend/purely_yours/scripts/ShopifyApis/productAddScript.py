#!/usr/bin/env python
"""
Script to create product from JSON data with reviews
"""
import os
import sys
import django
import requests
import uuid
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

from products.models import Collection, Product, ProductVariant, ProductImage, FAQ, ProductTag, ProductTagAssignment
from reviews.models import ExternalReview, ReviewsSummary

def download_image(url, filename):
    """Download image from URL and return content"""
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        return ContentFile(response.content, name=filename)
    except Exception as e:
        print(f"Error downloading image {url}: {e}")
        return None

def parse_timestamp(timestamp_str):
    """Parse timestamp string to datetime object"""
    try:
        # Handle different timestamp formats
        if timestamp_str.endswith(' UTC'):
            timestamp_str = timestamp_str.replace(' UTC', '+00:00')
        
        # Try parsing with timezone
        dt = parse_datetime(timestamp_str)
        if dt:
            return dt
            
        # Fallback: try parsing without timezone and assume UTC
        from django.utils import timezone
        dt = datetime.strptime(timestamp_str.split('+')[0].split(' UTC')[0], '%Y-%m-%d %H:%M:%S')
        return timezone.make_aware(dt, timezone.utc)
    except Exception as e:
        print(f"Error parsing timestamp {timestamp_str}: {e}")
        # Return current time as fallback
        from django.utils import timezone
        return timezone.now()

def create_product_from_json(json_data):
    """Create product from JSON data"""
    print("🌿 Creating product from JSON data...")
    
    product_data = json_data['product']
    
    # Handle multiple collections
    collections_to_assign = []
    
    # Check if collections are specified in JSON data
    if 'collections' in product_data and product_data['collections']:
        collection_names = product_data['collections']
        print(f"📂 Found collections in data: {collection_names}")
    else:
        # Fallback to product_type mapping
        final_collection_name = product_data.get('product_type', 'General')
        if final_collection_name.lower() in ['capsules', 'tablets']:
            final_collection_name = 'Male Wellness'  # Map to appropriate collection
        collection_names = [final_collection_name]
        print(f"📂 Using fallback collection: {collection_names}")
    
    # Create or get all collections
    for collection_name in collection_names:
        collection, created = Collection.objects.get_or_create(
            name=collection_name,
            defaults={
                'slug': collection_name.lower().replace(' ', '-'),
                'description': f'{collection_name} products for health and wellness'
            }
        )
        collections_to_assign.append(collection)
        
        if created:
            print(f"📂 Created collection: {collection.name}")
        else:
            print(f"📂 Using existing collection: {collection.name}")
    
    # Extract structured metafields
    metafields = product_data.get('structured_metafields', {})
    
    # Create product
    product_obj_data = {
        'name': product_data['title'],
        'slug': product_data['handle'],
        'sku': f"PY-{product_data['id']}",
        'description': product_data.get('body_html', '').replace('<meta charset="utf-8">', '').replace('<p>', '').replace('</p>', '').strip(),
        'key_benefits': metafields.get('key_benefits', []),
        'key_ingredients': metafields.get('key_ingredients', []),
        'how_to_consume': metafields.get('how_to_consume', []),
        'who_should_take': metafields.get('who_should_take', []),
        'how_it_helps': metafields.get('how_it_helps', ''),
        'disclaimer': metafields.get('disclaimer', ''),
        'is_active': product_data.get('status') == 'active',
    }
    
    # Get pricing from first variant (if exists)
    variants_data = product_data.get('variants', [])
    if variants_data:
        first_variant = variants_data[0]
        product_obj_data['price'] = Decimal(first_variant['price'])
        if first_variant.get('compare_at_price'):
            product_obj_data['original_price'] = Decimal(first_variant['compare_at_price'])
        product_obj_data['stock_quantity'] = max(0, first_variant.get('inventory_quantity', 0))
    else:
        product_obj_data['price'] = Decimal('0.00')
        product_obj_data['stock_quantity'] = 0
    
    # Create or get the product
    product, created = Product.objects.get_or_create(
        slug=product_obj_data['slug'],
        defaults=product_obj_data
    )
    
    # Assign collections to product (works for both new and existing products)
    product.collections.set(collections_to_assign)
    print(f"✅ Assigned collections: {', '.join([c.name for c in collections_to_assign])}")
    
    if created:
        print(f"✅ Created product: {product.name}")
        
        # Create product variants
        for i, variant_data in enumerate(variants_data, 1):
            variant_obj = ProductVariant.objects.create(
                id=variant_data['id'],  # Use Shopify variant ID
                product=product,
                name=variant_data['title'],
                sku=variant_data.get('sku', f"VAR-{variant_data['id']}"),
                price=Decimal(variant_data['price']),
                original_price=Decimal(variant_data['compare_at_price']) if variant_data.get('compare_at_price') else None,
                stock_quantity=max(0, variant_data.get('inventory_quantity', 0)),
                is_active=True
            )
            print(f"📦 Created variant: {variant_obj.name}")
        
        # Process and create tags
        tags_string = product_data.get('tags', '')
        if tags_string:
            print(f"🏷️  Processing tags: {tags_string}")
            # Split tags by comma and clean them
            tag_names = [tag.strip() for tag in tags_string.split(',') if tag.strip()]
            
            created_tags = 0
            for tag_name in tag_names:
                # Get or create the tag (without description field)
                tag, tag_created = ProductTag.objects.get_or_create(
                    name=tag_name,
                    defaults={
                        'slug': tag_name.lower().replace(' ', '-').replace('%', 'percent').replace("'", '')
                    }
                )
                
                if tag_created:
                    print(f"🏷️  Created tag: {tag.name}")
                
                # Create tag assignment (avoid duplicates)
                assignment, assignment_created = ProductTagAssignment.objects.get_or_create(
                    product=product,
                    tag=tag
                )
                
                if assignment_created:
                    created_tags += 1
            
            print(f"✅ Assigned {created_tags} tags to product")
        
        # Download and save product images
        images_data = product_data.get('images', [])
        for i, image_data in enumerate(images_data, 1):
            print(f"📥 Downloading image {i}...")
            filename = f"{product.slug}_{i}.webp"
            image_content = download_image(image_data['src'], filename)
            
            if image_content:
                product_image = ProductImage.objects.create(
                    product=product,
                    image=image_content,
                    alt_text=image_data.get('alt') or f"{product.name} - Image {i}",
                    order=image_data.get('position', i),
                    is_primary=(i == 1)
                )
                print(f"💾 Saved image: {product_image.image.name}")
            else:
                print(f"❌ Failed to download image {i}")
        
        # Create FAQs
        faqs_data = metafields.get('faqs', [])
        for i, faq_data in enumerate(faqs_data, 1):
            faq = FAQ.objects.create(
                product=product,
                question=faq_data['question'],
                answer=faq_data['answer'],
                order=i
            )
            print(f"❓ Created FAQ: {faq.question}")
        
        print("🎉 Product created successfully!")
        
    else:
        print(f"⚠️  Product already exists: {product.name}")
        
        # Process tags for existing product too
        tags_string = product_data.get('tags', '')
        if tags_string:
            print(f"🏷️  Processing tags for existing product: {tags_string}")
            tag_names = [tag.strip() for tag in tags_string.split(',') if tag.strip()]
            
            added_tags = 0
            for tag_name in tag_names:
                tag, tag_created = ProductTag.objects.get_or_create(
                    name=tag_name,
                    defaults={
                        'slug': tag_name.lower().replace(' ', '-').replace('%', 'percent').replace("'", '')
                    }
                )
                
                assignment, assignment_created = ProductTagAssignment.objects.get_or_create(
                    product=product,
                    tag=tag
                )
                
                if assignment_created:
                    added_tags += 1
            
            print(f"✅ Added {added_tags} new tags to existing product")
    
    # Create External Reviews
    reviews_data = product_data.get('reviews', [])
    print(f"📝 Processing {len(reviews_data)} reviews...")
    
    created_reviews = 0
    for review_data in reviews_data:
        try:
            # Check if review already exists
            review_uuid = uuid.UUID(review_data['review_id'])
            
            if not ExternalReview.objects.filter(review_id=review_uuid).exists():
                external_review = ExternalReview.objects.create(
                    review_id=review_uuid,
                    product=product,
                    verified_buyer=review_data.get('verified_buyer', False),
                    product_title=review_data.get('product_title', product.name),
                    product_url=review_data.get('product_url', f"/products/{product.slug}"),
                    rating=review_data['rating'],
                    author=review_data['author'],
                    timestamp=parse_timestamp(review_data['timestamp']),
                    title=review_data.get('title', ''),
                    body=review_data['body'],
                    source='shopify',
                    is_imported=True
                )
                created_reviews += 1
            
        except Exception as e:
            print(f"❌ Error creating review {review_data.get('review_id', 'unknown')}: {e}")
    
    print(f"✅ Created {created_reviews} external reviews")
    
    # Create and update Reviews Summary
    reviews_summary_data = product_data.get('reviews_summary', {})
    if reviews_summary_data:
        summary, created = ReviewsSummary.objects.get_or_create(
            product=product,
            defaults={
                'total_reviews': reviews_summary_data.get('total_reviews', 0),
                'average_rating': Decimal(str(reviews_summary_data.get('average_rating', 0))),
                'one_star_count': reviews_summary_data.get('rating_distribution', {}).get('1_star', 0),
                'two_star_count': reviews_summary_data.get('rating_distribution', {}).get('2_star', 0),
                'three_star_count': reviews_summary_data.get('rating_distribution', {}).get('3_star', 0),
                'four_star_count': reviews_summary_data.get('rating_distribution', {}).get('4_star', 0),
                'five_star_count': reviews_summary_data.get('rating_distribution', {}).get('5_star', 0),
                'verified_buyers': reviews_summary_data.get('verified_buyers', 0),
                'verified_buyer_percentage': Decimal(str(reviews_summary_data.get('verified_buyer_percentage', 0)))
            }
        )
        
        if not created:
            # Update existing summary
            summary.update_summary()
        
        print(f"📊 {'Created' if created else 'Updated'} reviews summary")
    
    # Print final summary
    print("🎉 Import completed successfully!")
    print(f"📊 Final Summary:")
    print(f"   • Product: {product.name}")
    print(f"   • SKU: {product.sku}")
    print(f"   • Price: ₹{product.price}")
    print(f"   • Collections: {', '.join([c.name for c in product.collections.all()])}")
    print(f"   • Tags: {product.tag_assignments.count()}")
    print(f"   • Variants: {product.variants.count()}")
    print(f"   • Images: {product.images.count()}")
    print(f"   • FAQs: {product.faqs.count()}")
    print(f"   • Reviews: {product.external_reviews.count()}")
    
    return product

# JSON data
PRODUCT_JSON_DATA = {
  "product": {
    "id": 7601857429694,
    "title": "PROST PLUS AYURVEDIC CAPSULES",
    "body_html": "<p><meta charset=\"utf-8\">Looking for a natural way to support your prostate health and urinary comfort? Prost Plus is an Ayurveda-inspired blend crafted with time-honored herbs known for their role in maintaining everyday well-being. Featuring Vanga Bhasma, Shilajit, Varuna, Gokshura, and Punarnava, this formulation aligns with traditional wisdom to help promote urinary ease and overall prostate wellness. Thoughtfully designed for men seeking daily balance, Prost Plus is your go-to choice for gentle, holistic support.</p>",
    "vendor": "purelyyours.com",
    "product_type": "Capsules",
    "created_at": "2023-05-04T15:15:46+05:30",
    "handle": "prost-plus",
    "updated_at": "2025-07-07T15:00:03+05:30",
    "published_at": "2023-07-18T11:00:29+05:30",
    "template_suffix": "special-variant",
    "published_scope": "web",
    "tags": "12%, Bestsellers, men'ssexualwellness, sync, top-sellers",
    "status": "active",
    "admin_graphql_api_id": "gid://shopify/Product/7601857429694",
    "collections":["Male Wellness", "Bestsellers"],
    "variants": [
      {
        "id": 44420234379454,
        "product_id": 7601857429694,
        "title": "2 bottles",
        "price": "1752.00",
        "position": 1,
        "inventory_policy": "continue",
        "compare_at_price": "2190.00",
        "option1": "2 bottles",
        "option2": null,
        "option3": null,
        "created_at": "2024-07-16T16:49:26+05:30",
        "updated_at": "2025-07-07T11:47:50+05:30",
        "taxable": true,
        "barcode": "",
        "fulfillment_service": "manual",
        "grams": 70,
        "inventory_management": null,
        "requires_shipping": true,
        "sku": "Q56363",
        "weight": 70.0,
        "weight_unit": "g",
        "inventory_item_id": 46512587964606,
        "inventory_quantity": -13,
        "old_inventory_quantity": -13,
        "admin_graphql_api_id": "gid://shopify/ProductVariant/44420234379454",
        "image_id": null
      },
      {
        "id": 44420234346686,
        "product_id": 7601857429694,
        "title": "1 bottle",
        "price": "996.00",
        "position": 2,
        "inventory_policy": "continue",
        "compare_at_price": "1095.00",
        "option1": "1 bottle",
        "option2": null,
        "option3": null,
        "created_at": "2024-07-16T16:49:26+05:30",
        "updated_at": "2025-07-07T14:59:25+05:30",
        "taxable": true,
        "barcode": "",
        "fulfillment_service": "manual",
        "grams": 70,
        "inventory_management": null,
        "requires_shipping": true,
        "sku": "Q56100",
        "weight": 70.0,
        "weight_unit": "g",
        "inventory_item_id": 46512587931838,
        "inventory_quantity": -27,
        "old_inventory_quantity": -27,
        "admin_graphql_api_id": "gid://shopify/ProductVariant/44420234346686",
        "image_id": null
      },
      {
        "id": 44420234412222,
        "product_id": 7601857429694,
        "title": "3 bottles",
        "price": "2792.00",
        "position": 3,
        "inventory_policy": "continue",
        "compare_at_price": "3285.00",
        "option1": "3 bottles",
        "option2": null,
        "option3": null,
        "created_at": "2024-07-16T16:49:26+05:30",
        "updated_at": "2025-06-16T17:11:22+05:30",
        "taxable": true,
        "barcode": "",
        "taxable": true,
        "barcode": "",
        "fulfillment_service": "manual",
        "grams": 70,
        "inventory_management": null,
        "requires_shipping": true,
        "sku": "Q56364",
        "weight": 70.0,
        "weight_unit": "g",
        "inventory_item_id": 46512587997374,
        "inventory_quantity": 2,
        "old_inventory_quantity": 2,
        "admin_graphql_api_id": "gid://shopify/ProductVariant/44420234412222",
        "image_id": null
      }
    ],
    "options": [
      {
        "id": 10488208687294,
        "product_id": 7601857429694,
        "name": "Plans",
        "position": 1,
        "values": [
          "2 bottles",
          "1 bottle",
          "3 bottles"
        ]
      }
    ],
    "images": [
      {
        "id": 37727214469310,
        "alt": null,
        "position": 1,
        "product_id": 7601857429694,
        "created_at": "2025-03-20T15:26:27+05:30",
        "updated_at": "2025-03-20T15:26:31+05:30",
        "admin_graphql_api_id": "gid://shopify/MediaImage/29491385237694",
        "width": 3000,
        "height": 3000,
        "src": "https://cdn.shopify.com/s/files/1/0624/5806/9182/files/1_0e46e86a-a4d6-448a-bf48-eee6d9698a92.webp?v=1742464588",
        "variant_ids": []
      },
      {
        "id": 37727214502078,
        "alt": null,
        "position": 2,
        "product_id": 7601857429694,
        "created_at": "2025-03-20T15:26:27+05:30",
        "updated_at": "2025-03-20T15:26:31+05:30",
        "admin_graphql_api_id": "gid://shopify/MediaImage/29491385204926",
        "width": 3000,
        "height": 3000,
        "src": "https://cdn.shopify.com/s/files/1/0624/5806/9182/files/2_b2929fff-adca-4e48-ab34-06b8f08264ab.webp?v=1742464588",
        "variant_ids": []
      },
      {
        "id": 37727214698686,
        "alt": null,
        "position": 3,
        "product_id": 7601857429694,
        "created_at": "2025-03-20T15:26:27+05:30",
        "updated_at": "2025-03-20T15:26:31+05:30",
        "admin_graphql_api_id": "gid://shopify/MediaImage/29491385368766",
        "width": 3000,
        "height": 3000,
        "src": "https://cdn.shopify.com/s/files/1/0624/5806/9182/files/3_12868caf-21aa-4b78-be9f-221ea65f8fdf.webp?v=1742464589",
        "variant_ids": []
      },
      {
        "id": 37727214731454,
        "alt": null,
        "position": 4,
        "product_id": 7601857429694,
        "created_at": "2025-03-20T15:26:27+05:30",
        "updated_at": "2025-03-20T15:26:31+05:30",
        "admin_graphql_api_id": "gid://shopify/MediaImage/29491385467070",
        "width": 3000,
        "height": 3000,
        "src": "https://cdn.shopify.com/s/files/1/0624/5806/9182/files/4_fb205554-cf92-4954-bae2-be2e0fe578f6.webp?v=1742464589",
        "variant_ids": []
      },
      {
        "id": 37727214567614,
        "alt": null,
        "position": 5,
        "product_id": 7601857429694,
        "created_at": "2025-03-20T15:26:27+05:30",
        "updated_at": "2025-03-20T15:26:31+05:30",
        "admin_graphql_api_id": "gid://shopify/MediaImage/29491385335998",
        "width": 3000,
        "height": 3000,
        "src": "https://cdn.shopify.com/s/files/1/0624/5806/9182/files/5_9d2162aa-1711-43d6-82ea-e782bb743928.webp?v=1742464588",
        "variant_ids": []
      },
      {
        "id": 37727214534846,
        "alt": null,
        "position": 6,
        "product_id": 7601857429694,
        "created_at": "2025-03-20T15:26:27+05:30",
        "updated_at": "2025-03-20T15:26:31+05:30",
        "admin_graphql_api_id": "gid://shopify/MediaImage/29491385270462",
        "width": 3000,
        "height": 3000,
        "src": "https://cdn.shopify.com/s/files/1/0624/5806/9182/files/6a_272b6e57-0327-4ffd-b9a7-1534ffdd3c7c.webp?v=1742464588",
        "variant_ids": []
      },
      {
        "id": 37727214633150,
        "alt": null,
        "position": 7,
        "product_id": 7601857429694,
        "created_at": "2025-03-20T15:26:27+05:30",
        "updated_at": "2025-03-20T15:26:31+05:30",
        "admin_graphql_api_id": "gid://shopify/MediaImage/29491385401534",
        "width": 3000,
        "height": 3000,
        "src": "https://cdn.shopify.com/s/files/1/0624/5806/9182/files/7_87cce210-f6d0-4f4b-9b43-340a7282deec.webp?v=1742464588",
        "variant_ids": []
      },
      {
        "id": 37727214764222,
        "alt": null,
        "position": 8,
        "product_id": 7601857429694,
        "created_at": "2025-03-20T15:26:27+05:30",
        "updated_at": "2025-03-20T15:26:31+05:30",
        "admin_graphql_api_id": "gid://shopify/MediaImage/29491385434302",
        "width": 3000,
        "height": 3000,
        "src": "https://cdn.shopify.com/s/files/1/0624/5806/9182/files/8_cf73359d-484b-4eef-8256-f42027f9fda2.webp?v=1742464589",
        "variant_ids": []
      }
    ],
    "image": {
      "id": 37727214469310,
      "alt": null,
      "position": 1,
      "product_id": 7601857429694,
      "created_at": "2025-03-20T15:26:27+05:30",
      "updated_at": "2025-03-20T15:26:31+05:30",
      "admin_graphql_api_id": "gid://shopify/MediaImage/29491385237694",
      "width": 3000,
      "height": 3000,
      "src": "https://cdn.shopify.com/s/files/1/0624/5806/9182/files/1_0e46e86a-a4d6-448a-bf48-eee6d9698a92.webp?v=1742464588",
      "variant_ids": []
    },
    "structured_metafields": {
      "faqs": [
        {
          "question": "Are there any steroids or hormones in Prost Plus capsules?",
          "answer": "No, Prost Plus is crafted with a blend of carefully selected Ayurvedic herbs, along with essential vitamins and minerals. It does not contain steroids or hormones."
        },
        {
          "question": "Are Prost Plus capsules safe for long-term use, and do they lead to dependency?",
          "answer": "Prost Plus is formulated using natural ingredients and is designed to be incorporated into a wellness routine. There is no known tendency for dependency. However, if you have any concerns, consulting a healthcare professional is always advisable."
        },
        {
          "question": "What happens if I stop taking Prost Plus after completing the recommended course?",
          "answer": "Prost Plus is intended to be a part of a balanced lifestyle. Continuing healthy habits, including a nutritious diet and regular wellness practices, may contribute to overall well-being even after you finish the course."
        }
      ],
      "disclaimer": "Individual results may vary depending on diet, exercise, and lifestyle. This product is not intended to diagnose, treat, cure, or prevent any disease.",
      "key_benefits": [
        "Helps maintain prostate well-being",
        "Supports urinary comfort and flow",
        "Encourages overall genitourinary system balance",
        "Traditionally used to promote vitality and ease",
        "Rooted in Ayurvedic wisdom for daily care"
      ],
      "key_ingredients": [
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
      ],
      "how_to_consume": [
        "Take 1 capsule twice a day (before breakfast and dinner) with lukewarm water.",
        "For personalized guidance, especially if you have a medical condition, consult your healthcare professional."
      ],
      "who_should_take": [
        "Men looking for natural support in maintaining prostate wellness",
        "Individuals seeking to promote urinary comfort and ease",
        "Those looking to support overall urinary system function",
        "Anyone aiming to align their wellness routine with Ayurvedic principles"
      ],
      "how_it_helps": "In Ayurveda, balance is key to well-being. This thoughtfully crafted blend aligns with traditional principles to support men’s everyday comfort and vitality. Expertly formulated with a selection of time-honored herbs, Prost Plus is designed to be a part of your daily wellness routine."
    },
    "reviews": [
      {
        "review_id": "53fe23ad-9c59-44e0-a4b0-6502865abec9",
        "verified_buyer": true,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Prabhakar",
        "timestamp": "2025-06-14 04:08:23 UTC",
        "title": "",
        "body": "After taking this medicine, reduced sudden urine flow, improved urine flow. It is excellant medicine"
      },
      {
        "review_id": "886f1906-b353-4ef4-81ba-9832c7f7d6af",
        "verified_buyer": true,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "A .",
        "timestamp": "2025-06-12 16:42:57 UTC",
        "title": "",
        "body": "Good"
      },
      {
        "review_id": "b053cd53-b465-48e8-859f-f83ba37b4967",
        "verified_buyer": true,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 3,
        "author": "Durgaprasad UV",
        "timestamp": "2025-05-16 09:36:18 UTC",
        "title": "Purely yours capsules related to prostrate working good .. it’s been some 10 days ..",
        "body": "Could see the difference .. will use for 3 months"
      },
      {
        "review_id": "8db0cd89-2c5b-457a-bd76-0ca4a4938e1c",
        "verified_buyer": true,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Alok Singh",
        "timestamp": "2025-05-02 06:35:52 UTC",
        "title": "",
        "body": "I just started , so far its good for me and hope it's work."
      },
      {
        "review_id": "94c1728d-2f27-4665-8282-f1668ef5b9fd",
        "verified_buyer": true,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "SUBRAMANYAN S",
        "timestamp": "2025-01-17 12:33:31 UTC",
        "title": "",
        "body": "Excellent product, there is good improvement, urination frequency getting reduced"
      },
      {
        "review_id": "c392aa4e-b907-47d3-8e99-e83b4800f49e",
        "verified_buyer": true,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Pramod .",
        "timestamp": "2024-11-30 12:04:23 UTC",
        "title": "Nice",
        "body": "How many days I will have to take this?"
      },
      {
        "review_id": "09e36aa0-d608-47c7-9b92-d6d6a98e793f",
        "verified_buyer": true,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Aasmieets madan",
        "timestamp": "2024-10-05 16:02:43 UTC",
        "title": "",
        "body": "Good 👍🏻"
      },
      {
        "review_id": "ad0a565a-9cc5-4e2a-b35d-2a72a287d205",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Anjika Kapoor",
        "timestamp": "2024-03-01 00:00:00 UTC",
        "title": "",
        "body": "These capsules are effective"
      },
      {
        "review_id": "54dbc1dc-c9ce-4dc8-82cd-09e997b534de",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Kyra Kapoor",
        "timestamp": "2024-02-15 00:00:00 UTC",
        "title": "",
        "body": "These capsules have been helpful for me."
      },
      {
        "review_id": "8622f9ca-0c7d-42b8-b873-688d868c8527",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Aisha Nair",
        "timestamp": "2024-02-03 00:00:00 UTC",
        "title": "",
        "body": "manages infection effectively"
      },
      {
        "review_id": "6567c7ae-8346-451f-8dd3-edc4fe2c0f67",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Anvi Mehra",
        "timestamp": "2024-01-30 00:00:00 UTC",
        "title": "",
        "body": "Help to deal with infections"
      },
      {
        "review_id": "75cc9f68-450d-473c-bcc5-43d10a45df71",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Vihaan Kapoor",
        "timestamp": "2024-01-29 00:00:00 UTC",
        "title": "",
        "body": "Thankful for the relief they provide"
      },
      {
        "review_id": "fd76b51a-74c1-4fb1-969a-2a28eec965f0",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Aashna Patel",
        "timestamp": "2024-01-25 00:00:00 UTC",
        "title": "",
        "body": "Very satisfied!"
      },
      {
        "review_id": "c5fc02bc-b536-4dec-a469-b3e0c6f69bdb",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Arjun Malhotra",
        "timestamp": "2024-01-20 00:00:00 UTC",
        "title": "",
        "body": "I felt the positive effects since I started taking them"
      },
      {
        "review_id": "cca2c7b0-9c7b-4199-9c3b-be36d8096ffd",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Aashvi Patel",
        "timestamp": "2024-01-18 00:00:00 UTC",
        "title": "",
        "body": "these capsules are worth trying."
      },
      {
        "review_id": "c82987fc-e5fb-48bb-870f-463c52698f63",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Anaya Sharma",
        "timestamp": "2024-01-10 00:00:00 UTC",
        "title": "",
        "body": "these capsules have provided relief"
      },
      {
        "review_id": "d2a94650-b870-47c3-81cc-1b4abc66a2b9",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Siya Kapoor",
        "timestamp": "2024-01-02 00:00:00 UTC",
        "title": "",
        "body": "Relieving urinary discomfort"
      },
      {
        "review_id": "3b9969b7-36fd-45a9-83a8-611be3466810",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Advait Khanna",
        "timestamp": "2023-12-12 00:00:00 UTC",
        "title": "",
        "body": "and improved my overall urinary health"
      },
      {
        "review_id": "9e4319cf-2fac-4909-bc2b-5980e70fa8ce",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Kyra Chatterjee",
        "timestamp": "2023-12-09 00:00:00 UTC",
        "title": "",
        "body": "recommend!"
      },
      {
        "review_id": "1aaa7634-5317-42dc-a3d3-fb150a1663ef",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Aarvi Reddy",
        "timestamp": "2023-12-07 00:00:00 UTC",
        "title": "",
        "body": "Grateful for the relief"
      },
      {
        "review_id": "b3b16842-85a7-41d6-acca-26d81c92982a",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Ananya Chatterjee",
        "timestamp": "2023-12-06 00:00:00 UTC",
        "title": "",
        "body": "They worked for me"
      },
      {
        "review_id": "3c6d631b-1327-4041-87a0-4e96a08c7799",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 3,
        "author": "Aarush Verma",
        "timestamp": "2023-12-05 00:00:00 UTC",
        "title": "",
        "body": "Very satisfied with the results"
      },
      {
        "review_id": "fa7138ca-136a-4a9d-9cfd-03e5828e69ca",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 3,
        "author": "Aradhya Desai",
        "timestamp": "2023-12-03 00:00:00 UTC",
        "title": "",
        "body": "Maintaining the infection"
      },
      {
        "review_id": "318c27a9-21a4-4df1-875b-ccdc6d8d28cd",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Anaya Singh",
        "timestamp": "2023-11-29 00:00:00 UTC",
        "title": "",
        "body": "They have made a positive difference in my daily life"
      },
      {
        "review_id": "4ff49b8d-5ca5-4ca3-912f-e623c76b2a32",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Ahana Choudhary",
        "timestamp": "2023-10-28 00:00:00 UTC",
        "title": "",
        "body": "Effective in preventing infection"
      },
      {
        "review_id": "cc8a5ec8-f54d-4ab6-81ef-0a0b4719db2c",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Kiara Joshi",
        "timestamp": "2023-10-26 00:00:00 UTC",
        "title": "",
        "body": "Fantastic product"
      },
      {
        "review_id": "96bfb716-a7f3-4e44-b8bb-0e20fad3b4d3",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Aarna Reddy",
        "timestamp": "2023-10-23 00:00:00 UTC",
        "title": "",
        "body": "Happy with the results of it"
      },
      {
        "review_id": "934e2f46-4fcf-44b2-8429-5d099d4544b7",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Anika Joshi",
        "timestamp": "2023-10-15 00:00:00 UTC",
        "title": "",
        "body": "These capsules are good for preventing urinary tract infections."
      },
      {
        "review_id": "04d82219-c39c-4e8a-a069-982bbc1168fe",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Aarna Kapoor",
        "timestamp": "2023-10-05 00:00:00 UTC",
        "title": "",
        "body": "Highly recommend!"
      },
      {
        "review_id": "87c4c667-c2b2-4005-9360-6c571628808e",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Diya Choudhary",
        "timestamp": "2023-10-01 00:00:00 UTC",
        "title": "",
        "body": "Not worrying about urinary issues."
      },
      {
        "review_id": "aed79979-bd94-4e91-81c4-3907103b10b7",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Siya Chatterjee",
        "timestamp": "2023-09-19 00:00:00 UTC",
        "title": "",
        "body": "I started taking them for infection and thy helped"
      },
      {
        "review_id": "cb9843ac-7d81-49f9-a968-b2f4aa292cc4",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Aanya Joshi",
        "timestamp": "2023-09-19 00:00:00 UTC",
        "title": "",
        "body": "No urinary discomfort"
      },
      {
        "review_id": "bf10f2f2-a588-4239-a117-a827a74d63e2",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Atul Desai",
        "timestamp": "2023-09-02 00:00:00 UTC",
        "title": "",
        "body": "I started taking these capsules for infection nd worked for me"
      },
      {
        "review_id": "5af3d41b-f964-493b-8cac-941cfc10be58",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Akriti Nair",
        "timestamp": "2023-08-24 00:00:00 UTC",
        "title": "",
        "body": "These capsules are a must have"
      },
      {
        "review_id": "74332de4-7594-48d0-90e1-e08b737bf8c9",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 3,
        "author": "Aarna Singh",
        "timestamp": "2023-08-11 00:00:00 UTC",
        "title": "",
        "body": "No more worrying about urinary tract infections!"
      },
      {
        "review_id": "bef551c5-31e4-441d-9249-10b706cce8a4",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Anvi Mehra",
        "timestamp": "2023-08-01 00:00:00 UTC",
        "title": "",
        "body": "I have experienced relief"
      },
      {
        "review_id": "eed3be9f-5d30-4a60-8a54-d76294ddec65",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 3,
        "author": "Saanvi Joshi",
        "timestamp": "2023-07-30 00:00:00 UTC",
        "title": "",
        "body": "I started taking these capsules nd thy were effective"
      },
      {
        "review_id": "1a9169b4-1cb8-4303-a0c6-44df7485d263",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Aarohi Mehra",
        "timestamp": "2023-07-23 00:00:00 UTC",
        "title": "",
        "body": "These capsules have kept me infection free and feeling great"
      },
      {
        "review_id": "b1807074-b544-47ba-8ab4-0f7df7313a0c",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Kyra Mehra",
        "timestamp": "2023-07-09 00:00:00 UTC",
        "title": "",
        "body": "I have experienced a noticeable reduction in infection"
      },
      {
        "review_id": "4acc234b-7275-49f7-b057-bf0803d3f161",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Dhruv Patel",
        "timestamp": "2023-07-02 00:00:00 UTC",
        "title": "",
        "body": "They work quickly and effectively"
      },
      {
        "review_id": "9d4a5a1d-0a3b-45d4-94d7-d2de20447382",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Kia Desai",
        "timestamp": "2023-06-18 00:00:00 UTC",
        "title": "",
        "body": "I feel much more comfortable"
      },
      {
        "review_id": "392d2db1-b09a-4de9-876f-c5fddb7e07ff",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Ananya Joshi",
        "timestamp": "2023-06-06 00:00:00 UTC",
        "title": "",
        "body": "Impressed!"
      },
      {
        "review_id": "f724a666-4342-4a92-b80e-2a421ae4f9e6",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "swara Iyer",
        "timestamp": "2023-05-25 00:00:00 UTC",
        "title": "",
        "body": "Prevents infections…"
      },
      {
        "review_id": "8ea243f4-8720-4efe-907c-7ae5c50f14c6",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Yuvan Iyer",
        "timestamp": "2023-05-23 00:00:00 UTC",
        "title": "",
        "body": "experienced a significant improvement in my condition"
      },
      {
        "review_id": "a8a08370-e3b6-4e6c-8f2a-eee5c03b3b71",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Navya Kapoor",
        "timestamp": "2023-05-22 00:00:00 UTC",
        "title": "",
        "body": "Great product!"
      },
      {
        "review_id": "f49dff84-e6ad-446a-a067-107fbbe9bada",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Zara Kapoor",
        "timestamp": "2023-05-22 00:00:00 UTC",
        "title": "",
        "body": "Very pleased with the results"
      },
      {
        "review_id": "9ffc991d-7a59-49b8-8744-87fa4b347c18",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Anaya Iyer",
        "timestamp": "2023-05-16 00:00:00 UTC",
        "title": "",
        "body": "Happy with the results"
      },
      {
        "review_id": "625c3c6c-2ecd-409e-8b37-7bd88d91a426",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "lekha Sharma",
        "timestamp": "2023-05-15 00:00:00 UTC",
        "title": "",
        "body": "noticed a positive impact"
      },
      {
        "review_id": "816567e1-22c8-4a76-ac26-c63e77ba2f16",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Kiara Joshi",
        "timestamp": "2023-05-08 00:00:00 UTC",
        "title": "",
        "body": "Highly recommended"
      },
      {
        "review_id": "82dc7ff7-c516-4d5c-ae14-71b5280e45f2",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "drikhsa Choudhary",
        "timestamp": "2023-04-07 00:00:00 UTC",
        "title": "",
        "body": "Good product"
      },
      {
        "review_id": "7062ec68-9ed1-4dca-9099-41097b693050",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Rekha Singh",
        "timestamp": "2023-04-07 00:00:00 UTC",
        "title": "",
        "body": "These capsules provide quick and lasting relief."
      },
      {
        "review_id": "dcc86cc3-4fc4-4665-8892-c437b316db0b",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "riya Patel",
        "timestamp": "2023-03-13 00:00:00 UTC",
        "title": "",
        "body": "These capsules have made good difference"
      },
      {
        "review_id": "a0afbb1f-ee40-4f92-bc75-8ed1170907cc",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Aarvi Kapoor",
        "timestamp": "2023-03-03 00:00:00 UTC",
        "title": "",
        "body": "Urinary tract infections used to be a recurring issue for me."
      },
      {
        "review_id": "59816605-85d2-48fa-a909-fc53d61f067e",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "Anvi Iyer",
        "timestamp": "2023-02-27 00:00:00 UTC",
        "title": "",
        "body": "I have noticed a significant improvement in my BPH symptoms"
      },
      {
        "review_id": "fa318ddb-d9ab-4f7c-bd16-49646bed2ac1",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Advika Reddy",
        "timestamp": "2023-02-17 00:00:00 UTC",
        "title": "",
        "body": "I've been taking these capsules for a while now, and they have definitely helped me a lot"
      },
      {
        "review_id": "a8551f7f-63f3-4dfd-be25-f4c584d6e9a6",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Aanya Iyer",
        "timestamp": "2023-01-17 00:00:00 UTC",
        "title": "",
        "body": "Good to deal with the constant discomfort"
      },
      {
        "review_id": "20b560df-3752-4e5d-8da9-509a076608a9",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 5,
        "author": "PREM S.",
        "timestamp": "2023-01-16 00:00:00 UTC",
        "title": "",
        "body": "Great result..."
      },
      {
        "review_id": "1799a5b1-ada4-4395-bdea-3c2ac8109469",
        "verified_buyer": false,
        "product_title": "PROST PLUS AYURVEDIC CAPSULES",
        "product_url": "/products/prost-plus",
        "rating": 4,
        "author": "Aanya Singh",
        "timestamp": "2023-01-06 00:00:00 UTC",
        "title": "",
        "body": "These capsules offer quick and effective relief"
      }
    ],
    "reviews_summary": {
      "total_reviews": 58,
      "average_rating": 4.21,
      "rating_distribution": {
        "1_star": 0,
        "2_star": 0,
        "3_star": 5,
        "4_star": 36,
        "5_star": 17
      },
      "verified_buyers": 7,
      "verified_buyer_percentage": 12.1
    }
  }
}


if __name__ == "__main__":
    # You can now pass a collection parameter
    create_product_from_json(PRODUCT_JSON_DATA, "Male Wellness")
    
    # Or use without collection (will use default mapping)
    # create_product_from_json(PRODUCT_JSON_DATA)
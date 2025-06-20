#!/usr/bin/env python
"""
Script to create sample data for the Purely Yours application
"""
import os
import sys
import django
from decimal import Decimal
from datetime import time

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'purely_yours.settings')
django.setup()

# Imports
from django.contrib.auth import get_user_model
from products.models import Category, Product, ProductVariant, FAQ, ProductTag
from consultations.models import Doctor, DoctorAvailability
from reviews.models import Review

User = get_user_model()

def create_sample_user():
    demo_user, created = User.objects.get_or_create(
        email='demo@purelyyours.com',
        defaults={
            'username': 'demo_user',
            'first_name': 'Demo',
            'last_name': 'User',
            'is_mobile_verified': True
        }
    )
    if created:
        demo_user.set_password('demo123')
        demo_user.save()
        print("👤 Created demo user: demo@purelyyours.com / demo123")
    return demo_user

def create_categories():
    categories_data = [
        {
            'name': 'Male Wellness',
            'slug': 'male-wellness',
            'description': 'Products specifically designed for men\'s health and wellness needs'
        },
        {
            'name': 'Female Wellness',
            'slug': 'female-wellness',
            'description': 'Comprehensive wellness solutions for women\'s health'
        },
        {
            'name': 'Hair & Scalp',
            'slug': 'hair-scalp',
            'description': 'Natural hair care and scalp health products'
        },
        {
            'name': 'Joint & Mobility',
            'slug': 'joint-mobility',
            'description': 'Support for joint health and improved mobility'
        },
        {
            'name': 'Gut & Digestive',
            'slug': 'gut-digestive',
            'description': 'Digestive health and gut wellness products'
        },
        {
            'name': 'Skin & Beauty',
            'slug': 'skin-beauty',
            'description': 'Natural skincare and beauty enhancement products'
        },
        {
            'name': 'Immunity & Detox',
            'slug': 'immunity-detox',
            'description': 'Boost immunity and natural detoxification'
        },
        {
            'name': 'Weight & Metabolism',
            'slug': 'weight-metabolism',
            'description': 'Healthy weight management and metabolism support'
        },
        {
            'name': 'Mind & Mood',
            'slug': 'mind-mood',
            'description': 'Mental wellness and mood enhancement products'
        },
        {
            'name': 'Sugar Management',
            'slug': 'sugar-management',
            'description': 'Natural blood sugar management solutions'
        }
    ]
    
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(slug=cat_data['slug'], defaults=cat_data)
        if created:
            print(f"📂 Created category: {category.name}")

def create_products():
    categories = {
        'male_wellness': Category.objects.get(slug='male-wellness'),
        'female_wellness': Category.objects.get(slug='female-wellness'),
        'hair_scalp': Category.objects.get(slug='hair-scalp'),
        'joint_mobility': Category.objects.get(slug='joint-mobility'),
        'gut_digestive': Category.objects.get(slug='gut-digestive'),
        'skin_beauty': Category.objects.get(slug='skin-beauty'),
        'immunity_detox': Category.objects.get(slug='immunity-detox'),
        'weight_metabolism': Category.objects.get(slug='weight-metabolism'),
        'mind_mood': Category.objects.get(slug='mind-mood'),
        'sugar_management': Category.objects.get(slug='sugar-management'),
    }
    products_data = [
        # Male Wellness
        {"name": "Men's Vitality Booster", "slug": "mens-vitality-booster", "category": categories['male_wellness'], "sku": "MW-001", "price": Decimal('1299'), "original_price": Decimal('1599'), "stock_quantity": 100, "description": "Boosts men's vitality."},
        {"name": "Testosterone Support Formula", "slug": "testosterone-support-formula", "category": categories['male_wellness'], "sku": "MW-002", "price": Decimal('1899'), "original_price": Decimal('2299'), "stock_quantity": 100, "description": "Supports testosterone levels."},
        {"name": "Men's Energy Complex", "slug": "mens-energy-complex", "category": categories['male_wellness'], "sku": "MW-003", "price": Decimal('999'), "original_price": Decimal('1299'), "stock_quantity": 100, "description": "Energy for men."},
        {"name": "Prostate Health Support", "slug": "prostate-health-support", "category": categories['male_wellness'], "sku": "MW-004", "price": Decimal('1599'), "original_price": Decimal('1999'), "stock_quantity": 100, "description": "Supports prostate health."},
        # Female Wellness
        {"name": "Women's Hormonal Balance", "slug": "womens-hormonal-balance", "category": categories['female_wellness'], "sku": "FW-001", "price": Decimal('1199'), "original_price": Decimal('1499'), "stock_quantity": 100, "description": "Balances hormones."},
        {"name": "Iron & Folic Acid Complex", "slug": "iron-folic-acid-complex", "category": categories['female_wellness'], "sku": "FW-002", "price": Decimal('699'), "original_price": Decimal('899'), "stock_quantity": 100, "description": "Iron and folic acid."},
        {"name": "Women's Multivitamin", "slug": "womens-multivitamin", "category": categories['female_wellness'], "sku": "FW-003", "price": Decimal('899'), "original_price": Decimal('1199'), "stock_quantity": 100, "description": "Multivitamin for women."},
        {"name": "Pregnancy Support Formula", "slug": "pregnancy-support-formula", "category": categories['female_wellness'], "sku": "FW-004", "price": Decimal('1399'), "original_price": Decimal('1799'), "stock_quantity": 100, "description": "Support during pregnancy."},
        # Hair & Scalp
        {"name": "Hair Growth Serum", "slug": "hair-growth-serum", "category": categories['hair_scalp'], "sku": "HS-001", "price": Decimal('799'), "original_price": Decimal('999'), "stock_quantity": 100, "description": "Serum for hair growth."},
        {"name": "Anti-Dandruff Treatment", "slug": "anti-dandruff-treatment", "category": categories['hair_scalp'], "sku": "HS-002", "price": Decimal('599'), "original_price": Decimal('799'), "stock_quantity": 100, "description": "Removes dandruff."},
        {"name": "Scalp Nourishing Oil", "slug": "scalp-nourishing-oil", "category": categories['hair_scalp'], "sku": "HS-003", "price": Decimal('499'), "original_price": Decimal('699'), "stock_quantity": 100, "description": "Nourishes scalp."},
        {"name": "Hair Strengthening Capsules", "slug": "hair-strengthening-capsules", "category": categories['hair_scalp'], "sku": "HS-004", "price": Decimal('1099'), "original_price": Decimal('1399'), "stock_quantity": 100, "description": "Strengthens hair."},
        # Joint & Mobility
        {"name": "Joint Care Formula", "slug": "joint-care-formula", "category": categories['joint_mobility'], "sku": "JM-001", "price": Decimal('1493'), "original_price": Decimal('1990'), "stock_quantity": 100, "description": "Joint support."},
        {"name": "Arthritis Relief Capsules", "slug": "arthritis-relief-capsules", "category": categories['joint_mobility'], "sku": "JM-002", "price": Decimal('1299'), "original_price": Decimal('1699'), "stock_quantity": 100, "description": "Relief for arthritis."},
        {"name": "Bone Strength Formula", "slug": "bone-strength-formula", "category": categories['joint_mobility'], "sku": "JM-003", "price": Decimal('999'), "original_price": Decimal('1299'), "stock_quantity": 100, "description": "Strengthens bones."},
        {"name": "Mobility Support Gel", "slug": "mobility-support-gel", "category": categories['joint_mobility'], "sku": "JM-004", "price": Decimal('699'), "original_price": Decimal('899'), "stock_quantity": 100, "description": "Supports mobility."},
        # Gut & Digestive
        {"name": "Digestive Enzyme Complex", "slug": "digestive-enzyme-complex", "category": categories['gut_digestive'], "sku": "GD-001", "price": Decimal('899'), "original_price": Decimal('1199'), "stock_quantity": 100, "description": "Digestive enzymes."},
        {"name": "Probiotic Capsules", "slug": "probiotic-capsules", "category": categories['gut_digestive'], "sku": "GD-002", "price": Decimal('1199'), "original_price": Decimal('1599'), "stock_quantity": 100, "description": "Probiotics for gut."},
        {"name": "Gut Health Formula", "slug": "gut-health-formula", "category": categories['gut_digestive'], "sku": "GD-003", "price": Decimal('799'), "original_price": Decimal('999'), "stock_quantity": 100, "description": "Gut health support."},
        {"name": "Acidity Relief Tablets", "slug": "acidity-relief-tablets", "category": categories['gut_digestive'], "sku": "GD-004", "price": Decimal('499'), "original_price": Decimal('699'), "stock_quantity": 100, "description": "Relieves acidity."},
        # Skin & Beauty
        {"name": "Collagen Beauty Drink", "slug": "collagen-beauty-drink", "category": categories['skin_beauty'], "sku": "SB-001", "price": Decimal('1599'), "original_price": Decimal('1999'), "stock_quantity": 100, "description": "Collagen for skin."},
        {"name": "Vitamin C Serum", "slug": "vitamin-c-serum", "category": categories['skin_beauty'], "sku": "SB-002", "price": Decimal('899'), "original_price": Decimal('1199'), "stock_quantity": 100, "description": "Vitamin C for skin."},
        {"name": "Anti-Aging Cream", "slug": "anti-aging-cream", "category": categories['skin_beauty'], "sku": "SB-003", "price": Decimal('1299'), "original_price": Decimal('1699'), "stock_quantity": 100, "description": "Reduces aging signs."},
        {"name": "Skin Glow Capsules", "slug": "skin-glow-capsules", "category": categories['skin_beauty'], "sku": "SB-004", "price": Decimal('999'), "original_price": Decimal('1299'), "stock_quantity": 100, "description": "Glowing skin."},
        # Immunity & Detox
        {"name": "Organic Immunity Boost", "slug": "organic-immunity-boost", "category": categories['immunity_detox'], "sku": "ID-001", "price": Decimal('536'), "original_price": Decimal('595'), "stock_quantity": 100, "description": "Boosts immunity."},
        {"name": "Detox Tea Blend", "slug": "detox-tea-blend", "category": categories['immunity_detox'], "sku": "ID-002", "price": Decimal('699'), "original_price": Decimal('899'), "stock_quantity": 100, "description": "Detox tea."},
        {"name": "Vitamin D3 Capsules", "slug": "vitamin-d3-capsules", "category": categories['immunity_detox'], "sku": "ID-003", "price": Decimal('799'), "original_price": Decimal('999'), "stock_quantity": 100, "description": "Vitamin D3 for immunity."},
        {"name": "Liver Detox Formula", "slug": "liver-detox-formula", "category": categories['immunity_detox'], "sku": "ID-004", "price": Decimal('1199'), "original_price": Decimal('1499'), "stock_quantity": 100, "description": "Liver detox."},
        # Weight & Metabolism
        {"name": "Weight Management Tea", "slug": "weight-management-tea", "category": categories['weight_metabolism'], "sku": "WM-001", "price": Decimal('489'), "original_price": Decimal('595'), "stock_quantity": 100, "description": "Tea for weight management."},
        {"name": "Fat Burner Capsules", "slug": "fat-burner-capsules", "category": categories['weight_metabolism'], "sku": "WM-002", "price": Decimal('1299'), "original_price": Decimal('1699'), "stock_quantity": 100, "description": "Burns fat."},
        {"name": "Metabolism Booster", "slug": "metabolism-booster", "category": categories['weight_metabolism'], "sku": "WM-003", "price": Decimal('999'), "original_price": Decimal('1299'), "stock_quantity": 100, "description": "Boosts metabolism."},
        {"name": "Appetite Control Formula", "slug": "appetite-control-formula", "category": categories['weight_metabolism'], "sku": "WM-004", "price": Decimal('899'), "original_price": Decimal('1199'), "stock_quantity": 100, "description": "Controls appetite."},
        # Mind & Mood
        {"name": "Stress Relief Capsules", "slug": "stress-relief-capsules", "category": categories['mind_mood'], "sku": "MM-001", "price": Decimal('899'), "original_price": Decimal('1199'), "stock_quantity": 100, "description": "Relieves stress."},
        {"name": "Memory Enhancer", "slug": "memory-enhancer", "category": categories['mind_mood'], "sku": "MM-002", "price": Decimal('1199'), "original_price": Decimal('1599'), "stock_quantity": 100, "description": "Enhances memory."},
        {"name": "Mood Support Formula", "slug": "mood-support-formula", "category": categories['mind_mood'], "sku": "MM-003", "price": Decimal('799'), "original_price": Decimal('999'), "stock_quantity": 100, "description": "Supports mood."},
        {"name": "Sleep Aid Natural", "slug": "sleep-aid-natural", "category": categories['mind_mood'], "sku": "MM-004", "price": Decimal('699'), "original_price": Decimal('899'), "stock_quantity": 100, "description": "Natural sleep aid."},
        # Sugar Management
        {"name": "Gluco Defence", "slug": "gluco-defence", "category": categories['sugar_management'], "sku": "SM-001", "price": Decimal('925'), "original_price": Decimal('995'), "stock_quantity": 100, "description": "Supports blood sugar."},
        {"name": "Organic Sugar Shield", "slug": "organic-sugar-shield", "category": categories['sugar_management'], "sku": "SM-002", "price": Decimal('489'), "original_price": Decimal('595'), "stock_quantity": 100, "description": "Shields sugar."},
        {"name": "Diabetes Care Tea", "slug": "diabetes-care-tea", "category": categories['sugar_management'], "sku": "SM-003", "price": Decimal('299'), "original_price": Decimal('399'), "stock_quantity": 100, "description": "Tea for diabetes care."},
        {"name": "Blood Sugar Monitor Kit", "slug": "blood-sugar-monitor-kit", "category": categories['sugar_management'], "sku": "SM-004", "price": Decimal('1299'), "original_price": Decimal('1599'), "stock_quantity": 100, "description": "Monitor kit."},
    ]
    for prod_data in products_data:
        product, created = Product.objects.get_or_create(slug=prod_data['slug'], defaults=prod_data)
        if created:
            print(f"🌿 Created product: {product.name}")
            # Optionally create variants/FAQs here
            create_variants(product)
            create_faqs(product)

def create_variants(product):
    variants = [
        {'name': '30 Capsules', 'sku': f"{product.sku}-30", 'price': product.price, 'original_price': product.original_price},
        {'name': '60 Capsules', 'sku': f"{product.sku}-60", 'price': product.price * Decimal('1.8'), 'original_price': product.original_price * Decimal('1.8')},
    ]
    for variant in variants:
        variant.update({'product': product, 'stock_quantity': 50})
        ProductVariant.objects.get_or_create(sku=variant['sku'], defaults=variant)

def create_faqs(product):
    faqs = [
        {
            'question': 'What makes this Shilajit different from others?',
            'answer': 'Our Shilajit contains 80%+ Fulvic Acid, sourced directly from the Himalayas, and is combined with clinically studied KSM-66 Ashwagandha and Safed Musli for enhanced benefits.',
            'order': 1
        },
        {
            'question': 'How long does it take to see results?',
            'answer': 'Most users notice increased energy levels within 2-3 weeks of consistent use. For optimal benefits including strength and vitality improvements, we recommend using for 2-3 months consistently.',
            'order': 2
        },
        {
            'question': 'Can women take this supplement?',
            'answer': 'While this formula is primarily designed for men\'s health needs, women can also benefit from Shilajit\'s energy-supporting properties. However, we recommend consulting with a healthcare provider before use.',
            'order': 3
        }
    ]
                
    for faq in faqs:
        FAQ.objects.get_or_create(product=product, question=faq['question'], defaults=faq)

def create_doctors():
    doctors_data = [
        {
            'name': 'Priya Sharma',
            'email': 'dr.priya@purelyyours.com',
            'mobile': '+91-9876543210',
            'specialization': 'Ayurvedic Medicine',
            'qualification': 'BAMS, MD (Ayurveda)',
            'experience_years': 12,
            'bio': 'Expert in holistic wellness.',
            'consultation_fee': Decimal('500.00')
        }
    ]
    for doc_data in doctors_data:
        doctor, created = Doctor.objects.get_or_create(email=doc_data['email'], defaults=doc_data)
        if created:
            print(f"👨‍⚕️ Created doctor: Dr. {doctor.name}")
            for weekday in range(5):
                DoctorAvailability.objects.get_or_create(
                    doctor=doctor,
                    weekday=weekday,
                    start_time=time(9, 0),
                    end_time=time(17, 0)
                )

def create_reviews(user):
    for product in Product.objects.all()[:2]:
        Review.objects.get_or_create(
            user=user,
            product=product,
            defaults={
                'rating': 5,
                'title': 'Excellent!',
                'comment': 'Highly recommended.',
                'is_verified_purchase': True
            }
        )

def create_sample_data():
    print("🌱 Starting sample data creation...")
    user = create_sample_user()
    create_categories()
    create_products()
    # create_doctors()
    # create_reviews(user)
    print("✅ Sample data created successfully!")

if __name__ == "__main__":
    create_sample_data()

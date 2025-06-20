#!/usr/bin/env python
"""
Script to create sample data for the Purely Yours application
"""
import os
import sys
import django
from decimal import Decimal

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'purely_yours.settings')

django.setup()

from django.contrib.auth import get_user_model
from products.models import Category, Product, ProductVariant, ProductImage, ProductTag, ProductTagAssignment, FAQ
from consultations.models import Doctor, DoctorAvailability
from reviews.models import Review

User = get_user_model()

def create_sample_data():
    """Create sample data for the application"""
    print("🌱 Creating sample data...")
    
    # Create demo user
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
    
    # Create categories
    categories_data = [
        {'name': 'Immunity & Wellness', 'slug': 'immunity-wellness', 'description': 'Boost your immunity naturally'},
        {'name': 'Energy & Vitality', 'slug': 'energy-vitality', 'description': 'Natural energy boosters'},
        {'name': 'Digestive Health', 'slug': 'digestive-health', 'description': 'Support your digestive system'},
        {'name': 'Joint & Bone Health', 'slug': 'joint-bone-health', 'description': 'Strengthen bones and joints'},
        {'name': 'Heart Health', 'slug': 'heart-health', 'description': 'Cardiovascular wellness'},
        {'name': 'Brain & Memory', 'slug': 'brain-memory', 'description': 'Cognitive health support'},
        {'name': 'Skin & Hair', 'slug': 'skin-hair', 'description': 'Natural beauty from within'},
        {'name': 'Weight Management', 'slug': 'weight-management', 'description': 'Healthy weight solutions'},
        {'name': 'Stress & Sleep', 'slug': 'stress-sleep', 'description': 'Relaxation and better sleep'},
        {'name': 'Women\'s Health', 'slug': 'womens-health', 'description': 'Specialized women\'s wellness'},
    ]
    
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"📂 Created category: {category.name}")
    
    # Create sample products
    immunity_category = Category.objects.get(slug='immunity-wellness')
    energy_category = Category.objects.get(slug='energy-vitality')
    digestive_category = Category.objects.get(slug='digestive-health')
    joint_category = Category.objects.get(slug='joint-bone-health')
    
    products_data = [
        {
            'name': 'Pure Himalayan Shilajit',
            'slug': 'pure-himalayan-shilajit',
            'category': energy_category,
            'sku': 'PY-SHIL-001',
            'price': Decimal('1299.00'),
            'original_price': Decimal('1599.00'),
            'stock_quantity': 50,
            'description': 'Premium quality Himalayan Shilajit for enhanced energy and vitality. Sourced from the pristine mountains of Himalayas.',
            'key_benefits': [
                'Boosts energy and stamina',
                'Enhances physical performance',
                'Supports immune system',
                'Rich in fulvic acid and minerals',
                'Anti-aging properties'
            ],
            'key_ingredients': [
                'Pure Himalayan Shilajit Extract',
                'Fulvic Acid (minimum 60%)',
                'Essential minerals and trace elements'
            ],
            'how_to_consume': [
                'Take 1-2 capsules daily',
                'Consume with warm water or milk',
                'Best taken on empty stomach',
                'For optimal results, use for 3 months'
            ],
            'who_should_take': [
                'Adults looking to boost energy',
                'Athletes and fitness enthusiasts',
                'People with active lifestyles',
                'Those experiencing fatigue'
            ],
            'how_it_helps': 'Shilajit is a powerful adaptogen that helps the body cope with stress and enhances overall vitality. It supports cellular energy production and helps maintain optimal health.',
            'disclaimer': 'This product is not intended to diagnose, treat, cure, or prevent any disease. Consult your healthcare provider before use.'
        },
        {
            'name': 'Ashwagandha Premium',
            'slug': 'ashwagandha-premium',
            'category': immunity_category,
            'sku': 'PY-ASH-001',
            'price': Decimal('899.00'),
            'original_price': Decimal('1199.00'),
            'stock_quantity': 75,
            'description': 'High-potency Ashwagandha extract for stress relief and immune support.',
            'key_benefits': [
                'Reduces stress and anxiety',
                'Boosts immune function',
                'Improves sleep quality',
                'Enhances mental clarity',
                'Supports adrenal health'
            ],
            'key_ingredients': [
                'Ashwagandha Root Extract (500mg)',
                'Withanolides (minimum 5%)',
                'Natural capsule shell'
            ],
            'how_to_consume': [
                'Take 1 capsule twice daily',
                'Consume with meals',
                'Use consistently for best results'
            ],
            'who_should_take': [
                'Adults experiencing stress',
                'People with sleep issues',
                'Those looking to boost immunity',
                'Individuals with busy lifestyles'
            ],
            'how_it_helps': 'Ashwagandha is an ancient adaptogenic herb that helps the body manage stress while supporting overall wellness and vitality.',
            'disclaimer': 'Consult your healthcare provider before use, especially if pregnant or nursing.'
        },
        {
            'name': 'Triphala Digestive Support',
            'slug': 'triphala-digestive-support',
            'category': digestive_category,
            'sku': 'PY-TRI-001',
            'price': Decimal('699.00'),
            'original_price': Decimal('899.00'),
            'stock_quantity': 100,
            'description': 'Traditional Ayurvedic blend for digestive health and detoxification.',
            'key_benefits': [
                'Supports healthy digestion',
                'Natural detoxification',
                'Promotes regular bowel movements',
                'Rich in antioxidants',
                'Supports weight management'
            ],
            'key_ingredients': [
                'Amla (Emblica officinalis)',
                'Bibhitaki (Terminalia bellirica)',
                'Haritaki (Terminalia chebula)'
            ],
            'how_to_consume': [
                'Take 1-2 tablets before bedtime',
                'Consume with warm water',
                'Start with 1 tablet and increase gradually'
            ],
            'who_should_take': [
                'Adults with digestive issues',
                'People looking for natural detox',
                'Those with irregular bowel movements',
                'Individuals seeking weight management support'
            ],
            'how_it_helps': 'Triphala is a time-tested Ayurvedic formula that gently cleanses and supports the digestive system while providing antioxidant benefits.',
            'disclaimer': 'Not recommended during pregnancy. Consult your healthcare provider before use.'
        },
        {
            'name': 'Turmeric Curcumin Complex',
            'slug': 'turmeric-curcumin-complex',
            'category': joint_category,
            'sku': 'PY-TUR-001',
            'price': Decimal('799.00'),
            'original_price': Decimal('999.00'),
            'stock_quantity': 80,
            'description': 'High-absorption turmeric with black pepper for joint health and inflammation support.',
            'key_benefits': [
                'Supports joint health',
                'Natural anti-inflammatory',
                'Powerful antioxidant',
                'Enhanced absorption formula',
                'Supports overall wellness'
            ],
            'key_ingredients': [
                'Turmeric Root Extract (500mg)',
                'Curcumin (95% standardized)',
                'Black Pepper Extract (Piperine)',
                'Organic turmeric powder'
            ],
            'how_to_consume': [
                'Take 1 capsule twice daily',
                'Consume with meals',
                'Take with healthy fats for better absorption'
            ],
            'who_should_take': [
                'Adults with joint discomfort',
                'Athletes and active individuals',
                'People seeking anti-inflammatory support',
                'Those looking for antioxidant benefits'
            ],
            'how_it_helps': 'Our enhanced turmeric formula with piperine provides superior absorption and bioavailability for maximum anti-inflammatory and antioxidant benefits.',
            'disclaimer': 'Consult your healthcare provider before use, especially if taking blood-thinning medications.'
        }
    ]
    
    for product_data in products_data:
        product, created = Product.objects.get_or_create(
            slug=product_data['slug'],
            defaults=product_data
        )
        if created:
            print(f"🌿 Created product: {product.name}")
            
            # Create product variants
            variants_data = [
                {'name': '30 Capsules', 'sku': f"{product.sku}-30", 'price': product.price, 'original_price': product.original_price},
                {'name': '60 Capsules', 'sku': f"{product.sku}-60", 'price': product.price * Decimal('1.8'), 'original_price': product.original_price * Decimal('1.8')},
                {'name': '90 Capsules', 'sku': f"{product.sku}-90", 'price': product.price * Decimal('2.5'), 'original_price': product.original_price * Decimal('2.5')},
            ]
            
            for variant_data in variants_data:
                variant_data['product'] = product
                variant_data['stock_quantity'] = 50
                ProductVariant.objects.get_or_create(
                    sku=variant_data['sku'],
                    defaults=variant_data
                )
            
            # Create FAQs
            faqs_data = [
                {
                    'question': 'How long does it take to see results?',
                    'answer': 'Most customers notice improvements within 2-4 weeks of consistent use. For optimal results, we recommend using the product for at least 3 months.',
                    'order': 1
                },
                {
                    'question': 'Are there any side effects?',
                    'answer': 'Our products are made from natural ingredients and are generally well-tolerated. However, if you experience any adverse reactions, discontinue use and consult your healthcare provider.',
                    'order': 2
                },
                {
                    'question': 'Can I take this with other medications?',
                    'answer': 'While our products are natural, we recommend consulting with your healthcare provider before combining with any medications or if you have any medical conditions.',
                    'order': 3
                },
                {
                    'question': 'Is this product suitable for vegetarians?',
                    'answer': 'Yes, all our products are 100% vegetarian and made with plant-based ingredients.',
                    'order': 4
                }
            ]
            
            for faq_data in faqs_data:
                faq_data['product'] = product
                FAQ.objects.get_or_create(
                    product=product,
                    question=faq_data['question'],
                    defaults=faq_data
                )
    
    # Create sample doctors
    doctors_data = [
        {
            'name': 'Priya Sharma',
            'email': 'dr.priya@purelyyours.com',
            'mobile': '+91-9876543210',
            'specialization': 'Ayurvedic Medicine',
            'qualification': 'BAMS, MD (Ayurveda)',
            'experience_years': 12,
            'bio': 'Dr. Priya Sharma is a renowned Ayurvedic practitioner with over 12 years of experience in holistic wellness. She specializes in digestive health, immunity, and stress management through traditional Ayurvedic approaches.',
            'consultation_fee': Decimal('500.00')
        },
        {
            'name': 'Rajesh Kumar',
            'email': 'dr.rajesh@purelyyours.com',
            'mobile': '+91-9876543211',
            'specialization': 'Nutritional Medicine',
            'qualification': 'MBBS, MD (Community Medicine), Certified Nutritionist',
            'experience_years': 8,
            'bio': 'Dr. Rajesh Kumar combines modern medical knowledge with nutritional science to help patients achieve optimal health through diet and lifestyle modifications.',
            'consultation_fee': Decimal('600.00')
        },
        {
            'name': 'Meera Patel',
            'email': 'dr.meera@purelyyours.com',
            'mobile': '+91-9876543212',
            'specialization': 'Integrative Medicine',
            'qualification': 'MBBS, MD (Internal Medicine), Fellowship in Integrative Medicine',
            'experience_years': 15,
            'bio': 'Dr. Meera Patel is an expert in integrative medicine, combining conventional medical treatments with evidence-based complementary therapies for comprehensive patient care.',
            'consultation_fee': Decimal('750.00')
        }
    ]
    
    for doctor_data in doctors_data:
        doctor, created = Doctor.objects.get_or_create(
            email=doctor_data['email'],
            defaults=doctor_data
        )
        if created:
            print(f"👨‍⚕️ Created doctor: Dr. {doctor.name}")
            
            # Create availability for weekdays (Monday to Friday)
            for weekday in range(5):  # 0-4 (Monday to Friday)
                DoctorAvailability.objects.get_or_create(
                    doctor=doctor,
                    weekday=weekday,
                    start_time='09:00',
                    end_time='17:00'
                )
    
    # Create sample reviews
    products = Product.objects.all()
    for product in products[:2]:  # Add reviews for first 2 products
        Review.objects.get_or_create(
            user=demo_user,
            product=product,
            defaults={
                'rating': 5,
                'title': 'Excellent product!',
                'comment': 'I have been using this product for 2 months and have seen great results. Highly recommended!',
                'is_verified_purchase': True
            }
        )
    
    print("✅ Sample data created successfully!")
    print("\n📋 Created:")
    print(f"   • {Category.objects.count()} categories")
    print(f"   • {Product.objects.count()} products")
    print(f"   • {ProductVariant.objects.count()} product variants")
    print(f"   • {Doctor.objects.count()} doctors")
    print(f"   • {Review.objects.count()} reviews")
    print(f"   • 1 demo user (demo@purelyyours.com / demo123)")

def create_categories():
    """Create product categories"""
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
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"Created category: {category.name}")

def create_products():
    """Create sample products"""
    
    # Get categories
    sugar_mgmt = Category.objects.get(slug='sugar-management')
    male_wellness = Category.objects.get(slug='male-wellness')
    joint_mobility = Category.objects.get(slug='joint-mobility')
    immunity = Category.objects.get(slug='immunity-detox')
    
    products_data = [
        {
            'name': 'Purely Yours Shilajit - Premium Himalayan Extract',
            'slug': 'shilajit-premium-himalayan-extract',
            'category': male_wellness,
            'sku': 'PY-SH-001',
            'price': Decimal('925.00'),
            'original_price': Decimal('995.00'),
            'stock_quantity': 50,
            'description': 'Purely Yours Shilajit is a premium supplement formulated with pure Himalayan Shilajit Extract containing 80%+ Fulvic Acid, combined with KSM-66 Ashwagandha and Safed Musli.',
            'key_benefits': [
                'Supports an active lifestyle & vitality',
                'Assists in maintaining natural energy levels',
                'Helps with muscle strength & post-workout recovery',
                'Aids overall wellness',
                'Ideal as a workout companion'
            ],
            'key_ingredients': [
                {'name': 'Pure Shilajit', 'description': 'Fuels drive and keeps you going strong'},
                {'name': 'KSM 66- Ashwagandha', 'description': 'Helps stay cool, calm, and ready to take on the day'},
                {'name': 'Safed Musli', 'description': 'Keeps spirits high and muscles mighty'}
            ],
            'how_to_consume': [
                'Take 1 capsule twice a day (after breakfast and dinner) with warm milk or warm water.',
                'For personalized guidance, especially if you have a medical condition, consult your healthcare professional.'
            ],
            'who_should_take': [
                'Men looking to naturally support endurance',
                'Anyone seeking a balanced way to help boost stamina',
                'Individuals aiming to enhance daily performance'
            ],
            'how_it_helps': 'Purely Yours Shilajit is formulated using pure Himalayan Shilajit Extract (80%+ Fulvic Acid), KSM-66 Ashwagandha, and Safed Musli.',
            'disclaimer': 'Individual results may vary depending on diet, exercise, and lifestyle. This product is not intended to diagnose, treat, cure, or prevent any disease.'
        },
        {
            'name': 'Gluco Defence',
            'slug': 'gluco-defence',
            'category': sugar_mgmt,
            'sku': 'PY-GD-001',
            'price': Decimal('925.00'),
            'original_price': Decimal('995.00'),
            'stock_quantity': 30,
            'description': 'Natural blood sugar management supplement with proven herbs and minerals.',
            'key_benefits': [
                'Supports healthy blood sugar levels',
                'Helps maintain glucose metabolism',
                'Natural herbal formula',
                'No artificial additives'
            ],
            'key_ingredients': [
                {'name': 'Bitter Melon', 'description': 'Natural blood sugar support'},
                {'name': 'Gymnema Sylvestre', 'description': 'Traditional sugar destroyer'},
                {'name': 'Chromium', 'description': 'Essential mineral for glucose metabolism'}
            ],
            'how_to_consume': [
                'Take 1 capsule twice daily before meals',
                'Maintain regular exercise and healthy diet'
            ],
            'who_should_take': [
                'Adults with blood sugar concerns',
                'People following diabetic diet',
                'Those seeking natural glucose support'
            ],
            'how_it_helps': 'Combines traditional Ayurvedic herbs with modern nutritional science.',
            'disclaimer': 'Consult your doctor before use if you have diabetes or are on medication.'
        },
        {
            'name': 'Joint Care Formula',
            'slug': 'joint-care-formula',
            'category': joint_mobility,
            'sku': 'PY-JC-001',
            'price': Decimal('1493.00'),
            'original_price': Decimal('1990.00'),
            'stock_quantity': 25,
            'description': 'Advanced joint support formula with glucosamine, chondroitin, and natural anti-inflammatory herbs.',
            'key_benefits': [
                'Supports joint flexibility',
                'Reduces joint discomfort',
                'Promotes cartilage health',
                'Natural anti-inflammatory support'
            ],
            'key_ingredients': [
                {'name': 'Glucosamine', 'description': 'Building block of cartilage'},
                {'name': 'Chondroitin', 'description': 'Supports joint structure'},
                {'name': 'Turmeric', 'description': 'Natural anti-inflammatory'}
            ],
            'how_to_consume': [
                'Take 2 capsules daily with meals',
                'Continue for at least 3 months for best results'
            ],
            'who_should_take': [
                'Adults with joint discomfort',
                'Active individuals',
                'People over 40 years'
            ],
            'how_it_helps': 'Scientifically formulated to support joint health and mobility.',
            'disclaimer': 'Results may vary. Consult healthcare provider if pregnant or nursing.'
        },
        {
            'name': 'Organic Immunity Boost',
            'slug': 'organic-immunity-boost',
            'category': immunity,
            'sku': 'PY-IB-001',
            'price': Decimal('536.00'),
            'original_price': Decimal('595.00'),
            'stock_quantity': 40,
            'description': 'Organic immunity booster with vitamin C, zinc, and powerful antioxidants.',
            'key_benefits': [
                'Boosts natural immunity',
                'Rich in antioxidants',
                'Supports overall health',
                'Organic and natural'
            ],
            'key_ingredients': [
                {'name': 'Vitamin C', 'description': 'Essential immune vitamin'},
                {'name': 'Zinc', 'description': 'Immune system mineral'},
                {'name': 'Elderberry', 'description': 'Natural immune support'}
            ],
            'how_to_consume': [
                'Take 1 capsule daily with breakfast',
                'Can be increased to 2 capsules during seasonal changes'
            ],
            'who_should_take': [
                'Adults seeking immune support',
                'People with busy lifestyles',
                'Those exposed to environmental stress'
            ],
            'how_it_helps': 'Combines organic ingredients to naturally support your immune system.',
            'disclaimer': 'Not intended to replace a balanced diet and healthy lifestyle.'
        }
    ]
    
    for prod_data in products_data:
        product, created = Product.objects.get_or_create(
            slug=prod_data['slug'],
            defaults=prod_data
        )
        if created:
            print(f"Created product: {product.name}")
            
            # Create variants for Shilajit product
            if product.slug == 'shilajit-premium-himalayan-extract':
                variants_data = [
                    {'name': '30 Capsules', 'sku': 'PY-SH-30-001', 'price': Decimal('925.00'), 'original_price': Decimal('995.00'), 'stock_quantity': 25},
                    {'name': '60 Capsules', 'sku': 'PY-SH-60-001', 'price': Decimal('1650.00'), 'original_price': Decimal('1890.00'), 'stock_quantity': 18},
                    {'name': '90 Capsules (Best Value)', 'sku': 'PY-SH-90-001', 'price': Decimal('2299.00'), 'original_price': Decimal('2785.00'), 'stock_quantity': 12}
                ]
                
                for variant_data in variants_data:
                    variant_data['product'] = product
                    ProductVariant.objects.create(**variant_data)
                    print(f"Created variant: {variant_data['name']}")
            
            # Create FAQs for Shilajit product
            if product.slug == 'shilajit-premium-himalayan-extract':
                faqs_data = [
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
                
                for faq_data in faqs_data:
                    faq_data['product'] = product
                    FAQ.objects.create(**faq_data)

def create_tags():
    """Create product tags"""
    tags_data = [
        {'name': 'Natural', 'slug': 'natural'},
        {'name': 'Ayurvedic', 'slug': 'ayurvedic'},
        {'name': 'Energy Booster', 'slug': 'energy-booster'},
        {'name': 'Himalayan', 'slug': 'himalayan'},
        {'name': 'Organic', 'slug': 'organic'},
        {'name': 'Herbal', 'slug': 'herbal'},
        {'name': 'Immunity', 'slug': 'immunity'},
        {'name': 'Joint Support', 'slug': 'joint-support'}
    ]
    
    for tag_data in tags_data:
        tag, created = ProductTag.objects.get_or_create(
            slug=tag_data['slug'],
            defaults=tag_data
        )
        if created:
            print(f"Created tag: {tag.name}")

def create_doctors():
    """Create sample doctors"""
    doctors_data = [
        {
            'name': 'Priya Sharma',
            'specialization': 'Ayurvedic Medicine',
            'experience_years': 15,
            'qualification': 'BAMS, MD (Ayurveda)',
            'bio': 'Dr. Priya Sharma is a renowned Ayurvedic practitioner with over 15 years of experience in holistic wellness and natural healing.',
            'consultation_fee': Decimal('500.00')
        },
        {
            'name': 'Rajesh Kumar',
            'specialization': 'Herbal Medicine',
            'experience_years': 12,
            'qualification': 'BHMS, MD (Homeopathy)',
            'bio': 'Dr. Rajesh Kumar specializes in herbal medicine and has helped thousands of patients achieve better health through natural remedies.',
            'consultation_fee': Decimal('450.00')
        },
        {
            'name': 'Meera Patel',
            'specialization': 'Nutrition & Wellness',
            'experience_years': 10,
            'qualification': 'MSc Nutrition, Certified Wellness Coach',
            'bio': 'Dr. Meera Patel is a nutrition expert who focuses on personalized wellness plans and dietary guidance for optimal health.',
            'consultation_fee': Decimal('600.00')
        }
    ]
    
    for doctor_data in doctors_data:
        doctor, created = Doctor.objects.get_or_create(
            email=doctor_data['email'],
            defaults=doctor_data
        )
        if created:
            print(f"👨‍⚕️ Created doctor: Dr. {doctor.name}")
            
            # Create availability for weekdays (Monday to Friday)
            for weekday in range(5):  # 0-4 (Monday to Friday)
                DoctorAvailability.objects.get_or_create(
                    doctor=doctor,
                    weekday=weekday,
                    start_time='09:00',
                    end_time='17:00'
                )
    
    # Create sample reviews
    products = Product.objects.all()
    for product in products[:2]:  # Add reviews for first 2 products
        Review.objects.get_or_create(
            user=demo_user,
            product=product,
            defaults={
                'rating': 5,
                'title': 'Excellent product!',
                'comment': 'I have been using this product for 2 months and have seen great results. Highly recommended!',
                'is_verified_purchase': True
            }
        )
    
    print("✅ Sample data created successfully!")
    print("\n📋 Created:")
    print(f"   • {Category.objects.count()} categories")
    print(f"   • {Product.objects.count()} products")
    print(f"   • {ProductVariant.objects.count()} product variants")
    print(f"   • {Doctor.objects.count()} doctors")
    print(f"   • {Review.objects.count()} reviews")
    print(f"   • 1 demo user (demo@purelyyours.com / demo123)")

def create_categories():
    """Create product categories"""
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
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"Created category: {category.name}")

def create_products():
    """Create sample products"""
    
    # Get categories
    sugar_mgmt = Category.objects.get(slug='sugar-management')
    male_wellness = Category.objects.get(slug='male-wellness')
    joint_mobility = Category.objects.get(slug='joint-mobility')
    immunity = Category.objects.get(slug='immunity-detox')
    
    products_data = [
        {
            'name': 'Purely Yours Shilajit - Premium Himalayan Extract',
            'slug': 'shilajit-premium-himalayan-extract',
            'category': male_wellness,
            'sku': 'PY-SH-001',
            'price': Decimal('925.00'),
            'original_price': Decimal('995.00'),
            'stock_quantity': 50,
            'description': 'Purely Yours Shilajit is a premium supplement formulated with pure Himalayan Shilajit Extract containing 80%+ Fulvic Acid, combined with KSM-66 Ashwagandha and Safed Musli.',
            'key_benefits': [
                'Supports an active lifestyle & vitality',
                'Assists in maintaining natural energy levels',
                'Helps with muscle strength & post-workout recovery',
                'Aids overall wellness',
                'Ideal as a workout companion'
            ],
            'key_ingredients': [
                {'name': 'Pure Shilajit', 'description': 'Fuels drive and keeps you going strong'},
                {'name': 'KSM 66- Ashwagandha', 'description': 'Helps stay cool, calm, and ready to take on the day'},
                {'name': 'Safed Musli', 'description': 'Keeps spirits high and muscles mighty'}
            ],
            'how_to_consume': [
                'Take 1 capsule twice a day (after breakfast and dinner) with warm milk or warm water.',
                'For personalized guidance, especially if you have a medical condition, consult your healthcare professional.'
            ],
            'who_should_take': [
                'Men looking to naturally support endurance',
                'Anyone seeking a balanced way to help boost stamina',
                'Individuals aiming to enhance daily performance'
            ],
            'how_it_helps': 'Purely Yours Shilajit is formulated using pure Himalayan Shilajit Extract (80%+ Fulvic Acid), KSM-66 Ashwagandha, and Safed Musli.',
            'disclaimer': 'Individual results may vary depending on diet, exercise, and lifestyle. This product is not intended to diagnose, treat, cure, or prevent any disease.'
        },
        {
            'name': 'Gluco Defence',
            'slug': 'gluco-defence',
            'category': sugar_mgmt,
            'sku': 'PY-GD-001',
            'price': Decimal('925.00'),
            'original_price': Decimal('995.00'),
            'stock_quantity': 30,
            'description': 'Natural blood sugar management supplement with proven herbs and minerals.',
            'key_benefits': [
                'Supports healthy blood sugar levels',
                'Helps maintain glucose metabolism',
                'Natural herbal formula',
                'No artificial additives'
            ],
            'key_ingredients': [
                {'name': 'Bitter Melon', 'description': 'Natural blood sugar support'},
                {'name': 'Gymnema Sylvestre', 'description': 'Traditional sugar destroyer'},
                {'name': 'Chromium', 'description': 'Essential mineral for glucose metabolism'}
            ],
            'how_to_consume': [
                'Take 1 capsule twice daily before meals',
                'Maintain regular exercise and healthy diet'
            ],
            'who_should_take': [
                'Adults with blood sugar concerns',
                'People following diabetic diet',
                'Those seeking natural glucose support'
            ],
            'how_it_helps': 'Combines traditional Ayurvedic herbs with modern nutritional science.',
            'disclaimer': 'Consult your doctor before use if you have diabetes or are on medication.'
        },
        {
            'name': 'Joint Care Formula',
            'slug': 'joint-care-formula',
            'category': joint_mobility,
            'sku': 'PY-JC-001',
            'price': Decimal('1493.00'),
            'original_price': Decimal('1990.00'),
            'stock_quantity': 25,
            'description': 'Advanced joint support formula with glucosamine, chondroitin, and natural anti-inflammatory herbs.',
            'key_benefits': [
                'Supports joint flexibility',
                'Reduces joint discomfort',
                'Promotes cartilage health',
                'Natural anti-inflammatory support'
            ],
            'key_ingredients': [
                {'name': 'Glucosamine', 'description': 'Building block of cartilage'},
                {'name': 'Chondroitin', 'description': 'Supports joint structure'},
                {'name': 'Turmeric', 'description': 'Natural anti-inflammatory'}
            ],
            'how_to_consume': [
                'Take 2 capsules daily with meals',
                'Continue for at least 3 months for best results'
            ],
            'who_should_take': [
                'Adults with joint discomfort',
                'Active individuals',
                'People over 40 years'
            ],
            'how_it_helps': 'Scientifically formulated to support joint health and mobility.',
            'disclaimer': 'Results may vary. Consult healthcare provider if pregnant or nursing.'
        },
        {
            'name': 'Organic Immunity Boost',
            'slug': 'organic-immunity-boost',
            'category': immunity,
            'sku': 'PY-IB-001',
            'price': Decimal('536.00'),
            'original_price': Decimal('595.00'),
            'stock_quantity': 40,
            'description': 'Organic immunity booster with vitamin C, zinc, and powerful antioxidants.',
            'key_benefits': [
                'Boosts natural immunity',
                'Rich in antioxidants',
                'Supports overall health',
                'Organic and natural'
            ],
            'key_ingredients': [
                {'name': 'Vitamin C', 'description': 'Essential immune vitamin'},
                {'name': 'Zinc', 'description': 'Immune system mineral'},
                {'name': 'Elderberry', 'description': 'Natural immune support'}
            ],
            'how_to_consume': [
                'Take 1 capsule daily with breakfast',
                'Can be increased to 2 capsules during seasonal changes'
            ],
            'who_should_take': [
                'Adults seeking immune support',
                'People with busy lifestyles',
                'Those exposed to environmental stress'
            ],
            'how_it_helps': 'Combines organic ingredients to naturally support your immune system.',
            'disclaimer': 'Not intended to replace a balanced diet and healthy lifestyle.'
        }
    ]
    
    for prod_data in products_data:
        product, created = Product.objects.get_or_create(
            slug=prod_data['slug'],
            defaults=prod_data
        )
        if created:
            print(f"Created product: {product.name}")
            
            # Create variants for Shilajit product
            if product.slug == 'shilajit-premium-himalayan-extract':
                variants_data = [
                    {'name': '30 Capsules', 'sku': 'PY-SH-30-001', 'price': Decimal('925.00'), 'original_price': Decimal('995.00'), 'stock_quantity': 25},
                    {'name': '60 Capsules', 'sku': 'PY-SH-60-001', 'price': Decimal('1650.00'), 'original_price': Decimal('1890.00'), 'stock_quantity': 18},
                    {'name': '90 Capsules (Best Value)', 'sku': 'PY-SH-90-001', 'price': Decimal('2299.00'), 'original_price': Decimal('2785.00'), 'stock_quantity': 12}
                ]
                
                for variant_data in variants_data:
                    variant_data['product'] = product
                    ProductVariant.objects.create(**variant_data)
                    print(f"Created variant: {variant_data['name']}")
            
            # Create FAQs for Shilajit product
            if product.slug == 'shilajit-premium-himalayan-extract':
                faqs_data = [
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
                
                for faq_data in faqs_data:
                    faq_data['product'] = product
                    FAQ.objects.create(**faq_data)

def create_tags():
    """Create product tags"""
    tags_data = [
        {'name': 'Natural', 'slug': 'natural'},
        {'name': 'Ayurvedic', 'slug': 'ayurvedic'},
        {'name': 'Energy Booster', 'slug': 'energy-booster'},
        {'name': 'Himalayan', 'slug': 'himalayan'},
        {'name': 'Organic', 'slug': 'organic'},
        {'name': 'Herbal', 'slug': 'herbal'},
        {'name': 'Immunity', 'slug': 'immunity'},
        {'name': 'Joint Support', 'slug': 'joint-support'}
    ]
    
    for tag_data in tags_data:
        tag, created = ProductTag.objects.get_or_create(
            slug=tag_data['slug'],
            defaults=tag_data
        )
        if created:
            print(f"Created tag: {tag.name}")

def create_doctors():
    """Create sample doctors"""
    doctors_data = [
        {
            'name': 'Priya Sharma',
            'specialization': 'Ayurvedic Medicine',
            'experience_years': 15,
            'qualification': 'BAMS, MD (Ayurveda)',
            'bio': 'Dr. Priya Sharma is a renowned Ayurvedic practitioner with over 15 years of experience in holistic wellness and natural healing.',
            'consultation_fee': Decimal('500.00')
        },
        {
            'name': 'Rajesh Kumar',
            'specialization': 'Herbal Medicine',
            'experience_years': 12,
            'qualification': 'BHMS, MD (Homeopathy)',
            'bio': 'Dr. Rajesh Kumar specializes in herbal medicine and has helped thousands of patients achieve better health through natural remedies.',
            'consultation_fee': Decimal('450.00')
        },
        {
            'name': 'Meera Patel',
            'specialization': 'Nutrition & Wellness',
            'experience_years': 10,
            'qualification': 'MSc Nutrition, Certified Wellness Coach',
            'bio': 'Dr. Meera Patel is a nutrition expert who focuses on personalized wellness plans and dietary guidance for optimal health.',
            'consultation_fee': Decimal('600.00')
        }
    ]
    
    for doctor_data in doctors_data:
        doctor, created = Doctor.objects.get_or_create(
            email=doctor_data['email'],
            defaults=doctor_data
        )
        if created:
            print(f"👨‍⚕️ Created doctor: Dr. {doctor.name}")
            
            # Create availability for weekdays (Monday to Friday)
            for weekday in range(5):  # 0-4 (Monday to Friday)
                DoctorAvailability.objects.get_or_create(
                    doctor=doctor,
                    weekday=weekday,
                    start_time='09:00',
                    end_time='17:00'
                )
    
    # Create sample reviews
    products = Product.objects.all()
    for product in products[:2]:  # Add reviews for first 2 products
        Review.objects.get_or_create(
            user=demo_user,
            product=product,
            defaults={
                'rating': 5,
                'title': 'Excellent product!',
                'comment': 'I have been using this product for 2 months and have seen great results. Highly recommended!',
                'is_verified_purchase': True
            }
        )
    
    print("✅ Sample data created successfully!")
    print("\n📋 Created:")
    print(f"   • {Category.objects.count()} categories")
    print(f"   • {Product.objects.count()} products")
    print(f"   • {ProductVariant.objects.count()} product variants")
    print(f"   • {Doctor.objects.count()} doctors")
    print(f"   • {Review.objects.count()} reviews")
    print(f"   • 1 demo user (demo@purelyyours.com / demo123)")

def create_categories():
    """Create product categories"""
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
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"Created category: {category.name}")

def create_products():
    """Create sample products"""
    
    # Get categories
    sugar_mgmt = Category.objects.get(slug='sugar-management')
    male_wellness = Category.objects.get(slug='male-wellness')
    joint_mobility = Category.objects.get(slug='joint-mobility')
    immunity = Category.objects.get(slug='immunity-detox')
    
    products_data = [
        {
            'name': 'Purely Yours Shilajit - Premium Himalayan Extract',
            'slug': 'shilajit-premium-himalayan-extract',
            'category': male_wellness,
            'sku': 'PY-SH-001',
            'price': Decimal('925.00'),
            'original_price': Decimal('995.00'),
            'stock_quantity': 50,
            'description': 'Purely Yours Shilajit is a premium supplement formulated with pure Himalayan Shilajit Extract containing 80%+ Fulvic Acid, combined with KSM-66 Ashwagandha and Safed Musli.',
            'key_benefits': [
                'Supports an active lifestyle & vitality',
                'Assists in maintaining natural energy levels',
                'Helps with muscle strength & post-workout recovery',
                'Aids overall wellness',
                'Ideal as a workout companion'
            ],
            'key_ingredients': [
                {'name': 'Pure Shilajit', 'description': 'Fuels drive and keeps you going strong'},
                {'name': 'KSM 66- Ashwagandha', 'description': 'Helps stay cool, calm, and ready to take on the day'},
                {'name': 'Safed Musli', 'description': 'Keeps spirits high and muscles mighty'}
            ],
            'how_to_consume': [
                'Take 1 capsule twice a day (after breakfast and dinner) with warm milk or warm water.',
                'For personalized guidance, especially if you have a medical condition, consult your healthcare professional.'
            ],
            'who_should_take': [
                'Men looking to naturally support endurance',
                'Anyone seeking a balanced way to help boost stamina',
                'Individuals aiming to enhance daily performance'
            ],
            'how_it_helps': 'Purely Yours Shilajit is formulated using pure Himalayan Shilajit Extract (80%+ Fulvic Acid), KSM-66 Ashwagandha, and Safed Musli.',
            'disclaimer': 'Individual results may vary depending on diet, exercise, and lifestyle. This product is not intended to diagnose, treat, cure, or prevent any disease.'
        },
        {
            'name': 'Gluco Defence',
            'slug': 'gluco-defence',
            'category': sugar_mgmt,
            'sku': 'PY-GD-001',
            'price': Decimal('925.00'),
            'original_price': Decimal('995.00'),
            'stock_quantity': 30,
            'description': 'Natural blood sugar management supplement with proven herbs and minerals.',
            'key_benefits': [
                'Supports healthy blood sugar levels',
                'Helps maintain glucose metabolism',
                'Natural herbal formula',
                'No artificial additives'
            ],
            'key_ingredients': [
                {'name': 'Bitter Melon', 'description': 'Natural blood sugar support'},
                {'name': 'Gymnema Sylvestre', 'description': 'Traditional sugar destroyer'},
                {'name': 'Chromium', 'description': 'Essential mineral for glucose metabolism'}
            ],
            'how_to_consume': [
                'Take 1 capsule twice daily before meals',
                'Maintain regular exercise and healthy diet'
            ],
            'who_should_take': [
                'Adults with blood sugar concerns',
                'People following diabetic diet',
                'Those seeking natural glucose support'
            ],
            'how_it_helps': 'Combines traditional Ayurvedic herbs with modern nutritional science.',
            'disclaimer': 'Consult your doctor before use if you have diabetes or are on medication.'
        },
        {
            'name': 'Joint Care Formula',
            'slug': 'joint-care-formula',
            'category': joint_mobility,
            'sku': 'PY-JC-001',
            'price': Decimal('1493.00'),
            'original_price': Decimal('1990.00'),
            'stock_quantity': 25,
            'description': 'Advanced joint support formula with glucosamine, chondroitin, and natural anti-inflammatory herbs.',
            'key_benefits': [
                'Supports joint flexibility',
                'Reduces joint discomfort',
                'Promotes cartilage health',
                'Natural anti-inflammatory support'
            ],
            'key_ingredients': [
                {'name': 'Glucosamine', 'description': 'Building block of cartilage'},
                {'name': 'Chondroitin', 'description': 'Supports joint structure'},
                {'name': 'Turmeric', 'description': 'Natural anti-inflammatory'}
            ],
            'how_to_consume': [
                'Take 2 capsules daily with meals',
                'Continue for at least 3 months for best results'
            ],
            'who_should_take': [
                'Adults with joint discomfort',
                'Active individuals',
                'People over 40 years'
            ],
            'how_it_helps': 'Scientifically formulated to support joint health and mobility.',
            'disclaimer': 'Results may vary. Consult healthcare provider if pregnant or nursing.'
        },
        {
            'name': 'Organic Immunity Boost',
            'slug': 'organic-immunity-boost',
            'category': immunity,
            'sku': 'PY-IB-001',
            'price': Decimal('536.00'),
            'original_price': Decimal('595.00'),
            'stock_quantity': 40,
            'description': 'Organic immunity booster with vitamin C, zinc, and powerful antioxidants.',
            'key_benefits': [
                'Boosts natural immunity',
                'Rich in antioxidants',
                'Supports overall health',
                'Organic and natural'
            ],
            'key_ingredients': [
                {'name': 'Vitamin C', 'description': 'Essential immune vitamin'},
                {'name': 'Zinc', 'description': 'Immune system mineral'},
                {'name': 'Elderberry', 'description': 'Natural immune support'}
            ],
            'how_to_consume': [
                'Take 1 capsule daily with breakfast',
                'Can be increased to 2 capsules during seasonal changes'
            ],
            'who_should_take': [
                'Adults seeking immune support',
                'People with busy lifestyles',
                'Those exposed to environmental stress'
            ],
            'how_it_helps': 'Combines organic ingredients to naturally support your immune system.',
            'disclaimer': 'Not intended to replace a balanced diet and healthy lifestyle.'
        }
    ]
    
    for prod_data in products_data:
        product, created = Product.objects.get_or_create(
            slug=prod_data['slug'],
            defaults=prod_data
        )
        if created:
            print(f"Created product: {product.name}")
            
            # Create variants for Shilajit product
            if product.slug == 'shilajit-premium-himalayan-extract':
                variants_data = [
                    {'name': '30 Capsules', 'sku': 'PY-SH-30-001', 'price': Decimal('925.00'), 'original_price': Decimal('995.00'), 'stock_quantity': 25},
                    {'name': '60 Capsules', 'sku': 'PY-SH-60-001', 'price': Decimal('1650.00'), 'original_price': Decimal('1890.00'), 'stock_quantity': 18},
                    {'name': '90 Capsules (Best Value)', 'sku': 'PY-SH-90-001', 'price': Decimal('2299.00'), 'original_price': Decimal('2785.00'), 'stock_quantity': 12}
                ]
                
                for variant_data in variants_data:
                    variant_data['product'] = product
                    ProductVariant.objects.create(**variant_data)
                    print(f"Created variant: {variant_data['name']}")
            
            # Create FAQs for Shilajit product
            if product.slug == 'shilajit-premium-himalayan-extract':
                faqs_data = [
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
                
                for faq_data in faqs_data:
                    faq_data['product'] = product
                    FAQ.objects.create(**faq_data)

def create_tags():
    """Create product tags"""
    tags_data = [
        {'name': 'Natural', 'slug': 'natural'},
        {'name': 'Ayurvedic', 'slug': 'ayurvedic'},
        {'name': 'Energy Booster', 'slug': 'energy-booster'},
        {'name': 'Himalayan', 'slug': 'himalayan'},
        {'name': 'Organic', 'slug': 'organic'},
        {'name': 'Herbal', 'slug': 'herbal'},
        {'name': 'Immunity', 'slug': 'immunity'},
        {'name': 'Joint Support', 'slug': 'joint-support'}
    ]
    
    for tag_data in tags_data:
        tag, created = ProductTag.objects.get_or_create(
            slug=tag_data['slug'],
            defaults=tag_data
        )
        if created:
            print(f"Created tag: {tag.name}")

def create_doctors():
    """Create sample doctors"""
    doctors_data = [
        {
            'name': 'Priya Sharma',
            'email': 'priya.sharma@purelyyours.com',
            'mobile': '+911234567890',
            'specialization': 'Ayurvedic Medicine',
            'experience_years': 15,
            'qualification': 'BAMS, MD (Ayurveda)',
            'bio': 'Dr. Priya Sharma is a renowned Ayurvedic practitioner with over 15 years of experience in holistic wellness and natural healing.',
            'consultation_fee': Decimal('500.00')
        },
        {
            'name': 'Rajesh Kumar',
            'email': 'rajesh.kumar@purelyyours.com',
            'mobile': '+919876543210',
            'specialization': 'Herbal Medicine',
            'experience_years': 12,
            'qualification': 'BHMS, MD (Homeopathy)',
            'bio': 'Dr. Rajesh Kumar specializes in herbal medicine and has helped thousands of patients achieve better health through natural remedies.',
            'consultation_fee': Decimal('450.00')
        },
        {
            'name': 'Meera Patel',
            'email': 'meera.patel@purelyyours.com',
            'mobile': '+919112233445',
            'specialization': 'Nutrition & Wellness',
            'experience_years': 10,
            'qualification': 'MSc Nutrition, Certified Wellness Coach',
            'bio': 'Dr. Meera Patel is a nutrition expert who focuses on personalized wellness plans and dietary guidance for optimal health.',
            'consultation_fee': Decimal('600.00')
        }
    ]
    
    for doctor_data in doctors_data:
        doctor, created = Doctor.objects.get_or_create(
            email=doctor_data['email'],
            defaults=doctor_data
        )
        if created:
            print(f"👨‍⚕️ Created doctor: Dr. {doctor.name}")
            # Create availability for weekdays (Monday to Friday)
            for weekday in range(5):  # 0-4 (Monday to Friday)
                DoctorAvailability.objects.get_or_create(
                    doctor=doctor,
                    weekday=weekday,
                    start_time='09:00',
                    end_time='17:00'
                )
    # ...existing code...
    # Create sample reviews
    products = Product.objects.all()
    for product in products[:2]:  # Add reviews for first 2 products
        Review.objects.get_or_create(
            user=demo_user,
            product=product,
            defaults={
                'rating': 5,
                'title': 'Excellent product!',
                'comment': 'I have been using this product for 2 months and have seen great results. Highly recommended!',
                'is_verified_purchase': True
            }
        )
    
    print("✅ Sample data created successfully!")
    print("\n📋 Created:")
    print(f"   • {Category.objects.count()} categories")
    print(f"   • {Product.objects.count()} products")
    print(f"   • {ProductVariant.objects.count()} product variants")
    print(f"   • {Doctor.objects.count()} doctors")
    print(f"   • {Review.objects.count()} reviews")
    print(f"   • 1 demo user (demo@purelyyours.com / demo123)")

def create_categories():
    """Create product categories"""
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
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"Created category: {category.name}")

def create_products():
    """Create sample products"""
    
    # Get categories
    sugar_mgmt = Category.objects.get(slug='sugar-management')
    male_wellness = Category.objects.get(slug='male-wellness')
    joint_mobility = Category.objects.get(slug='joint-mobility')
    immunity = Category.objects.get(slug='immunity-detox')
    
    products_data = [
        {
            'name': 'Purely Yours Shilajit - Premium Himalayan Extract',
            'slug': 'shilajit-premium-himalayan-extract',
            'category': male_wellness,
            'sku': 'PY-SH-001',
            'price': Decimal('925.00'),
            'original_price': Decimal('995.00'),
            'stock_quantity': 50,
            'description': 'Purely Yours Shilajit is a premium supplement formulated with pure Himalayan Shilajit Extract containing 80%+ Fulvic Acid, combined with KSM-66 Ashwagandha and Safed Musli.',
            'key_benefits': [
                'Supports an active lifestyle & vitality',
                'Assists in maintaining natural energy levels',
                'Helps with muscle strength & post-workout recovery',
                'Aids overall wellness',
                'Ideal as a workout companion'
            ],
            'key_ingredients': [
                {'name': 'Pure Shilajit', 'description': 'Fuels drive and keeps you going strong'},
                {'name': 'KSM 66- Ashwagandha', 'description': 'Helps stay cool, calm, and ready to take on the day'},
                {'name': 'Safed Musli', 'description': 'Keeps spirits high and muscles mighty'}
            ],
            'how_to_consume': [
                'Take 1 capsule twice a day (after breakfast and dinner) with warm milk or warm water.',
                'For personalized guidance, especially if you have a medical condition, consult your healthcare professional.'
            ],
            'who_should_take': [
                'Men looking to naturally support endurance',
                'Anyone seeking a balanced way to help boost stamina',
                'Individuals aiming to enhance daily performance'
            ],
            'how_it_helps': 'Purely Yours Shilajit is formulated using pure Himalayan Shilajit Extract (80%+ Fulvic Acid), KSM-66 Ashwagandha, and Safed Musli.',
            'disclaimer': 'Individual results may vary depending on diet, exercise, and lifestyle. This product is not intended to diagnose, treat, cure, or prevent any disease.'
        },
        {
            'name': 'Gluco Defence',
            'slug': 'gluco-defence',
            'category': sugar_mgmt,
            'sku': 'PY-GD-001',
            'price': Decimal('925.00'),
            'original_price': Decimal('995.00'),
            'stock_quantity': 30,
            'description': 'Natural blood sugar management supplement with proven herbs and minerals.',
            'key_benefits': [
                'Supports healthy blood sugar levels',
                'Helps maintain glucose metabolism',
                'Natural herbal formula',
                'No artificial additives'
            ],
            'key_ingredients': [
                {'name': 'Bitter Melon', 'description': 'Natural blood sugar support'},
                {'name': 'Gymnema Sylvestre', 'description': 'Traditional sugar destroyer'},
                {'name': 'Chromium', 'description': 'Essential mineral for glucose metabolism'}
            ],
            'how_to_consume': [
                'Take 1 capsule twice daily before meals',
                'Maintain regular exercise and healthy diet'
            ],
            'who_should_take': [
                'Adults with blood sugar concerns',
                'People following diabetic diet',
                'Those seeking natural glucose support'
            ],
            'how_it_helps': 'Combines traditional Ayurvedic herbs with modern nutritional science.',
            'disclaimer': 'Consult your doctor before use if you have diabetes or are on medication.'
        },
        {
            'name': 'Joint Care Formula',
            'slug': 'joint-care-formula',
            'category': joint_mobility,
            'sku': 'PY-JC-001',
            'price': Decimal('1493.00'),
            'original_price': Decimal('1990.00'),
            'stock_quantity': 25,
            'description': 'Advanced joint support formula with glucosamine, chondroitin, and natural anti-inflammatory herbs.',
            'key_benefits': [
                'Supports joint flexibility',
                'Reduces joint discomfort',
                'Promotes cartilage health',
                'Natural anti-inflammatory support'
            ],
            'key_ingredients': [
                {'name': 'Glucosamine', 'description': 'Building block of cartilage'},
                {'name': 'Chondroitin', 'description': 'Supports joint structure'},
                {'name': 'Turmeric', 'description': 'Natural anti-inflammatory'}
            ],
            'how_to_consume': [
                'Take 2 capsules daily with meals',
                'Continue for at least 3 months for best results'
            ],
            'who_should_take': [
                'Adults with joint discomfort',
                'Active individuals',
                'People over 40 years'
            ],
            'how_it_helps': 'Scientifically formulated to support joint health and mobility.',
            'disclaimer': 'Results may vary. Consult healthcare provider if pregnant or nursing.'
        },
        {
            'name': 'Organic Immunity Boost',
            'slug': 'organic-immunity-boost',
            'category': immunity,
            'sku': 'PY-IB-001',
            'price': Decimal('536.00'),
            'original_price': Decimal('595.00'),
            'stock_quantity': 40,
            'description': 'Organic immunity booster with vitamin C, zinc, and powerful antioxidants.',
            'key_benefits': [
                'Boosts natural immunity',
                'Rich in antioxidants',
                'Supports overall health',
                'Organic and natural'
            ],
            'key_ingredients': [
                {'name': 'Vitamin C', 'description': 'Essential immune vitamin'},
                {'name': 'Zinc', 'description': 'Immune system mineral'},
                {'name': 'Elderberry', 'description': 'Natural immune support'}
            ],
            'how_to_consume': [
                'Take 1 capsule daily with breakfast',
                'Can be increased to 2 capsules during seasonal changes'
            ],
            'who_should_take': [
                'Adults seeking immune support',
                'People with busy lifestyles',
                'Those exposed to environmental stress'
            ],
            'how_it_helps': 'Combines organic ingredients to naturally support your immune system.',
            'disclaimer': 'Not intended to replace a balanced diet and healthy lifestyle.'
        }
    ]
    
    for prod_data in products_data:
        product, created = Product.objects.get_or_create(
            slug=prod_data['slug'],
            defaults=prod_data
        )
        if created:
            print(f"Created product: {product.name}")
            
            # Create variants for Shilajit product
            if product.slug == 'shilajit-premium-himalayan-extract':
                variants_data = [
                    {'name': '30 Capsules', 'sku': 'PY-SH-30-001', 'price': Decimal('925.00'), 'original_price': Decimal('995.00'), 'stock_quantity': 25},
                    {'name': '60 Capsules', 'sku': 'PY-SH-60-001', 'price': Decimal('1650.00'), 'original_price': Decimal('1890.00'), 'stock_quantity': 18},
                    {'name': '90 Capsules (Best Value)', 'sku': 'PY-SH-90-001', 'price': Decimal('2299.00'), 'original_price': Decimal('2785.00'), 'stock_quantity': 12}
                ]
                
                for variant_data in variants_data:
                    variant_data['product'] = product
                    ProductVariant.objects.create(**variant_data)
                    print(f"Created variant: {variant_data['name']}")
            
            # Create FAQs for Shilajit product
            if product.slug == 'shilajit-premium-himalayan-extract':
                faqs_data = [
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
                
                for faq_data in faqs_data:
                    faq_data['product'] = product
                    FAQ.objects.create(**faq_data)

def create_tags():
    """Create product tags"""
    tags_data = [
        {'name': 'Natural', 'slug': 'natural'},
        {'name': 'Ayurvedic', 'slug': 'ayurvedic'},
        {'name': 'Energy Booster', 'slug': 'energy-booster'},
        {'name': 'Himalayan', 'slug': 'himalayan'},
        {'name': 'Organic', 'slug': 'organic'},
        {'name': 'Herbal', 'slug': 'herbal'},
        {'name': 'Immunity', 'slug': 'immunity'},
        {'name': 'Joint Support', 'slug': 'joint-support'}
    ]
    
    for tag_data in tags_data:
        tag, created = ProductTag.objects.get_or_create(
            slug=tag_data['slug'],
            defaults=tag_data
        )
        if created:
            print(f"Created tag: {tag.name}")

def create_doctors():
    """Create sample doctors"""
    doctors_data = [
        {
            'name': 'Priya Sharma',
            'specialization': 'Ayurvedic Medicine',
            'experience_years': 15,
            'qualification': 'BAMS, MD (Ayurveda)',
            'bio': 'Dr. Priya Sharma is a renowned Ayurvedic practitioner with over 15 years of experience in holistic wellness and natural healing.',
            'consultation_fee': Decimal('500.00')
        },
        {
            'name': 'Rajesh Kumar',
            'specialization': 'Herbal Medicine',
            'experience_years': 12,
            'qualification': 'BHMS, MD (Homeopathy)',
            'bio': 'Dr. Rajesh Kumar specializes in herbal medicine and has helped thousands of patients achieve better health through natural remedies.',
            'consultation_fee': Decimal('450.00')
        },
        {
            'name': 'Meera Patel',
            'specialization': 'Nutrition & Wellness',
            'experience_years': 10,
            'qualification': 'MSc Nutrition, Certified Wellness Coach',
            'bio': 'Dr. Meera Patel is a nutrition expert who focuses on personalized wellness plans and dietary guidance for optimal health.',
            'consultation_fee': Decimal('600.00')
        }
    ]
    
    for doctor_data in doctors_data:
        doctor, created = Doctor.objects.get_or_create(
            email=doctor_data['email'],
            defaults=doctor_data
        )
        if created:
            print(f"👨‍⚕️ Created doctor: Dr. {doctor.name}")
            
            # Create availability for weekdays (Monday to Friday)
            for weekday in range(5):  # 0-4 (Monday to Friday)
                DoctorAvailability.objects.get_or_create(
                    doctor=doctor,
                    weekday=weekday,
                    start_time='09:00',
                    end_time='17:00'
                )
    
    # Create sample reviews
    products = Product.objects.all()
    for product in products[:2]:  # Add reviews for first 2 products
        Review.objects.get_or_create(
            user=demo_user,
            product=product,
            defaults={
                'rating': 5,
                'title': 'Excellent product!',
                'comment': 'I have been using this product for 2 months and have seen great results. Highly recommended!',
                'is_verified_purchase': True
            }
        )
    
    print("✅ Sample data created successfully!")
    print("\n📋 Created:")
    print(f"   • {Category.objects.count()} categories")
    print(f"   • {Product.objects.count()} products")
    print(f"   • {ProductVariant.objects.count()} product variants")
    print(f"   • {Doctor.objects.count()} doctors")
    print(f"   • {Review.objects.count()} reviews")
    print(f"   • 1 demo user (demo@purelyyours.com / demo123)")

def create_categories():
    """Create product categories"""
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
        category, created = Category.objects.get_or_create(
            slug=cat_data['slug'],
            defaults=cat_data
        )
        if created:
            print(f"Created category: {category.name}")

def create_products():
    """Create sample"""
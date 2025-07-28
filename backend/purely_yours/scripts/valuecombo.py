import os
import sys
import django

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'purely_yours.settings')
django.setup()

# Import after Django setup
from products.models import Product, Collection, ProductTag

def add_combo_pack_products_to_value_combos():
    """Find products with 'combo & pack' tag and add them to 'Value Combos' collection"""
    print("🎁 Starting Value Combos collection update...")
    
    # Get or create the "Value Combos" collection
    value_combos, created = Collection.objects.get_or_create(
        name="Value Combos",
        defaults={
            "slug": "value-combos",
            "description": "Specially curated combo & pack offers"
        }
    )
    
    if created:
        print(f"✅ Created new collection: {value_combos.name}")
    else:
        print(f"📦 Using existing collection: {value_combos.name}")

    # Find the "combo & pack" tag
    try:
        combo_tag = ProductTag.objects.get(name__iexact="combo & pack")
        print(f"🏷️  Found tag: {combo_tag.name}")
    except ProductTag.DoesNotExist:
        print("❌ No tag named 'combo & pack' found.")
        print("Available tags:")
        for tag in ProductTag.objects.all():
            print(f"   - {tag.name}")
        return

    # Find all products with the "combo & pack" tag
    combo_products = Product.objects.filter(tag_assignments__tag=combo_tag).distinct()
    print(f"🔍 Found {combo_products.count()} products with 'combo & pack' tag")

    count = 0
    for product in combo_products:
        if value_combos not in product.collections.all():
            product.collections.add(value_combos)
            count += 1
            print(f"   ✅ Added '{product.name}' to Value Combos")
        else:
            print(f"   ⏭️  '{product.name}' already in Value Combos")

    print(f"\n📊 Summary:")
    print(f"   Total products processed: {combo_products.count()}")
    print(f"   Products added to Value Combos: {count}")
    print(f"   Products already in collection: {combo_products.count() - count}")

def add_bestsellers_products_to_bestsellers():
    """Find products with 'Bestsellers' tag and add them to 'Bestsellers' collection"""
    print("🏆 Starting Bestsellers collection update...")
    
    # Get or create the "Bestsellers" collection
    bestsellers, created = Collection.objects.get_or_create(
        name="Bestsellers",
        defaults={
            "slug": "bestsellers",
            "description": "Our most popular and top-selling products"
        }
    )
    
    if created:
        print(f"✅ Created new collection: {bestsellers.name}")
    else:
        print(f"📦 Using existing collection: {bestsellers.name}")

    # Find the "Bestsellers" tag
    try:
        bestsellers_tag = ProductTag.objects.get(name__iexact="Bestsellers")
        print(f"🏷️  Found tag: {bestsellers_tag.name}")
    except ProductTag.DoesNotExist:
        print("❌ No tag named 'Bestsellers' found.")
        print("Available tags:")
        for tag in ProductTag.objects.all():
            print(f"   - {tag.name}")
        return

    # Find all products with the "Bestsellers" tag
    bestsellers_products = Product.objects.filter(tag_assignments__tag=bestsellers_tag).distinct()
    print(f"🔍 Found {bestsellers_products.count()} products with 'Bestsellers' tag")

    count = 0
    for product in bestsellers_products:
        if bestsellers not in product.collections.all():
            product.collections.add(bestsellers)
            count += 1
            print(f"   ✅ Added '{product.name}' to Bestsellers")
        else:
            print(f"   ⏭️  '{product.name}' already in Bestsellers")

    print(f"\n📊 Summary:")
    print(f"   Total products processed: {bestsellers_products.count()}")
    print(f"   Products added to Bestsellers: {count}")
    print(f"   Products already in collection: {bestsellers_products.count() - count}")

def list_all_tags():
    """Helper function to list all available tags"""
    print("🏷️  All available tags:")
    tags = ProductTag.objects.all().order_by('name')
    for tag in tags:
        product_count = Product.objects.filter(tag_assignments__tag=tag).count()
        print(f"   - {tag.name} ({product_count} products)")

def main():
    """Main function with options"""
    print("🎁 Product Collection Manager")
    print("=" * 50)
    
    while True:
        print("\nOptions:")
        print("1. Add combo & pack products to Value Combos")
        print("2. Add bestsellers products to Bestsellers")
        print("3. List all available tags")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            add_combo_pack_products_to_value_combos()
            
        elif choice == '2':
            add_bestsellers_products_to_bestsellers()
            
        elif choice == '3':
            list_all_tags()
            
        elif choice == '4':
            print("👋 Goodbye!")
            break
            
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
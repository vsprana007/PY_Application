#!/usr/bin/env python
"""
Script to clean up slugs by removing "-&" and "-%" from collections and products
"""
import os
import sys
import django
import re
from django.utils.text import slugify

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'purely_yours.settings')

django.setup()

# Now import after Django setup
from products.models import Collection, Product

def clean_slug(slug):
    """Clean slug by removing unwanted characters"""
    if not slug:
        return slug
        
    # Remove "-&" and "-%" from slug
    cleaned_slug = slug.replace('-&', '').replace('-%', '')
    
    # Remove any double dashes that might be created
    cleaned_slug = re.sub(r'-+', '-', cleaned_slug)
    
    # Remove leading/trailing dashes
    cleaned_slug = cleaned_slug.strip('-')
    
    return cleaned_slug

def clean_collection_slugs():
    """Clean all collection slugs"""
    print("🧹 Cleaning collection slugs...")
    
    collections = Collection.objects.all()
    updated_count = 0
    
    for collection in collections:
        original_slug = collection.slug
        cleaned_slug = clean_slug(original_slug)
        
        if original_slug != cleaned_slug:
            # Check if cleaned slug already exists
            if Collection.objects.filter(slug=cleaned_slug).exclude(id=collection.id).exists():
                print(f"⚠️  Collection slug conflict: {cleaned_slug} already exists for {collection.name}")
                # Add a suffix to make it unique
                counter = 1
                while Collection.objects.filter(slug=f"{cleaned_slug}-{counter}").exclude(id=collection.id).exists():
                    counter += 1
                cleaned_slug = f"{cleaned_slug}-{counter}"
                print(f"   Using: {cleaned_slug}")
            
            collection.slug = cleaned_slug
            collection.save()
            updated_count += 1
            print(f"✅ Updated collection: {collection.name}")
            print(f"   Old slug: {original_slug}")
            print(f"   New slug: {cleaned_slug}")
    
    print(f"\n📊 Collections updated: {updated_count}")
    return updated_count

def clean_product_slugs():
    """Clean all product slugs"""
    print("\n🧹 Cleaning product slugs...")
    
    products = Product.objects.all()
    updated_count = 0
    
    for product in products:
        original_slug = product.slug
        cleaned_slug = clean_slug(original_slug)
        
        if original_slug != cleaned_slug:
            # Check if cleaned slug already exists
            if Product.objects.filter(slug=cleaned_slug).exclude(id=product.id).exists():
                print(f"⚠️  Product slug conflict: {cleaned_slug} already exists for {product.name}")
                # Add a suffix to make it unique
                counter = 1
                while Product.objects.filter(slug=f"{cleaned_slug}-{counter}").exclude(id=product.id).exists():
                    counter += 1
                cleaned_slug = f"{cleaned_slug}-{counter}"
                print(f"   Using: {cleaned_slug}")
            
            product.slug = cleaned_slug
            product.save()
            updated_count += 1
            print(f"✅ Updated product: {product.name}")
            print(f"   Old slug: {original_slug}")
            print(f"   New slug: {cleaned_slug}")
    
    print(f"\n📊 Products updated: {updated_count}")
    return updated_count

def regenerate_slugs_from_names():
    """Regenerate all slugs from names (more thorough cleaning)"""
    print("\n🔄 Regenerating slugs from names...")
    
    # Clean collection slugs
    collections = Collection.objects.all()
    collection_count = 0
    
    for collection in collections:
        original_slug = collection.slug
        new_slug = slugify(collection.name)
        
        if original_slug != new_slug:
            # Check for conflicts
            if Collection.objects.filter(slug=new_slug).exclude(id=collection.id).exists():
                counter = 1
                while Collection.objects.filter(slug=f"{new_slug}-{counter}").exclude(id=collection.id).exists():
                    counter += 1
                new_slug = f"{new_slug}-{counter}"
            
            collection.slug = new_slug
            collection.save()
            collection_count += 1
            print(f"✅ Collection: {collection.name}")
            print(f"   Old: {original_slug} → New: {new_slug}")
    
    # Clean product slugs
    products = Product.objects.all()
    product_count = 0
    
    for product in products:
        original_slug = product.slug
        new_slug = slugify(product.name)
        
        if original_slug != new_slug:
            # Check for conflicts
            if Product.objects.filter(slug=new_slug).exclude(id=product.id).exists():
                counter = 1
                while Product.objects.filter(slug=f"{new_slug}-{counter}").exclude(id=product.id).exists():
                    counter += 1
                new_slug = f"{new_slug}-{counter}"
            
            product.slug = new_slug
            product.save()
            product_count += 1
            print(f"✅ Product: {product.name}")
            print(f"   Old: {original_slug} → New: {new_slug}")
    
    print(f"\n📊 Regenerated - Collections: {collection_count}, Products: {product_count}")
    return collection_count, product_count

def preview_changes():
    """Preview what changes will be made without saving"""
    print("👀 Previewing slug changes...")
    
    # Preview collection changes
    print("\n🏷️  Collection changes:")
    collections = Collection.objects.all()
    collection_changes = []
    
    for collection in collections:
        original_slug = collection.slug
        cleaned_slug = clean_slug(original_slug)
        
        if original_slug != cleaned_slug:
            collection_changes.append({
                'name': collection.name,
                'old': original_slug,
                'new': cleaned_slug
            })
    
    if collection_changes:
        for change in collection_changes:
            print(f"   {change['name']}: {change['old']} → {change['new']}")
    else:
        print("   No collection changes needed")
    
    # Preview product changes
    print("\n📦 Product changes:")
    products = Product.objects.all()
    product_changes = []
    
    for product in products:
        original_slug = product.slug
        cleaned_slug = clean_slug(original_slug)
        
        if original_slug != cleaned_slug:
            product_changes.append({
                'name': product.name,
                'old': original_slug,
                'new': cleaned_slug
            })
    
    if product_changes:
        for change in product_changes:
            print(f"   {change['name']}: {change['old']} → {change['new']}")
    else:
        print("   No product changes needed")
    
    print(f"\n📊 Summary: {len(collection_changes)} collections, {len(product_changes)} products to update")
    return len(collection_changes), len(product_changes)

def main():
    """Main function with menu options"""
    print("🧹 Slug Cleanup Utility")
    print("=" * 50)
    
    while True:
        print("\nOptions:")
        print("1. Preview changes")
        print("2. Clean existing slugs (remove -& and -%)")
        print("3. Regenerate all slugs from names")
        print("4. Exit")
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == '1':
            preview_changes()
            
        elif choice == '2':
            confirm = input("Are you sure you want to clean existing slugs? (y/N): ").strip().lower()
            if confirm == 'y':
                collection_count = clean_collection_slugs()
                product_count = clean_product_slugs()
                print(f"\n🎉 Cleanup completed!")
                print(f"   Collections updated: {collection_count}")
                print(f"   Products updated: {product_count}")
            else:
                print("Cancelled.")
                
        elif choice == '3':
            confirm = input("Are you sure you want to regenerate ALL slugs? (y/N): ").strip().lower()
            if confirm == 'y':
                collection_count, product_count = regenerate_slugs_from_names()
                print(f"\n🎉 Regeneration completed!")
                print(f"   Collections updated: {collection_count}")
                print(f"   Products updated: {product_count}")
            else:
                print("Cancelled.")
                
        elif choice == '4':
            print("👋 Goodbye!")
            break
            
        else:
            print("Invalid choice. Please try again.")

if __name__ == "__main__":
    main()
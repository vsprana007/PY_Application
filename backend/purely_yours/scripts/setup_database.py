#!/usr/bin/env python
"""
Setup script to create database tables and initial data
"""
import os
import sys
import django

# Add the backend directory to Python path
sys.path.append('/tmp/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'purely_yours.settings')

django.setup()

from django.core.management import execute_from_command_line

def setup_database():
    """Setup database with migrations and initial data"""
    print("🔧 Setting up database...")
    
    # Run migrations
    print("📦 Running migrations...")
    execute_from_command_line(['manage.py', 'makemigrations'])
    execute_from_command_line(['manage.py', 'migrate'])
    
    print("✅ Database setup completed!")
    print("\n📋 Next steps:")
    print("1. Create a superuser: python manage.py createsuperuser")
    print("2. Run the sample data script: python scripts/create_sample_data.py")
    print("3. Start the server: python manage.py runserver")

if __name__ == '__main__':
    setup_database()

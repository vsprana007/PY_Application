from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Address, OTP
import random
from datetime import datetime, timedelta

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'first_name', 'last_name', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if email and password:
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        return attrs

class OTPSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=15)
    country_code = serializers.CharField(max_length=5, default='+91')

    def create(self, validated_data):
        mobile = validated_data['mobile']
        otp_code = str(random.randint(100000, 999999))
        expires_at = datetime.now() + timedelta(minutes=10)
        
        # Delete existing OTPs for this mobile
        OTP.objects.filter(mobile=mobile).delete()
        
        otp = OTP.objects.create(
            mobile=mobile,
            otp=otp_code,
            expires_at=expires_at
        )
        
        # In production, send SMS here
        print(f"OTP for {mobile}: {otp_code}")
        
        return otp

class OTPVerificationSerializer(serializers.Serializer):
    mobile = serializers.CharField(max_length=15)
    otp = serializers.CharField(max_length=6)

    def validate(self, attrs):
        mobile = attrs.get('mobile')
        otp_code = attrs.get('otp')

        try:
            otp = OTP.objects.get(
                mobile=mobile,
                otp=otp_code,
                is_verified=False,
                expires_at__gt=datetime.now()
            )
            otp.is_verified = True
            otp.save()
            attrs['otp_instance'] = otp
        except OTP.DoesNotExist:
            raise serializers.ValidationError('Invalid or expired OTP')
        
        return attrs

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'first_name', 'last_name', 'mobile', 
                 'is_mobile_verified', 'date_of_birth', 'gender', 'date_joined')
        read_only_fields = ('id', 'email', 'date_joined', 'is_mobile_verified')

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'
        read_only_fields = ('user',)

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

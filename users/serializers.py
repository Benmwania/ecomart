from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, SellerProfile

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    business_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'password_confirm', 
                 'user_type', 'phone_number', 'business_name')
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return data
    
    def create(self, validated_data):
        business_name = validated_data.pop('business_name', None)
        password_confirm = validated_data.pop('password_confirm')
        user_type = validated_data.get('user_type')
        
        user = User.objects.create_user(**validated_data)
        
        # Create seller profile if user is a seller
        if user_type == 'seller' and business_name:
            SellerProfile.objects.create(
                user=user,
                business_name=business_name
            )
        
        return user

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate(self, data):
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            # Authenticate using email as username
            user = authenticate(username=email, password=password)
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            data['user'] = user
        return data

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'user_type', 'phone_number', 
                 'avatar', 'preferences', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class SellerProfileSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = SellerProfile
        fields = '__all__'
        read_only_fields = ('user', 'created_at', 'updated_at', 
                           'verification_status', 'total_products', 
                           'total_sales', 'customer_rating')
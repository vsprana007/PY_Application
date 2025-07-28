from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import JsonResponse
import requests
import uuid
import json
import hmac
import hashlib
import base64
import time

from .models import PaymentSession, PaymentWebhook
from .serializers import PaymentSessionSerializer, CreatePaymentSessionSerializer
from orders.models import Order, OrderStatusHistory

class PaymentSessionListView(generics.ListAPIView):
    serializer_class = PaymentSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentSession.objects.filter(order__user=self.request.user)

class PaymentSessionDetailView(generics.RetrieveAPIView):
    serializer_class = PaymentSessionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return PaymentSession.objects.filter(order__user=self.request.user)

def handle_cashfree_response(response, operation_name="API call"):
    """Handle different Cashfree API response codes"""
    status_code = response.status_code
    
    try:
        response_data = response.json() if response.content else {}
    except json.JSONDecodeError:
        response_data = {"message": "Invalid JSON response"}
    
    if status_code == 200:
        return {
            'success': True,
            'data': response_data,
            'message': f'{operation_name} successful'
        }
    elif status_code == 400:
        return {
            'success': False,
            'error_code': 'BAD_REQUEST',
            'message': response_data.get('message', 'Bad request - Invalid parameters'),
            'details': response_data
        }
    elif status_code == 401:
        return {
            'success': False,
            'error_code': 'UNAUTHORIZED',
            'message': 'Authentication failed - Invalid API credentials',
            'details': response_data
        }
    elif status_code == 404:
        return {
            'success': False,
            'error_code': 'NOT_FOUND',
            'message': response_data.get('message', 'Resource not found'),
            'details': response_data
        }
    elif status_code == 409:
        return {
            'success': False,
            'error_code': 'CONFLICT',
            'message': response_data.get('message', 'Conflict - Resource already exists'),
            'details': response_data
        }
    elif status_code == 422:
        return {
            'success': False,
            'error_code': 'VALIDATION_ERROR',
            'message': response_data.get('message', 'Validation failed'),
            'details': response_data
        }
    elif status_code == 429:
        return {
            'success': False,
            'error_code': 'RATE_LIMIT',
            'message': 'Too many requests - Please try again later',
            'details': response_data
        }
    elif status_code == 500:
        return {
            'success': False,
            'error_code': 'INTERNAL_SERVER_ERROR',
            'message': 'Payment gateway internal error - Please try again',
            'details': response_data
        }
    elif status_code == 502:
        return {
            'success': False,
            'error_code': 'BAD_GATEWAY',
            'message': 'Payment gateway temporarily unavailable - Please try again',
            'details': response_data
        }
    else:
        return {
            'success': False,
            'error_code': 'UNKNOWN_ERROR',
            'message': f'Unexpected error (Status: {status_code})',
            'details': response_data
        }

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_payment_session(request):
    print('Request data:', request.data)
    serializer = CreatePaymentSessionSerializer(data=request.data)
    if serializer.is_valid():
        order_id = serializer.validated_data['order_id']
        return_url = serializer.validated_data.get('return_url', f"{request.build_absolute_uri('/')[:-1]}/payment/success/")
        notify_url = serializer.validated_data.get('notify_url', f"{request.build_absolute_uri('/')[:-1]}/api/payments/webhook/")
        

        try:
            # Get the order
            order = get_object_or_404(Order, id=order_id, user=request.user)
            print("Order found:", order)
            
            # Check if payment session already exists
            if hasattr(order, 'payment_session'):
                payment_session = order.payment_session
                if payment_session.payment_status in ['created', 'pending']:
                    return Response({
                        'success': True,
                        'message': 'Payment session already exists',
                        'data': PaymentSessionSerializer(payment_session).data
                    })

            # Generate unique order ID for Cashfree
            cashfree_order_id = f"ORDER_{order.order_number}_{uuid.uuid4().hex[:8]}"

            # Prepare Cashfree API request
            url = f"{settings.CASHFREE_BASE_URL}/orders"
            
            payload = {
                "order_id": cashfree_order_id,
                "order_currency": "INR",
                "order_amount": float(order.total_amount),
                "customer_details": {
                    "customer_id": str(order.user.id),
                    "customer_name": f"{order.user.first_name} {order.user.last_name}".strip(),
                    "customer_email": order.user.email,
                    "customer_phone": order.shipping_mobile or order.user.mobile or "9999999999"
                },
                "order_meta": {
                    "return_url": return_url,
                    "notify_url": notify_url
                },
                "order_note": f"Payment for order {order.order_number}"
            }

            headers = {
                "x-api-version": settings.CASHFREE_API_VERSION,
                "x-client-id": settings.CASHFREE_CLIENT_ID,
                "x-client-secret": settings.CASHFREE_CLIENT_SECRET,
                "Content-Type": "application/json"
            }

            response = requests.post(url, json=payload, headers=headers, timeout=30)
            result = handle_cashfree_response(response, "Create payment session")
            
            if result['success']:
                data = result['data']
                
                # Create or update payment session
                payment_session, created = PaymentSession.objects.get_or_create(
                    order=order,
                    defaults={
                        'cashfree_order_id': cashfree_order_id,
                        'payment_session_id': data.get('payment_session_id'),
                        'payment_status': 'created',
                        'gateway_response': data
                    }
                )

                if not created:
                    payment_session.cashfree_order_id = cashfree_order_id
                    payment_session.payment_session_id = data.get('payment_session_id')
                    payment_session.payment_status = 'created'
                    payment_session.gateway_response = data
                    payment_session.save()

                return Response({
                    'success': True,
                    'message': 'Payment session created successfully',
                    'data': {
                        'payment_session_id': data.get('payment_session_id'),
                        'cashfree_order_id': cashfree_order_id,
                        'order_amount': float(order.total_amount),
                        'order_currency': 'INR',
                        'return_url': return_url,
                        'cashfree_mode': settings.CASHFREE_MODE
                    }
                })
            else:
                return Response(result, status=status.HTTP_400_BAD_REQUEST)

        except Order.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except requests.exceptions.Timeout:
            return Response({
                'success': False,
                'error_code': 'TIMEOUT',
                'message': 'Payment gateway request timed out - Please try again'
            }, status=status.HTTP_408_REQUEST_TIMEOUT)
        except requests.exceptions.ConnectionError:
            return Response({
                'success': False,
                'error_code': 'CONNECTION_ERROR',
                'message': 'Unable to connect to payment gateway - Please try again'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'An error occurred while creating payment session',
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    else:
        print('Serializer errors:', serializer.errors)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def process_card_payment(request):
    """Process card payment with Cashfree"""
    try:
        payment_session_id = request.data.get('payment_session_id')
        card_data = request.data.get('card_data', {})
        
        if not payment_session_id:
            return Response({
                'success': False,
                'message': 'Payment session ID is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate card data
        required_fields = ['card_number', 'card_expiry_mm', 'card_expiry_yy', 'card_cvv', 'card_holder_name']
        for field in required_fields:
            if not card_data.get(field):
                return Response({
                    'success': False,
                    'message': f'{field.replace("_", " ").title()} is required'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get payment session
        try:
            payment_session = PaymentSession.objects.get(
                payment_session_id=payment_session_id,
                order__user=request.user
            )
        except PaymentSession.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Payment session not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Prepare Cashfree payment request
        url = "https://sandbox.cashfree.com/pg/orders/sessions"
        
        payload = {
            "payment_session_id": payment_session_id,
            "payment_method": {
                "card": {
                    "channel": "post",
                    "card_number": card_data['card_number'].replace(' ', ''),
                    "card_expiry_mm": card_data['card_expiry_mm'],
                    "card_expiry_yy": card_data['card_expiry_yy'],
                    "card_cvv": card_data['card_cvv'],
                    "card_holder_name": card_data['card_holder_name'],
                }
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "x-api-version": "2023-08-01",
        }
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        result = handle_cashfree_response(response, "Process card payment")
        
        if result['success']:
            data = result['data']
            
            # Update payment session
            payment_session.payment_status = 'processing'
            payment_session.gateway_response = data
            payment_session.save()
            
            # Check if OTP is required
            if data.get('data', {}).get('url'):
                return Response({
                    'success': True,
                    'requires_otp': True,
                    'otp_url': data['data']['url'],
                    'message': 'OTP verification required'
                })
            elif data.get('payment_status') == 'SUCCESS':
                # Payment successful
                payment_session.payment_status = 'success'
                payment_session.transaction_id = data.get('cf_payment_id', '')
                payment_session.save()
                
                # Update order
                order = payment_session.order
                order.payment_status = 'paid'
                order.status = 'confirmed'
                order.save()
                
                # Create status history
                OrderStatusHistory.objects.create(
                    order=order,
                    status='confirmed',
                    notes='Payment completed successfully',
                    created_by=request.user
                )
                
                return Response({
                    'success': True,
                    'payment_status': 'SUCCESS',
                    'message': 'Payment completed successfully',
                    'order_id': order.id
                })
            else:
                return Response({
                    'success': False,
                    'message': data.get('message', 'Payment processing failed'),
                    'payment_status': data.get('payment_status', 'FAILED')
                })
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except requests.exceptions.Timeout:
        return Response({
            'success': False,
            'error_code': 'TIMEOUT',
            'message': 'Payment processing timed out - Please try again'
        }, status=status.HTTP_408_REQUEST_TIMEOUT)
    except requests.exceptions.ConnectionError:
        return Response({
            'success': False,
            'error_code': 'CONNECTION_ERROR',
            'message': 'Unable to connect to payment gateway - Please try again'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'An error occurred while processing payment',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_otp(request):
    """Verify OTP for card payment"""
    try:
        otp_url = request.data.get('otp_url')
        otp = request.data.get('otp')
        payment_session_id = request.data.get('payment_session_id')
        
        if not all([otp_url, otp, payment_session_id]):
            return Response({
                'success': False,
                'message': 'OTP URL, OTP, and payment session ID are required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get payment session
        try:
            payment_session = PaymentSession.objects.get(
                payment_session_id=payment_session_id,
                order__user=request.user
            )
        except PaymentSession.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Payment session not found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Submit OTP to Cashfree
        payload = {
            "action": "SUBMIT_OTP",
            "otp": otp
        }
        
        headers = {
            "accept": "*/*",
            "Content-Type": "application/json",
            "x-api-version": "2023-08-01",
        }
        
        response = requests.post(otp_url, json=payload, headers=headers, timeout=30)
        result = handle_cashfree_response(response, "OTP verification")
        
        if result['success']:
            data = result['data']
            
            # Check payment status
            payment_status = data.get('payment_status') or data.get('status') or data.get('data', {}).get('payment_status')
            authenticate_status = data.get('authenticate_status')
            
            if (payment_status == 'SUCCESS' or 
                authenticate_status == 'SUCCESS' or 
                data.get('action') == 'COMPLETE'):
                
                # Payment successful
                payment_session.payment_status = 'success'
                payment_session.transaction_id = data.get('cf_payment_id', '')
                payment_session.gateway_response = data
                payment_session.save()
                
                # Update order
                order = payment_session.order
                order.payment_status = 'paid'
                order.status = 'confirmed'
                order.save()
                
                # Create status history
                OrderStatusHistory.objects.create(
                    order=order,
                    status='confirmed',
                    notes='Payment completed after OTP verification',
                    created_by=request.user
                )
                
                return Response({
                    'success': True,
                    'payment_status': 'SUCCESS',
                    'message': 'Payment completed successfully',
                    'order_id': order.id
                })
            elif (payment_status == 'FAILED' or 
                  authenticate_status == 'FAILED'):
                
                # Payment failed
                payment_session.payment_status = 'failed'
                payment_session.gateway_response = data
                payment_session.save()
                
                return Response({
                    'success': False,
                    'payment_status': 'FAILED',
                    'message': data.get('message') or data.get('error_description') or 'OTP verification failed'
                })
            else:
                # Check payment status as fallback
                status_result = check_payment_status_internal(payment_session.cashfree_order_id)
                if status_result['success'] and status_result['data'].get('payment_status') == 'SUCCESS':
                    # Payment successful
                    payment_session.payment_status = 'success'
                    payment_session.save()
                    
                    # Update order
                    order = payment_session.order
                    order.payment_status = 'paid'
                    order.status = 'confirmed'
                    order.save()
                    
                    # Create status history
                    OrderStatusHistory.objects.create(
                        order=order,
                        status='confirmed',
                        notes='Payment confirmed via status check',
                        created_by=request.user
                    )
                    
                    return Response({
                        'success': True,
                        'payment_status': 'SUCCESS',
                        'message': 'Payment completed successfully',
                        'order_id': order.id
                    })
                else:
                    return Response({
                        'success': False,
                        'message': data.get('message') or 'OTP verification status unclear',
                        'details': data
                    })
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
            
    except requests.exceptions.Timeout:
        return Response({
            'success': False,
            'error_code': 'TIMEOUT',
            'message': 'OTP verification timed out - Please try again'
        }, status=status.HTTP_408_REQUEST_TIMEOUT)
    except requests.exceptions.ConnectionError:
        return Response({
            'success': False,
            'error_code': 'CONNECTION_ERROR',
            'message': 'Unable to connect to payment gateway - Please try again'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'An error occurred during OTP verification',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def check_payment_status_internal(cashfree_order_id):
    """Internal function to check payment status"""
    try:
        url = f"{settings.CASHFREE_BASE_URL}/orders/{cashfree_order_id}"
        headers = {
            "x-api-version": settings.CASHFREE_API_VERSION,
            "x-client-id": settings.CASHFREE_CLIENT_ID,
            "x-client-secret": settings.CASHFREE_CLIENT_SECRET,
        }

        response = requests.get(url, headers=headers, timeout=30)
        return handle_cashfree_response(response, "Check payment status")
        
    except Exception as e:
        return {
            'success': False,
            'message': f'Error checking payment status: {str(e)}'
        }

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_payment_status(request, cashfree_order_id):
    try:
        payment_session = get_object_or_404(
            PaymentSession, 
            cashfree_order_id=cashfree_order_id,
            order__user=request.user
        )

        # Fetch latest status from Cashfree
        result = check_payment_status_internal(cashfree_order_id)
        
        if result['success']:
            data = result['data']
            
            # Update payment session status
            order_status = data.get('order_status', '').lower()
            if order_status == 'paid':
                payment_session.payment_status = 'success'
                payment_session.order.payment_status = 'paid'
                payment_session.order.status = 'confirmed'
                payment_session.order.save()
                
                # Create status history
                OrderStatusHistory.objects.create(
                    order=payment_session.order,
                    status='confirmed',
                    notes='Payment completed successfully',
                    created_by=request.user
                )
            elif order_status in ['cancelled', 'terminated']:
                payment_session.payment_status = 'failed'
            elif order_status == 'active':
                payment_session.payment_status = 'pending'
            
            payment_session.gateway_response = data
            payment_session.save()

            return Response({
                'success': True,
                'data': {
                    'payment_status': payment_session.payment_status,
                    'order_status': order_status,
                    'cashfree_order_id': cashfree_order_id,
                    'order_details': data
                }
            })
        else:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)

    except PaymentSession.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Payment session not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'message': 'An error occurred while checking payment status',
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@method_decorator(csrf_exempt, name='dispatch')
@api_view(['POST'])
@permission_classes([])
def payment_webhook(request):
    try:
        # Verify webhook signature (optional but recommended)
        webhook_data = json.loads(request.body)
        
        # Store webhook for processing
        PaymentWebhook.objects.create(
            cashfree_order_id=webhook_data.get('order', {}).get('order_id', ''),
            event_type=webhook_data.get('type', ''),
            webhook_data=webhook_data
        )

        # Process webhook
        if webhook_data.get('type') == 'PAYMENT_SUCCESS_WEBHOOK':
            order_data = webhook_data.get('order', {})
            cashfree_order_id = order_data.get('order_id')
            
            try:
                payment_session = PaymentSession.objects.get(cashfree_order_id=cashfree_order_id)
                payment_session.payment_status = 'success'
                payment_session.transaction_id = webhook_data.get('payment', {}).get('cf_payment_id', '')
                payment_session.gateway_response = webhook_data
                payment_session.save()

                # Update order status
                order = payment_session.order
                order.payment_status = 'paid'
                order.status = 'confirmed'
                order.save()

                # Create status history
                OrderStatusHistory.objects.create(
                    order=order,
                    status='confirmed',
                    notes='Payment completed via webhook',
                    created_by=order.user
                )

            except PaymentSession.DoesNotExist:
                pass

        elif webhook_data.get('type') == 'PAYMENT_FAILED_WEBHOOK':
            order_data = webhook_data.get('order', {})
            cashfree_order_id = order_data.get('order_id')
            
            try:
                payment_session = PaymentSession.objects.get(cashfree_order_id=cashfree_order_id)
                payment_session.payment_status = 'failed'
                payment_session.gateway_response = webhook_data
                payment_session.save()

            except PaymentSession.DoesNotExist:
                pass

        return JsonResponse({'status': 'success'})

    except Exception as e:
        return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

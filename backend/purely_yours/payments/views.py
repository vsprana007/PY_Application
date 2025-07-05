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

            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                
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
                error_data = response.json() if response.content else {}
                return Response({
                    'success': False,
                    'message': 'Failed to create payment session',
                    'error': error_data.get('message', 'Unknown error from payment gateway')
                }, status=status.HTTP_400_BAD_REQUEST)

        except Order.DoesNotExist:
            return Response({
                'success': False,
                'message': 'Order not found'
            }, status=status.HTTP_404_NOT_FOUND)
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
        url = f"{settings.CASHFREE_BASE_URL}/orders/{cashfree_order_id}"
        headers = {
            "x-api-version": settings.CASHFREE_API_VERSION,
            "x-client-id": settings.CASHFREE_CLIENT_ID,
            "x-client-secret": settings.CASHFREE_CLIENT_SECRET,
        }

        response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            data = response.json()
            
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
            return Response({
                'success': False,
                'message': 'Failed to fetch payment status'
            }, status=status.HTTP_400_BAD_REQUEST)

    except PaymentSession.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Payment session not found'
        }, status=status.HTTP_404_NOT_FOUND)

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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def handle_payment(request):
    """
    Handle payment processing.
    This is a placeholder for any additional payment handling logic.
    """
    return Response({
        'success': True,
        'message': 'Payment handling not implemented yet.'
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def handle_cashfree_otp(request):
    """
    Handle OTP verification.
    This is a placeholder for any additional OTP handling logic.
    """
    data = request.data
    return Response({
        'success': True,
        'message': 'OTP handling not implemented yet.'
    }, status=status.HTTP_200_OK)

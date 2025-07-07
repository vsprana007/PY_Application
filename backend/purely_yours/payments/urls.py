from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.PaymentSessionListView.as_view(), name='payment-sessions'),
    path('sessions/<int:pk>/', views.PaymentSessionDetailView.as_view(), name='payment-session-detail'),
    path('create-session/', views.create_payment_session, name='create-payment-session'),
    path('process-card-payment/', views.process_card_payment, name='process-card-payment'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),
    path('status/<str:cashfree_order_id>/', views.get_payment_status, name='payment-status'),
    path('webhook/', views.payment_webhook, name='payment-webhook'),
]

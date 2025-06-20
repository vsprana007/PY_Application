from django.urls import path
from . import views

urlpatterns = [
    path('sessions/', views.PaymentSessionListView.as_view(), name='payment-sessions'),
    path('sessions/<int:pk>/', views.PaymentSessionDetailView.as_view(), name='payment-session-detail'),
    path('create-session/', views.create_payment_session, name='create-payment-session'),
    path('status/<str:cashfree_order_id>/', views.get_payment_status, name='payment-status'),
    path('webhook/', views.payment_webhook, name='payment-webhook'),
]

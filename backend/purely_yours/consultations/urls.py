from django.urls import path
from . import views

urlpatterns = [
    path('doctors/', views.DoctorListView.as_view(), name='doctor_list'),
    path('doctors/<int:pk>/', views.DoctorDetailView.as_view(), name='doctor_detail'),
    path('book/', views.book_consultation, name='book_consultation'),
    path('my-consultations/', views.UserConsultationsView.as_view(), name='user_consultations'),
    path('<int:pk>/', views.ConsultationDetailView.as_view(), name='consultation_detail'),
    path('<int:consultation_id>/cancel/', views.cancel_consultation, name='cancel_consultation'),
    path('<int:consultation_id>/feedback/', views.submit_feedback, name='submit_feedback'),
]

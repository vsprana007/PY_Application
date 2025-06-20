from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Doctor, Consultation, ConsultationFeedback
from .serializers import (
    DoctorSerializer, ConsultationSerializer, 
    BookConsultationSerializer, CreateFeedbackSerializer
)

class DoctorListView(generics.ListAPIView):
    queryset = Doctor.objects.filter(is_active=True)
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]

class DoctorDetailView(generics.RetrieveAPIView):
    queryset = Doctor.objects.filter(is_active=True)
    serializer_class = DoctorSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def book_consultation(request):
    serializer = BookConsultationSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        consultation = serializer.save()
        return Response({
            'success': True,
            'message': 'Consultation booked successfully',
            'consultation': ConsultationSerializer(consultation, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

class UserConsultationsView(generics.ListAPIView):
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Consultation.objects.filter(user=self.request.user)

class ConsultationDetailView(generics.RetrieveAPIView):
    serializer_class = ConsultationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Consultation.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_consultation(request, consultation_id):
    try:
        consultation = Consultation.objects.get(
            id=consultation_id,
            user=request.user,
            status='scheduled'
        )
        
        consultation.status = 'cancelled'
        consultation.save()
        
        return Response({
            'success': True,
            'message': 'Consultation cancelled successfully',
            'consultation': ConsultationSerializer(consultation, context={'request': request}).data
        })
        
    except Consultation.DoesNotExist:
        return Response({
            'success': False,
            'message': 'Consultation not found or cannot be cancelled'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def submit_feedback(request, consultation_id):
    consultation = get_object_or_404(
        Consultation,
        id=consultation_id,
        user=request.user,
        status='completed'
    )
    
    if hasattr(consultation, 'feedback'):
        return Response({
            'success': False,
            'message': 'Feedback already submitted for this consultation'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = CreateFeedbackSerializer(data=request.data)
    if serializer.is_valid():
        feedback = serializer.save(consultation=consultation)
        return Response({
            'success': True,
            'message': 'Feedback submitted successfully',
            'feedback': CreateFeedbackSerializer(feedback).data
        }, status=status.HTTP_201_CREATED)
    
    return Response({
        'success': False,
        'errors': serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)

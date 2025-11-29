import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { StarRating } from '../components/StarRating';
import { submitRating } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

type RatingScreenProps = NativeStackScreenProps<RootStackParamList, 'Rating'>;

export function RatingScreen({ route, navigation }: RatingScreenProps) {
  const { orderId } = route.params;
  const { token } = useAuth();

  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Avaliação', 'Por favor, selecione uma nota de 1 a 5 estrelas.');
      return;
    }

    if (!token) {
      Alert.alert('Erro', 'Usuário não autenticado');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitRating(orderId, rating, feedback, token);
      Alert.alert('Sucesso', 'Avaliação enviada com sucesso!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MyOrders'),
        },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao enviar avaliação';
      Alert.alert('Erro', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate('MyOrders');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>Avalie o Serviço</Text>
          <Text style={styles.subtitle}>
            Sua opinião é muito importante para nós!
          </Text>

          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Toque nas estrelas para avaliar:</Text>
            <StarRating rating={rating} onRatingChange={setRating} size={48} />
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && 'Ruim'}
                {rating === 2 && 'Regular'}
                {rating === 3 && 'Bom'}
                {rating === 4 && 'Muito Bom'}
                {rating === 5 && 'Excelente'}
              </Text>
            )}
          </View>

          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackLabel}>Comentário (opcional):</Text>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Deixe um comentário sobre o serviço..."
              placeholderTextColor="#95a5a6"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={styles.charCount}>{feedback.length}/500</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.submitButton, rating === 0 && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting || rating === 0}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Enviar Avaliação</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
              disabled={isSubmitting}
            >
              <Text style={styles.skipButtonText}>Pular</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 32,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3498db',
    marginTop: 12,
  },
  feedbackContainer: {
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    padding: 16,
    fontSize: 16,
    color: '#2c3e50',
    minHeight: 120,
  },
  charCount: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'right',
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButton: {
    backgroundColor: '#3498db',
  },
  disabledButton: {
    backgroundColor: '#bdc3c7',
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  skipButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#7f8c8d',
  },
});

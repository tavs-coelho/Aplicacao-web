import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';

interface SignatureCaptureProps {
  onConfirm: (signatureBase64: string) => void;
  onClear?: () => void;
}

export function SignatureCapture({ onConfirm, onClear }: SignatureCaptureProps) {
  const signatureRef = useRef<SignatureViewRef>(null);

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    onClear?.();
  };

  const handleOK = (signature: string) => {
    // The signature is returned as a data URL (e.g., "data:image/png;base64,...")
    onConfirm(signature);
  };

  const handleEmpty = () => {
    // Called when trying to confirm an empty signature
    console.log('Assinatura vazia');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assinatura do Cliente</Text>
      <Text style={styles.instruction}>Desenhe a assinatura abaixo</Text>
      
      <View style={styles.signatureContainer}>
        <SignatureScreen
          ref={signatureRef}
          onOK={handleOK}
          onEmpty={handleEmpty}
          autoClear={false}
          descriptionText=""
          webStyle={webStyle}
        />
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.clearButton]}
          onPress={handleClear}
        >
          <Text style={styles.clearButtonText}>Limpar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.confirmButton]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirmar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const webStyle = `.m-signature-pad {
  box-shadow: none;
  border: none;
  margin: 0;
  width: 100%;
  height: 100%;
}
.m-signature-pad--body {
  border: none;
  width: 100%;
  height: 100%;
}
.m-signature-pad--footer {
  display: none;
}
canvas {
  width: 100%;
  height: 100%;
}`;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 16,
  },
  signatureContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    overflow: 'hidden',
    minHeight: 200,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  confirmButton: {
    backgroundColor: '#3498db',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

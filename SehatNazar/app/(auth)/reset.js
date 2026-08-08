import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import theme from '../../constants/theme';
import T from '../../components/T';
import { useLang } from '../../lib/i18n';
import { resetPin } from '../../lib/auth';
import { useSession } from '../../lib/session';

function HeaderBand() {
  return (
    <LinearGradient colors={theme.grad.lilac} start={{x:0,y:0}} end={{x:1,y:1}} style={{ height: 180, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 64, height: 64, borderRadius: 24, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
        <Svg width={32} height={32} viewBox="0 0 48 48">
          <Circle cx="24" cy="24" r="18" stroke={theme.color.brand} strokeWidth="3.5" fill="none" />
          <Circle cx="24" cy="24" r="10" stroke={theme.color.lilacD} strokeWidth="3.5" fill="none" />
          <Circle cx="24" cy="24" r="4" fill={theme.color.brand} />
        </Svg>
      </View>
    </LinearGradient>
  );
}

function Field({ label, error, children }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <T style={{ fontSize: 13, fontWeight: '700', color: theme.color.ink2, marginBottom: 8 }}>{label}</T>
      {children}
      {error ? <T style={{ fontSize: 12, color: theme.color.coralD, marginTop: 6 }}>{error}</T> : null}
    </View>
  );
}

export default function ResetScreen() {
  const router = useRouter();
  const { t, isUrdu } = useLang();
  const { refreshSession } = useSession();
  const params = useLocalSearchParams();
  
  const isStep2 = params.step === '2';

  const [phone, setPhone] = useState(params.phone || '03');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSendCode = async () => {
    let errs = {};
    if (!/^03\d{9}$/.test(phone)) errs.phone = t('invalid_phone');

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    router.push({
      pathname: '/(auth)/reset',
      params: { step: '2', phone }
    });
  };

  const handleReset = async () => {
    let errs = {};
    if (!/^\d{4}$/.test(pin)) errs.pin = t('pin_invalid');
    if (pin !== confirmPin) errs.confirmPin = t('pin_mismatch');

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    
    try {
      await resetPin(params.phone, pin);
      await refreshSession();
      router.replace('/(tabs)');
    } catch (e) {
      setErrors({ pin: 'Reset failed. Check your phone number.' });
    }
    setSubmitting(false);
  };

  const inputStyle = {
    backgroundColor: '#F7F7FA',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.color.ink,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    textAlign: isUrdu ? 'right' : 'left'
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.color.bg }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <HeaderBand />
        <View style={{ flex: 1, backgroundColor: theme.color.bg, marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 32 }}>
          <T style={{ fontSize: 24, fontWeight: '700', color: theme.color.ink, marginBottom: 24, textAlign: isUrdu ? 'right' : 'left' }}>
            {t('forgot_pin')}
          </T>

          {!isStep2 ? (
            <>
              <Field label={t('phone')} error={errors.phone}>
                <TextInput
                  style={inputStyle}
                  keyboardType="numeric"
                  value={phone}
                  onChangeText={(text) => {
                    if (text.startsWith('03')) setPhone(text);
                    else if (text === '0') setPhone('03');
                  }}
                  maxLength={11}
                  editable={!submitting}
                />
              </Field>

              <TouchableOpacity onPress={handleSendCode} disabled={submitting} style={{ marginTop: 10, marginBottom: 30 }}>
                <LinearGradient colors={theme.grad.brand} style={{ paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
                  <T style={{ fontSize: 17, fontWeight: '700', color: '#FFF' }}>{t('next')}</T>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center', marginBottom: 40 }}>
                <T style={{ fontSize: 14, fontWeight: '600', color: theme.color.brand }}>{t('cancel')}</T>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Field label={t('pin')} error={errors.pin}>
                    <TextInput style={inputStyle} keyboardType="numeric" maxLength={4} secureTextEntry value={pin} onChangeText={setPin} editable={!submitting} />
                  </Field>
                </View>
                <View style={{ flex: 1 }}>
                  <Field label={t('confirm_pin')} error={errors.confirmPin}>
                    <TextInput style={inputStyle} keyboardType="numeric" maxLength={4} secureTextEntry value={confirmPin} onChangeText={setConfirmPin} editable={!submitting} />
                  </Field>
                </View>
              </View>

              <TouchableOpacity onPress={handleReset} disabled={submitting} style={{ marginTop: 10, marginBottom: 40 }}>
                <LinearGradient colors={theme.grad.brand} style={{ paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
                  <T style={{ fontSize: 17, fontWeight: '700', color: '#FFF' }}>{t('save')}</T>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

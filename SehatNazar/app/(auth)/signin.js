import React, { useState, useRef } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';
import theme from '../../constants/theme';
import T from '../../components/T';
import { useLang } from '../../lib/i18n';
import { signIn } from '../../lib/auth';
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

export default function SignInScreen() {
  const router = useRouter();
  const { t, isUrdu } = useLang();
  const { refreshSession } = useSession();
  
  const [phone, setPhone] = useState('03');
  const [pinCode, setPinCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleChange = (text, index) => {
    const newCode = [...pinCode];
    newCode[index] = text;
    setPinCode(newCode);

    if (text && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !pinCode[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handleSignIn = async () => {
    setError('');
    const fullPin = pinCode.join('');
    
    if (!/^03\d{9}$/.test(phone)) {
      setError(t('invalid_phone'));
      return;
    }
    if (fullPin.length < 4) {
      setError(t('pin_invalid'));
      return;
    }

    setSubmitting(true);
    try {
      await signIn(phone, fullPin);
      await refreshSession();
      router.replace('/(tabs)');
    } catch (e) {
      setError(t('wrong_phone_pin'));
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
            {t('sign_in')}
          </T>

          <View style={{ marginBottom: 20 }}>
            <T style={{ fontSize: 13, fontWeight: '700', color: theme.color.ink2, marginBottom: 8 }}>{t('phone')}</T>
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
          </View>

          <View style={{ marginBottom: 24 }}>
            <T style={{ fontSize: 13, fontWeight: '700', color: theme.color.ink2, marginBottom: 8 }}>{t('pin')}</T>
            <View style={{ flexDirection: 'row', gap: 12, direction: 'ltr' }}>
              {pinCode.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={inputRefs[i]}
                  style={{
                    flex: 1,
                    height: 56,
                    borderRadius: 14,
                    backgroundColor: '#F7F7FA',
                    borderWidth: 1,
                    borderColor: '#E5E5EA',
                    fontSize: 24,
                    fontWeight: '700',
                    textAlign: 'center',
                    color: theme.color.ink
                  }}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChange(text, i)}
                  onKeyPress={(e) => handleKeyPress(e, i)}
                  editable={!submitting}
                />
              ))}
            </View>
          </View>

          {error ? <T style={{ fontSize: 13, color: theme.color.coralD, marginBottom: 16, textAlign: 'center' }}>{error}</T> : null}

          <TouchableOpacity onPress={handleSignIn} disabled={submitting} style={{ marginBottom: 24 }}>
            <LinearGradient colors={theme.grad.brand} style={{ paddingVertical: 16, borderRadius: 14, alignItems: 'center' }}>
              <T style={{ fontSize: 17, fontWeight: '700', color: '#FFF' }}>{t('sign_in')}</T>
            </LinearGradient>
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <TouchableOpacity onPress={() => router.push('/(auth)/reset')}>
              <T style={{ fontSize: 14, fontWeight: '600', color: theme.color.ink3 }}>{t('forgot_pin')}</T>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.replace('/(auth)/signup')}>
              <T style={{ fontSize: 14, fontWeight: '600', color: theme.color.brand }}>{t('new_here')}</T>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import theme from '../../constants/theme';
import T from '../../components/T';
import { useLang } from '../../lib/i18n';
import { signUp } from '../../lib/auth';

const DISTRICTS = ['مظفرگڑھ', 'ملتان', 'ڈیرہ غازی خان', 'راجن پور', 'لیہ'];
const TEHSILS = ['جتوئی', 'کوٹ ادو', 'علی پور']; // Mock
const UCS = ['UC-11', 'UC-12', 'UC-13', 'UC-14'];

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

export default function SignUpScreen() {
  const router = useRouter();
  const { t, isUrdu } = useLang();
  const params = useLocalSearchParams();
  
  const isStep2 = params.step === '2';

  const [phone, setPhone] = useState(params.phone || '03');
  const [lhwId, setLhwId] = useState(params.lhwId || '');
  const [name, setName] = useState(params.name || '');
  
  const [district, setDistrict] = useState('');
  const [tehsil, setTehsil] = useState('');
  const [uc, setUc] = useState('');
  const [village, setVillage] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');

  const [pickerConfig, setPickerConfig] = useState({ visible: false, title: '', data: [], onSelect: null });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const getInitials = (n) => {
    const parts = n.trim().split(' ');
    if (parts.length === 0 || !parts[0]) return 'LHW';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleSendCode = async () => {
    let errs = {};
    if (!/^03\d{9}$/.test(phone)) errs.phone = t('invalid_phone');
    if (!name.trim()) errs.name = t('required');

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    router.push({
      pathname: '/(auth)/signup',
      params: { step: '2', phone, lhwId, name }
    });
  };

  const handleRegister = async () => {
    let errs = {};
    if (!district) errs.district = t('required');
    if (!tehsil) errs.tehsil = t('required');
    if (!uc) errs.uc = t('required');
    if (!village) errs.village = t('required');
    if (!/^\d{4}$/.test(pin)) errs.pin = t('pin_invalid');
    if (pin !== confirmPin) errs.confirmPin = t('pin_mismatch');

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    
    try {
      const pPhone = params.phone;
      const pLhwId = params.lhwId;
      const pName = params.name;

      await signUp({
        phone: pPhone,
        name: pName,
        nameUr: pName,
        lhwId: pLhwId,
        initials: getInitials(pName),
        district,
        tehsil,
        uc,
        village,
        lang: isUrdu ? 'ur' : 'en',
        pin
      });
      router.replace('/(tabs)');
    } catch (e) {
      errs.pin = 'Registration failed';
      setErrors(errs);
    }
    setSubmitting(false);
  };

  const openPicker = (title, data, setter) => {
    setPickerConfig({
      visible: true,
      title,
      data,
      onSelect: (val) => {
        setter(val);
        setPickerConfig({ ...pickerConfig, visible: false });
      }
    });
  };

  const inputStyle = {
    backgroundColor: theme.color.bg,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.color.ink,
    borderWidth: 1,
    borderColor: theme.color.lav,
    textAlign: isUrdu ? 'right' : 'left'
  };

  const pickerStyle = { ...inputStyle, justifyContent: 'center' };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.color.bg }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <HeaderBand />
        <View style={{ flex: 1, backgroundColor: theme.color.bg, marginTop: -24, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 24, paddingTop: 32 }}>
          <T style={{ fontSize: 24, fontWeight: '700', color: theme.color.ink, marginBottom: 24, textAlign: isUrdu ? 'right' : 'left' }}>
            {t('sign_up')}
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
              <Field label={t('lhw_id')} error={errors.lhwId}>
                <TextInput style={inputStyle} value={lhwId} onChangeText={setLhwId} editable={!submitting} />
              </Field>
              <Field label={t('full_name')} error={errors.name}>
                <TextInput style={inputStyle} value={name} onChangeText={setName} editable={!submitting} />
              </Field>

              <TouchableOpacity onPress={handleSendCode} disabled={submitting} style={{ marginTop: 10, marginBottom: 30 }}>
                <LinearGradient colors={theme.grad.brand} style={{ paddingVertical: 16, borderRadius: theme.radius.pill, alignItems: 'center' }}>
                  <T style={{ fontSize: 17, fontWeight: '700', color: '#FFF' }}>{t('next')}</T>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => router.replace('/(auth)/signin')} style={{ alignItems: 'center', marginBottom: 40 }}>
                <T style={{ fontSize: 14, fontWeight: '600', color: theme.color.brand }}>{t('sign_in')}</T>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Field label={t('district')} error={errors.district}>
                <TouchableOpacity style={pickerStyle} onPress={() => openPicker(t('district'), DISTRICTS, setDistrict)}>
                  <T style={{ color: district ? theme.color.ink : theme.color.ink3 }}>{district || t('district')}</T>
                </TouchableOpacity>
              </Field>
              <Field label={t('tehsil')} error={errors.tehsil}>
                <TouchableOpacity style={pickerStyle} onPress={() => openPicker(t('tehsil'), TEHSILS, setTehsil)}>
                  <T style={{ color: tehsil ? theme.color.ink : theme.color.ink3 }}>{tehsil || t('tehsil')}</T>
                </TouchableOpacity>
              </Field>
              <Field label={t('uc')} error={errors.uc}>
                <TouchableOpacity style={pickerStyle} onPress={() => openPicker(t('uc'), UCS, setUc)}>
                  <T style={{ color: uc ? theme.color.ink : theme.color.ink3 }}>{uc || t('uc')}</T>
                </TouchableOpacity>
              </Field>
              <Field label={t('village')} error={errors.village}>
                <TextInput style={inputStyle} value={village} onChangeText={setVillage} editable={!submitting} />
              </Field>
              
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

              <TouchableOpacity onPress={handleRegister} disabled={submitting} style={{ marginTop: 10, marginBottom: 40 }}>
                <LinearGradient colors={theme.grad.brand} style={{ paddingVertical: 16, borderRadius: theme.radius.pill, alignItems: 'center' }}>
                  <T style={{ fontSize: 17, fontWeight: '700', color: '#FFF' }}>{t('create_account')}</T>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>

      {/* Picker Modal */}
      <Modal visible={pickerConfig.visible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <View style={{ backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: 400 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#EEE' }}>
              <T style={{ fontSize: 18, fontWeight: '700', color: theme.color.ink }}>{pickerConfig.title}</T>
              <TouchableOpacity onPress={() => setPickerConfig({ ...pickerConfig, visible: false })}>
                <Ionicons name="close" size={24} color={theme.color.ink} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={pickerConfig.data}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => pickerConfig.onSelect(item)} style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
                  <T style={{ fontSize: 16, color: theme.color.ink, textAlign: isUrdu ? 'right' : 'left' }}>{item}</T>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

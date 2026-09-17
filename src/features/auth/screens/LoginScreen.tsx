import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '../../../shared/api/client';
import { useKeyboardInset, useScrollFocusedInput } from '../../../shared/hooks/useKeyboardInset';
import { colors, radius, space, type } from '../../../shared/theme/tokens';
import { Button } from '../../../shared/ui/Button';
import { TextField } from '../../../shared/ui/TextField';
import { DEMO_LOGIN, loginSchema, type LoginForm } from '../api';
import { useSessionStore } from '../sessionStore';

export function LoginScreen() {
  const login = useSessionStore((state) => state.login);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [demoFilled, setDemoFilled] = useState(false);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const { keyboardHeight, paddingBottom, keyboardVisible } = useKeyboardInset();
  const { scrollRef, bindFocus, onScroll, scrollFocusedIntoView } =
    useScrollFocusedInput(keyboardHeight);

  const { control, handleSubmit, setValue, formState } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    Keyboard.dismiss();
    setFormError(null);
    try {
      await login(values);
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : 'Could not sign in. Try the demo credentials.',
      );
    }
  });

  const fillDemo = () => {
    setValue('username', DEMO_LOGIN.username, { shouldValidate: true });
    setValue('password', DEMO_LOGIN.password, { shouldValidate: true });
    setFormError(null);
    setDemoFilled(true);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        onScroll={(event) => onScroll(event.nativeEvent.contentOffset.y)}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.content, { paddingBottom }]}
      >
        <View style={[styles.hero, keyboardVisible ? styles.heroCompact : null]}>
          {keyboardVisible ? null : (
            <View style={styles.mark}>
              <Ionicons name="storefront" size={28} color="#fff" />
            </View>
          )}
          <Text style={styles.brand}>Bazaar</Text>
          <Text style={styles.title}>{keyboardVisible ? 'Sign in' : 'Welcome back'}</Text>
          {keyboardVisible ? null : (
            <Text style={styles.tagline}>Sign in to browse, bag items, and check out.</Text>
          )}
        </View>

        <View style={styles.card}>
          <Controller
            control={control}
            name="username"
            render={({ field, fieldState }) => (
              <TextField
                ref={usernameRef}
                label="Username"
                placeholder="e.g. emilys"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="username"
                textContentType="username"
                returnKeyType="next"
                blurOnSubmit={false}
                value={field.value}
                onChangeText={field.onChange}
                onFocus={() => {
                  bindFocus(usernameRef.current);
                  setTimeout(scrollFocusedIntoView, 80);
                }}
                onSubmitEditing={() => passwordRef.current?.focus()}
                error={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <TextField
                ref={passwordRef}
                label="Password"
                placeholder="Your password"
                autoComplete="password"
                textContentType="password"
                returnKeyType="go"
                secureTextEntry={!showPassword}
                value={field.value}
                onChangeText={field.onChange}
                onFocus={() => {
                  bindFocus(passwordRef.current);
                  setTimeout(scrollFocusedIntoView, 80);
                }}
                onSubmitEditing={onSubmit}
                error={fieldState.error?.message}
                right={
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    hitSlop={8}
                    onPress={() => setShowPassword((open) => !open)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.inkMuted}
                    />
                  </Pressable>
                }
              />
            )}
          />
          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          <Button label="Sign in" onPress={onSubmit} loading={formState.isSubmitting} />
        </View>

        <Pressable
          style={({ pressed }) => [styles.demo, pressed ? styles.demoPressed : null]}
          onPress={fillDemo}
          accessibilityRole="button"
          accessibilityLabel="Tap to fill demo account"
        >
          <View style={styles.demoTop}>
            <View style={styles.demoIcon}>
              <Ionicons name="flash-outline" size={18} color={colors.accent} />
            </View>
            <View style={styles.demoTitleWrap}>
              <Text style={styles.demoKicker}>Demo account</Text>
              <Text style={styles.demoHint}>DummyJSON test user — no signup needed.</Text>
            </View>
          </View>

          <View style={styles.credList}>
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Username</Text>
              <Text style={styles.credValue}>{DEMO_LOGIN.username}</Text>
            </View>
            <View style={styles.credDivider} />
            <View style={styles.credRow}>
              <Text style={styles.credLabel}>Password</Text>
              <Text style={styles.credValue}>{DEMO_LOGIN.password}</Text>
            </View>
          </View>

          <View style={[styles.demoCta, demoFilled ? styles.demoCtaDone : null]}>
            <Ionicons
              name={demoFilled ? 'checkmark-circle' : 'arrow-down-circle-outline'}
              size={18}
              color={demoFilled ? colors.success : '#fff'}
            />
            <Text style={[styles.demoCtaText, demoFilled ? styles.demoCtaTextDone : null]}>
              {demoFilled ? 'Filled' : 'Tap to fill'}
            </Text>
          </View>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingHorizontal: space.xxl,
    paddingTop: space.xl,
    gap: space.xl,
  },
  hero: {
    gap: space.sm,
  },
  heroCompact: {
    gap: 2,
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.sm,
  },
  brand: {
    fontSize: type.sm,
    fontWeight: '700',
    color: colors.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: colors.ink,
    letterSpacing: -0.8,
  },
  tagline: {
    fontSize: type.md,
    color: colors.inkMuted,
    lineHeight: 22,
    maxWidth: 300,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.xl,
    gap: space.lg,
  },
  error: {
    color: colors.danger,
    fontSize: type.sm,
  },
  demo: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.lg,
    gap: space.md,
  },
  demoPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  demoTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  demoIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  demoTitleWrap: {
    flex: 1,
    gap: 2,
  },
  demoKicker: {
    fontSize: type.md,
    fontWeight: '800',
    color: colors.ink,
  },
  demoHint: {
    fontSize: type.sm,
    color: colors.inkMuted,
    lineHeight: 18,
  },
  credList: {
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.md,
    paddingVertical: 12,
    gap: space.md,
  },
  credDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
    marginHorizontal: space.md,
  },
  credLabel: {
    fontSize: type.sm,
    color: colors.inkMuted,
    fontWeight: '600',
  },
  credValue: {
    fontSize: type.md,
    fontWeight: '700',
    color: colors.ink,
    fontVariant: ['tabular-nums'],
  },
  demoCta: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  demoCtaDone: {
    backgroundColor: colors.successSoft,
  },
  demoCtaText: {
    fontSize: type.md,
    fontWeight: '700',
    color: '#fff',
  },
  demoCtaTextDone: {
    color: colors.success,
  },
});

import { forwardRef, type ReactNode } from 'react';
import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

import { colors, radius, space, type } from '../theme/tokens';

type Props = TextInputProps & {
  label: string;
  error?: string;
  right?: ReactNode;
};

export const TextField = forwardRef<TextInput, Props>(function TextField(
  { label, error, right, style, ...inputProps },
  ref,
) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        <TextInput
          ref={ref}
          placeholderTextColor={colors.inkSubtle}
          style={[styles.input, right ? styles.inputWithRight : null, style]}
          {...inputProps}
        />
        {right ? <View style={styles.right}>{right}</View> : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: space.xs,
  },
  label: {
    fontSize: type.sm,
    fontWeight: '600',
    color: colors.ink,
  },
  field: {
    minHeight: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    minHeight: 52,
    paddingHorizontal: space.md,
    fontSize: type.md,
    color: colors.ink,
  },
  inputWithRight: {
    paddingRight: space.xs,
  },
  right: {
    paddingRight: space.md,
  },
  error: {
    fontSize: type.xs,
    color: colors.danger,
  },
});

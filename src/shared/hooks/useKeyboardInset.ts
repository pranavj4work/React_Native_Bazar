import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  type KeyboardEvent,
  type ScrollView,
  type TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function useKeyboardInset() {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height);
    };
    const onHide = () => setKeyboardHeight(0);

    const show = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      onShow,
    );
    const hide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      onHide,
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const paddingBottom = keyboardHeight > 0 ? keyboardHeight + 16 : insets.bottom + 24;

  return {
    keyboardHeight,
    paddingBottom,
    keyboardVisible: keyboardHeight > 0,
  };
}

export function useScrollFocusedInput(keyboardHeight: number) {
  const scrollRef = useRef<ScrollView>(null);
  const focusedRef = useRef<TextInput | null>(null);
  const offsetY = useRef(0);

  const scrollFocusedIntoView = useCallback(() => {
    const input = focusedRef.current;
    const scroll = scrollRef.current;
    if (!input || !scroll || keyboardHeight <= 0) return;

    input.measureInWindow((_x, y, _w, height) => {
      const keyboardTop = Dimensions.get('window').height - keyboardHeight;
      const overflow = y + height + 24 - keyboardTop;
      if (overflow > 0) {
        scroll.scrollTo({ y: Math.max(0, offsetY.current + overflow), animated: true });
      }
    });
  }, [keyboardHeight]);

  useEffect(() => {
    if (keyboardHeight <= 0) return;
    const handle = setTimeout(scrollFocusedIntoView, 60);
    return () => clearTimeout(handle);
  }, [keyboardHeight, scrollFocusedIntoView]);

  const onScroll = useCallback((y: number) => {
    offsetY.current = y;
  }, []);

  const bindFocus = useCallback((node: TextInput | null) => {
    focusedRef.current = node;
  }, []);

  return { scrollRef, bindFocus, onScroll, scrollFocusedIntoView };
}

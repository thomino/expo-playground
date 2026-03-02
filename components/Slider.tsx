import React, { useCallback, useEffect } from 'react';
import { View, StyleProp, ViewStyle, LayoutChangeEvent, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useThemeColors } from '@/app/contexts/ThemeColors';

type SliderSize = 's' | 'm' | 'l';

interface SliderProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  value?: number;
  initialValue?: number;
  onValueChange?: (value: number) => void;
  label?: string;
  maxValue?: number;
  minValue?: number;
  step?: number;
  size?: SliderSize;
}

const sizeStyles = {
  s: {
    containerHeight: 20,
    labelText: 'text-sm',
    valueText: 'text-xs',
    trackHeight: 4,
    thumbSize: 16,
  },
  m: {
    containerHeight: 30,
    labelText: 'text-sm',
    valueText: 'text-sm',
    trackHeight: 6,
    thumbSize: 20,
  },
  l: {
    containerHeight: 40,
    labelText: 'text-base',
    valueText: 'text-base',
    trackHeight: 8,
    thumbSize: 24,
  },
};

const Slider = ({
  className = '',
  style,
  value,
  initialValue,
  onValueChange,
  label,
  maxValue = 100,
  minValue = 0,
  step = 1,
  size = 'm',
}: SliderProps) => {
  const colors = useThemeColors();
  const currentSize = sizeStyles[size];

  // This ensures initialValue takes precedence when value is undefined
  const effectiveInitialValue = initialValue !== undefined ? initialValue : 0;
  const effectiveValue = value !== undefined ? value : effectiveInitialValue;

  // Calculate the width of the slider and track absolute positions
  const containerWidth = useSharedValue(0);

  // Percentage for positioning (0-1)
  const percentage = useSharedValue(
    maxValue === minValue
      ? 0
      : Math.max(0, Math.min(1, (effectiveValue - minValue) / (maxValue - minValue)))
  );

  // Calculate display value from percentage
  const displayValue = useDerivedValue(() => {
    return minValue + percentage.value * (maxValue - minValue);
  });

  // When external value changes, update our internal values
  useEffect(() => {
    if (value === undefined || maxValue === minValue) return;

    const newPercentage = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue)));
    percentage.value = withTiming(newPercentage, { duration: 100 });
  }, [value, minValue, maxValue, percentage]);

  // Calculate actual thumb position accounting for thumb size to ensure edge-to-edge movement
  const thumbPosition = useDerivedValue(() => {
    // This creates perfect edge-to-edge movement
    const thumbRadius = currentSize.thumbSize / 2;
    return percentage.value * (containerWidth.value - currentSize.thumbSize) + thumbRadius;
  });

  // Calculate track width
  const trackWidth = useDerivedValue(() => {
    // Make track width relative to thumb center position
    return (
      percentage.value * (containerWidth.value - currentSize.thumbSize) + currentSize.thumbSize / 2
    );
  });

  // Handle direct tap on track
  const calculateValueFromTap = (x: number) => {
    // Get real container width excluding thumb size
    const usableWidth = containerWidth.value - currentSize.thumbSize;
    if (usableWidth <= 0) return;

    // Calculate position relative to usable width, accounting for thumb radius offset
    let newPercentage = Math.max(0, Math.min(1, (x - currentSize.thumbSize / 2) / usableWidth));

    // Calculate raw value
    const rawValue = minValue + newPercentage * (maxValue - minValue);

    // Apply stepping
    let steppedValue;
    if (step > 0) {
      steppedValue = Math.round((rawValue - minValue) / step) * step + minValue;
      steppedValue = Math.min(Math.max(steppedValue, minValue), maxValue);

      // Recalculate percentage from stepped value
      newPercentage = (steppedValue - minValue) / (maxValue - minValue);
    } else {
      steppedValue = rawValue;
    }

    // Update percentage and notify
    percentage.value = withTiming(newPercentage, { duration: 150 });

    if (onValueChange) {
      onValueChange(steppedValue);
    }
  };

  // Handle pan gesture
  const startPercentage = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startPercentage.value = percentage.value;
    })
    .onUpdate((event) => {
      // Calculate position relative to usable width (excluding thumb)
      const usableWidth = containerWidth.value - currentSize.thumbSize;
      if (usableWidth <= 0) return;

      let newPercentage = startPercentage.value + event.translationX / usableWidth;
      newPercentage = Math.min(Math.max(newPercentage, 0), 1);

      // Calculate raw value
      const rawValue = minValue + newPercentage * (maxValue - minValue);

      // Apply stepping
      let steppedValue;
      if (step > 0) {
        steppedValue = Math.round((rawValue - minValue) / step) * step + minValue;
        steppedValue = Math.min(Math.max(steppedValue, minValue), maxValue);

        // Recalculate percentage from stepped value
        newPercentage = (steppedValue - minValue) / (maxValue - minValue);
      } else {
        steppedValue = rawValue;
      }

      percentage.value = newPercentage;

      if (onValueChange) {
        runOnJS(onValueChange)(steppedValue);
      }
    });

  // Thumb position style
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbPosition.value - currentSize.thumbSize / 2 }],
  }));

  // Active track style
  const activeTrackStyle = useAnimatedStyle(() => ({
    width: trackWidth.value,
  }));

  // Handle layout changes
  const onLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { width } = event.nativeEvent.layout;
      if (width <= 0) return;

      containerWidth.value = width;

      // Initialize position based on value or initialValue
      if (maxValue !== minValue) {
        const valueToUse =
          value !== undefined ? value : initialValue !== undefined ? initialValue : 0;
        const validPercentage = Math.max(
          0,
          Math.min(1, (valueToUse - minValue) / (maxValue - minValue))
        );
        percentage.value = validPercentage;
      }
    },
    [containerWidth, value, initialValue, minValue, maxValue]
  );

  // Format display value with appropriate decimal points
  const formatValue = useDerivedValue(() => {
    const decimalPoints = step >= 1 ? 0 : String(step).split('.')[1]?.length || 0;
    return displayValue.value.toFixed(decimalPoints);
  });

  // Handle tap gesture on track
  const tapGesture = Gesture.Tap()
    .runOnJS(true)
    .onEnd((event) => {
      calculateValueFromTap(event.x);
    });

  return (
    <View className={`w-full ${className}`} style={style}>
      {label && (
        <View className="mb-2 flex-row justify-between">
          <Text className={currentSize.labelText}>{label}</Text>
          
        </View>
      )}

      <View
        style={{ height: currentSize.containerHeight }}
        className="justify-center"
        onLayout={onLayout}>
        <GestureDetector gesture={tapGesture}>
          <Animated.View className="h-full w-full justify-center">
            {/* Background Track */}
            <View
              style={{
                position: 'absolute',
                height: currentSize.trackHeight,
                backgroundColor: colors.secondary,
                borderRadius: currentSize.trackHeight / 2,
                width: '100%',
              }}
            />

            {/* Active Track */}
            <Animated.View
              style={[
                {
                  position: 'absolute',
                  height: currentSize.trackHeight,
                  backgroundColor: colors.highlight,
                  borderRadius: currentSize.trackHeight / 2,
                },
                activeTrackStyle,
              ]}
            />

            {/* Thumb */}
            <GestureDetector gesture={panGesture}>
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    width: currentSize.thumbSize,
                    height: currentSize.thumbSize,
                    borderRadius: currentSize.thumbSize / 2,
                    backgroundColor: colors.highlight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    elevation: 3,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 3,
                    zIndex: 10,
                  },
                  thumbStyle,
                ]}
              />
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
};

export default Slider;

import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import { View, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    useDerivedValue,
    withSpring,
    useAnimatedStyle,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useTheme } from '@/app/contexts/ThemeContext';
import { Stack } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

const ISLAND_W = 126;
const ISLAND_H = 34;
const TOGGLE_SIZE = 44;
const STRING_LEN = 100;
const DRAG_THRESHOLD = 72;

// Low damping = oscillation/pendulum feel
const SPRING = { damping: 2, stiffness: 60, mass: 0.2 };

export default function PendulumToggleScreen() {
    const { width: W, height: H } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const { theme, toggleTheme } = useTheme();

    const isDark = theme === 'dark';

    // Anchor: bottom edge of the island pill
    const anchorX = W / 2;
    const anchorY =  34; // sits at top of safe area, pill extends below

    // Rest position for toggle center
    const restX = W / 2;
    const restY = anchorY + ISLAND_H / 2 + STRING_LEN;

    // Displacement from rest (shared values for animation)
    const posX = useSharedValue(0);
    const posY = useSharedValue(0);
    const startX = useSharedValue(0);
    const startY = useSharedValue(0);

    const doToggle = () => {
        toggleTheme();
    };

    const pan = Gesture.Pan()
        .onBegin(() => {
            startX.value = posX.value;
            startY.value = posY.value;
        })
        .onUpdate((e) => {
            posX.value = startX.value + e.translationX;
            posY.value = startY.value + e.translationY;
        })
        .onEnd(() => {
            const dist = Math.sqrt(posX.value ** 2 + posY.value ** 2);
            if (dist > DRAG_THRESHOLD) {
                runOnJS(doToggle)();
            }
            posX.value = withSpring(0, SPRING);
            posY.value = withSpring(0, SPRING);
        });

    // Skia path: string from island base to top of toggle
    const stringPath = useDerivedValue(() => {
        const tx = restX + posX.value;
        const ty = restY + posY.value - TOGGLE_SIZE / 2;
        const path = Skia.Path.Make();
        path.moveTo(anchorX, anchorY + ISLAND_H / 2);
        // Control point: leans toward toggle but stays anchored — creates natural sag
        const cpX = anchorX + posX.value * 0.12;
        const cpY = anchorY + ISLAND_H / 2 + (ty - anchorY - ISLAND_H / 2) * 0.4;
        path.quadTo(cpX, cpY, tx, ty);
        return path;
    });

    const toggleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: posX.value }, { translateY: posY.value }],
    }));

    const bg = isDark ? '#0f0f0f' : '#f2f2f7';
    const islandBg = isDark ? '#0f0f0f' : '#c7c7cc';
    const stringColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
    const handleBg = isDark ? '#eaeaea' : '#0f0f0f';
    return (
        <>
            <View style={{ flex: 1, backgroundColor: bg }}>

                {/* String drawn in Skia */}
                <Canvas style={{ position: 'absolute', width: W, height: H }}>
                    <Path
                        path={stringPath}
                        color={stringColor}
                        style="stroke"
                        strokeWidth={2.5}
                        strokeCap="round"
                    />
                </Canvas>

                {/* Island pill */}
                <View
                    style={{
                        position: 'absolute',
                        top: 14,
                        left: anchorX - ISLAND_W / 2,
                        width: ISLAND_W,
                        height: ISLAND_H,
                        backgroundColor: islandBg,
                        borderRadius: ISLAND_H / 2,
                    }}
                />

                {/* Hanging toggle */}
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            top: restY - TOGGLE_SIZE / 2,
                            left: restX - TOGGLE_SIZE / 2,
                        },
                        toggleStyle,
                    ]}
                >
                    <GestureDetector gesture={pan}>
                        <View
                            className="rounded-2xl items-center justify-center"
                            style={{
                                width: TOGGLE_SIZE,
                                height: TOGGLE_SIZE,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                                backgroundColor: handleBg,
                            }}
                        >
                            <Feather
                                name={isDark ? 'sun' : 'moon'}
                                size={18}
                                color={isDark ? '#000' : '#fff'}
                            />
                        </View>
                    </GestureDetector>
                </Animated.View>

                {/* Hint */}
                <View
                    className="absolute left-0 right-0 items-center"
                    style={{ bottom: insets.bottom + 52 }}
                >
                    <Text className="text-sm dark:text-white/30 text-black/30 tracking-wide">
                        drag to toggle theme
                    </Text>
                </View>
            </View>
        </>
    );
}

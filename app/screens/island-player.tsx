import {
    Canvas,
    Group,
    RoundedRect,
    Skia,
    TileMode,
} from '@shopify/react-native-skia';
import { View, Text, Image, Pressable, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
    useSharedValue,
    withSpring,
    useDerivedValue,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import Feather from '@expo/vector-icons/Feather';

// ── Island pill ───────────────────────────────────────────
const ISLAND_W = 130;
const ISLAND_H = 36;
const ISLAND_PILL_R = ISLAND_H / 2;          // fully rounded capsule
const ISLAND_TOP = 14;                        // from screen top

// ── Expanded player card ──────────────────────────────────
const CARD_W = 220;
const CARD_H = 60;
const CARD_R = 26;
const CARD_GAP = 25;  // gap between island bottom and card top (> 2*sigma to snap cleanly)

const CANVAS_H = ISLAND_TOP + ISLAND_H + CARD_GAP + CARD_H + 50;

// ── Spring ────────────────────────────────────────────────
const SPRING = { damping: 90, stiffness: 400 };

// ── Gooey paint ───────────────────────────────────────────
const gooeyPaint = (() => {
    const paint = Skia.Paint();
    const blur = Skia.ImageFilter.MakeBlur(10, 10, TileMode.Clamp, null, null);
    const colorFilter = Skia.ColorFilter.MakeMatrix([
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 20, -9,
    ]);
    const colorEffect = Skia.ImageFilter.MakeColorFilter(colorFilter, null, null);
    paint.setImageFilter(Skia.ImageFilter.MakeCompose(colorEffect, blur));
    return paint;
})();

export default function IslandPlayerScreen() {
    const { width: W } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const isExpanded = useSharedValue(0);

    const islandCX = W / 2;

    const cardX = useDerivedValue(() => {
        'worklet';
        return withSpring(isExpanded.value === 1 ? (W - CARD_W) / 2 : islandCX - ISLAND_W / 2, SPRING);
    });
    const cardY = useDerivedValue(() => {
        'worklet';
        return withSpring(
            isExpanded.value === 1 ? ISLAND_TOP + ISLAND_H + CARD_GAP : ISLAND_TOP,
            SPRING
        );
    });
    const cardW = useDerivedValue(() => {
        'worklet';
        return withSpring(isExpanded.value === 1 ? CARD_W : ISLAND_W, SPRING);
    });
    const cardH = useDerivedValue(() => {
        'worklet';
        return withSpring(isExpanded.value === 1 ? CARD_H : ISLAND_H, SPRING);
    });
    const cardR = useDerivedValue(() => {
        'worklet';
        return withSpring(isExpanded.value === 1 ? CARD_R : ISLAND_PILL_R, SPRING);
    });
    const contentOpacity = useDerivedValue(() => {
        'worklet';
        return withSpring(isExpanded.value, { damping: 72, stiffness: 500 });
    });

    const iconStyle = useAnimatedStyle(() => ({
        opacity: withSpring(contentOpacity.value, { damping: 20, stiffness: 120 }),
        transform: [{ scale: withSpring(0.6 + contentOpacity.value * 0.4, { damping: 20, stiffness: 120 }) }],
    }));

    const contentStyle = useAnimatedStyle(() => ({
        position: 'absolute' as const,
        top: cardY.value,
        left: cardX.value,
        width: cardW.value,
        height: cardH.value,
        opacity: contentOpacity.value,
        overflow: 'hidden' as const,
        borderRadius: cardR.value,
    }));

    return (
        <View className="flex-1 bg-stone-200">
            {/*<Image source={require('@/assets/img/scify.jpg')} className="absolute top-0 left-0 w-full h-full" />*/}
            {/* Back button */}
            

            {/* Island + player canvas */}
            <Pressable
                onPress={() => { isExpanded.value = isExpanded.value === 0 ? 1 : 0; }}
                className="absolute inset-x-0 top-0 z-20"
                style={{ height: CANVAS_H }}
            >
                <Canvas style={{ position: 'absolute', top: 0, left: 0, width: W, height: CANVAS_H }}>
                    <Group>
                        <Group layer={gooeyPaint}>
                            <RoundedRect x={islandCX - ISLAND_W / 2} y={ISLAND_TOP} width={ISLAND_W} height={ISLAND_H} r={ISLAND_PILL_R} color="black" />
                            <RoundedRect x={cardX} y={cardY} width={cardW} height={cardH} r={cardR} color="black" />
                        </Group>
                    </Group>
                </Canvas>

                {/* Player content */}
                <Animated.View style={contentStyle} pointerEvents="none">
                    <View className="flex-1 flex-row p-3.5 items-center">
                        <Image
                            source={require('@/assets/img/scify.jpg')}
                            className="w-[40px] aspect-square rounded-3xl"
                            resizeMode="cover"
                        />
                        <View className="flex-1 ml-3 flex-row items-center justify-between" style={{ height: CARD_H - 28 }}>
                            <View>
                                <Text className="text-white text-sm font-bold mb-0.5" numberOfLines={1}>
                                    Cornfield Chase
                                </Text>
                                <Text className="text-white/45 text-xs" numberOfLines={1}>
                                    Hans Zimmer
                                </Text>
                            </View>
                            <Animated.View style={iconStyle}>
                                <Feather name="pause" size={18} color="white" className='mr-2' />
                            </Animated.View>

                        </View>
                    </View>
                </Animated.View>
            </Pressable>

            {/* Toggle button */}
            <View className="flex-1 items-center justify-end" style={{ paddingBottom: insets.bottom + 40 }}>
                <Pressable
                    onPress={() => { isExpanded.value = isExpanded.value === 0 ? 1 : 0; }}
                    className="bg-black px-6 py-3 mb-8 rounded-full"
                >
                    <Text className="text-white text-sm">Toggle player</Text>
                </Pressable>

                <Pressable
                    onPress={() => router.back()}
                >
                    <Text className="text-black text-sm">Back</Text>
                </Pressable>
            </View>
        </View>
    );
}

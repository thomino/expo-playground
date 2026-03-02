import { useRef } from 'react';
import Slider from '@/components/Slider';
import { Feather, Feather as FeatherIcons } from '@expo/vector-icons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    interpolate,
    Extrapolation,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { View, Text, ImageBackground, Pressable, Image, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from 'expo-router';

const SHEET_TRAVEL = 260;

export default function HeaderDrawer() {
    const insets = useSafeAreaInsets();
    const isOpen = useRef(false);
    const progress = useSharedValue(0);
    const startProgress = useSharedValue(0);

    const setIsOpen = (val: boolean) => { isOpen.current = val; };

    const snapTo = (open: boolean) => {
        'worklet';
        progress.value = withTiming(open ? 1 : 0, { duration: 320, easing: Easing.out(Easing.cubic) });
        runOnJS(setIsOpen)(open);
    };

    const toggleFilters = () => {
        isOpen.current = !isOpen.current;
        progress.value = withTiming(isOpen.current ? 1 : 0, { duration: 320, easing: Easing.out(Easing.cubic) });
    };

    const panGesture = Gesture.Pan()
        .activeOffsetY([-8, 8])
        .onBegin(() => {
            startProgress.value = progress.value;
        })
        .onUpdate((e) => {
            progress.value = Math.min(1, Math.max(0, startProgress.value + e.translationY / SHEET_TRAVEL));
        })
        .onEnd((e) => {
            const shouldOpen = e.velocityY > 300 || (e.velocityY > -300 && progress.value > 0.4);
            snapTo(shouldOpen);
        });

    // Profile image: slide left + fade out
    const imageStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
        transform: [{ translateX: interpolate(progress.value, [0, 1], [0, -56], Extrapolation.CLAMP) }],
    }));

    // "Filters" label: slide right + fade in
    const filtersLabelStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
        transform: [{ translateX: interpolate(progress.value, [0, 1], [66, 0], Extrapolation.CLAMP) }],
    }));

    // more-vertical: scale + rotate out
    const moreIconStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [1, 0], Extrapolation.CLAMP),
        transform: [
            { scale: interpolate(progress.value, [0, 1], [1, 0.2], Extrapolation.CLAMP) },
            { rotate: `${interpolate(progress.value, [0, 1], [0, 90], Extrapolation.CLAMP)}deg` },
        ],
    }));

    // check: scale + rotate in
    const checkIconStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
        transform: [
            { scale: interpolate(progress.value, [0, 1], [0.2, 1], Extrapolation.CLAMP) },
            { rotate: `${interpolate(progress.value, [0, 1], [-90, 0], Extrapolation.CLAMP)}deg` },
        ],
    }));

    // FilterContent: slide up from bottom, no opacity change
    const filterContentStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: interpolate(progress.value, [0, 1], [50, 0], Extrapolation.CLAMP) }],
    }));

    // Sheet: top slides from 0 → 260, scales down slightly
    const sheetStyle = useAnimatedStyle(() => ({
        top: interpolate(progress.value, [0, 1], [0, 260], Extrapolation.CLAMP),
        transform: [{ scale: interpolate(progress.value, [0, 1], [1, 0.9], Extrapolation.CLAMP) }],
    }));

    return (
        <View className="flex-1 bg-neutral-900" style={{ paddingTop: insets.top }}>
            <View className="w-full flex-row items-center justify-start pt-4 pb-6 px-6">
                {/* Left: profile image slides/fades out, "Filters" slides/fades in */}
                <View>
                    <Animated.View style={imageStyle}>
                        <Image source={require('@/assets/img/user-1.jpg')} className='w-10 h-10 rounded-full' />
                    </Animated.View>
                    <Animated.Text numberOfLines={1} className="text-white w-[200px] text-xl font-semibold absolute" style={filtersLabelStyle}>
                        Filters
                    </Animated.Text>
                </View>

                {/* Right: more-vertical scales/rotates out, check scales/rotates in */}
                <View className="ml-auto w-6 h-6">
                    <Animated.View className="absolute" style={moreIconStyle}>
                        <HeaderIcon onPress={toggleFilters} icon="more-vertical" color="white" size={24} />
                    </Animated.View>
                    <Animated.View className="absolute right-12" style={moreIconStyle}>
                        <HeaderIcon onPress={toggleFilters} icon="bell" color="white" size={24} />
                    </Animated.View>
                    <Animated.View className="absolute" style={checkIconStyle}>
                        <HeaderIcon onPress={toggleFilters} icon="check" color="white" size={24} />
                    </Animated.View>
                </View>
            </View>

            <View className="flex-1 relative">
                <FilterContent animStyle={filterContentStyle} />

                <Animated.View
                    className="w-full h-full z-20 absolute left-0 right-0 bottom-0 rounded-t-[40px] overflow-hidden"
                    style={sheetStyle}
                >
                    <ImageBackground source={require('@/assets/img/scify.jpg')} className="w-full h-full">
                        <GestureDetector gesture={panGesture}>
                            <View className="w-full items-center justify-center py-4">
                                <View className='w-20 h-2 rounded-full bg-white/30 border border-white/30' />
                            </View>
                        </GestureDetector>
                        <View className='w-full mt-auto px-6' style={{ paddingBottom: insets.bottom }}>
                            <Pressable onPress={() => router.back()} className="bg-black/50 rounded-full p-4 items-center">
                                <Text className="text-white text-lg font-semibold">Back</Text>
                            </Pressable>
                        </View>
                    </ImageBackground>
                </Animated.View>
            </View>
        </View>
    );
}

const HeaderIcon = ({ onPress, icon, size, color, style, className }: { onPress: () => void, icon: string, size?: number, color: string, style?: string, className?: string }) => {
    return (
        <Pressable onPress={onPress} className={`${style} ${className}`}>
            <Feather name={icon as keyof typeof FeatherIcons.glyphMap} size={size} color={color} />
        </Pressable>
    );
}

const FilterContent = ({ animStyle }: { animStyle: any }) => {
    return (
        <>
            <Animated.View className="w-full pt-4" style={animStyle}>
                <Text className="text-white text-sm font-semibold pl-6">Transaction type</Text>
                <ScrollView className='w-full' contentContainerClassName='flex-row h-auto pt-2 px-6 gap-2 items-start' horizontal showsHorizontalScrollIndicator={false}>
                    <Chip label="All" isActive={true} onPress={() => { }} />
                    <Chip label="Income" isActive={false} onPress={() => { }} />
                    <Chip label="Expense" isActive={false} onPress={() => { }} />
                    <Chip label="Recurring" isActive={false} onPress={() => { }} />
                </ScrollView>
                <Text className="text-white text-sm font-semibold pl-6 mt-10">Category</Text>
                <ScrollView className='w-full' contentContainerClassName='flex-row pt-2 px-6 gap-2 items-start' horizontal showsHorizontalScrollIndicator={false}>
                    <Chip label="All" isActive={false} onPress={() => { }} />
                    <Chip label="Health & Fitness" isActive={false} onPress={() => { }} />
                    <Chip label="Education" isActive={false} onPress={() => { }} />
                    <Chip label="Other" isActive={false} onPress={() => { }} />
                </ScrollView>
                <Text className="text-white text-sm font-semibold px-6 mt-10">Amount
                    <Slider label="Amount" value={50} onValueChange={() => { }} />
                </Text>
            </Animated.View>
        </>
    );
}

const Chip = ({ label, isActive, onPress, icon }: { label: string; isActive: boolean; onPress: () => void, icon?: string }) => {
    return (
        <Pressable onPress={onPress} className={`relative rounded-full px-4 py-2 bg-secondary overflow-hidden ${isActive ? 'bg-white' : 'bg-secondary'}`}>
            {icon && (
                <Feather name={icon as keyof typeof FeatherIcons.glyphMap} size={20} color="white" />
            )}
            <Text className={`text-sm font-semibold ${isActive ? 'text-black' : 'text-white'}`}>{label}</Text>
        </Pressable>
    );
}

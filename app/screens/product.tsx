import { View, Text, Pressable } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from "react-native-reanimated";
import { useState } from "react";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
type ProductInfoData = {
    id: number;
    title: string;
    price: string;
    description: string;
    position: { top?: number; bottom?: number; left?: number; right?: number };
    imageOffset: { x: number; y: number };
    scale: number;
};

const PRODUCTS: ProductInfoData[] = [
    {
        id: 1,
        title: "Woolen Sweater",
        price: "$299",
        description: "Premium comfort with lumbar support and adjustable armrests",
        position: { top: 260, right: 100 },
        imageOffset: { x: -10, y: -20 },
        scale: 1.5
    },
    {
        id: 2,
        title: "Cream Shoes",
        price: "$29.99",
        description: "Electric height adjustment with memory presets",
        position: { bottom: 150, left: 80 },
        imageOffset: { x: 50, y: -100 },
        scale: 1.5
    },
    {
        id: 3,
        title: "Trousers that fit ",
        price: "$89",
        description: "Full motion mount for screens up to 32 inches",
        position: { top: 400, left: 140 },
        imageOffset: { x: 20, y: -50 },
        scale: 1.5
    },
];

export default function Product() {
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const imageScale = useSharedValue(1);
    const imageTranslateX = useSharedValue(0);
    const imageTranslateY = useSharedValue(0);

    const handleExpand = (product: ProductInfoData | null) => {
        if (product && expandedId !== product.id) {
            setExpandedId(product.id);
            imageScale.value = withSpring(product.scale, { damping: 80, stiffness: 400 });
            imageTranslateX.value = withSpring(product.imageOffset.x, { damping: 80, stiffness: 400 });
            imageTranslateY.value = withSpring(product.imageOffset.y, { damping: 80, stiffness: 400 });
        } else {
            setExpandedId(null);
            imageScale.value = withSpring(1, { damping: 80, stiffness: 400 });
            imageTranslateX.value = withSpring(0, { damping: 80, stiffness: 400 });
            imageTranslateY.value = withSpring(0, { damping: 80, stiffness: 400 });
        }
    };

    const imageAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: imageScale.value },
                { translateX: imageTranslateX.value },
                { translateY: imageTranslateY.value },
            ],
        };
    });

    return (
        <View className="flex-1 bg-background relative overflow-hidden">
            <View className="w-full px-8 absolute top-0 left-0 right-0 z-10" style={{ paddingTop: insets.top + 10 }}>
                
                    <Pressable className="w-10 h-10 bg-white rounded-full items-center justify-center" onPress={() => navigation.goBack()}>
                        <Feather
                            name="arrow-left"
                            size={20}
                            color="black"
                        />
                    </Pressable>
            </View>
            <Animated.Image
                source={require('@/assets/img/product.webp')}
                className="w-full h-full"
                style={imageAnimatedStyle}
            />
            {PRODUCTS.map((product) => (
                <ProductInfo
                    key={product.id}
                    product={product}
                    isExpanded={expandedId === product.id}
                    isOtherExpanded={expandedId !== null && expandedId !== product.id}
                    onToggle={() => handleExpand(expandedId === product.id ? null : product)}
                />
            ))}
        </View>
    );
}

type ProductInfoProps = {
    product: ProductInfoData;
    isExpanded: boolean;
    isOtherExpanded: boolean;
    onToggle: () => void;
};

const ProductInfo = ({ product, isExpanded, isOtherExpanded, onToggle }: ProductInfoProps) => {
    const expanded = useSharedValue(0);
    const otherExpanded = useSharedValue(0);

    // Sync with parent state
    if (isExpanded && expanded.value === 0) {
        expanded.value = withSpring(1, { damping: 90, stiffness: 700 });
    } else if (!isExpanded && expanded.value === 1) {
        expanded.value = withSpring(0, { damping: 90, stiffness: 700 });
    }

    // Sync other expanded state
    if (isOtherExpanded && otherExpanded.value === 0) {
        otherExpanded.value = withSpring(1, { damping: 90, stiffness: 700 });
    } else if (!isOtherExpanded && otherExpanded.value === 1) {
        otherExpanded.value = withSpring(0, { damping: 90, stiffness: 700 });
    }

    const containerAnimatedStyle = useAnimatedStyle(() => {
        const width = interpolate(expanded.value, [0, 1], [34, 220]);
        const height = interpolate(expanded.value, [0, 1], [34, 130]);
        const borderRadius = interpolate(expanded.value, [0, 1], [24, 20]);
        const opacity = interpolate(otherExpanded.value, [0, 1], [1, 0]);
        const scale = interpolate(otherExpanded.value, [0, 1], [1, 0.6]);

        return {
            width,
            height,
            borderRadius,
            opacity,
            transform: [{ scale }],
        };
    });

    const iconAnimatedStyle = useAnimatedStyle(() => {
        const rotate = interpolate(expanded.value, [0, 1], [0, 45]);
        return {
            transform: [{ rotate: `${rotate}deg` }],
        };
    });

    const contentAnimatedStyle = useAnimatedStyle(() => {
        const delay = 0.2;
        const adjustedProgress = Math.max(0, Math.min(1, (expanded.value - delay) / (1 - delay)));
        const opacity = interpolate(adjustedProgress, [0, 0.5, 1], [0, 0, 1]);
        const translateY = interpolate(adjustedProgress, [0, 1], [40, 0]);
        return {
            opacity,
            transform: [{ translateY }],
        };
    });

    return (
        <Animated.View
            className="bg-white/30"
            style={[
                {
                    position: 'absolute',
                    //backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    overflow: 'hidden',
                    ...product.position,
                },
                containerAnimatedStyle
            ]}
        >
            <BlurView
                intensity={40}
                tint="light"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,

                }}
            >
            </BlurView>
            <View className="flex-1">
                {/* Icon button */}
                <Pressable
                    onPress={onToggle}
                    className="w-10 h-10 rounded-full items-center justify-center absolute top-0 right-0  z-10"
                >
                    <Animated.View style={iconAnimatedStyle}>
                        <Feather name="plus" size={16} color="black" />
                    </Animated.View>
                </Pressable>

                {/* Product info */}
                <Animated.View style={contentAnimatedStyle} className="mt-0 p-6">
                    <Text className="text-black text-lg font-bold" numberOfLines={1}>{product.title}</Text>
                    <Text className="text-black/80 text-base font-semibold">{product.price}</Text>
                    {/* <Text className="text-black/60 text-sm mt-1" numberOfLines={2}>{product.description}</Text> */}
                    <Pressable className="bg-black rounded-full py-2 px-4 mt-3 items-center">
                        <Text className="text-white text-sm font-semibold">Add to Cart</Text>
                    </Pressable>
                </Animated.View>
            </View>
        </Animated.View>
    );
}